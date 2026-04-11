import subprocess
import tempfile
import os


def validate_lua(code: str) -> dict:
    """Syntax-check Lua code via luac -p. Returns {"valid": bool, "errors": str|None}."""
    if not code.strip():
        return {"valid": False, "errors": "Empty code"}

    with tempfile.NamedTemporaryFile(suffix=".lua", mode="w", delete=False, encoding="utf-8") as f:
        f.write(code)
        tmp_path = f.name

    try:
        result = subprocess.run(
            ["luac", "-p", tmp_path],
            capture_output=True,
            text=True,
            timeout=10,
        )
        return {
            "valid": result.returncode == 0,
            "errors": result.stderr.strip() if result.stderr else None,
        }
    finally:
        os.unlink(tmp_path)