import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.agents.clarifier import ClarifierAgent
from backend.agents.coder import CoderAgent
from backend.agents.refiner import PromptRefinerAgent
from backend.agents.validator import LuaGenerationValidator
from backend.ollama_client import check_connection


TESTS = [
    {
        "name": "1. Последний элемент массива",
        "prompt": "Из полученного списка email получи последний.",
        "context": '{"wf":{"vars":{"emails":["user1@example.com","user2@example.com","user3@example.com"]}}}',
        "must_contain": ["wf.vars.emails", "#wf.vars.emails"],
    },
    {
        "name": "2. Счётчик попыток",
        "prompt": "Увеличивай значение переменной try_count_n на каждой итерации",
        "context": '{"wf":{"vars":{"try_count_n":3}}}',
        "must_contain": ["wf.vars.try_count_n", "+1"],
    },
    {
        "name": "3. Очистка переменных",
        "prompt": "Очисти значения переменных ID, ENTITY_ID, CALL",
        "context": '{"wf":{"vars":{"RESTbody":{"result":[{"ID":123,"ENTITY_ID":456,"CALL":"x","OTHER":"y"}]}}}}',
        "must_contain": ["wf.vars.RESTbody.result"],
        "must_contain_any": [["pairs", "ipairs"]],
    },
    {
        "name": "4. ISO 8601",
        "prompt": "Преобразуй время из формата YYYYMMDD и HHMMSS в строку ISO 8601",
        "context": '{"wf":{"vars":{"json":{"IDOC":{"ZCDF_HEAD":{"DATUM":"20231015","TIME":"153000"}}}}}}',
        "must_contain": ["string.format", "DATUM", "TIME"],
    },
    {
        "name": "5. Проверка типа данных",
        "prompt": "Преобразуй структуру чтобы все items в ZCDF_PACKAGES были массивами",
        "context": '{"wf":{"vars":{"json":{"IDOC":{"ZCDF_HEAD":{"ZCDF_PACKAGES":[{"items":[{"sku":"A"}]},{"items":{"sku":"C"}}]}}}}}}',
        "must_contain": ["table"],
        "must_contain_any": [["type(", "_utils.array.new"]],
    },
    {
        "name": "6. Фильтрация массива",
        "prompt": "Отфильтруй элементы - оставь только те у которых есть Discount или Markdown",
        "context": '{"wf":{"vars":{"parsedCsv":[{"SKU":"A001","Discount":"10%","Markdown":""},{"SKU":"A002","Discount":"","Markdown":"5%"}]}}}',
        "must_contain": ["_utils.array.new", "wf.vars.parsedCsv"],
    },
    {
        "name": "7. Дополнение кода",
        "prompt": "Добавь переменную с квадратом числа",
        "context": "",
        "must_contain_any": [["n*n", "n * n"]],
    },
    {
        "name": "8. Конвертация в Unix",
        "prompt": "Конвертируй время в переменной recallTime в unix-формат",
        "context": '{"wf":{"initVariables":{"recallTime":"2023-10-15T15:30:00+00:00"}}}',
        "must_contain": ["wf.initVariables.recallTime", "86400"],
    },
]


def _normalize_for_match(text: str) -> str:
    return re.sub(r"\s+", "", text)


def _contains_expected(code: str, test_case: dict) -> tuple[bool, list[str]]:
    normalized = _normalize_for_match(code)
    missing = []

    for token in test_case.get("must_contain", []):
        if _normalize_for_match(token) not in normalized:
            missing.append(token)

    for any_group in test_case.get("must_contain_any", []):
        probes = [_normalize_for_match(token) for token in any_group]
        if not any(probe in normalized for probe in probes):
            missing.append(" | ".join(any_group))

    return not missing, missing


def _run_agent_chain(
    prompt: str,
    context: str,
    clarifier: ClarifierAgent,
    refiner: PromptRefinerAgent,
    coder: CoderAgent,
    validator: LuaGenerationValidator,
) -> dict:
    clarification = clarifier.analyze(prompt, context)
    if clarification != "CLEAR":
        return {
            "status": "needs_clarification",
            "clarification": clarification,
            "refined_prompt": None,
            "code": None,
            "validation_errors": [],
        }

    refined_prompt = refiner.refine(prompt, context)
    code = coder.generate_lua([{"role": "user", "content": refined_prompt}], task=prompt)
    validation_errors = validator.validate(code)

    return {
        "status": "completed" if not validation_errors else "invalid",
        "clarification": "CLEAR",
        "refined_prompt": refined_prompt,
        "code": code,
        "validation_errors": validation_errors,
    }


def run():
    if not check_connection():
        print("ERROR: Ollama недоступна")
        sys.exit(1)

    clarifier = ClarifierAgent()
    refiner = PromptRefinerAgent()
    coder = CoderAgent()
    validator = LuaGenerationValidator()
    passed = 0
    results = []

    print("\n" + "=" * 60)
    print("AGENTS SMOKE TEST")
    print("=" * 60)

    for test_case in TESTS:
        result = _run_agent_chain(
            test_case["prompt"],
            test_case["context"],
            clarifier,
            refiner,
            coder,
            validator,
        )
        code = result["code"] or ""
        has_block = "lua{" in code and "}lua" in code
        has_expected, missing = _contains_expected(code, test_case)
        ok = result["status"] == "completed" and has_block and has_expected and not result["validation_errors"]

        print(f"\n{'[OK]' if ok else '[FAIL]'} {test_case['name']}")
        if not ok:
            print(f"   status: {result['status']}")
            if missing:
                print(f"   missing: {missing}")
            if not has_block:
                print("   missing lua{...}lua block")
            if result["validation_errors"]:
                print(f"   validation_errors: {result['validation_errors']}")
            if code:
                print(f"   code: {code[:220]}...")

        if ok:
            passed += 1

        results.append(
            {
                "name": test_case["name"],
                "status": result["status"],
                "ok": ok,
                "validation_errors": result["validation_errors"],
                "code": code,
                "refined_prompt": result["refined_prompt"],
            }
        )

    print("\n" + "=" * 60)
    print(f"Итого: {passed}/{len(TESTS)}")
    print("=" * 60)
    print("\nJSON summary:")
    print(json.dumps(results, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    run()
