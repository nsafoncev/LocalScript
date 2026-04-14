import unittest
from unittest.mock import patch

from backend.agents.coder import CoderAgent


class CoderFastPathTests(unittest.TestCase):
    def test_ws_return_task_uses_template_fallback(self):
        agent = CoderAgent()

        result = agent.generate_lua([], task="Верни переменную ws, если она пустая - nil")

        self.assertIn("wf.vars.ws == nil", result)
        self.assertIn("#wf.vars.ws == 0", result)
        self.assertIn("return wf.vars.ws", result)

    def test_last_email_task_uses_template_fallback(self):
        agent = CoderAgent()

        result = agent.generate_lua(
            [],
            task=(
                "Из полученного списка email получи последний.\n"
                'Context: {"wf":{"vars":{"emails":["user1@example.com","user2@example.com","user3@example.com"]}}}'
            ),
        )

        self.assertIn("wf.vars.emails == nil", result)
        self.assertIn("#wf.vars.emails == 0", result)
        self.assertIn("wf.vars.emails[#wf.vars.emails]", result)

    def test_try_count_increment_uses_template_fallback(self):
        agent = CoderAgent()

        result = agent.generate_lua(
            [],
            task=(
                "Увеличивай значение переменной try_count_n на каждой итерации\n"
                'Context: {"wf":{"vars":{"try_count_n":3}}}'
            ),
        )

        self.assertIn("tonumber(wf.vars.try_count_n)", result)
        self.assertIn("return n + 1", result)

    @patch("backend.agents.coder.generate")
    def test_generic_sum_function_request_uses_generic_function_mode(self, generate_mock):
        generate_mock.return_value = (
            '{"result":"lua{local function sum(numbers)\\n'
            'local total = 0\\n'
            'for _, value in ipairs(numbers) do\\n'
            '  total = total + value\\n'
            'end\\n'
            'return total\\n'
            'end\\n'
            'return sum}lua"}'
        )
        agent = CoderAgent()

        result = agent.generate_lua(
            [],
            task="Сделай функцию, которая получает на вход массив чисел, а выдает их сумму",
        )

        self.assertTrue(generate_mock.called)
        self.assertIn("generic Lua 5.5 function generator", generate_mock.call_args.args[0])
        self.assertIn('{"result":"lua{', result)
        self.assertIn("local function sum(numbers)", result)
        self.assertIn("for _, value in ipairs(numbers) do", result)
        self.assertIn("return total", result)
        self.assertIn("return sum", result)


if __name__ == "__main__":
    unittest.main()
