from backend.agents.base import BaseAgent

class CriticAgent(BaseAgent):
    def __init__(self):
        super().__init__("critic.txt")

    def fix(self, task: str, bad_code: str, errors: str) -> str:
        """
        Исправляет код по найденным ошибкам.
        """
        content = (
            f"Task: {task}\n\n"
            f"Bad code:\n{bad_code}\n\n"
            f"Errors:\n{errors}\n\n"
            f"Fix the code."
        )
        return self.run([
            {"role": "user", "content": content}
        ])