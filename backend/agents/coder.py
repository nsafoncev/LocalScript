import re
from backend.agents.base import BaseAgent
from backend.agents.critic import CriticAgent

class CoderAgent(BaseAgent):
    def __init__(self):
        super().__init__("coder.txt")
        self._critic = CriticAgent()

    def generate_lua(self, messages: list[dict], task: str = "", max_retries: int = 2) -> str:
        raw = self.run(messages)
        code = self._repair(raw)

        for _ in range(max_retries):
            errors = self._validate(code)
            if not errors:
                break
            code = self._critic.fix(task, code, "\n".join(errors))
            code = self._repair(code)

        return code

    def _validate(self, code: str) -> list[str]:
        errors = []
        if "lua{" not in code or "}lua" not in code:
            errors.append("Нет блока lua{...}lua")
        if "os.time()" in code or "os.date()" in code:
            errors.append("Запрещено: os.time() / os.date()")
        if "require(" in code:
            errors.append("Запрещено: require()")
        if "$." in code:
            errors.append("JsonPath запрещён — используй wf.vars")
        if "return" not in code:
            errors.append("Отсутствует return")
        return errors

    def _repair(self, raw: str) -> str:
        raw = raw.strip()
        raw = re.sub(r'```json\s*', '', raw)
        raw = re.sub(r'```\s*', '', raw)
        raw = raw.strip()

        if 'lua{' not in raw:
            return raw

        last_open_pos = raw.rfind('lua{')
        after_last_open = raw[last_open_pos:]
        if '}lua' not in after_last_open:
            raw += '}lua'

        if raw.count('"') % 2 != 0:
            raw += '"'
        if raw.count('{') > raw.count('}'):
            raw += '}'

        return raw