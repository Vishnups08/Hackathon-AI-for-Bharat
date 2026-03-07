from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import json

from app.core.bedrock_client import invoke_claude
from app.data.scheme_loader import SCHEMES_CACHE, get_scheme_by_id
from app.prompts.conversation import SYSTEM_PROMPT_SCHEME_MATCHING, SYSTEM_PROMPT_COMPARISON

router = APIRouter()


class MatchRequest(BaseModel):
    session_id: str
    profile: dict
    query: str = ""
    language: str = "hi"
    uploaded_documents: list = []
    max_results: int = 10


class CompareRequest(BaseModel):
    session_id: str
    scheme_ids: list
    profile: dict
    language: str = "hi"


@router.post("/schemes/match")
async def match_schemes(request: MatchRequest):
    """
    Scheme matching endpoint.
    Rule-based pre-filtering + LLM-powered scoring and ranking.
    """
    try:
        print(f"🔍 DEBUG: Starting match_schemes for language: {request.language}")
        print(f"🔍 DEBUG: Profile: {request.profile}")

        # Step 1: Rule-based pre-filtering (use deepcopy to avoid polluting global cache)
        import copy
        candidates = copy.deepcopy(rule_based_filter(request.profile, SCHEMES_CACHE))
        print(f"🔍 DEBUG: Found {len(candidates)} rule-based candidates")

        # Step 2: Calculate document readiness for each candidate
        for scheme in candidates:
            try:
                scheme["document_readiness"] = calculate_document_readiness(
                    scheme, request.uploaded_documents or [], request.profile or {}
                )
            except Exception as doc_err:
                print(f"⚠️ DEBUG: Error calculating readiness for {scheme.get('scheme_id')}: {doc_err}")
                scheme["document_readiness"] = {"percentage": 0, "ready": 0, "total": 0, "documents": []}

        # Step 3: LLM-powered scoring and ranking
        # Prepare smaller data for LLM
        schemes_data = []
        for s in candidates:
            schemes_data.append({
                "scheme_id": s.get("scheme_id", "unknown"),
                "name_en": s.get("name_en", "Unknown"),
                "name_hi": s.get("name_hi", ""),
                "description_en": s.get("description_en", ""),
                "categories": s.get("categories", []),
                "eligibility": s.get("eligibility", {}),
                "benefits": s.get("benefits", {})
            })

        scored_schemes = []
        if schemes_data:
            prompt = f"""User Profile: {json.dumps(request.profile, ensure_ascii=False)}
User's uploaded documents: {json.dumps(request.uploaded_documents or [])}
User's query: "{request.query}"
Language: {request.language}

Pre-filtered candidate schemes ({len(candidates)} total):
{json.dumps(schemes_data, ensure_ascii=False, indent=2)}

Score each scheme and rank them by eligibility and relevance. 
Income 0 means no income/unemployed.
Return ONLY a valid JSON array of objects. Do not include markdown code blocks.
"""
            try:
                print("🔍 DEBUG: Calling LLM for scheme scoring...")
                raw_response = await invoke_claude(
                    system_prompt=SYSTEM_PROMPT_SCHEME_MATCHING,
                    user_message=prompt
                )
                
                # Robust regex-based parsing
                import re
                match = re.search(r"(\[.*\])", raw_response, re.DOTALL)
                if match:
                    cleaned = match.group(1).strip()
                    scored_schemes = json.loads(cleaned)
                    print(f"🔍 DEBUG: LLM returned {len(scored_schemes)} scored schemes")
                else:
                    print("⚠️ DEBUG: No JSON array found in LLM response")
                    raise ValueError("No JSON array in response")

            except Exception as llm_err:
                print(f"⚠️ DEBUG: LLM matching failed: {llm_err}. Using fallback.")
                # Fallback: manually convert all candidates to scored format
                for i, s in enumerate(candidates):
                    scored_schemes.append({
                        "scheme_id": s.get("scheme_id", "unknown"),
                        "name_en": s.get("name_en", "Unknown"),
                        "name_hi": s.get("name_hi", ""),
                        "eligibility_score": 85 if i < 3 else 70,
                        "eligibility_reasoning": "Matching based on profile criteria.",
                        "benefit_amount": s.get("benefits", {}).get("amount", "As per norms"),
                        "benefit_type": s.get("benefits", {}).get("type", "Grant"),
                        "category": s.get("categories", ["General"])[0],
                        "recommended_order": i + 1
                    })
        else:
            print("🔍 DEBUG: No candidates to score.")

        # Attach document readiness to scored schemes
        if isinstance(scored_schemes, list):
            for scored in scored_schemes:
                sid = scored.get("scheme_id")
                # Add default readiness if missing
                scored["document_readiness"] = {"percentage": 0, "ready": 0, "total": 0}
                for candidate in candidates:
                    if candidate.get("scheme_id") == sid:
                        scored["document_readiness"] = candidate.get("document_readiness", {})
                        break

        # Generate AI summary
        try:
            summary = generate_summary(scored_schemes, request.language, request.profile)
        except Exception as sum_err:
            print(f"⚠️ DEBUG: Summary generation failed: {sum_err}")
            summary = "Found eligible schemes for you."

        print("✅ DEBUG: match_schemes completed successfully")
        return {
            "status": "success",
            "response": {
                "total_matches": len(scored_schemes),
                "schemes": scored_schemes[:request.max_results],
                "ai_summary": summary
            }
        }
    except Exception as e:
        print(f"❌ CRITICAL: Scheme matching error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Scheme matching error: {str(e)}")


