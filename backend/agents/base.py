from pathlib import Path
from backend.ollama_client import generate

class BaseAgent:
    def __init__(self, prompt_filename: str):
        path = Path(__file__).parent/"prompts"/prompt_filename
        if not path.exists():
            raise FileNotFoundError(f"Промпт не найден: {path}")
        self.system_prompt = path.read_text(encoding="utf-8")

    def run(self, messages: list[dict]) -> str:
        return generate(self.system_prompt, messages)