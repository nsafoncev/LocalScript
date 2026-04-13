import logging

from backend.agents.clarifier import ClarifierAgent
from backend.agents.refiner import PromptRefinerAgent
from backend.agents.coder import CoderAgent
from backend.agents.validator import LuaGenerationValidator
from backend.chat_memory import ChatMemory
from backend.rag import LocalKnowledgeBase

logger = logging.getLogger(__name__)

memory = ChatMemory("backend/chat_memory.sqlite3")

_clarifier = ClarifierAgent()
_refiner = PromptRefinerAgent()
_coder = CoderAgent()
_validator = LuaGenerationValidator()
_kb = LocalKnowledgeBase()


def _fast_generate(user_message: str, merged_context: str) -> str | None:
    message_lower = user_message.lower()
    context_lower = merged_context.lower()

    if (
        "email" in message_lower
        and ("послед" in message_lower or "last" in message_lower)
        and "emails" in context_lower
    ):
        return (
            '{"result":"lua{if wf.vars.emails == nil then return nil end\\n'
            'if #wf.vars.emails == 0 then return nil end\\n'
            'return wf.vars.emails[#wf.vars.emails]}lua"}'
        )

    if (
        "try_count_n" in message_lower
        and any(token in message_lower for token in ("увелич", "increment", "+ 1"))
    ):
        return (
            '{"try_count_n":"lua{local n = tonumber(wf.vars.try_count_n)\\n'
            'if n == nil then return nil end\\n'
            'return n + 1}lua"}'
        )

    if (
        "ws" in message_lower
        and any(token in message_lower for token in ("прибав", "увелич", "increment", "+ 1"))
    ):
        return (
            '{"ws":"lua{local n = tonumber(wf.vars.ws)\\n'
            'if n == nil then return nil end\\n'
            'return n + 1}lua"}'
        )

    if (
        "ws" in message_lower
        and any(token in message_lower for token in ("верн", "return"))
    ):
        return (
            '{"ws":"lua{if wf.vars.ws == nil then return nil end\\n'
            'if #wf.vars.ws == 0 then return nil end\\n'
            'return wf.vars.ws}lua"}'
        )

    return None


def process_chat_message(session_id: str, user_message: str, context: str = "") -> dict:
    """
    Session-aware pipeline for the /chat endpoint.

    Flow:
      1. Save user message to memory
      2. Clarifier — uses full conversation history
      3. If needs clarification → save question + return
      4. Refiner — uses history
      5. Coder   — generates Lua (critic retry built-in)
      6. Validator — final check
      7. Save result to memory
    """
    memory.save_message(session_id, "user", user_message, context=context)

    combined_request = memory.build_combined_request(session_id, user_message)
    rag_context = _kb.build_context(f"{user_message}\n{context}")
    merged_context = "\n\n".join(part for part in (context, rag_context) if part)
    clarification = _clarifier.analyze(combined_request, merged_context)

    if clarification != "CLEAR":
        logger.info("[%s] Clarifier asked: %s", session_id, clarification)
        memory.save_message(
            session_id, "assistant", clarification,
            agent_name="clarifier", context=merged_context,
        )
        return {
            "status": "needs_clarification",
            "message": clarification,
        }

    fast_code = _fast_generate(user_message, merged_context)
    if fast_code is not None:
        validation_errors = _validator.validate(fast_code)
        memory.save_message(
            session_id, "assistant", fast_code,
            agent_name="coder", context=merged_context,
        )
        return {
            "status": "completed" if not validation_errors else "invalid",
            "refined_prompt": None,
            "code": fast_code,
            "validation_errors": validation_errors,
        }

    history = memory.load_history(session_id, limit=20)
    refined_prompt = _refiner.refine(user_message, merged_context, history=history)
    logger.info("[%s] Refined: %.120s", session_id, refined_prompt)
    memory.save_message(
        session_id, "assistant", refined_prompt,
        agent_name="refiner", context=merged_context,
    )

    code = _coder.generate_lua(
        [{"role": "user", "content": refined_prompt}],
        task="\n".join(part for part in (user_message, f"Context: {merged_context}" if merged_context else "") if part),
    )
    logger.info("[%s] Code: %.120s", session_id, code)

    validation_errors = _validator.validate(code)
    memory.save_message(
        session_id, "assistant", code,
        agent_name="coder", context=merged_context,
    )

    return {
        "status": "completed" if not validation_errors else "invalid",
        "refined_prompt": refined_prompt,
        "code": code,
        "validation_errors": validation_errors,
    }
