import unittest
from unittest.mock import patch

from backend.agents.clarifier import ClarifierAgent


class ClarifierAgentTests(unittest.TestCase):
    def test_returns_question_for_empty_request(self):
        agent = ClarifierAgent()
        self.assertEqual(agent.analyze(""), "Что именно нужно сгенерировать?")

    @patch("backend.agents.clarifier.BaseAgent.run")
    def test_skips_llm_when_request_is_specific(self, run_mock):
        agent = ClarifierAgent()

        result = agent.analyze(
            "Конвертируй wf.initVariables.recallTime в unix",
            '{"wf":{"initVariables":{"recallTime":"2023-10-15T15:30:00+00:00"}}}',
        )

        self.assertEqual(result, "CLEAR")
        run_mock.assert_not_called()

    @patch("backend.agents.clarifier.BaseAgent.run")
    def test_asks_for_source_when_request_is_generic(self, run_mock):
        agent = ClarifierAgent()

        result = agent.analyze("Добавь переменную с квадратом числа")

        self.assertEqual(result, "Какую переменную или поле из wf нужно использовать?")
        run_mock.assert_not_called()

    @patch("backend.agents.clarifier.BaseAgent.run")
    def test_asks_about_ws_shape_when_request_is_too_abstract(self, run_mock):
        agent = ClarifierAgent()

        result = agent.analyze("Как вернуть переменную ws в LuaScript?")

        self.assertEqual(result, "Что хранится в wf.vars.ws: строка, массив или объект?")
        run_mock.assert_not_called()

    @patch("backend.agents.clarifier.BaseAgent.run")
    def test_does_not_ask_for_source_when_named_variable_is_present(self, run_mock):
        agent = ClarifierAgent()

        result = agent.analyze("Как прибавить 1 к числовой переменной ws в LuaCode?")

        self.assertEqual(result, "CLEAR")
        run_mock.assert_not_called()

    @patch("backend.agents.clarifier.BaseAgent.run", return_value="CLEAR.")
    def test_normalizes_model_answer(self, run_mock):
        agent = ClarifierAgent()

        result = agent.analyze("Нечеткий запрос", "")

        self.assertEqual(result, "CLEAR")
        run_mock.assert_called_once()

    @patch("backend.agents.clarifier.BaseAgent.run")
    def test_marks_answer_to_previous_shape_question_as_clear(self, run_mock):
        agent = ClarifierAgent()

        result = agent.analyze(
            "USER: Как вернуть переменную ws в LuaScript?\n"
            "ASSISTANT: Что хранится в wf.vars.ws: строка, массив или объект?\n"
            "USER: одно число, а не массив"
        )

        self.assertEqual(result, "CLEAR")
        run_mock.assert_not_called()

    @patch("backend.agents.clarifier.BaseAgent.run")
    def test_replaces_raw_unclear_from_model_with_question(self, run_mock):
        run_mock.return_value = "UNCLEAR"
        agent = ClarifierAgent()

        result = agent.analyze("Нечеткий запрос", "")

        self.assertEqual(
            result,
            "Уточни, пожалуйста, какую переменную и какое действие нужно использовать.",
        )
