from __future__ import annotations

import os
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

DEFAULT_DB_PATH = "data/pm.db"
DEFAULT_USERNAME = "user"
DEFAULT_BOARD_TITLE = "Kanban Studio"

SEED_COLUMNS = [
    {
        "title": "Backlog",
        "cards": [
            {
                "title": "Align roadmap themes",
                "details": "Draft quarterly themes with impact statements and metrics.",
            },
            {
                "title": "Gather customer signals",
                "details": "Review support tags, sales notes, and churn feedback.",
            },
        ],
    },
    {
        "title": "Discovery",
        "cards": [
            {
                "title": "Prototype analytics view",
                "details": "Sketch initial dashboard layout and key drill-downs.",
            }
        ],
    },
    {
        "title": "In Progress",
        "cards": [
            {
                "title": "Refine status language",
                "details": "Standardize column labels and tone across the board.",
            },
            {
                "title": "Design card layout",
                "details": "Add hierarchy and spacing for scanning dense lists.",
            },
        ],
    },
    {
        "title": "Review",
        "cards": [
            {
                "title": "QA micro-interactions",
                "details": "Verify hover, focus, and loading states.",
            }
        ],
    },
    {
        "title": "Done",
        "cards": [
            {
                "title": "Ship marketing page",
                "details": "Final copy approved and asset pack delivered.",
            },
            {
                "title": "Close onboarding sprint",
                "details": "Document release notes and share internally.",
            },
        ],
    },
]


def now_iso() -> str:
    return f"{datetime.now(timezone.utc).isoformat()}"


def get_db_path() -> Path:
    return Path(os.environ.get("PM_DB_PATH", DEFAULT_DB_PATH))


def get_connection() -> sqlite3.Connection:
    db_path = get_db_path()
    db_path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(db_path)
    connection.row_factory = sqlite3.Row
    return connection


def init_db(connection: sqlite3.Connection) -> None:
    connection.executescript(
        """
        PRAGMA foreign_keys = ON;

        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            username TEXT NOT NULL UNIQUE,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS boards (
            id INTEGER PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            created_at TEXT NOT NULL
        );

        CREATE UNIQUE INDEX IF NOT EXISTS boards_user_unique
            ON boards(user_id);
        CREATE INDEX IF NOT EXISTS boards_user_id_idx
            ON boards(user_id);

        CREATE TABLE IF NOT EXISTS columns (
            id INTEGER PRIMARY KEY,
            board_id INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            position INTEGER NOT NULL,
            created_at TEXT NOT NULL
        );

        CREATE UNIQUE INDEX IF NOT EXISTS columns_board_position_unique
            ON columns(board_id, position);
        CREATE INDEX IF NOT EXISTS columns_board_id_idx
            ON columns(board_id);

        CREATE TABLE IF NOT EXISTS cards (
            id INTEGER PRIMARY KEY,
            column_id INTEGER NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            details TEXT NOT NULL,
            position INTEGER NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE UNIQUE INDEX IF NOT EXISTS cards_column_position_unique
            ON cards(column_id, position);
        CREATE INDEX IF NOT EXISTS cards_column_id_idx
            ON cards(column_id);
        """
    )
    connection.commit()


def get_or_create_user(connection: sqlite3.Connection, username: str) -> int:
    cursor = connection.execute(
        "SELECT id FROM users WHERE username = ?", (username,)
    )
    row = cursor.fetchone()
    if row:
        return int(row["id"])

    created_at = now_iso()
    cursor = connection.execute(
        "INSERT INTO users (username, created_at) VALUES (?, ?)",
        (username, created_at),
    )
    connection.commit()
    return int(cursor.lastrowid)


def get_or_create_board(
    connection: sqlite3.Connection, user_id: int, title: str
) -> int:
    cursor = connection.execute(
        "SELECT id FROM boards WHERE user_id = ?", (user_id,)
    )
    row = cursor.fetchone()
    if row:
        return int(row["id"])

    created_at = now_iso()
    cursor = connection.execute(
        "INSERT INTO boards (user_id, title, created_at) VALUES (?, ?, ?)",
        (user_id, title, created_at),
    )
    connection.commit()
    return int(cursor.lastrowid)


