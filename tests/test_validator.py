import unittest

from backend.agents.validator import LuaGenerationValidator


class LuaGenerationValidatorTests(unittest.TestCase):
    def setUp(self):
        self.validator = LuaGenerationValidator()

    def test_accepts_valid_json_wrapped_lua(self):
        raw = '{"result":"lua{return wf.vars.value}lua"}'
        self.assertEqual(self.validator.validate(raw), [])

    def test_rejects_non_json_output(self):
        errors = self.validator.validate("lua{return 1}lua")
        self.assertIn("Ответ модели должен быть JSON-объектом.", errors)

    def test_rejects_forbidden_tokens(self):
        raw = '{"result":"lua{return os.time()}lua"}'
        errors = self.validator.validate(raw)
        self.assertTrue(any("os.time(" in error for error in errors))

    def test_rejects_missing_return(self):
        raw = '{"result":"lua{local x=1}lua"}'
        errors = self.validator.validate(raw)
        self.assertTrue(any("return" in error for error in errors))

    def test_rejects_unbalanced_parentheses(self):
        raw = '{"result":"lua{if(a>0 then return a end}lua"}'
        errors = self.validator.validate(raw)
        self.assertTrue(any("скобки" in error for error in errors))


if __name__ == "__main__":
    unittest.main()
