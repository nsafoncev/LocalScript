import unittest
import importlib
from unittest.mock import patch


class ChatServiceTests(unittest.TestCase):
    def _load_chat_service(self):
        with patch("backend.chat_memory.ChatMemory"):
            module = importlib.import_module("backend.chat_service")
        return importlib.reload(module)

    @patch("backend.chat_service._validator")
    @patch("backend.chat_service._coder")
    @patch("backend.chat_service._refiner")
    @patch("backend.chat_service._clarifier")
    @patch("backend.chat_service._kb")
    @patch("backend.chat_service.memory")
    def test_returns_clarification_and_saves_it(
        self,
        memory_mock,
        kb_mock,
        clarifier_mock,
        refiner_mock,
        coder_mock,
        validator_mock,
    ):
        process_chat_message = self._load_chat_service().process_chat_message
        kb_mock.build_context.return_value = "[kb] use wf.vars"
        memory_mock.build_combined_request.return_value = "USER: Добавь квадрат числа"
        clarifier_mock.analyze.return_value = "Какую переменную или поле из wf нужно использовать?"

        result = process_chat_message("s1", "Добавь квадрат числа")

        self.assertEqual(
            result,
            {
                "status": "needs_clarification",
                "message": "Какую переменную или поле из wf нужно использовать?",
            },
        )
        refiner_mock.refine.assert_not_called()
        coder_mock.generate_lua.assert_not_called()
        validator_mock.validate.assert_not_called()
        memory_mock.save_message.assert_any_call(
            "s1",
            "assistant",
            "Какую переменную или поле из wf нужно использовать?",
            agent_name="clarifier",
            context="[kb] use wf.vars",
        )

    @patch("backend.chat_service._validator")
    @patch("backend.chat_service._coder")
    @patch("backend.chat_service._refiner")
    @patch("backend.chat_service._clarifier")
    @patch("backend.chat_service._kb")
    @patch("backend.chat_service.memory")
    def test_runs_full_flow_with_merged_context(
        self,
        memory_mock,
        kb_mock,
        clarifier_mock,
        refiner_mock,
        coder_mock,
        validator_mock,
    ):
        process_chat_message = self._load_chat_service().process_chat_message
        memory_mock.build_combined_request.return_value = "combined request"
        memory_mock.load_history.return_value = [{"role": "user", "content": "old"}]
        kb_mock.build_context.return_value = "[kb] unix conversion"
        clarifier_mock.analyze.return_value = "CLEAR"
        refiner_mock.refine.return_value = "Refined prompt"
        coder_mock.generate_lua.return_value = '{"unix_time":"lua{return 1}lua"}'
        validator_mock.validate.return_value = []

        result = process_chat_message(
            "s1",
            "Конвертируй recallTime в unix",
            '{"wf":{"initVariables":{"recallTime":"2023-10-15T15:30:00+00:00"}}}',
        )

        merged_context = (
            '{"wf":{"initVariables":{"recallTime":"2023-10-15T15:30:00+00:00"}}}'
            "\n\n[kb] unix conversion"
        )
        self.assertEqual(result["status"], "completed")
        clarifier_mock.analyze.assert_called_once_with("combined request", merged_context)
        refiner_mock.refine.assert_called_once_with(
            "Конвертируй recallTime в unix",
            merged_context,
            history=[{"role": "user", "content": "old"}],
        )
        coder_mock.generate_lua.assert_called_once_with(
            [{"role": "user", "content": "Refined prompt"}],
            task="Конвертируй recallTime в unix",
        )
        validator_mock.validate.assert_called_once_with('{"unix_time":"lua{return 1}lua"}')
