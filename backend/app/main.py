from hmac import compare_digest
import json
from pathlib import Path

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.responses import HTMLResponse
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.staticfiles import StaticFiles

from backend.app.ai import OPENROUTER_MODEL, call_openrouter, call_openrouter_messages, parse_ai_response
from backend.app.db import get_board, replace_board
from backend.app.schemas import AIChatRequest, BoardEnvelope

load_dotenv(Path(__file__).resolve().parents[2] / ".env")

app = FastAPI()

STATIC_DIR = Path(__file__).resolve().parent / "static"
security = HTTPBasic()
DEMO_USERNAME = "user"
DEMO_PASSWORD = "password"


@app.get("/api/hello")
def read_hello() -> dict:
    return {"message": "Hello from FastAPI"}


AI_SYSTEM_PROMPT = """You are a helpful project management assistant.
Return JSON only, with this schema:
{"message":"string","board":{...} or null}

The board object must match:
{"title":"string","columns":[{"title":"string","position":0,"cards":[{"title":"string","details":"string","position":0}]}]}

If no board changes are needed, set "board" to null.
"""


def require_demo_auth(
  credentials: HTTPBasicCredentials = Depends(security),
) -> str:
  is_valid = compare_digest(credentials.username, DEMO_USERNAME) and compare_digest(
    credentials.password, DEMO_PASSWORD
  )
  if not is_valid:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Invalid credentials",
      headers={"WWW-Authenticate": "Basic"},
    )
  return credentials.username


@app.get("/api/board")
def read_board(_: str = Depends(require_demo_auth)) -> dict:
  return get_board()


@app.put("/api/board")
def update_board(payload: BoardEnvelope, _: str = Depends(require_demo_auth)) -> dict:
  return replace_board(payload.board.model_dump())


@app.get("/api/ai/test")
def ai_test(_: str = Depends(require_demo_auth)) -> dict:
  response = call_openrouter("2+2")
  return {
    "prompt": "2+2",
    "response": response,
    "model": OPENROUTER_MODEL,
  }


@app.post("/api/ai/chat")
def ai_chat(payload: AIChatRequest, _: str = Depends(require_demo_auth)) -> dict:
  board_json = json.dumps(payload.board.model_dump(), ensure_ascii=True)
  messages = [
    {"role": "system", "content": AI_SYSTEM_PROMPT},
    *[{"role": entry.role, "content": entry.content} for entry in payload.history],
    {
      "role": "user",
      "content": f"Current board JSON:\n{board_json}\n\nUser request:\n{payload.prompt}",
    },
  ]

  response_text = call_openrouter_messages(messages, max_tokens=512)
  structured = parse_ai_response(response_text)

  if structured.board:
    updated_board = replace_board(structured.board.model_dump())
    return {"message": structured.message, "board": updated_board["board"]}

  return {"message": structured.message, "board": None}


if STATIC_DIR.exists():
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")
else:

    @app.get("/", response_class=HTMLResponse)
    def read_root() -> HTMLResponse:
        html = """
        <!doctype html>
        <html lang=\"en\">
          <head>
            <meta charset=\"utf-8\" />
            <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
            <title>Project Management MVP</title>
          </head>
          <body>
            <main style=\"font-family: Arial, sans-serif; padding: 32px;\">
              <h1>Hello from FastAPI</h1>
              <p>Docker and FastAPI are running successfully.</p>
            </main>
          </body>
        </html>
        """
        return HTMLResponse(content=html)
