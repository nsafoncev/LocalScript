from backend.agents.base import BaseAgent


class ClarifierAgent(BaseAgent):
    def __init__(self):
        super().__init__("clarifier.txt", agent_role="clarifier")

    def analyze(self, user_message: str, context: str = "") -> str:
        heuristic = self._fast_path(user_message, context)
        if heuristic is not None:
            return heuristic

        content = user_message
        if context.strip():
            content += f"\nContext: {context}"
        raw = self.run([{"role": "user", "content": content}])
        return self._parse(raw.strip())

    def _parse(self, raw: str) -> str:
        if raw.upper().startswith("CLEAR"):
            return "CLEAR"
        return raw

    def _fast_path(self, user_message: str, context: str) -> str | None:
        message = user_message.strip()
        context = context.strip()
        message_lower = message.lower()
        context_lower = context.lower()

        if not message:
            return "Что именно нужно сгенерировать?"

        if self._needs_shape_clarification(message_lower, context_lower):
            return "Что хранится в wf.vars.ws: строка, массив или объект?"

        if self._needs_specific_source(message_lower, context_lower):
            return "Какую переменную или поле из wf нужно использовать?"

        if self._looks_answered(message_lower, context_lower):
            return "CLEAR"

        return None

    def _looks_answered(self, message_lower: str, context_lower: str) -> bool:
        combined = f"{message_lower}\n{context_lower}"
        has_workflow_data = any(
            marker in combined
            for marker in ("wf.", '"wf"', "context:", "relevant local knowledge base excerpts:")
        )
        has_generation_intent = any(
            token in message_lower
            for token in (
                "верни",
                "добавь",
                "создай",
                "сгенер",
                "конверт",
                "преобраз",
                "очист",
                "отфильтр",
                "увелич",
                "square",
                "unix",
                "iso",
                "lua",
                "wf.",
            )
        )
        return has_workflow_data or has_generation_intent

    def _needs_specific_source(self, message_lower: str, context_lower: str) -> bool:
        if context_lower:
            return False

        if self._mentions_named_variable(message_lower):
            return False

        mentions_generic_value = any(
            token in message_lower
            for token in ("числ", "значени", "переменн", "массив", "время", "дат", "строк")
        )
        mentions_exact_source = any(
            token in message_lower
            for token in ("wf.", "recalltime", "datum", "time", "try_count", "emails")
        )
        return mentions_generic_value and not mentions_exact_source

    def _mentions_named_variable(self, message_lower: str) -> bool:
        variable_markers = (
            "переменн",
            "поле ",
            "field ",
            "variable ",
            "переменную ",
            "переменной ",
        )
        known_short_names = (" ws", " ws?", " ws ", "try_count_n", "emails", "recalltime")

        return any(marker in message_lower for marker in variable_markers) and any(
            name in f" {message_lower} " for name in known_short_names
        )

    def _needs_shape_clarification(self, message_lower: str, context_lower: str) -> bool:
        if context_lower:
            return False

        asks_about_ws = "ws" in message_lower
        asks_how_to_return = any(
            token in message_lower for token in ("как вернуть", "return", "вернуть")
        )
        return asks_about_ws and asks_how_to_return and "wf." not in message_lower
