# ───────────────────────────────────────────────
# Scientific Production Portal — Makefile
# ───────────────────────────────────────────────

.PHONY: install dev-api dev-web build lint typecheck test e2e format format-check ci docker-up docker-down docker-rebuild docker-api-logs docker-web-logs docker-db-logs clean

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

e2e:
	pnpm run e2e

format:
	pnpm run format

format-check:
	pnpm run format:check

ci:
	pnpm run ci

# ── Docker ─────────────────────────────────────

docker-up:
	docker compose -f docker-compose.yml --env-file apps/api/.env up --build -d

docker-down:
	docker compose -f docker-compose.yml --env-file apps/api/.env down

docker-rebuild:
	docker compose -f docker-compose.yml --env-file apps/api/.env down -v
	docker compose -f docker-compose.yml --env-file apps/api/.env up --build -d

docker-api-logs:
	docker compose -f docker-compose.yml --env-file apps/api/.env logs -f --no-log-prefix api

docker-web-logs:
	docker compose -f docker-compose.yml --env-file apps/api/.env logs -f --no-log-prefix web

docker-db-logs:
	docker compose -f docker-compose.yml --env-file apps/api/.env logs -f --no-log-prefix db

# ── Cleanup ────────────────────────────────────

clean:
	rm -rf node_modules apps/api/node_modules apps/web/node_modules
	rm -rf apps/api/dist apps/web/.next
