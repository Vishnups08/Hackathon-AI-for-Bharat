import os
from dotenv import load_dotenv

load_dotenv(override=True)

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
LLM_MODEL_ID = os.getenv("LLM_MODEL_ID", "meta-llama/llama-3.3-70b-instruct:free")
S3_BUCKET = os.getenv("S3_BUCKET", "jan-sahayak-schemes")
DYNAMODB_TABLE = os.getenv("DYNAMODB_TABLE", "jan-sahayak-sessions")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
