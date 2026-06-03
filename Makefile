# ───────────────────────────────────────────────
# Scientific Production Portal — Makefile
# ───────────────────────────────────────────────

.PHONY: install dev-api dev-web build lint typecheck test format format-check ci docker-up docker-down docker-rebuild clean

# ── Setup ──────────────────────────────────────

install:
	pnpm install

# ── Development ────────────────────────────────

dev-api:
	pnpm run dev:api

dev-web:
	pnpm run dev:web

# ── Build ──────────────────────────────────────

build:
	pnpm run build

# ── Quality ────────────────────────────────────

lint:
	pnpm run lint

typecheck:
	pnpm run typecheck

test:
	pnpm run test

format:
	pnpm run format

format-check:
	pnpm run format:check

ci:
	pnpm run ci

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
