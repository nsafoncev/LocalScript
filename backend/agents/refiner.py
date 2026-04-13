from backend.agents.base import BaseAgent
from typing import Optional
import httpx


class PromptRefinerAgent(BaseAgent):
    def __init__(self):
        super().__init__("refiner.txt", agent_role="refiner")

    def refine(
        self,
        user_message: str,
        context: str = "",
        history: Optional[list[dict]] = None,
    ) -> str:
        fast_path = self._fast_path(user_message, context)
        if fast_path is not None:
            return fast_path

        content = f"Request: {user_message}"
        if context.strip():
            content += f"\nContext: {context}"

        messages = list(history) if history else []
        messages.append({"role": "user", "content": content})

        try:
            return self.run(messages)
        except httpx.HTTPError:
            return content

    def _fast_path(self, user_message: str, context: str) -> str | None:
        message = user_message.strip()
        context = context.strip()
        message_lower = message.lower()
        context_lower = context.lower()
        combined = f"{message_lower}\n{context_lower}"

        if not message:
            return None

        has_explicit_source = any(
            marker in combined
            for marker in (
                "wf.",
                '"wf"',
                "recalltime",
                "datum",
                "time",
                "emails",
                "try_count",
                "restbody",
                "parsedcsv",
                "zcdf_packages",
                "relevant local knowledge base excerpts:",
            )
        )
        has_context = bool(context)
        has_simple_intent = any(
            token in message_lower
            for token in (
                "верни",
                "return",
                "конверт",
                "очист",
                "увелич",
                "квадрат",
                "square",
                "unix",
                "iso",
                "добавь",
                "создай",
                "отфильтр",
                "items",
            )
        )
        is_open_ended = any(
            token in message_lower
            for token in (
                "помоги",
                "придум",
                "неизвест",
                "как лучше",
                "вариант",
                "иде",
            )
        )

        if is_open_ended:
            return None

        if not has_simple_intent:
            return None

        if not (has_context or has_explicit_source):
            return None

        if context:
            return f"Request: {message}\nContext: {context}"
        return f"Request: {message}"
