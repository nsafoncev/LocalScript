import httpx
import os

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
DEFAULT_MODEL_NAME = "qwen2.5-coder:7b"

OLLAMA_PARAMS = {
    "num_ctx": 4096,
    "num_predict": 256,
    "temperature": 0.1,
}


def _extract_ollama_error(response: httpx.Response) -> str:
    try:
      payload = response.json()
    except ValueError:
      payload = None

    if isinstance(payload, dict):
      error = payload.get("error")
      if isinstance(error, str) and error.strip():
        return error.strip()

    text = response.text.strip()
    return text or f"HTTP {response.status_code}"


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
    resolved_model_name = model_name or resolve_model_name()
    payload = {
        "model": resolved_model_name,
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
        raise RuntimeError("Ollama недоступна. Проверьте, что сервис запущен и готов к работе.")
    except httpx.TimeoutException:
        raise RuntimeError(
            f"Модель {resolved_model_name} ещё загружается или отвечает слишком долго. "
            "Подождите завершения инициализации Ollama и попробуйте снова."
        )
    except httpx.HTTPStatusError as exc:
        detail = _extract_ollama_error(exc.response)
        raise RuntimeError(
            f"Ollama вернула ошибку для модели {resolved_model_name}: {detail}"
        )
    except httpx.HTTPError as exc:
        raise RuntimeError(f"Ошибка запроса к Ollama: {exc}")


def check_connection() -> bool:
    try:
        r = httpx.get(f"{OLLAMA_HOST}/api/tags", timeout=5.0)
        return r.status_code == 200
    except Exception:
        return False
