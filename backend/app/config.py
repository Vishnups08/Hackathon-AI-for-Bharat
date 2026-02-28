import os
from dotenv import load_dotenv

load_dotenv()

AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
BEDROCK_MODEL_ID = os.getenv("BEDROCK_MODEL_ID", "anthropic.claude-3-5-sonnet-20241022-v2:0")
EMBEDDING_MODEL_ID = os.getenv("EMBEDDING_MODEL_ID", "amazon.titan-embed-text-v2:0")
S3_BUCKET = os.getenv("S3_BUCKET", "jan-sahayak-schemes")
DYNAMODB_TABLE = os.getenv("DYNAMODB_TABLE", "jan-sahayak-sessions")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
