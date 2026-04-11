import httpx
import os

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
MODEL_NAME = os.getenv("MODEL_NAME", "qwen2.5-coder:3b-instruct-q4_K_M")

OLLAMA_PARAMS = {
    "num_ctx": 4096,
    "num_predict": 256,
    "temperature": 0.2,
}

def generate(system_prompt: str, messages: list[dict]) -> str:
    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "system", "content": system_prompt}
        ] + messages,
        "stream": False,
        "options": OLLAMA_PARAMS,
    }
    try:
        response = httpx.post(
            f"{OLLAMA_HOST}/api/chat",
            json=payload,
            timeout=120.0,
        )
        response.raise_for_status()
        return response.json()["message"]["content"]
    except httpx.ConnectError:
        raise RuntimeError("Ollama недоступна. Запустите сервис.")
    
def check_connection() -> bool:
    try:
        r = httpx.get(f"{OLLAMA_HOST}/api/tags", timeout=5.0)
        return r.status_code == 200
    except Exception:
        return False
