import json
import logging
import re

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.pipeline import run_pipeline
from backend.chat_service import process_chat_message, memory


def _extract_lua(raw: str) -> str:
    """Extract plain Lua code from {"key":"lua{CODE}lua"} coder format."""
    try:
        data = json.loads(raw)
        for value in data.values():
            if isinstance(value, str) and "lua{" in value:
                start = value.find("lua{") + 4
                end = value.rfind("}lua")
                if end > start:
                    return value[start:end].replace("\\n", "\n")
    except (json.JSONDecodeError, AttributeError):
        pass
    m = re.search(r"lua\{(.*?)\}lua", raw, re.DOTALL)
    return m.group(1).replace("\\n", "\n") if m else raw

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="LocalScript API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── /generate — backward compat with current frontend ──────────────────────

class GenerateRequest(BaseModel):
    prompt: str


class GenerateResponse(BaseModel):
    code: str


@app.post("/generate", response_model=GenerateResponse)
def generate(req: GenerateRequest):
    try:
        result = run_pipeline(req.prompt)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))

    if result.get("question"):
        code = f"-- {result['question']}"
    else:
        code = _extract_lua(result["code"])

    return GenerateResponse(code=code)


# ── /chat — session-aware endpoint ─────────────────────────────────────────

class ChatRequest(BaseModel):
    session_id: str
    message: str
    context: str = ""


@app.post("/chat")
def chat(req: ChatRequest):
    try:
        return process_chat_message(req.session_id, req.message, req.context)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))


@app.get("/chat/{session_id}/history")
def get_history(session_id: str):
    return {"messages": memory.load_messages(session_id, limit=100)}


# ── /health ─────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok"}