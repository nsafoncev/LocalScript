import unittest
from unittest.mock import patch

from backend.agents.refiner import PromptRefinerAgent


class PromptRefinerAgentTests(unittest.TestCase):
    @patch("backend.agents.refiner.BaseAgent.run")
    def test_skips_llm_for_simple_specific_request(self, run_mock):
        agent = PromptRefinerAgent()

        result = agent.refine(
            "Верни wf.vars.ws, если пустая - nil",
            '{"wf":{"vars":{"ws":["a"]}}}',
        )

        self.assertEqual(
            result,
            'Request: Верни wf.vars.ws, если пустая - nil\nContext: {"wf":{"vars":{"ws":["a"]}}}',
        )
        run_mock.assert_not_called()

    @patch("backend.agents.refiner.BaseAgent.run", return_value="refined by llm")
    def test_uses_llm_for_non_obvious_request(self, run_mock):
        agent = PromptRefinerAgent()

        result = agent.refine("Помоги придумать преобразование для неизвестной структуры", "")

        self.assertEqual(result, "refined by llm")
        run_mock.assert_called_once()
