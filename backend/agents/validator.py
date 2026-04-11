import json
import re


class LuaGenerationValidator:
    FORBIDDEN_TOKENS = (
        "os.time(",
        "os.date(",
        "require(",
        "loadstring(",
        "io.",
        "$.",
    )

    def sanitize(self, raw: str) -> str:
        cleaned = raw.strip()
        cleaned = re.sub(r"```json\s*", "", cleaned)
        cleaned = re.sub(r"```\s*", "", cleaned)
        return cleaned.strip()

    def validate(self, raw: str) -> list[str]:
        errors: list[str] = []
        cleaned = self.sanitize(raw)

        payload = self._parse_json(cleaned)
        if payload is None:
            return ["Ответ модели должен быть JSON-объектом."]
        if not payload:
            return ["JSON-объект не должен быть пустым."]

        for key, value in payload.items():
            if not isinstance(value, str):
                errors.append(f"Поле {key} должно содержать строку с Lua-кодом.")
                continue

            if "lua{" not in value or "}lua" not in value:
                errors.append(f"Поле {key} не содержит блока lua{{...}}lua.")
                continue

            code = self.extract_lua(value)
            if not code.strip():
                errors.append(f"Поле {key} содержит пустой Lua-код.")
                continue

            if "return" not in code:
                errors.append(f"Поле {key} должно содержать return.")
            if code.count("(") != code.count(")"):
                errors.append(f"Поле {key} содержит несбалансированные круглые скобки.")
            if code.count("{") != code.count("}"):
                errors.append(f"Поле {key} содержит несбалансированные фигурные скобки.")
            if code.count('"') % 2 != 0:
                errors.append(f"Поле {key} содержит незакрытую строку.")

            for token in self.FORBIDDEN_TOKENS:
                if token in code:
                    errors.append(f"Поле {key} содержит запрещенный токен: {token}")

        return errors

    def extract_lua(self, value: str) -> str:
        start = value.find("lua{")
        end = value.rfind("}lua")
        if start == -1 or end == -1 or end < start:
            return ""
        return value[start + 4:end]

    def _parse_json(self, cleaned: str) -> dict | None:
        try:
            data = json.loads(cleaned)
        except json.JSONDecodeError:
            return None
        return data if isinstance(data, dict) else None
