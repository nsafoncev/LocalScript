from backend.agents.base import BaseAgent


class ClarifierAgent(BaseAgent):
    def __init__(self):
        super().__init__("clarifier.txt")

    def analyze(self, user_message: str) -> str:
        """
        Возвращает "CLEAR" если запрос понятен,
        или строку с уточняющим вопросом.
        """
        raw = self.run([
            {"role": "user", "content": user_message}
        ])
        return self._parse(raw.strip())

    def _parse(self, raw: str) -> str:
        """
        Нормализуем ответ — модель может написать
        "CLEAR." или "Clear - understood" вместо просто CLEAR
        """
        if raw.upper().startswith("CLEAR"):
            return "CLEAR"
        return raw