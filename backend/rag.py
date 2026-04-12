from pathlib import Path
import re


class LocalKnowledgeBase:
    def __init__(self, docs_dir: str | Path = "backend/knowledge"):
        self.docs_dir = Path(docs_dir)
        self.docs_dir.mkdir(parents=True, exist_ok=True)

    def search(self, query: str, limit: int = 3) -> list[dict]:
        tokens = self._tokenize(query)
        if not tokens:
            return []

        results = []
        for path in sorted(self.docs_dir.glob("*.md")):
            content = path.read_text(encoding="utf-8")
            score = self._score(tokens, content)
            if score <= 0:
                continue
            results.append(
                {
                    "source": path.name,
                    "score": score,
                    "snippet": self._make_snippet(content, tokens),
                }
            )

        results.sort(key=lambda item: item["score"], reverse=True)
        return results[:limit]

    def build_context(self, query: str, limit: int = 3) -> str:
        matches = self.search(query, limit=limit)
        if not matches:
            return ""

        chunks = ["Relevant local knowledge base excerpts:"]
        for item in matches:
            chunks.append(f"[{item['source']}] {item['snippet']}")
        return "\n".join(chunks)

    def _tokenize(self, value: str) -> set[str]:
        return {
            token
            for token in re.findall(r"[A-Za-zА-Яа-я0-9_]+", value.lower())
            if len(token) >= 3
        }

    def _score(self, tokens: set[str], content: str) -> int:
        content_lower = content.lower()
        return sum(content_lower.count(token) for token in tokens)

    def _make_snippet(self, content: str, tokens: set[str], max_len: int = 240) -> str:
        lines = [line.strip() for line in content.splitlines() if line.strip()]
        for line in lines:
            lower = line.lower()
            if any(token in lower for token in tokens):
                return line[:max_len]
        return content.strip().replace("\n", " ")[:max_len]
