from fastapi.testclient import TestClient

from backend.app.main import app


AUTH = ("user", "password")


def test_board_get_creates_seed_data(tmp_path, monkeypatch) -> None:
    db_path = tmp_path / "pm.db"
    monkeypatch.setenv("PM_DB_PATH", str(db_path))
    client = TestClient(app)

    response = client.get("/api/board", auth=AUTH)

    assert response.status_code == 200
    payload = response.json()
    assert "board" in payload
    assert payload["board"]["columns"]
    assert db_path.exists()


def test_board_update_round_trip(tmp_path, monkeypatch) -> None:
    db_path = tmp_path / "pm.db"
    monkeypatch.setenv("PM_DB_PATH", str(db_path))
    client = TestClient(app)

    update_payload = {
        "board": {
            "title": "My Board",
            "columns": [
                {
                    "title": "Todo",
                    "position": 0,
                    "cards": [
                        {
                            "title": "Card A",
                            "details": "Details",
                            "position": 0,
                        }
                    ],
                }
            ],
        }
    }

    update_response = client.put("/api/board", json=update_payload, auth=AUTH)
    assert update_response.status_code == 200

    get_response = client.get("/api/board", auth=AUTH)
    assert get_response.status_code == 200
    payload = get_response.json()
    assert payload["board"]["title"] == "My Board"
    assert payload["board"]["columns"][0]["title"] == "Todo"
    assert payload["board"]["columns"][0]["cards"][0]["title"] == "Card A"
