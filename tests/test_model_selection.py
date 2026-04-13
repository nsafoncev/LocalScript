import os
import unittest
from unittest.mock import patch

from backend.agents.clarifier import ClarifierAgent
from backend.agents.coder import CoderAgent
from backend.ollama_client import resolve_model_name


class ModelSelectionTests(unittest.TestCase):
    def test_resolve_model_name_prefers_role_specific_env(self):
        with patch.dict(
            os.environ,
            {
                "MODEL_NAME": "main-model",
                "CLARIFIER_MODEL": "fast-model",
            },
            clear=False,
        ):
            self.assertEqual(resolve_model_name("clarifier"), "fast-model")
            self.assertEqual(resolve_model_name("coder"), "main-model")

    def test_agents_pick_model_for_their_role(self):
        with patch.dict(
            os.environ,
            {
                "MODEL_NAME": "main-model",
                "CLARIFIER_MODEL": "fast-model",
                "CODER_MODEL": "code-model",
            },
            clear=False,
        ):
            clarifier = ClarifierAgent()
            coder = CoderAgent()

            self.assertEqual(clarifier.model_name, "fast-model")
            self.assertEqual(coder.model_name, "code-model")

    @patch("backend.agents.base.generate", return_value="ok")
    def test_base_agent_run_passes_selected_model(self, generate_mock):
        with patch.dict(
            os.environ,
            {
                "MODEL_NAME": "main-model",
                "CLARIFIER_MODEL": "fast-model",
            },
            clear=False,
        ):
            clarifier = ClarifierAgent()
            result = clarifier.run([{"role": "user", "content": "hello"}])

            self.assertEqual(result, "ok")
            generate_mock.assert_called_once_with(
                clarifier.system_prompt,
                [{"role": "user", "content": "hello"}],
                model_name="fast-model",
            )


if __name__ == "__main__":
    unittest.main()
