from pathlib import Path
from backend.ollama_client import generate

class BaseAgent:
    def __init__(self, prompt_filename: str):
        path = Path(__file__).parent/"prompts"/prompt_filename
        if not path.exists():
            raise FileNotFoundError(f"Промпт не найден: {path}")
        self.system_prompt = path.read_text(encoding="utf-8")
        extra_path = path.with_name(f"{path.stem}_extra{path.suffix}")
        if extra_path.exists():
            self.system_prompt += "\n\n" + extra_path.read_text(encoding="utf-8")

    def run(self, messages: list[dict]) -> str:
        return generate(self.system_prompt, messages)
