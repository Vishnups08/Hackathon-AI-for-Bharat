from fastapi import APIRouter, Form, HTTPException
from fastapi.responses import StreamingResponse
import io

router = APIRouter()

# Try to initialize AWS voice services
try:
    import boto3
    from app.config import AWS_REGION
    polly_client = boto3.client("polly", region_name=AWS_REGION)
    transcribe_client = boto3.client("transcribe", region_name=AWS_REGION)
    VOICE_AVAILABLE = True
except Exception:
    VOICE_AVAILABLE = False
    print("⚠️ Voice services unavailable")


@router.post("/voice/synthesize")
async def text_to_speech(
    text: str = Form(...),
    language: str = Form("hi")
):
    """Convert text to speech using Amazon Polly."""
    if not VOICE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Voice service unavailable")

    try:
        voice_map = {
            "hi": {"voice_id": "Aditi", "lang_code": "hi-IN"},
            "en": {"voice_id": "Joanna", "lang_code": "en-US"},
            "ta": {"voice_id": "Aditi", "lang_code": "hi-IN"},  # Fallback
            "te": {"voice_id": "Aditi", "lang_code": "hi-IN"},  # Fallback
        }

        config = voice_map.get(language, voice_map["hi"])

        response = polly_client.synthesize_speech(
            Text=text,
            OutputFormat="mp3",
            VoiceId=config["voice_id"],
            LanguageCode=config["lang_code"]
        )

        audio_stream = response["AudioStream"].read()
        return StreamingResponse(
            io.BytesIO(audio_stream),
            media_type="audio/mpeg",
            headers={"Content-Disposition": "inline; filename=speech.mp3"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS error: {str(e)}")


@router.get("/languages")
async def get_supported_languages():
    """Return list of supported languages."""
    return {
        "status": "success",
        "languages": [
            {"code": "hi", "name": "हिंदी", "name_en": "Hindi", "voice_available": True},
            {"code": "en", "name": "English", "name_en": "English", "voice_available": True},
            {"code": "ta", "name": "தமிழ்", "name_en": "Tamil", "voice_available": False},
            {"code": "te", "name": "తెలుగు", "name_en": "Telugu", "voice_available": False},
            {"code": "mr", "name": "मराठी", "name_en": "Marathi", "voice_available": False},
            {"code": "bn", "name": "বাংলা", "name_en": "Bengali", "voice_available": False},
            {"code": "kn", "name": "ಕನ್ನಡ", "name_en": "Kannada", "voice_available": False},
            {"code": "gu", "name": "ગુજરાતી", "name_en": "Gujarati", "voice_available": False},
            {"code": "ml", "name": "മലയാളം", "name_en": "Malayalam", "voice_available": False},
            {"code": "pa", "name": "ਪੰਜਾਬੀ", "name_en": "Punjabi", "voice_available": False},
            {"code": "or", "name": "ଓଡ଼ିଆ", "name_en": "Odia", "voice_available": False},
        ]
    }
