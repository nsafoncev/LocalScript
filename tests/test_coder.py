import unittest

from backend.agents.coder import CoderAgent


class _CriticStub:
    def __init__(self, response: str):
        self.response = response
        self.calls = []

    def fix(self, task: str, bad_code: str, errors: str) -> str:
        self.calls.append((task, bad_code, errors))
        return self.response


class CoderAgentTests(unittest.TestCase):
    def test_validate_output_uses_structural_validator(self):
        agent = CoderAgent()
        errors = agent.validate_output('{"result":"lua{local x=1}lua"}')
        self.assertTrue(any("return" in error for error in errors))

    def test_generate_lua_retries_with_critic_when_output_invalid(self):
        agent = CoderAgent()
        agent.run = lambda messages: '{"result":"lua{local x=1}lua"}'
        agent._critic = _CriticStub('{"result":"lua{return 1}lua"}')

        result = agent.generate_lua([{"role": "user", "content": "spec"}], task="task", max_retries=1)

        self.assertEqual(result, '{"result":"lua{return 1}lua"}')
        self.assertEqual(len(agent._critic.calls), 1)

    def test_uses_square_template_fallback(self):
        agent = CoderAgent()

        result = agent.generate_lua([], task="Добавь переменную с квадратом числа")

        self.assertIn("n*n", result)

    def test_uses_unix_template_fallback(self):
        agent = CoderAgent()

        result = agent.generate_lua([], task="Конвертируй время в переменной recallTime в unix-формат")

        self.assertIn("86400", result)
        self.assertIn("wf.initVariables.recallTime", result)


if __name__ == "__main__":
    unittest.main()
