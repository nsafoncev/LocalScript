from backend.agents.base import BaseAgent
from typing import Optional


class PromptRefinerAgent(BaseAgent):
    def __init__(self):
        super().__init__("refiner.txt")

    def refine(
        self,
        user_message: str,
        context: str = "",
        history: Optional[list[dict]] = None,
    ) -> str:
        content = f"Request: {user_message}"
        if context.strip():
            content += f"\nContext: {context}"

        messages = list(history) if history else []
        messages.append({"role": "user", "content": content})

        return self.run(messages)