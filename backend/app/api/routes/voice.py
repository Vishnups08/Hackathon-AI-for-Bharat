from fastapi import APIRouter, Form, HTTPException, File, UploadFile
from fastapi.responses import StreamingResponse
import io
import time
import urllib.request
import json
import uuid

router = APIRouter()

# Try to initialize AWS voice services
try:
    import boto3
    from app.config import AWS_REGION, S3_BUCKET
    polly_client = boto3.client("polly", region_name=AWS_REGION)
    transcribe_client = boto3.client("transcribe", region_name=AWS_REGION)
    s3_client = boto3.client("s3", region_name=AWS_REGION)
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


@router.post("/voice/transcribe")
async def speech_to_text(
    audio: UploadFile = File(...),
    language: str = Form("hi")
):
    """Convert speech to text using Amazon Transcribe."""
    if not VOICE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Voice service unavailable")

    try:
        from app.config import S3_BUCKET
        
        # 1. Upload audio to S3
        file_ext = audio.filename.split('.')[-1] if '.' in audio.filename else 'webm'
        job_name = f"chat-audio-{uuid.uuid4()}"
        file_key = f"audio/{job_name}.{file_ext}"
        
        audio_bytes = await audio.read()
        s3_client.put_object(
            Bucket=S3_BUCKET,
            Key=file_key,
            Body=audio_bytes
        )
        s3_uri = f"s3://{S3_BUCKET}/{file_key}"
        
        # 2. Start Transcribe Job
        lang_code = "hi-IN" if language == "hi" else "en-IN"
        
        # WebM is recorded by Chrome/Firefox. Use 'webm'
        media_format = file_ext if file_ext in ['mp3', 'mp4', 'wav', 'flac', 'ogg', 'amr', 'webm'] else 'webm'
        
        transcribe_client.start_transcription_job(
            TranscriptionJobName=job_name,
            Media={'MediaFileUri': s3_uri},
            MediaFormat=media_format,
            LanguageCode=lang_code
        )
        
        # 3. Poll for completion
        job_status = "IN_PROGRESS"
        while job_status not in ['COMPLETED', 'FAILED']:
            time.sleep(2)
            status_res = transcribe_client.get_transcription_job(TranscriptionJobName=job_name)
            job_status = status_res['TranscriptionJob']['TranscriptionJobStatus']
            
        if job_status == 'FAILED':
            raise Exception("Transcription job failed")
            
        # 4. Get transcript URL and fetch it
        transcript_url = status_res['TranscriptionJob']['Transcript']['TranscriptFileUri']
        with urllib.request.urlopen(transcript_url) as response:
            data = json.loads(response.read().decode('utf-8'))
            
        transcript_text = ""
        transcripts = data.get('results', {}).get('transcripts', [])
        if transcripts:
            transcript_text = transcripts[0].get('transcript', '')
        
        # Cleanup S3
        try:
            s3_client.delete_object(Bucket=S3_BUCKET, Key=file_key)
            transcribe_client.delete_transcription_job(TranscriptionJobName=job_name)
        except Exception:
            pass
            
        return {"status": "success", "text": transcript_text}
    except Exception as e:
        print(f"Transcribe Error: {e}")
        raise HTTPException(status_code=500, detail=f"Transcribe error: {str(e)}")

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
