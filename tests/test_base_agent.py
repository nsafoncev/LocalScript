import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from backend.agents.base import BaseAgent


class BaseAgentPromptLoadingTests(unittest.TestCase):
    def test_loads_extra_prompt_file_when_present(self):
        with tempfile.TemporaryDirectory() as tmp:
            prompts_dir = Path(tmp) / "prompts"
            prompts_dir.mkdir()
            (prompts_dir / "sample.txt").write_text("base", encoding="utf-8")
            (prompts_dir / "sample_extra.txt").write_text("extra", encoding="utf-8")

            fake_agent_file = Path(tmp) / "base.py"
            fake_agent_file.write_text("", encoding="utf-8")

            with patch("backend.agents.base.Path") as mock_path:
                mock_path.return_value = fake_agent_file
                agent = BaseAgent("sample.txt")

            self.assertIn("base", agent.system_prompt)
            self.assertIn("extra", agent.system_prompt)


if __name__ == "__main__":
    unittest.main()
