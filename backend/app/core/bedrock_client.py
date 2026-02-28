import boto3
import json
from app.config import AWS_REGION, BEDROCK_MODEL_ID


def get_bedrock_client():
    """Create and return a Bedrock Runtime client."""
    return boto3.client(
        service_name="bedrock-runtime",
        region_name=AWS_REGION
    )


bedrock_runtime = get_bedrock_client()


async def invoke_claude(system_prompt: str, user_message: str, chat_history: list = None):
    """
    Invoke Claude 3.5 Sonnet via Amazon Bedrock.
    
    Args:
        system_prompt: System instructions for the model
        user_message: The user's current message
        chat_history: Previous conversation messages [{role, content}]
    
    Returns:
        str: The model's text response
    """
    if chat_history is None:
        chat_history = []
    
    messages = []
    
    # Add chat history
    for msg in chat_history:
        messages.append({
            "role": msg["role"],
            "content": [{"type": "text", "text": msg["content"]}]
        })
    
    # Add current user message
    messages.append({
        "role": "user",
        "content": [{"type": "text", "text": user_message}]
    })
    
    body = json.dumps({
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 2048,
        "system": system_prompt,
        "messages": messages,
        "temperature": 0.7
    })
    
    response = bedrock_runtime.invoke_model(
        modelId=BEDROCK_MODEL_ID,
        body=body,
        contentType="application/json",
        accept="application/json"
    )
    
    response_body = json.loads(response["body"].read())
    return response_body["content"][0]["text"]


async def invoke_claude_with_image(system_prompt: str, user_message: str, image_bytes: bytes, media_type: str = "image/jpeg"):
    """
    Invoke Claude with an image for document analysis.
    
    Args:
        system_prompt: System instructions
        user_message: Text prompt about the image
        image_bytes: Raw bytes of the image
        media_type: MIME type of the image
    
    Returns:
        str: The model's text response
    """
    import base64
    
    image_b64 = base64.b64encode(image_bytes).decode("utf-8")
    
    messages = [{
        "role": "user",
        "content": [
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": media_type,
                    "data": image_b64
                }
            },
            {
                "type": "text",
                "text": user_message
            }
        ]
    }]
    
    body = json.dumps({
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 2048,
        "system": system_prompt,
        "messages": messages,
        "temperature": 0.3
    })
    
    response = bedrock_runtime.invoke_model(
        modelId=BEDROCK_MODEL_ID,
        body=body,
        contentType="application/json",
        accept="application/json"
    )
    
    response_body = json.loads(response["body"].read())
    return response_body["content"][0]["text"]
