import unittest

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
