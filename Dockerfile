FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl ca-certificates \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir uv

COPY backend/requirements.txt /app/backend/requirements.txt
RUN uv pip install --system -r /app/backend/requirements.txt

COPY backend /app/backend

COPY frontend/package.json frontend/package-lock.json /app/frontend/
RUN npm --prefix /app/frontend ci

COPY frontend /app/frontend
RUN npm --prefix /app/frontend run build
RUN mkdir -p /app/backend/app/static \
    && cp -r /app/frontend/out/. /app/backend/app/static/

ENV PYTHONPATH=/app
EXPOSE 8000

CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
