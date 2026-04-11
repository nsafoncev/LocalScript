import logging

from backend.agents.clarifier import ClarifierAgent
from backend.agents.refiner import PromptRefinerAgent
from backend.agents.coder import CoderAgent
from backend.agents.validator import LuaGenerationValidator
from backend.chat_memory import ChatMemory

logger = logging.getLogger(__name__)

memory = ChatMemory("backend/chat_memory.sqlite3")

_clarifier = ClarifierAgent()
_refiner = PromptRefinerAgent()
_coder = CoderAgent()
_validator = LuaGenerationValidator()


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
    clarification = _clarifier.analyze(combined_request, context)

    if clarification != "CLEAR":
        logger.info("[%s] Clarifier asked: %s", session_id, clarification)
        memory.save_message(
            session_id, "assistant", clarification,
            agent_name="clarifier", context=context,
        )
        return {
            "status": "needs_clarification",
            "message": clarification,
        }

    history = memory.load_history(session_id, limit=20)
    refined_prompt = _refiner.refine(user_message, context, history=history)
    logger.info("[%s] Refined: %.120s", session_id, refined_prompt)
    memory.save_message(
        session_id, "assistant", refined_prompt,
        agent_name="refiner", context=context,
    )

    code = _coder.generate_lua(
        [{"role": "user", "content": refined_prompt}],
        task=user_message,
    )
    logger.info("[%s] Code: %.120s", session_id, code)

    validation_errors = _validator.validate(code)
    memory.save_message(
        session_id, "assistant", code,
        agent_name="coder", context=context,
    )

    return {
        "status": "completed" if not validation_errors else "invalid",
        "refined_prompt": refined_prompt,
        "code": code,
        "validation_errors": validation_errors,
    }