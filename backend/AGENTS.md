# Backend Codebase Notes

## Overview

This backend is a FastAPI app that serves a hello world HTML page at / and a JSON endpoint at /api/hello. It is the initial scaffolding for the MVP.

## Key Files

- app/main.py: FastAPI app with root HTML response and /api/hello JSON response.
- requirements.txt: Runtime dependencies.
- requirements-dev.txt: Test dependencies.
- tests/test_main.py: Pytest smoke tests for / and /api/hello.

## Local Development

- Install dependencies with uv:
	- uv pip install -r backend/requirements-dev.txt
- Run tests:
	- pytest backend/tests