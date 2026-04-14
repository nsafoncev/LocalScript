import sqlite3
from contextlib import closing
from pathlib import Path
from typing import Optional


class ChatMemory:
    def __init__(self, db_path: str | Path = "backend/chat_memory.sqlite3"):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def create_session(self, session_id: str, title: Optional[str] = None) -> None:
        with closing(self._connect()) as conn:
            conn.execute(
                """
                INSERT INTO sessions(session_id, title)
                VALUES(?, ?)
                ON CONFLICT(session_id) DO NOTHING
                """,
                (session_id, title),
            )
            conn.commit()

    def save_message(
        self,
        session_id: str,
        role: str,
        content: str,
        agent_name: Optional[str] = None,
        context: Optional[str] = None,
    ) -> int:
        self.create_session(session_id)
        with closing(self._connect()) as conn:
            cursor = conn.execute(
                """
                INSERT INTO messages(session_id, role, content, agent_name, context)
                VALUES(?, ?, ?, ?, ?)
                """,
                (session_id, role, content, agent_name, context),
            )
            conn.commit()
            return int(cursor.lastrowid)

    def load_messages(self, session_id: str, limit: int = 20) -> list[dict]:
        with closing(self._connect()) as conn:
            rows = conn.execute(
                """
                SELECT id, role, content, agent_name, context, created_at
                FROM messages
                WHERE session_id = ?
                ORDER BY id DESC
                LIMIT ?
                """,
                (session_id, limit),
            ).fetchall()

        rows.reverse()
        return [
            {
                "id": row[0],
                "role": row[1],
                "content": row[2],
                "agent_name": row[3],
                "context": row[4],
                "created_at": row[5],
            }
            for row in rows
        ]

    def load_history(self, session_id: str, limit: int = 20) -> list[dict]:
        messages = self.load_messages(session_id, limit=limit)
        return [{"role": message["role"], "content": message["content"]} for message in messages]

    def build_combined_request(self, session_id: str, latest_user_message: str, limit: int = 20) -> str:
        history = self.load_messages(session_id, limit=limit)
        parts = []
        for item in history:
            role = item["role"].upper()
            parts.append(f"{role}: {item['content']}")
        if not history or history[-1]["role"] != "user" or history[-1]["content"] != latest_user_message:
            parts.append(f"USER: {latest_user_message}")
        return "\n".join(parts)

    def _init_db(self) -> None:
        with closing(self._connect()) as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS sessions (
                    session_id TEXT PRIMARY KEY,
                    title TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
            conn.commit()
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS messages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT NOT NULL,
                    role TEXT NOT NULL,
                    content TEXT NOT NULL,
                    agent_name TEXT,
                    context TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY(session_id) REFERENCES sessions(session_id)
                )
                """
            )

    def _connect(self) -> sqlite3.Connection:
        return sqlite3.connect(self.db_path)
