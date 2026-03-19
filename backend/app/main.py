from fastapi import FastAPI
from fastapi.responses import HTMLResponse

app = FastAPI()


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


@app.get("/api/hello")
def read_hello() -> dict:
    return {"message": "Hello from FastAPI"}
