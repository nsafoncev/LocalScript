import re
from backend.agents.base import BaseAgent

class CoderAgent(BaseAgent):
    def __init__(self):
        super().__init__("coder.txt")

    def generate_lua(self, messages: list[dict]) -> str:
        raw = self.run(messages)
        return self._repair(raw)
    
    def _repair(self, raw: str) -> str:
        raw = raw.strip()

        # Убираем markdown обёртки
        raw = re.sub(r'```json\s*', '', raw)
        raw = re.sub(r'```\s*', '', raw)
        raw = raw.strip()

        if 'lua{' not in raw:
            return raw

        # Находим позицию ПОСЛЕДНЕГО lua{
        last_open_pos = raw.rfind('lua{')

        # Проверяем есть ли }lua ПОСЛЕ него
        after_last_open = raw[last_open_pos:]
        if '}lua' not in after_last_open:
            # Последний блок не закрыт — добавляем
            raw += '}lua'

        # Закрываем JSON если обрезан
        if raw.count('"') % 2 != 0:
            raw += '"'
        open_braces  = raw.count('{')
        close_braces = raw.count('}')
        if open_braces > close_braces:
            raw += '}'

        return raw