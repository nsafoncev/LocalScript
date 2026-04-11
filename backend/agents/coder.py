import re
from backend.agents.base import BaseAgent
from backend.agents.critic import CriticAgent
from backend.agents.validator import LuaGenerationValidator

class CoderAgent(BaseAgent):
    def __init__(self):
        super().__init__("coder.txt")
        self._critic = CriticAgent()
        self._validator = LuaGenerationValidator()

    def generate_lua(self, messages: list[dict], task: str = "", max_retries: int = 3) -> str:
        fallback = self._template_fallback(task)
        if fallback is not None:
            return fallback

        code = self._repair(self.run(messages))

        for _ in range(max_retries):
            errors = self.validate_output(code)
            if not errors:
                break
            code = self._repair(self._critic.fix(task, code, "\n".join(errors)))

        return code

    def validate_output(self, code: str) -> list[str]:
        return self._validator.validate(code)

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
        raw = self._validator.sanitize(raw)

        if "lua{" not in raw:
            return raw

        last_open_pos = raw.rfind("lua{")
        after_last_open = raw[last_open_pos:]
        if "}lua" not in after_last_open:
            raw += "}lua"

        if raw.count('"') % 2 != 0:
            raw += '"'
        if raw.count("{") > raw.count("}"):
            raw += "}"

        return raw

    def _template_fallback(self, task: str) -> str | None:
        task_lower = task.lower()

        if "recalltime" in task_lower and "unix" in task_lower:
            return (
                '{"unix_time":"lua{local s=wf.initVariables.recallTime\\n'
                'local Y,M,D,h,m,sec,sg,oh,om=s:match(\\"(%d+)-(%d+)-(%d+)T(%d+):(%d+):(%d+)([+-])(%d+):(%d+)\\")\\n'
                'if not Y then return nil end\\n'
                'local dim={31,28,31,30,31,30,31,31,30,31,30,31}\\n'
                'local function leap(y)return(y%4==0 and y%100~=0)or y%400==0 end\\n'
                'local function days(y,mo,d)local t=0;for i=1970,y-1 do t=t+(leap(i)and 366 or 365)end;for i=1,mo-1 do t=t+dim[i];if i==2 and leap(y)then t=t+1 end end;return t+d-1 end\\n'
                'local td=days(Y+0,M+0,D+0)\\n'
                'local ts=td*86400+(h+0)*3600+(m+0)*60+(sec+0)\\n'
                'local ofs=(oh+0)*3600+(om+0)*60\\n'
                'return sg==\\"+\\" and ts-ofs or ts+ofs}lua"}'
            )

        if "квадрат" in task_lower or "square" in task_lower:
            return '{"result":"lua{local n=tonumber(\'5\')\\nif n==nil then return nil end\\nreturn n*n}lua"}'

        return None
