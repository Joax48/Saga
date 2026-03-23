# ───────────────────────────────────────────────
# Scientific Production Portal — Makefile
# ───────────────────────────────────────────────

.PHONY: install dev-api dev-web build lint typecheck test format format-check ci docker-up docker-down docker-rebuild clean

# ── Setup ──────────────────────────────────────

install:
	npm install

# ── Development ────────────────────────────────

dev-api:
	npm run dev:api

dev-web:
	npm run dev:web

# ── Build ──────────────────────────────────────

build:
	npm run build

# ── Quality ────────────────────────────────────

lint:
	npm run lint

typecheck:
	npm run typecheck

test:
	npm run test

format:
	npm run format

format-check:
	npm run format:check

ci:
	npm run ci

# ── Docker ─────────────────────────────────────

docker-up:
	docker compose up --build -d

docker-down:
	docker compose down

docker-rebuild:
	docker compose down -v
	docker compose up --build -d

# ── Cleanup ────────────────────────────────────

clean:
	rm -rf node_modules apps/api/node_modules apps/web/node_modules
	rm -rf apps/api/dist apps/web/.next
