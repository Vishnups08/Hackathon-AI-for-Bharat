from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import json

from app.core.bedrock_client import invoke_claude, invoke_claude_with_image
from app.prompts.conversation import SYSTEM_PROMPT_DOCUMENT_PARSING, SYSTEM_PROMPT_DOCUMENT_VISION

router = APIRouter()


# Try to use Amazon Textract, fall back to Claude Vision
USE_TEXTRACT = True

try:
    import boto3
    from app.config import AWS_REGION
    textract_client = boto3.client("textract", region_name=AWS_REGION)
except Exception:
    USE_TEXTRACT = False
    print("⚠️ Textract unavailable, using Claude Vision for document analysis")


@router.post("/document/upload")
async def upload_document(
    file: UploadFile = File(...),
    session_id: str = Form(...),
    language: str = Form("hi")
):
    """
    Document intelligence endpoint.
    Upload a document photo → OCR → structured profile data extraction.
    """
    try:
        # Read file bytes
        file_bytes = await file.read()
        content_type = file.content_type or "image/jpeg"

        # Determine media type for Claude Vision
        media_type_map = {
            "image/jpeg": "image/jpeg",
            "image/jpg": "image/jpeg",
            "image/png": "image/png",
            "image/webp": "image/webp",
            "application/pdf": "application/pdf"
        }
        media_type = media_type_map.get(content_type, "image/jpeg")

        extracted_data = None

        # Method 1: Try Amazon Textract + Claude for parsing
        if USE_TEXTRACT and media_type != "application/pdf":
            try:
                extracted_data = await process_with_textract(file_bytes, language)
            except Exception as e:
                print(f"⚠️ Textract failed: {e}, falling back to Claude Vision")

        # Method 2: Fall back to Claude Vision (direct image analysis)
        if extracted_data is None:
            extracted_data = await process_with_claude_vision(file_bytes, media_type, language)

        # Generate confirmation message
        if language == "hi":
            msg = "आपके दस्तावेज़ से यह जानकारी मिली। क्या यह सही है?"
        else:
            msg = "Here's the information extracted from your document. Is this correct?"

        return {
            "status": "success",
            "response": {
                "detected_document_type": extracted_data.get("document_type", "unknown"),
                "confidence": extracted_data.get("confidence", 0.0),
                "extracted_data": extracted_data.get("extracted_data", {}),
                "profile_updates": extracted_data.get("profile_updates", {}),
                "message": msg,
                "requires_confirmation": True
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Document processing error: {str(e)}")


async def process_with_textract(file_bytes: bytes, language: str) -> dict:
    """Process document using Amazon Textract OCR + Claude parsing."""
    # Step 1: Textract OCR
    textract_response = textract_client.detect_document_text(
        Document={"Bytes": file_bytes}
    )

    # Extract all text lines
    ocr_lines = []
    for block in textract_response.get("Blocks", []):
        if block["BlockType"] == "LINE":
            ocr_lines.append(block["Text"])

    ocr_text = "\n".join(ocr_lines)

    if not ocr_text.strip():
        raise ValueError("No text extracted from document")

    # Step 2: Claude parses OCR text into structured data
    prompt = f"""OCR Text extracted from an Indian government document:
---
{ocr_text}
---

Parse this into structured profile data. Detect the document type automatically."""

    raw_response = await invoke_claude(
        system_prompt=SYSTEM_PROMPT_DOCUMENT_PARSING,
        user_message=prompt
    )

    return parse_claude_json(raw_response)


async def process_with_claude_vision(file_bytes: bytes, media_type: str, language: str) -> dict:
    """Process document using Claude's built-in vision capability."""
    prompt = "Analyze this Indian government document image. Extract all visible information including name, date of birth, gender, address, and any ID numbers. Mask Aadhaar numbers."

    raw_response = await invoke_claude_with_image(
        system_prompt=SYSTEM_PROMPT_DOCUMENT_VISION,
        user_message=prompt,
        image_bytes=file_bytes,
        media_type=media_type
    )

    return parse_claude_json(raw_response)


def parse_claude_json(raw_response: str) -> dict:
    """Parse Claude's JSON response with fallback handling."""
    try:
        cleaned = raw_response.strip()
        if cleaned.startswith("```"):
            lines = cleaned.split("\n")
            json_lines = [l for l in lines if not l.strip().startswith("```")]
            cleaned = "\n".join(json_lines)
        return json.loads(cleaned)
    except json.JSONDecodeError:
        return {
            "document_type": "unknown",
            "confidence": 0.0,
            "extracted_data": {},
            "profile_updates": {}
        }
