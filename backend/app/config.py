import os
from dotenv import load_dotenv

load_dotenv(override=True)

# LLM Configuration — supports OpenRouter and NVIDIA NIM
LLM_API_KEY = os.getenv("LLM_API_KEY", os.getenv("OPENROUTER_API_KEY", ""))
LLM_BASE_URL = os.getenv("LLM_BASE_URL", "https://integrate.api.nvidia.com/v1/chat/completions")
LLM_MODEL_ID = os.getenv("LLM_MODEL_ID", "moonshotai/kimi-k2.5")

# Backward compatibility
OPENROUTER_API_KEY = LLM_API_KEY

# AWS Configuration (optional — for voice/OCR features)
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
S3_BUCKET = os.getenv("S3_BUCKET", "jan-sahayak-schemes")
DYNAMODB_TABLE = os.getenv("DYNAMODB_TABLE", "jan-sahayak-sessions")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
