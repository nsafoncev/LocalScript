import logging

from backend.agents.clarifier import ClarifierAgent
from backend.agents.refiner import PromptRefinerAgent
from backend.agents.coder import CoderAgent
from backend.agents.validator import LuaGenerationValidator

logger = logging.getLogger(__name__)

# Module-level singletons — created once at startup
_clarifier = ClarifierAgent()
_refiner = PromptRefinerAgent()
_coder = CoderAgent()
_validator = LuaGenerationValidator()


def run_pipeline(prompt: str) -> dict:
    """
    Stateless pipeline used by the /generate endpoint (backward compat).

    Flow: Clarifier → Refiner → Coder (critic retry built-in) → Validator
    Returns:
        {code, question, valid}
    """
    clarification = _clarifier.analyze(prompt)
    if clarification != "CLEAR":
        logger.info("Clarifier asked: %s", clarification)
        return {"code": "", "question": clarification, "valid": False}

    refined_prompt = _refiner.refine(prompt)
    logger.info("Refined prompt: %.120s", refined_prompt)

    code = _coder.generate_lua(
        [{"role": "user", "content": refined_prompt}],
        task=prompt,
    )
    logger.info("Coder output: %.120s", code)

    errors = _validator.validate(code)
    return {"code": code, "question": None, "valid": len(errors) == 0}
