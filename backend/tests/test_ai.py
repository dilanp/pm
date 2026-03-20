import json

from fastapi.testclient import TestClient

from backend.app.main import app
import backend.app.main as main_module


def _sample_request_payload() -> dict:
    return {
        "prompt": "Rename the board to Launch Plan.",
        "board": {
            "title": "Current Board",
            "columns": [
                {
                    "title": "Todo",
                    "position": 0,
                    "cards": [
                        {
                            "title": "Task A",
                            "details": "Details",
                            "position": 0,
                        }
                    ],
                }
            ],
        },
        "history": [{"role": "user", "content": "Previous message."}],
    }


def test_ai_chat_applies_board_update(tmp_path, monkeypatch) -> None:
    db_path = tmp_path / "pm.db"
    monkeypatch.setenv("PM_DB_PATH", str(db_path))

    def fake_call_openrouter(messages, max_tokens=512):
        response = {
            "message": "Updated the board title.",
            "board": {
                "title": "Launch Plan",
                "columns": [
                    {
                        "title": "Todo",
                        "position": 0,
                        "cards": [
                            {
                                "title": "Task A",
                                "details": "Details",
                                "position": 0,
                            }
                        ],
                    }
                ],
            },
        }
        return json.dumps(response)

    monkeypatch.setattr(main_module, "call_openrouter_messages", fake_call_openrouter)
    client = TestClient(app)

    response = client.post(
        "/api/ai/chat",
        json=_sample_request_payload(),
        auth=("user", "password"),
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["message"] == "Updated the board title."
    assert payload["board"]["title"] == "Launch Plan"

    board_response = client.get("/api/board", auth=("user", "password"))
    assert board_response.status_code == 200
    assert board_response.json()["board"]["title"] == "Launch Plan"


def test_ai_chat_rejects_invalid_response(tmp_path, monkeypatch) -> None:
    db_path = tmp_path / "pm.db"
    monkeypatch.setenv("PM_DB_PATH", str(db_path))

    def fake_call_openrouter(messages, max_tokens=512):
        return "not-json"

    monkeypatch.setattr(main_module, "call_openrouter_messages", fake_call_openrouter)
    client = TestClient(app)

    response = client.post(
        "/api/ai/chat",
        json=_sample_request_payload(),
        auth=("user", "password"),
    )

    assert response.status_code == 502
