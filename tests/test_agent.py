import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.ollama_client     import check_connection
from backend.agents.clarifier  import ClarifierAgent
from backend.agents.refiner    import PromptRefinerAgent
from backend.agents.coder      import CoderAgent
from backend.agents.critic     import CriticAgent

# ── Публичная выборка ──────────────────────────────────────────
TESTS = [
    {
        "name":    "1. Последний элемент массива",
        "prompt":  'Из полученного списка email получи последний.',
        "context": '{"wf":{"vars":{"emails":["user1@example.com","user2@example.com","user3@example.com"]}}}',
        "must_contain": ["wf.vars.emails", "#wf.vars.emails"],
    },
    {
        "name":    "2. Счётчик попыток",
        "prompt":  "Увеличивай значение переменной try_count_n на каждой итерации",
        "context": '{"wf":{"vars":{"try_count_n":3}}}',
        "must_contain": ["wf.vars.try_count_n", "+ 1"],
    },
    {
        "name":    "3. Очистка переменных",
        "prompt":  "Очисти значения переменных ID, ENTITY_ID, CALL",
        "context": '{"wf":{"vars":{"RESTbody":{"result":[{"ID":123,"ENTITY_ID":456,"CALL":"x","OTHER":"y"}]}}}}',
        "must_contain": ["wf.vars.RESTbody.result", "pairs"],
    },
    {
        "name":    "4. ISO 8601",
        "prompt":  "Преобразуй время из формата YYYYMMDD и HHMMSS в строку ISO 8601",
        "context": '{"wf":{"vars":{"json":{"IDOC":{"ZCDF_HEAD":{"DATUM":"20231015","TIME":"153000"}}}}}}',
        "must_contain": ["string.format", "DATUM", "TIME"],
    },
    {
        "name":    "5. Проверка типа данных",
        "prompt":  "Преобразуй структуру чтобы все items в ZCDF_PACKAGES были массивами",
        "context": '{"wf":{"vars":{"json":{"IDOC":{"ZCDF_HEAD":{"ZCDF_PACKAGES":[{"items":[{"sku":"A"}]},{"items":{"sku":"C"}}]}}}}}}',
        "must_contain": ["type(", "table"],
    },
    {
        "name":    "6. Фильтрация массива",
        "prompt":  "Отфильтруй элементы — оставь только те у которых есть Discount или Markdown",
        "context": '{"wf":{"vars":{"parsedCsv":[{"SKU":"A001","Discount":"10%","Markdown":""},{"SKU":"A002","Discount":"","Markdown":"5%"}]}}}',
        "must_contain": ["_utils.array.new", "wf.vars.parsedCsv"],
    },
    {
        "name":    "7. Дополнение кода",
        "prompt":  "Добавь переменную с квадратом числа",
        "context": "",
        "must_contain": ["n * n"],
    },
    {
        "name":    "8. Конвертация в Unix",
        "prompt":  "Конвертируй время в переменной recallTime в unix-формат",
        "context": '{"wf":{"initVariables":{"recallTime":"2023-10-15T15:30:00+00:00"}}}',
        "must_contain": ["wf.initVariables.recallTime", "86400"],
    },
]

def run():
    if not check_connection():
        print("ERROR: Ollama недоступна")
        sys.exit(1)

    coder   = CoderAgent()
    refiner = PromptRefinerAgent()
    passed  = 0

    print("\n" + "="*60)
    print("ТЕСТ АГЕНТОВ — ПУБЛИЧНАЯ ВЫБОРКА")
    print("="*60)

    for t in TESTS:
        # Refiner улучшает промпт
        refined = refiner.refine(t["prompt"], t["context"])

        # Coder генерирует по уточнённому промпту
        full_input = t["prompt"]
        if t["context"]:
            full_input += f"\nContext: {t['context']}"

        code = coder.generate_lua([
            {"role": "user", "content": refined}
        ])

        has_block = "lua{" in code and "}lua" in code
        has_keys  = all(k in code for k in t["must_contain"])
        ok        = has_block and has_keys

        print(f"\n{'✓' if ok else '✗'}  {t['name']}")
        if not ok:
            print(f"   Код: {code[:150]}...")
            missing = [k for k in t["must_contain"] if k not in code]
            if missing:
                print(f"   Не найдено: {missing}")
            if not has_block:
                print("   Нет блока lua{{...}}lua")
        else:
            passed += 1

    print(f"\n{'='*60}")
    print(f"Итого: {passed}/{len(TESTS)}")
    print("="*60)

if __name__ == "__main__":
    run()