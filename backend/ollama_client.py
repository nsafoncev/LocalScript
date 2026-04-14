import httpx
import os

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
DEFAULT_MODEL_NAME = "qwen2.5-coder:7b"

OLLAMA_PARAMS = {
    "num_ctx": 4096,
    "num_predict": 256,
    "temperature": 0.1,
}


def resolve_model_name(agent_role: str | None = None) -> str:
    if agent_role:
        role_specific = os.getenv(f"{agent_role.upper()}_MODEL")
        if role_specific:
            return role_specific

    return os.getenv("MODEL_NAME", DEFAULT_MODEL_NAME)


def generate(
    system_prompt: str,
    messages: list[dict],
    model_name: str | None = None,
) -> str:
    payload = {
        "model": model_name or resolve_model_name(),
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
            timeout=600.0,
        )
        response.raise_for_status()
        return response.json()["message"]["content"]
    except httpx.ConnectError:
        raise RuntimeError("Ollama is unavailable. Start the service.")


def check_connection() -> bool:
    try:
        r = httpx.get(f"{OLLAMA_HOST}/api/tags", timeout=5.0)
        return r.status_code == 200
    except Exception:
        return False
