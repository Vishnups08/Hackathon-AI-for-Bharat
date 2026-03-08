import json
import httpx
from app.config import LLM_API_KEY, LLM_MODEL_ID, LLM_BASE_URL

async def invoke_claude(system_prompt: str, user_message: str, chat_history: list = None):
    """
    Invoke LLM via NVIDIA NIM API (OpenAI-compatible).
    Keeps function name for backward compatibility.
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
    
    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            LLM_BASE_URL,
            headers={
                "Authorization": f"Bearer {LLM_API_KEY}",
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            json={
                "model": LLM_MODEL_ID,
                "messages": messages,
                "temperature": 0.5,
                "max_tokens": 2048,
                "stream": False,
            }
        )
        if response.status_code != 200:
            print(f"LLM API Error: {response.status_code} - {response.text}")
            response.raise_for_status()
            
        response_json = response.json()
        content = response_json["choices"][0]["message"]["content"]
        
        # Some models (like Kimi) include <think> tags — strip them
        if "<think>" in content and "</think>" in content:
            think_end = content.index("</think>") + len("</think>")
            content = content[think_end:].strip()
        
        return content


async def invoke_claude_with_image(system_prompt: str, user_message: str, image_bytes: bytes, media_type: str = "image/jpeg"):
    """
    Invoke LLM with an image for document analysis.
    Falls back to text-only if vision is not supported.
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
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            LLM_BASE_URL,
            headers={
                "Authorization": f"Bearer {LLM_API_KEY}",
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            json={
                "model": LLM_MODEL_ID,
                "messages": messages,
                "temperature": 0.3,
                "max_tokens": 2048,
                "stream": False,
            }
        )
        try:
            if response.status_code != 200:
                print(f"LLM Vision Error: {response.status_code} - {response.text}")
                # Fallback: retry with text-only (strip image)
                return await invoke_claude(system_prompt, user_message)
            response_json = response.json()
            content = response_json["choices"][0]["message"]["content"]
            
            # Strip <think> tags if present
            if "<think>" in content and "</think>" in content:
                think_end = content.index("</think>") + len("</think>")
                content = content[think_end:].strip()
            
            return content
        except Exception as e:
            print(f"Vision parsing error: {e}")
            return "{}"
