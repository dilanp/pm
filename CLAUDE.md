# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Project Management MVP with a Kanban board and AI chat sidebar. Next.js frontend served as static export from a Python FastAPI backend, all packaged in Docker.

## Commands

### Run the app (Docker)
```powershell
./scripts/start.ps1   # Windows
./scripts/stop.ps1    # Stop container
```
```bash
./scripts/start.sh    # Mac/Linux
./scripts/stop.sh     # Stop container
```
The app runs at http://localhost:8000. Start scripts run frontend tests before building.

### Frontend (from frontend/)
```bash
npm run test          # Vitest unit tests
npm run test:e2e      # Playwright e2e tests
npm run lint          # ESLint
npm run dev           # Dev server
npm run build         # Static export build
```

### Backend (from repo root with venv activated)
```bash
pytest backend/tests/              # All backend tests
pytest backend/tests/test_main.py  # Single test file
```

## Architecture

- **Frontend**: Next.js 16 with React 19, static export to `frontend/out/`. Drag-and-drop via @dnd-kit. Tailwind CSS.
- **Backend**: FastAPI at `backend/app/main.py`. Serves static frontend at `/` and API at `/api/*`.
- **Database**: SQLite at `data/pm.db` (configurable via `PM_DB_PATH`). Schema: users, boards, columns, cards.
- **AI**: OpenRouter integration in `backend/app/ai.py`. Model: `openai/gpt-oss-120b`. Key in `.env` as `OPENROUTER_API_KEY`.
- **Auth**: MVP uses hardcoded credentials (`user`/`password`) with HTTP Basic on protected endpoints.

## API Endpoints

- `GET /api/board` - fetch board state
- `PUT /api/board` - replace entire board
- `POST /api/ai/chat` - AI chat with board context (auth required)
- `GET /api/ai/test` - test AI connectivity (auth required)

## Coding Standards

1. Use latest library versions and idiomatic approaches
2. Keep it simple - no over-engineering, no unnecessary defensive programming
3. Be concise. No emojis
4. Identify root cause with evidence before fixing issues
