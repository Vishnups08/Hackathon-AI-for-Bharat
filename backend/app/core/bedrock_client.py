import json
import httpx
from app.config import OPENROUTER_API_KEY, LLM_MODEL_ID

async def invoke_claude(system_prompt: str, user_message: str, chat_history: list = None):
    """
    Invoke LLM via OpenRouter API (keeps same name for compatibility).
    """
    if chat_history is None:
        chat_history = []
    
    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    
    # Add chat history
    for msg in chat_history:
        messages.append({
            "role": msg["role"],
            "content": msg["content"]
        })
    
    # Add current user message
    messages.append({
        "role": "user",
        "content": user_message
    })
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://jansahayak.ai", # Helpful for some OpenRouter models
                "X-OpenRouter-Title": "Jan Sahayak",
            },
            json={
                "model": LLM_MODEL_ID,
                "messages": messages,
                "temperature": 0.5,
                "max_tokens": 2048,
            }
        )
        if response.status_code != 200:
            print(f"OpenRouter Error: {response.status_code} - {response.text}")
            response.raise_for_status()
            
        response_json = response.json()
        return response_json["choices"][0]["message"]["content"]


async def invoke_claude_with_image(system_prompt: str, user_message: str, image_bytes: bytes, media_type: str = "image/jpeg"):
    """
    Invoke OpenRouter with an image for document analysis.
    """
    import base64
    image_b64 = base64.b64encode(image_bytes).decode("utf-8")
    
    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
        
    messages.append({
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": user_message
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:{media_type};base64,{image_b64}"
                    }
                }
            ]
        })
    
    # Use Gemini Flash (Paid version) for vision as well to avoid 429
    vision_model = LLM_MODEL_ID if "gemini" in LLM_MODEL_ID else "google/gemini-2.0-flash-001"
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://jansahayak.ai",
                "X-OpenRouter-Title": "Jan Sahayak",
            },
            json={
                "model": vision_model,
                "messages": messages,
                "temperature": 0.3,
                "max_tokens": 2048,
            }
        )
        try:
            if response.status_code != 200:
                print(f"OpenRouter Vision Error: {response.status_code} - {response.text}")
                return "{}"
            response_json = response.json()
            return response_json["choices"][0]["message"]["content"]
        except Exception as e:
            print(f"Vision parsing error: {e}")
            return "{}"