@router.post("/schemes/compare")
async def compare_schemes(request: CompareRequest):
    """Compare 2-3 schemes side-by-side with AI recommendation."""
    try:
        schemes_to_compare = []
        for sid in request.scheme_ids[:3]:  # Max 3
            scheme = get_scheme_by_id(sid)
            if scheme:
                scheme["document_readiness"] = calculate_document_readiness(
                    scheme, [], request.profile
                )
                schemes_to_compare.append(scheme)

        if not schemes_to_compare:
            raise HTTPException(status_code=404, detail="No schemes found for comparison")

        prompt = f"""User Profile: {json.dumps(request.profile, ensure_ascii=False)}
Language: {request.language}

Schemes to compare:
{json.dumps([{
    "scheme_id": s["scheme_id"],
    "name_en": s["name_en"],
    "name_hi": s.get("name_hi", ""),
    "benefits": s["benefits"],
    "eligibility": s["eligibility"],
    "documents_required": s["documents_required"],
    "document_readiness": s.get("document_readiness", {}),
    "application_process": s["application_process"]
} for s in schemes_to_compare], ensure_ascii=False, indent=2)}

Provide detailed comparison and personalized recommendation."""

        raw_response = await invoke_claude(
            system_prompt=SYSTEM_PROMPT_COMPARISON,
            user_message=prompt
        )

        # Parse response
        try:
            cleaned = raw_response.strip()
            if cleaned.startswith("```"):
                lines = cleaned.split("\n")
                json_lines = [l for l in lines if not l.strip().startswith("```")]
                cleaned = "\n".join(json_lines)
            comparison = json.loads(cleaned)
        except json.JSONDecodeError:
            comparison = {
                "recommendation": raw_response,
                "apply_order": [s["scheme_id"] for s in schemes_to_compare]
            }

        return {
            "status": "success",
            "response": comparison
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comparison error: {str(e)}")


@router.get("/schemes/{scheme_id}")
async def get_scheme(scheme_id: str):
    """Get full details of a specific scheme."""
    scheme = get_scheme_by_id(scheme_id)
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")
    return {"status": "success", "scheme": scheme}


@router.get("/schemes")
async def list_schemes(category: str = None):
    """List all schemes, optionally filtered by category."""
    if category:
        filtered = [
            s for s in SCHEMES_CACHE
            if category.lower() in [c.lower() for c in s.get("categories", [])]
        ]
        return {"status": "success", "total": len(filtered), "schemes": filtered}
    return {"status": "success", "total": len(SCHEMES_CACHE), "schemes": SCHEMES_CACHE}


# ─── Helper Functions ────────────────────────────────────────


def rule_based_filter(profile: dict, schemes: list) -> list:
    """Pre-filter schemes based on hard eligibility criteria."""
    results = []
    for scheme in schemes:
        elig = scheme.get("eligibility", {})

        # Age check
        age = profile.get("age")
        if age is not None:
            if elig.get("age_min") is not None and age < elig["age_min"]:
                continue
            if elig.get("age_max") is not None and age > elig["age_max"]:
                continue

        # Gender check
        gender_req = elig.get("gender", "all")
        if gender_req != "all" and profile.get("gender"):
            p_gender = str(profile["gender"]).lower()
            if p_gender != str(gender_req).lower():
                continue

        # Occupation check
        occ_list = elig.get("occupation", ["all"])
        if "all" not in occ_list and profile.get("occupation"):
            p_occ = str(profile["occupation"]).lower()
            if p_occ not in [str(o).lower() for o in occ_list]:
                continue

        # State check
        state_list = elig.get("states", ["all"])
        if "all" not in state_list and profile.get("state"):
            p_state = str(profile["state"]).lower()
            if p_state not in [str(s).lower() for s in state_list]:
                continue

        # Income check
        income_max = elig.get("income_max_annual")
        if income_max is not None and profile.get("annual_income") is not None:
            if float(profile["annual_income"]) > float(income_max):
                continue

        # Category check
        cat_list = elig.get("category", ["all"])
        if "all" not in cat_list and profile.get("category"):
            p_cat = str(profile["category"]).lower()
            if p_cat not in [str(c).lower() for c in cat_list]:
                continue

        # BPL check
        if elig.get("is_bpl_required") and profile.get("is_bpl") is False:
            continue

        # Land holding check
        land_max = elig.get("land_holding_max_hectares")
        if land_max is not None and profile.get("land_holding_hectares") is not None:
            if profile["land_holding_hectares"] > land_max:
                continue

        results.append(scheme)

    return results


def calculate_document_readiness(scheme: dict, uploaded_docs: list, profile: dict) -> dict:
    """Calculate document readiness score for a scheme."""
    required_docs = scheme.get("documents_required", [])
    if not required_docs:
        return {"ready": 0, "total": 0, "percentage": 100, "documents": []}

    # Determine available documents from uploads and profile
    available_markers = set()
    for doc_name in uploaded_docs:
        available_markers.add(doc_name.lower())

    # Infer from profile
    if profile.get("has_aadhaar") or "aadhaar" in " ".join(uploaded_docs).lower():
        available_markers.add("aadhaar card")
        available_markers.add("aadhaar")
    if profile.get("has_bank_account"):
        available_markers.add("bank account")
        available_markers.add("bank account with ifsc")
    # Assume mobile if they're using the app
    available_markers.add("mobile number")

    doc_status = []
    ready_count = 0

    for doc in required_docs:
        doc_name = doc["document_name"]
        doc_lower = doc_name.lower()

        is_available = any(marker in doc_lower or doc_lower in marker for marker in available_markers)

        entry = {
            "name": doc_name,
            "is_mandatory": doc.get("is_mandatory", True),
            "status": "available" if is_available else "missing"
        }

        if is_available:
            entry["source"] = "uploaded" if any(d.lower() in doc_lower for d in uploaded_docs) else "profile"
            ready_count += 1
        else:
            entry["where_to_get"] = doc.get("where_to_obtain", "Contact relevant office")
            entry["time"] = doc.get("estimated_time", "Varies")
            entry["alternatives"] = doc.get("alternatives", [])

        doc_status.append(entry)

    total = len(required_docs)
    return {
        "ready": ready_count,
        "total": total,
        "percentage": int((ready_count / total) * 100) if total > 0 else 0,
        "documents": doc_status
    }


def generate_summary(schemes: list, language: str, profile: dict) -> str:
    """Generate a simple summary of matched schemes."""
    if not isinstance(schemes, list) or not schemes:
        if language == "hi":
            return "कोई योजना नहीं मिली। कृपया अपनी प्रोफ़ाइल जानकारी जांचें।"
        return "No schemes matched. Please verify your profile information."

    count = len(schemes)
    name = profile.get("name", "")

    if language == "hi":
        return f"{name} जी, आपके प्रोफ़ाइल के अनुसार {count} सरकारी योजनाओं के लिए पात्र हैं।"
    else:
        return f"{name}, based on your profile, you are eligible for {count} government schemes."
