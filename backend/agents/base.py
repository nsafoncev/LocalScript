from pathlib import Path
from backend.ollama_client import generate, resolve_model_name


class BaseAgent:
    def __init__(self, prompt_filename: str, agent_role: str | None = None):
        path = Path(__file__).parent / "prompts" / prompt_filename
        if not path.exists():
            raise FileNotFoundError(f"Промпт не найден: {path}")

        self.system_prompt = path.read_text(encoding="utf-8")
        self.agent_role = agent_role or path.stem
        self.model_name = resolve_model_name(self.agent_role)

        extra_path = path.with_name(f"{path.stem}_extra{path.suffix}")
        if extra_path.exists():
            self.system_prompt += "\n\n" + extra_path.read_text(encoding="utf-8")

    def run(self, messages: list[dict]) -> str:
        return generate(self.system_prompt, messages, model_name=self.model_name)
