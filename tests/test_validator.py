import unittest

from backend.agents.validator import LuaGenerationValidator


class LuaGenerationValidatorTests(unittest.TestCase):
    def setUp(self):
        self.validator = LuaGenerationValidator()

    def test_rejects_length_check_without_nil_guard(self):
        raw = '{"ws":"lua{if #wf.vars.ws == 0 then return nil end return wf.vars.ws}lua"}'

        errors = self.validator.validate(raw)

        self.assertTrue(any("#variable" in error for error in errors))

    def test_accepts_length_check_with_nil_guard(self):
        raw = (
            '{"ws":"lua{if wf.vars.ws == nil then return nil end '
            'if #wf.vars.ws == 0 then return nil end return wf.vars.ws}lua"}'
        )

        errors = self.validator.validate(raw)

        self.assertEqual(errors, [])
