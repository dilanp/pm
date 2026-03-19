# Data Model (Part 5)

## Scope

- Single board per user for MVP.
- SQLite database created on first run.
- Authentication uses the demo user (user/password), but the schema supports multiple users.

## Entities

### Users

- `users.id`: integer primary key.
- `users.username`: unique username.
- `users.created_at`: ISO timestamp.

### Boards

- `boards.id`: integer primary key.
- `boards.user_id`: owner (FK to users).
- `boards.title`: board name.
- `boards.created_at`: ISO timestamp.
- One board per user enforced with a unique index on `boards.user_id`.

### Columns

- `columns.id`: integer primary key.
- `columns.board_id`: owning board (FK to boards).
- `columns.title`: column name.
- `columns.position`: zero-based or one-based ordering (fixed order per board).
- `columns.created_at`: ISO timestamp.
- Unique `board_id + position` to keep ordering consistent.

### Cards

- `cards.id`: integer primary key.
- `cards.column_id`: owning column (FK to columns).
- `cards.title`: card title.
- `cards.details`: card details body.
- `cards.position`: ordering within a column.
- `cards.created_at`, `cards.updated_at`: ISO timestamps.
- Unique `column_id + position` to keep ordering consistent.

## Constraints & Behavior

- Deleting a user cascades to boards, columns, and cards.
- Deleting a board cascades to its columns and cards.
- Deleting a column cascades to its cards.
- Reordering is expressed by updating `position` values.

## Schema File

See [docs/schema.json](schema.json) for the JSON representation of the SQLite schema.
