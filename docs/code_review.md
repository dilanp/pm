# Code Review Report

Date: 2026-03-20
Updated: 2026-03-20 (Critical, High, Medium issues remediated)

## Summary

The codebase is well-structured for an MVP. All 21 tests pass. The code follows the project's simplicity guidelines. This review identifies areas for improvement organized by priority.

---

## Critical

### 1. Live API call in unit test

**File:** `backend/tests/test_main.py:19-24`

```python
def test_ai_test_endpoint_returns_answer() -> None:
    response = client.get("/api/ai/test", auth=("user", "password"))
    assert response.status_code == 200
    payload = response.json()
    assert "response" in payload
    assert "4" in payload["response"]
```

**Issue:** This test makes a real call to OpenRouter, requiring a valid API key and network access. It will fail in CI without credentials and adds latency/cost.

**Action:** Mock `call_openrouter` similar to `test_ai.py` tests.

---

## High Priority

### 2. Unused variable in AIChatSidebar

**File:** `frontend/src/components/AIChatSidebar.tsx:62`

```tsx
const lastMessage = useMemo(() => messages[messages.length - 1], [messages]);
```

Used at line 135 only to display duplicate info already shown in the message list.

**Action:** Remove `lastMessage` and the "Latest:" section at bottom (lines 135-139) - it duplicates the chat history.

### 3. Board endpoint lacks authentication

**File:** `backend/app/main.py:56-63`

```python
@app.get("/api/board")
def read_board() -> dict:
  return get_board()

@app.put("/api/board")
def update_board(payload: BoardEnvelope) -> dict:
  return replace_board(payload.board.model_dump())
```

**Issue:** `/api/board` GET and PUT are unprotected while `/api/ai/*` requires auth. Anyone can read/modify board data.

**Action:** Add `_: str = Depends(require_demo_auth)` to both endpoints for consistency.

### 4. Missing input validation on column rename

**File:** `frontend/src/components/KanbanColumn.tsx:42-46`

The column title input has no length limit. A user could paste extremely long text.

**Action:** Add `maxLength={50}` to the input.

---

## Medium Priority

### 5. Hardcoded credentials in multiple places

Credentials `user`/`password` appear in:
- `backend/app/main.py:21-22`
- `frontend/src/components/AuthGate.tsx:23`
- `frontend/src/lib/aiApi.ts:14`

**Issue:** Expected for MVP, but scattered definitions make future changes error-prone.

**Action:** For post-MVP, centralize credentials or move to environment variables.

### 6. No card editing capability

**Observation:** Cards can be created, moved, and deleted, but not edited. Users must delete and recreate to fix a typo.

**Action:** Consider adding inline edit for card title/details in a future iteration.

### 7. Error messages expose implementation details

**File:** `backend/app/ai.py:91-94`

```python
raise HTTPException(
    status_code=status.HTTP_502_BAD_GATEWAY,
    detail="OpenRouter request failed",
)
```

**Issue:** The generic "OpenRouter" name leaks the AI provider to clients.

**Action:** Change to "AI service request failed" for cleaner abstraction.

### 8. Frontend API base URL handling

**File:** `frontend/src/lib/boardApi.ts:42`

```ts
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
```

When empty, relative URLs work for same-origin but break if frontend is served separately during development.

**Action:** Document that `NEXT_PUBLIC_API_BASE_URL` must be set when running frontend dev server against Docker backend.

---

## Low Priority

### 9. Console logging not configured

**File:** `backend/app/ai.py:24`

```python
logger = logging.getLogger("backend.ai")
```

Logger is created but no handler configured. Logs won't appear unless uvicorn captures them.

**Action:** Add basic logging config in `main.py` or rely on uvicorn's default (current behavior is acceptable for MVP).

### 10. Position validation is minimal

**File:** `backend/app/schemas.py:11,16`

```python
position: int = Field(ge=0)
```

Validates >= 0 but doesn't check for duplicates or gaps. The `replace_board` logic handles this correctly, but malformed input could cause confusion.

**Action:** Acceptable for MVP since full board replacement resets positions.

### 11. Test file lacks `__init__.py`

**File:** `backend/tests/` directory

Missing `__init__.py` in tests folder. Pytest handles this fine, but explicit packages are cleaner.

**Action:** Add empty `backend/tests/__init__.py`.

### 12. Dockerfile installs npm in container

**File:** `Dockerfile:8-12`

NodeSource script adds ~200MB to image for build-time-only dependency.

**Action:** Consider multi-stage build to reduce final image size (not critical for local MVP).

---

## Code Quality Observations (No Action Required)

- **Good:** AI module has retry logic with exponential backoff and jitter
- **Good:** Pydantic schemas provide clear request/response validation
- **Good:** Frontend uses optimistic UI updates with fallback
- **Good:** DnD-kit integration is clean with proper sensor configuration
- **Good:** Tests use `tmp_path` and `monkeypatch` properly for isolation
- **Good:** Color scheme variables are consistent with design spec

---

## Action Summary

| Priority | Item | File | Status |
|----------|------|------|--------|
| Critical | Live API in test | test_main.py | FIXED - Mocked OpenRouter call |
| High | Unused lastMessage | AIChatSidebar.tsx | FIXED - Removed duplicate display |
| High | Unprotected board API | main.py | FIXED - Added auth to GET/PUT board |
| High | No input length limit | KanbanColumn.tsx | FIXED - Added maxLength={50} |
| Medium | Scattered credentials | multiple | FIXED - Centralized in boardApi.ts |
| Medium | No card editing | KanbanCard.tsx | Deferred - Future feature |
| Medium | Provider name leaked | ai.py | FIXED - Generic "AI service" messages |
| Medium | API base URL docs | boardApi.ts | FIXED - Added comment |
| Low | Logger config | ai.py | Open - Acceptable for MVP |
| Low | Position gaps | schemas.py | Open - Acceptable for MVP |
| Low | Missing __init__.py | backend/tests/ | Open |
| Low | Image size | Dockerfile | Open |
