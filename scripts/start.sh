#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

npm --prefix "$REPO_ROOT/frontend" install
npm --prefix "$REPO_ROOT/frontend" run test:all

docker build -t pm-app "$REPO_ROOT"
docker rm -f pm-app >/dev/null 2>&1 || true

docker run -d --name pm-app -p 8000:8000 pm-app
