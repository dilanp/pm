# Project Plan (Detailed)

This document expands each phase into actionable checklists with tests and success criteria. The goal is to keep the MVP simple while meeting the requirements from AGENTS.md.

## Part 1: Plan

Goal: lock a detailed execution plan and document the current frontend baseline.

Checklist:
- [ ] Expand this PLAN with checklists, tests, and success criteria per phase.
- [ ] Document the existing frontend in frontend/AGENTS.md.
- [ ] Confirm Python and Node versions are latest stable at implementation time.
- [ ] Align on backend test runner (pytest) and frontend test invocation requirements.
- [ ] Get user approval before starting Part 2.

Tests:
- N/A (documentation-only phase).

Success criteria:
- PLAN.md includes clear, phase-by-phase checklists, tests, and success criteria.
- frontend/AGENTS.md accurately describes the current frontend codebase and scripts.
- User explicitly approves the plan.

## Part 2: Scaffolding

Goal: set up Docker, FastAPI backend, and start/stop scripts; serve a hello world page and a sample API response.

Checklist:
- [ ] Create backend/ FastAPI app with health and sample JSON endpoints.
- [ ] Serve a static hello world HTML page directly from FastAPI at /.
- [ ] Add a simple API route (e.g., /api/hello) that returns JSON.
- [ ] Create Dockerfile and docker ignore as needed.
- [ ] Add start/stop scripts for Mac, Windows, Linux under scripts/.
- [ ] Ensure scripts run frontend tests before launching the web app.
- [ ] Use latest stable Python and Node versions in the container.

Tests:
- Backend: pytest smoke tests for / and /api/hello.
- Manual: container starts, / returns HTML, /api/hello returns JSON.

Success criteria:
- Docker container starts locally and serves FastAPI at / and /api/hello.
- Start/stop scripts function on each OS and run frontend tests before launch.
- README or docs mention how to run the container and scripts.

## Part 3: Add in Frontend

Goal: serve the existing Next.js Kanban UI as a static build from FastAPI.

Checklist:
- [ ] Configure frontend build output for static export.
- [ ] Adjust FastAPI to serve the static frontend at /.
- [ ] Ensure asset paths and routing work with FastAPI static hosting.
- [ ] Wire docker build to produce and include static frontend assets.

Tests:
- Frontend: run existing unit tests (Vitest) and e2e tests (Playwright).
- Integration: open / and confirm Kanban renders with five columns.

Success criteria:
- / shows the Kanban UI from the static build.
- All frontend tests pass and are run before the app launch.
- No regression in existing drag-and-drop or card creation flows.

## Part 4: Fake User Sign In

Goal: add a simple login gate with dummy credentials (user/password) and logout.

Checklist:
- [ ] Create a login UI and gating logic in the frontend.
- [ ] Add minimal backend auth session or token handling if needed.
- [ ] Ensure logout clears session state and returns to login screen.

Tests:
- Frontend unit tests for login form behavior.
- E2E tests for login success, login failure, and logout.

Success criteria:
- User must log in to see the Kanban.
- Correct dummy credentials grant access; invalid credentials do not.
- Logout returns to the login screen.

## Part 5: Database Modeling

Goal: define the Kanban database schema and document the data model.

Checklist:
- [ ] Propose a SQLite schema for users, boards, columns, cards.
- [ ] Save schema as JSON (docs/ or a new schema file).
- [ ] Document the data model decisions and constraints in docs/.
- [ ] Get user sign-off before implementing storage.

Tests:
- N/A (documentation-only phase).

Success criteria:
- JSON schema and documentation exist and are approved.

## Part 6: Backend

Goal: implement CRUD endpoints for Kanban data in FastAPI.

Checklist:
- [ ] Add data access layer with SQLite; create DB if missing.
- [ ] Implement endpoints to fetch and update board data.
- [ ] Validate requests and handle errors simply.

Tests:
- Backend unit tests with pytest for all endpoints.
- DB initialization test verifies creation on first run.

Success criteria:
- CRUD endpoints work for the single-board-per-user model.
- Backend tests pass and cover error cases.

## Part 7: Frontend + Backend

Goal: connect the frontend to backend APIs for persistent Kanban state.

Checklist:
- [ ] Replace frontend local state with API calls.
- [ ] Add loading/error states with minimal UI changes.
- [ ] Ensure drag/drop and card edits persist.

Tests:
- Integration tests for end-to-end persistence.
- E2E tests for create, move, delete, and refresh flows.

Success criteria:
- Kanban changes persist across reloads.
- UI stays responsive and consistent with backend data.

## Part 8: AI Connectivity

Goal: enable backend AI calls through OpenRouter.

Checklist:
- [ ] Add OpenRouter client using OPENROUTER_API_KEY.
- [ ] Implement a test endpoint that asks "2+2".
- [ ] Use model openai/gpt-oss-120b.

Tests:
- Backend test that hits AI endpoint and asserts response includes "4".

Success criteria:
- AI call succeeds with proper auth and returns a valid response.

## Part 9: AI Structured Outputs

Goal: send board JSON and user prompt to AI and parse structured output.

Checklist:
- [ ] Define a structured output schema for response + optional board updates.
- [ ] Send current board + conversation history to AI.
- [ ] Validate and apply structured updates in backend.

Tests:
- Unit tests for schema validation and update application.
- Integration test with a mocked AI response for deterministic behavior.

Success criteria:
- AI responses are parsed safely and updates apply correctly.
- Backend rejects malformed output gracefully.

## Part 10: AI Chat UI

Goal: add a sidebar chat UI that displays AI responses and updates the board.

Checklist:
- [ ] Build a sidebar chat widget in the frontend.
- [ ] Wire chat requests to backend AI endpoint.
- [ ] Apply AI-driven updates and refresh the board automatically.

Tests:
- Frontend unit tests for chat UI behavior.
- E2E test for an AI interaction that updates the board.

Success criteria:
- Chat sidebar is functional and visually aligned with the design.
- AI-driven updates are reflected in the UI without manual refresh.