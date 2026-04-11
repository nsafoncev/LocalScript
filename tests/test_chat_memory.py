import tempfile
import unittest
from pathlib import Path

from backend.chat_memory import ChatMemory


class ChatMemoryTests(unittest.TestCase):
    def setUp(self):
        self.tmpdir = tempfile.TemporaryDirectory()
        self.db_path = Path(self.tmpdir.name) / "chat_memory.sqlite3"
        self.memory = ChatMemory(self.db_path)

    def tearDown(self):
        self.tmpdir.cleanup()

    def test_save_and_load_messages_in_order(self):
        self.memory.save_message("session-1", "user", "Привет")
        self.memory.save_message("session-1", "assistant", "Какой у тебя запрос?", agent_name="clarifier")
        self.memory.save_message("session-1", "user", "Сделай квадрат числа")

        messages = self.memory.load_messages("session-1")

        self.assertEqual(len(messages), 3)
        self.assertEqual(messages[0]["role"], "user")
        self.assertEqual(messages[0]["content"], "Привет")
        self.assertEqual(messages[1]["agent_name"], "clarifier")
        self.assertEqual(messages[2]["content"], "Сделай квадрат числа")

    def test_load_history_returns_role_content_pairs(self):
        self.memory.save_message("session-2", "user", "Первый запрос")
        self.memory.save_message("session-2", "assistant", "Уточни переменную")

        history = self.memory.load_history("session-2")

        self.assertEqual(
            history,
            [
                {"role": "user", "content": "Первый запрос"},
                {"role": "assistant", "content": "Уточни переменную"},
            ],
        )

    def test_build_combined_request_joins_previous_context(self):
        self.memory.save_message("session-3", "user", "Сделай квадрат числа")
        self.memory.save_message("session-3", "assistant", "Какая переменная содержит число?")

        combined = self.memory.build_combined_request("session-3", "wf.vars.n")

        self.assertIn("USER: Сделай квадрат числа", combined)
        self.assertIn("ASSISTANT: Какая переменная содержит число?", combined)
        self.assertTrue(combined.endswith("USER: wf.vars.n"))

    def test_limit_returns_latest_messages(self):
        for idx in range(5):
            self.memory.save_message("session-4", "user", f"msg-{idx}")

        messages = self.memory.load_messages("session-4", limit=2)

        self.assertEqual([item["content"] for item in messages], ["msg-3", "msg-4"])


if __name__ == "__main__":
    unittest.main()
