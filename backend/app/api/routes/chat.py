from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import json

from app.core.bedrock_client import invoke_claude
from app.prompts.conversation import SYSTEM_PROMPT_PROFILING

router = APIRouter()


class ChatRequest(BaseModel):
    session_id: str
    message: str
    language: str = "hi"
    chat_history: list = []
    current_profile: dict = {}


@router.post("/chat")
async def chat(request: ChatRequest):
    """
    Conversational profile building endpoint.
    AI asks questions, extracts profile data from user responses.
    """
    try:
        # Build context with current profile
        profile_context = json.dumps(request.current_profile, ensure_ascii=False)
        context = f"\n\nCurrent extracted profile so far: {profile_context}"
        context += f"\nUser's preferred language: {request.language}"
        system = SYSTEM_PROMPT_PROFILING + context

        # Call Bedrock Claude
        raw_response = await invoke_claude(
            system_prompt=system,
            user_message=request.message,
            chat_history=request.chat_history
        )

        # Parse JSON response from Claude
        try:
            # Try to extract JSON from response (Claude sometimes wraps in markdown)
            cleaned = raw_response.strip()
            if cleaned.startswith("```"):
                # Remove markdown code blocks
                lines = cleaned.split("\n")
                json_lines = [l for l in lines if not l.strip().startswith("```")]
                cleaned = "\n".join(json_lines)
            parsed = json.loads(cleaned)
        except json.JSONDecodeError:
            # Fallback: return raw message
            parsed = {
                "message": raw_response,
                "extracted_fields": {},
                "is_profile_complete": False,
                "profile_summary": None
            }

        # Merge extracted fields into profile
        extracted = parsed.get("extracted_fields", {})
        updated_profile = {**request.current_profile, **extracted}
        completeness = calculate_completeness(updated_profile)

        return {
            "status": "success",
            "response": {
                "message": parsed.get("message", raw_response),
                "extracted_profile_updates": extracted,
                "conversation_phase": "matching" if parsed.get("is_profile_complete") else "profiling",
                "profile_completeness": completeness,
                "is_profile_complete": parsed.get("is_profile_complete", False),
                "profile_summary": parsed.get("profile_summary"),
                "suggested_actions": get_suggested_actions(completeness, parsed.get("is_profile_complete", False))
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")


def calculate_completeness(profile: dict) -> int:
    """Calculate profile completeness as a percentage."""
    key_fields = [
        "name", "age", "gender", "state", "occupation",
        "annual_income", "category", "family_size"
    ]
    filled = sum(1 for f in key_fields if profile.get(f) is not None)
    return int((filled / len(key_fields)) * 100)


def get_suggested_actions(completeness: int, is_complete: bool) -> list:
    """Generate context-aware action suggestions."""
    actions = []
    if not is_complete:
        actions.append({"type": "continue_chat", "label": "Continue answering"})
        actions.append({"type": "upload_document", "label": "Upload Aadhaar to auto-fill"})
    else:
        actions.append({"type": "find_schemes", "label": "Find eligible schemes"})
        actions.append({"type": "upload_document", "label": "Upload documents for readiness check"})
    return actions
