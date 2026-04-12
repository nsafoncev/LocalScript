import tempfile
import unittest
from pathlib import Path

from backend.rag import LocalKnowledgeBase


class LocalKnowledgeBaseTests(unittest.TestCase):
    def setUp(self):
        self.tmpdir = tempfile.TemporaryDirectory()
        docs_dir = Path(self.tmpdir.name)
        (docs_dir / "unix.md").write_text(
            "Use string.match and multiply by 86400 to compute unix timestamp.",
            encoding="utf-8",
        )
        (docs_dir / "arrays.md").write_text(
            "Use _utils.array.new() and ipairs for arrays.",
            encoding="utf-8",
        )
        self.kb = LocalKnowledgeBase(docs_dir)

    def tearDown(self):
        self.tmpdir.cleanup()

    def test_search_returns_relevant_documents(self):
        results = self.kb.search("convert recallTime to unix timestamp")
        self.assertTrue(results)
        self.assertEqual(results[0]["source"], "unix.md")

    def test_build_context_contains_snippets(self):
        context = self.kb.build_context("filter arrays with ipairs")
        self.assertIn("Relevant local knowledge base excerpts:", context)
        self.assertIn("arrays.md", context)
        self.assertIn("_utils.array.new()", context)


if __name__ == "__main__":
    unittest.main()
