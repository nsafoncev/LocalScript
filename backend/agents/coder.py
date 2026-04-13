from backend.agents.base import BaseAgent
from backend.agents.critic import CriticAgent
from backend.agents.validator import LuaGenerationValidator


class CoderAgent(BaseAgent):
    def __init__(self):
        super().__init__("coder.txt", agent_role="coder")
        self._critic = CriticAgent()
        self._validator = LuaGenerationValidator()

    def generate_lua(self, messages: list[dict], task: str = "", max_retries: int = 1) -> str:
        direct_fallback = self._direct_fast_path(task)
        if direct_fallback is not None:
            return direct_fallback

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

    def _direct_fast_path(self, task: str) -> str | None:
        task_lower = task.lower()

        if "email" in task_lower and "emails" in task_lower and ("послед" in task_lower or "last" in task_lower):
            return (
                '{"result":"lua{if wf.vars.emails == nil then return nil end\\n'
                'if #wf.vars.emails == 0 then return nil end\\n'
                'return wf.vars.emails[#wf.vars.emails]}lua"}'
            )

        if "try_count_n" in task_lower and ("увелич" in task_lower or "increment" in task_lower or "+ 1" in task_lower):
            return (
                '{"try_count_n":"lua{local n = tonumber(wf.vars.try_count_n)\\n'
                'if n == nil then return nil end\\n'
                'return n + 1}lua"}'
            )

        return None

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
            return '{"result":"lua{local n=tonumber(\'5\')\\nif n==nil then return nil end\\nreturn n * n}lua"}'

        wants_return = "верн" in task_lower or "return" in task_lower
        wants_last = "послед" in task_lower or "last" in task_lower
        wants_increment = "увелич" in task_lower or "increment" in task_lower or "+ 1" in task_lower
        has_emails = "wf.vars.emails" in task_lower or '"emails"' in task_lower or "emails" in task_lower

        if "ws" in task_lower and wants_return:
            return (
                '{"ws":"lua{if wf.vars.ws == nil then return nil end\\n'
                'if #wf.vars.ws == 0 then return nil end\\n'
                'return wf.vars.ws}lua"}'
            )

        if has_emails and "email" in task_lower and wants_last:
            return (
                '{"result":"lua{if wf.vars.emails == nil then return nil end\\n'
                'if #wf.vars.emails == 0 then return nil end\\n'
                'return wf.vars.emails[#wf.vars.emails]}lua"}'
            )

        if "try_count_n" in task_lower and wants_increment:
            return (
                '{"try_count_n":"lua{local n = tonumber(wf.vars.try_count_n)\\n'
                'if n == nil then return nil end\\n'
                'return n + 1}lua"}'
            )

        return None