def seed_board(connection: sqlite3.Connection, board_id: int) -> None:
    cursor = connection.execute(
        "SELECT COUNT(*) AS count FROM columns WHERE board_id = ?", (board_id,)
    )
    if int(cursor.fetchone()["count"]) > 0:
        return

    created_at = now_iso()
    for column_index, column in enumerate(SEED_COLUMNS):
        cursor = connection.execute(
            "INSERT INTO columns (board_id, title, position, created_at) "
            "VALUES (?, ?, ?, ?)",
            (board_id, column["title"], column_index, created_at),
        )
        column_id = int(cursor.lastrowid)
        for card_index, card in enumerate(column["cards"]):
            connection.execute(
                "INSERT INTO cards (column_id, title, details, position, created_at, updated_at) "
                "VALUES (?, ?, ?, ?, ?, ?)",
                (
                    column_id,
                    card["title"],
                    card["details"],
                    card_index,
                    created_at,
                    created_at,
                ),
            )
    connection.commit()


def build_board_payload(connection: sqlite3.Connection, board_id: int) -> dict[str, Any]:
    board_row = connection.execute(
        "SELECT id, title FROM boards WHERE id = ?", (board_id,)
    ).fetchone()
    if not board_row:
        raise ValueError("Board not found")

    columns_rows = connection.execute(
        "SELECT id, title, position FROM columns WHERE board_id = ? ORDER BY position",
        (board_id,),
    ).fetchall()

    columns = []
    for column_row in columns_rows:
        cards_rows = connection.execute(
            "SELECT id, title, details, position FROM cards "
            "WHERE column_id = ? ORDER BY position",
            (column_row["id"],),
        ).fetchall()
        columns.append(
            {
                "id": int(column_row["id"]),
                "title": column_row["title"],
                "position": int(column_row["position"]),
                "cards": [
                    {
                        "id": int(card_row["id"]),
                        "title": card_row["title"],
                        "details": card_row["details"],
                        "position": int(card_row["position"]),
                    }
                    for card_row in cards_rows
                ],
            }
        )

    return {
        "board": {
            "id": int(board_row["id"]),
            "title": board_row["title"],
            "columns": columns,
        }
    }


def get_board(username: str = DEFAULT_USERNAME) -> dict[str, Any]:
    connection = get_connection()
    try:
        init_db(connection)
        user_id = get_or_create_user(connection, username)
        board_id = get_or_create_board(connection, user_id, DEFAULT_BOARD_TITLE)
        seed_board(connection, board_id)
        return build_board_payload(connection, board_id)
    finally:
        connection.close()


def replace_board(board: dict[str, Any], username: str = DEFAULT_USERNAME) -> dict[str, Any]:
    connection = get_connection()
    try:
        init_db(connection)
        user_id = get_or_create_user(connection, username)
        board_id = get_or_create_board(
            connection, user_id, board.get("title", DEFAULT_BOARD_TITLE)
        )

        connection.execute(
            "UPDATE boards SET title = ? WHERE id = ?",
            (board.get("title", DEFAULT_BOARD_TITLE), board_id),
        )

        column_ids = [
            row["id"]
            for row in connection.execute(
                "SELECT id FROM columns WHERE board_id = ?", (board_id,)
            ).fetchall()
        ]
        if column_ids:
            connection.executemany(
                "DELETE FROM cards WHERE column_id = ?",
                [(column_id,) for column_id in column_ids],
            )
        connection.execute("DELETE FROM columns WHERE board_id = ?", (board_id,))

        created_at = now_iso()
        for column in board.get("columns", []):
            cursor = connection.execute(
                "INSERT INTO columns (board_id, title, position, created_at) "
                "VALUES (?, ?, ?, ?)",
                (board_id, column["title"], column["position"], created_at),
            )
            column_id = int(cursor.lastrowid)
            for card in column.get("cards", []):
                connection.execute(
                    "INSERT INTO cards (column_id, title, details, position, created_at, updated_at) "
                    "VALUES (?, ?, ?, ?, ?, ?)",
                    (
                        column_id,
                        card["title"],
                        card["details"],
                        card["position"],
                        created_at,
                        created_at,
                    ),
                )

        connection.commit()
        return build_board_payload(connection, board_id)
    finally:
        connection.close()
