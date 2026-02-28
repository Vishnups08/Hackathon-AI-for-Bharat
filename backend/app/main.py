from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

from app.config import FRONTEND_URL
from app.api.routes import chat, document, schemes, voice, health

app = FastAPI(
    title="Jan Sahayak API",
    description="AI-Powered Government Scheme Eligibility & Guidance Assistant",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL,
        "http://localhost:5173",
        "http://localhost:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routes
app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(chat.router, prefix="/api", tags=["Chat"])
app.include_router(document.router, prefix="/api", tags=["Document"])
app.include_router(schemes.router, prefix="/api", tags=["Schemes"])
app.include_router(voice.router, prefix="/api", tags=["Voice"])

# Lambda handler for AWS deployment
handler = Mangum(app)

@app.on_event("startup")
async def startup_event():
    print("🚀 Jan Sahayak API starting up...")
    from app.data.scheme_loader import SCHEMES_CACHE
    print(f"📋 Loaded {len(SCHEMES_CACHE)} government schemes")
