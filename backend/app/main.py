from pathlib import Path

from fastapi import FastAPI
from pydantic import BaseModel, Field
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

from backend.app.db import get_board, replace_board

app = FastAPI()

STATIC_DIR = Path(__file__).resolve().parent / "static"


@app.get("/api/hello")
def read_hello() -> dict:
    return {"message": "Hello from FastAPI"}


class CardPayload(BaseModel):
  title: str
  details: str
  position: int = Field(ge=0)


class ColumnPayload(BaseModel):
  title: str
  position: int = Field(ge=0)
  cards: list[CardPayload]


class BoardPayload(BaseModel):
  title: str
  columns: list[ColumnPayload]


class BoardEnvelope(BaseModel):
  board: BoardPayload


@app.get("/api/board")
def read_board() -> dict:
  return get_board()


@app.put("/api/board")
def update_board(payload: BoardEnvelope) -> dict:
  return replace_board(payload.board.model_dump())


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
