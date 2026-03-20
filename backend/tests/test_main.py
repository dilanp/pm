from fastapi.testclient import TestClient
from backend.app.main import app
import backend.app.main as main_module

client = TestClient(app)


def test_root_returns_html() -> None:
    response = client.get("/")
    assert response.status_code == 200
    assert "Hello from FastAPI" in response.text


def test_api_hello_returns_json() -> None:
    response = client.get("/api/hello")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello from FastAPI"}


def test_ai_test_endpoint_returns_answer(monkeypatch) -> None:
    def fake_call_openrouter(prompt: str) -> str:
        return "The answer is 4."

    monkeypatch.setattr(main_module, "call_openrouter", fake_call_openrouter)
    client = TestClient(app)

    response = client.get("/api/ai/test", auth=("user", "password"))
    assert response.status_code == 200
    payload = response.json()
    assert "response" in payload
    assert "4" in payload["response"]
