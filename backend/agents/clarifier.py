from backend.agents.base import BaseAgent


class ClarifierAgent(BaseAgent):
    def __init__(self):
        super().__init__("clarifier.txt", agent_role="clarifier")

    def analyze(self, user_message: str, context: str = "") -> str:
        latest_user_message = self._extract_latest_user_message(user_message)
        heuristic = self._fast_path(latest_user_message, context, user_message)
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
        if raw.upper().startswith("UNCLEAR"):
            return "Уточни, пожалуйста, какую переменную и какое действие нужно использовать."
        return raw

    def _fast_path(self, user_message: str, context: str, full_request: str = "") -> str | None:
        message = user_message.strip()
        context = context.strip()
        full_request = full_request.strip()
        message_lower = message.lower()
        context_lower = context.lower()
        full_request_lower = full_request.lower()

        if not message:
            return "Что именно нужно сгенерировать?"

        if self._is_follow_up_to_clarification(message_lower, full_request_lower):
            return "CLEAR"

        if self._is_standalone_coding_request(message_lower, context_lower):
            return "CLEAR"

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

    def _extract_latest_user_message(self, raw: str) -> str:
        lines = [line.strip() for line in raw.splitlines() if line.strip()]
        for line in reversed(lines):
            if line.startswith("USER:"):
                return line[5:].strip()
        return raw.strip()

    def _is_follow_up_to_clarification(self, message_lower: str, full_request_lower: str) -> bool:
        if "assistant:" not in full_request_lower:
            return False

        last_assistant_line = ""
        for line in reversed([line.strip() for line in full_request_lower.splitlines() if line.strip()]):
            if line.startswith("assistant:"):
                last_assistant_line = line
                break

        if "какую переменную или поле из wf нужно использовать?" not in last_assistant_line:
            return False

        if self._mentions_named_variable(message_lower) or "wf." in message_lower:
            return True

        short_follow_up = len(message_lower.split()) <= 4
        negative_reply = any(
            token in message_lower
            for token in ("не надо", "никакую", "любую", "без wf", "не из wf", "no", "none")
        )
        return short_follow_up or negative_reply

    def _is_standalone_coding_request(self, message_lower: str, context_lower: str) -> bool:
        if context_lower and "wf" in context_lower:
            return False

        mentions_workflow = any(
            token in message_lower
            for token in ("wf.", "wf ", "workflow", "luacode", "octapi", "lowcode", "initvariables", "vars.")
        )
        if mentions_workflow:
            return False

        coding_markers = (
            "напиши функцию",
            "write a function",
            "implement",
            "реализуй",
            "fizzbuzz",
            "palindrome",
            "ispalindrome",
            "python",
            "javascript",
            "js",
            "typescript",
            "java",
            "c#",
            "leetcode",
            "алгоритм",
        )
        return any(marker in message_lower for marker in coding_markers)

    def _needs_specific_source(self, message_lower: str, context_lower: str) -> bool:
        if context_lower:
            return False

        if not self._is_workflow_request(message_lower):
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

        if not self._is_workflow_request(message_lower):
            return False

        asks_about_ws = "ws" in message_lower
        asks_how_to_return = any(
            token in message_lower for token in ("как вернуть", "return", "вернуть")
        )
        return asks_about_ws and asks_how_to_return and "wf." not in message_lower

    def _is_workflow_request(self, message_lower: str) -> bool:
        return any(
            token in message_lower
            for token in (
                "wf",
                "переменн",
                "поле",
                "luacode",
                "luascript",
                "octapi",
                "workflow",
                "initvariables",
                "vars",
            )
        )
