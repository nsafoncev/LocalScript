from backend.agents.base import BaseAgent


class ClarifierAgent(BaseAgent):
    def __init__(self):
        super().__init__("clarifier.txt")

    def analyze(self, user_message: str, context: str = "") -> str:
        """
        Возвращает "CLEAR" если запрос понятен,
        или строку с уточняющим вопросом.
        """
        content = user_message
        if context.strip():
            content += f"\nContext: {context}"
        raw = self.run([{"role": "user", "content": content}])
        return self._parse(raw.strip())

    def _parse(self, raw: str) -> str:
        """
        Нормализуем ответ — модель может написать
        "CLEAR." или "Clear - understood" вместо просто CLEAR
        """
        if raw.upper().startswith("CLEAR"):
            return "CLEAR"
        return raw