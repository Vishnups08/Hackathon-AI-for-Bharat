from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    from app.data.scheme_loader import SCHEMES_CACHE
    return {
        "status": "healthy",
        "service": "Jan Sahayak API",
        "schemes_loaded": len(SCHEMES_CACHE)
    }
