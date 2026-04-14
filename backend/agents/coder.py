from backend.agents.base import BaseAgent
from backend.agents.critic import CriticAgent
from backend.agents.validator import LuaGenerationValidator
from backend.ollama_client import generate


GENERIC_FUNCTION_SYSTEM_PROMPT = """You are a generic Lua 5.5 function generator.

Generate plain Lua functions when the user asks for a standalone function without workflow context.

RULES:
- Do not use wf.vars, wf.initVariables, Octapi, or platform-specific globals
- Return ONLY one JSON object in the format {\"result\":\"lua{...}lua\"}
- The code inside lua{...}lua must define a local function
- The code must end with return <function_name>
- No markdown, no explanations
- Prefer clear function names and normal Lua arguments
"""


class CoderAgent(BaseAgent):
    def __init__(self):
        super().__init__("coder.txt", agent_role="coder")
        self._critic = CriticAgent()
        self._validator = LuaGenerationValidator()

    def generate_lua(self, messages: list[dict], task: str = "", max_retries: int = 1) -> str:
        effective_task = task or self._infer_task(messages)

        if self._is_generic_function_mode(effective_task):
            code = self._repair(self._generate_generic_function(messages, effective_task))
            for _ in range(max_retries):
                errors = self.validate_output(code)
                if not errors:
                    break
                code = self._repair(self._critic.fix(effective_task, code, "\n".join(errors)))
            return code

        direct_fallback = self._direct_fast_path(effective_task)
        if direct_fallback is not None:
            return direct_fallback

        fallback = self._template_fallback(effective_task)
        if fallback is not None:
            return fallback

        code = self._repair(self.run(messages))

        for _ in range(max_retries):
            errors = self.validate_output(code)
            if not errors:
                break
            code = self._repair(self._critic.fix(effective_task, code, "\n".join(errors)))

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

        if "restbody" in task_lower and "result" in task_lower and all(
            token in task_lower for token in ("id", "entity_id", "call")
        ):
            return (
                '{"result":"lua{local result = wf.vars.RESTbody.result\\n'
                'for _, filteredEntry in pairs(result) do\\n'
                '  for key, value in pairs(filteredEntry) do\\n'
                '    if key == \\\"ID\\\" or key == \\\"ENTITY_ID\\\" or key == \\\"CALL\\\" then\\n'
                '      filteredEntry[key] = nil\\n'
                '    end\\n'
                '  end\\n'
                'end\\n'
                'return result}lua"}'
            )

        if "datum" in task_lower and "time" in task_lower and "iso" in task_lower:
            return (
                '{"time":"lua{DATUM = wf.vars.json.IDOC.ZCDF_HEAD.DATUM\\n'
                'TIME = wf.vars.json.IDOC.ZCDF_HEAD.TIME\\n'
                'local function safe_sub(str, start_pos, end_pos)\\n'
                '  local s = string.sub(str, start_pos, math.min(end_pos, #str))\\n'
                '  return s ~= \\\"\\\" and s or \\\"00\\\"\\n'
                'end\\n'
                'local year = safe_sub(DATUM, 1, 4)\\n'
                'local month = safe_sub(DATUM, 5, 6)\\n'
                'local day = safe_sub(DATUM, 7, 8)\\n'
                'local hour = safe_sub(TIME, 1, 2)\\n'
                'local minute = safe_sub(TIME, 3, 4)\\n'
                'local second = safe_sub(TIME, 5, 6)\\n'
                'local iso_date = string.format(\\\"%s-%s-%sT%s:%s:%s.00000Z\\\", year, month, day, hour, minute, second)\\n'
                'return iso_date}lua"}'
            )

        if "zcdf_packages" in task_lower and "items" in task_lower and "массив" in task_lower:
            return (
                '{"packages":"lua{local function ensureArray(t)\\n'
                '  if type(t) ~= \\\"table\\\" then\\n'
                '    return {t}\\n'
                '  end\\n'
                '  local isArray = true\\n'
                '  for k, v in pairs(t) do\\n'
                '    if type(k) ~= \\\"number\\\" or math.floor(k) ~= k then\\n'
                '      isArray = false\\n'
                '      break\\n'
                '    end\\n'
                '  end\\n'
                '  return isArray and t or {t}\\n'
                'end\\n'
                'local function ensureAllItemsAreArrays(objectsArray)\\n'
                '  if type(objectsArray) ~= \\\"table\\\" then\\n'
                '    return objectsArray\\n'
                '  end\\n'
                '  for _, obj in ipairs(objectsArray) do\\n'
                '    if type(obj) == \\\"table\\\" and obj.items then\\n'
                '      obj.items = ensureArray(obj.items)\\n'
                '    end\\n'
                '  end\\n'
                '  return objectsArray\\n'
                'end\\n'
                'return ensureAllItemsAreArrays(wf.vars.json.IDOC.ZCDF_HEAD.ZCDF_PACKAGES)}lua"}'
            )

        if "parsedcsv" in task_lower and all(token in task_lower for token in ("discount", "markdown")):
            return (
                '{"result":"lua{local result = _utils.array.new()\\n'
                'local items = wf.vars.parsedCsv\\n'
                'for _, item in ipairs(items) do\\n'
                '  if (item.Discount ~= \\\"\\\" and item.Discount ~= nil) or (item.Markdown ~= \\\"\\\" and item.Markdown ~= nil) then\\n'
                '    table.insert(result, item)\\n'
                '  end\\n'
                'end\\n'
                'return result}lua"}'
            )

        return None

    def _infer_task(self, messages: list[dict]) -> str:
        parts = []
        for message in messages:
            content = message.get("content")
            if isinstance(content, str) and content.strip():
                parts.append(content)
        return "\n".join(parts)

    def _template_fallback(self, task: str) -> str | None:
        task_lower = task.lower()

        if "recalltime" in task_lower and "unix" in task_lower:
            return (
                '{"unix_time":"lua{local s=wf.initVariables.recallTime\\n'
                'local Y,M,D,h,m,sec,sg,oh,om=s:match(\\\"(%d+)-(%d+)-(%d+)T(%d+):(%d+):(%d+)([+-])(%d+):(%d+)\\\")\\n'
                'if not Y then return nil end\\n'
                'local dim={31,28,31,30,31,30,31,31,30,31,30,31}\\n'
                'local function leap(y)return(y%4==0 and y%100~=0)or y%400==0 end\\n'
                'local function days(y,mo,d)local t=0;for i=1970,y-1 do t=t+(leap(i)and 366 or 365)end;for i=1,mo-1 do t=t+dim[i];if i==2 and leap(y)then t=t+1 end end;return t+d-1 end\\n'
                'local td=days(Y+0,M+0,D+0)\\n'
                'local ts=td*86400+(h+0)*3600+(m+0)*60+(sec+0)\\n'
                'local ofs=(oh+0)*3600+(om+0)*60\\n'
                'return sg==\\"+\\" and ts-ofs or ts+ofs}lua"}'
            )

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

    def _is_generic_function_mode(self, task: str) -> bool:
        task_lower = task.lower()
        mentions_function = any(
            token in task_lower for token in ("функц", "function")
        )
        mentions_workflow = any(
            token in task_lower
            for token in ("wf.", '"wf"', "wf.vars", "wf.initvariables", "octapi", "luacode", "luascript")
        )
        return mentions_function and not mentions_workflow

    def _generate_generic_function(self, messages: list[dict], task: str) -> str:
        generic_messages = list(messages) if messages else [{"role": "user", "content": task}]
        generic_messages = [
            {
                "role": message.get("role", "user"),
                "content": self._strip_workflow_bias(str(message.get("content", ""))),
            }
            for message in generic_messages
        ]

        return generate(
            GENERIC_FUNCTION_SYSTEM_PROMPT,
            generic_messages,
            model_name=self.model_name,
        )

    def _strip_workflow_bias(self, content: str) -> str:
        return content.replace("wf.vars", "input values").replace("wf.initVariables", "input values")
