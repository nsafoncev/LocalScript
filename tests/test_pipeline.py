import unittest
from unittest.mock import patch

from backend.pipeline import run_pipeline


class RunPipelineTests(unittest.TestCase):
    @patch("backend.pipeline._validator")
    @patch("backend.pipeline._coder")
    @patch("backend.pipeline._refiner")
    @patch("backend.pipeline._kb")
    def test_run_pipeline_uses_rag_refiner_coder_only(
        self,
        kb_mock,
        refiner_mock,
        coder_mock,
        validator_mock,
    ):
        kb_mock.build_context.return_value = (
            "Relevant local knowledge base excerpts:\n"
            "[lua_patterns.md] Use wf.vars for Octa API values."
        )
        refiner_mock.refine.return_value = "Refined task"
        coder_mock.generate_lua.return_value = '{"result":"lua{return wf.vars.ws}lua"}'
        validator_mock.validate.return_value = []

        result = run_pipeline("Return wf.vars.ws")

        self.assertEqual(
            result,
            {
                "code": '{"result":"lua{return wf.vars.ws}lua"}',
                "question": None,
                "valid": True,
            },
        )
        kb_mock.build_context.assert_called_once_with("Return wf.vars.ws")
        refiner_mock.refine.assert_called_once_with(
            "Return wf.vars.ws",
            "Relevant local knowledge base excerpts:\n"
            "[lua_patterns.md] Use wf.vars for Octa API values.",
        )
        coder_mock.generate_lua.assert_called_once_with(
            [{"role": "user", "content": "Refined task"}],
            task=(
                "Return wf.vars.ws\n"
                "Context: Relevant local knowledge base excerpts:\n"
                "[lua_patterns.md] Use wf.vars for Octa API values."
            ),
        )
        validator_mock.validate.assert_called_once_with(
            '{"result":"lua{return wf.vars.ws}lua"}'
        )
