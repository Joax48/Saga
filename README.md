# Scientific Production Portal

Public portal for researchers, projects, and scientific productions.

## Quality Plan

The project's software quality practices, conventions, and guidelines are documented in QualityPlan.md 

[See the full document here](QualityPlan.md)


## Tech Stack

| Layer    | Technology              | Port |
| -------- | ----------------------- | ---- |
| Frontend | Next.js 14 (App Router) | 3000 |
| Backend  | NestJS 10 (BFF pattern) | 3001 |
| Database | PostgreSQL 16           | 5432 |
| Language | TypeScript 5            |      |

## Project Structure

```
├── apps/
│   ├── api/              # NestJS backend
│   │   └── src/
│   │       ├── main.ts              # Entry point
│   │       ├── app.module.ts        # Root module
│   │       ├── bff/                 # BFF controllers and request models
│   │       │   ├── public/          # Public-facing controllers
│   │       │   └── common/          # Shared components
│   │       ├── application/         # Use cases, view models, and shared app concerns
│   │       │   ├── use-cases/       # View-specific orchestration
│   │       │   ├── view-models/     # Response shapes returned to the client
│   │       │   └── common/          # Shared components
│   │       ├── common/              # Database, guards, filters, middleware
│   │       └── modules/             # Domain modules
│   │           ├── researchers/     # Entity, reader contract, data/, module
│   │           ├── units/
│   │           ├── projects/
│   │           ├── scientific-productions/
│   │           ├── search/
│   │           ├── cache/
│   │           └── auth/
│   └── web/              # Next.js frontend
│       └── src/app/
│           ├── layout.tsx
│           └── page.tsx
├── docker-compose.yml
├── .gitlab-ci.yml
├── .env.development
├── Makefile
├── pnpm-workspace.yaml   # pnpm workspaces config
└── package.json          # monorepo root
```

### Architecture (BFF Pattern)

```
Browser → Next.js (web) → NestJS BFF controllers → Application use cases → Reader services/contracts → Repositories → PostgreSQL
```

- **BFF controllers** — organized by interface boundary, with public endpoints under `bff/public`
- **Application use cases** — orchestrate readers to build view-specific responses
- **View models** — define the response shapes returned by each public view
- **Reader services/contracts** — read logic behind explicit contracts
- **Repositories** — raw SQL with parameterized queries (`$1`, `$2`) via `pg`

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) >= 11 — `npm install -g pnpm`
- [Docker](https://www.docker.com/) and Docker Compose (for containerized setup)

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Environment variables

```bash
cp .env.development .env
```

Edit `.env` with your values. Both `.env` and `.env.development` are git-ignored.

### 3. Run locally (without Docker)

Start the API and frontend in separate terminals:

```bash
# Terminal 1 — API on port 3001
pnpm run dev:api

# Terminal 2 — Web on port 3000
pnpm run dev:web
```

### 4. Run with Docker Compose

```bash
# Build and start all services (db, api, web)
docker compose up --build

# Or in detached mode
docker compose up --build -d

# Stop
docker compose down

# Stop and remove volumes (deletes database data)
docker compose down -v
```

## Testing Structure

The API test suite is organized under:

```text
apps/api/src/tests/
├── unit/
├── integration/
└── e2e/
```

## Available Commands

All commands are run from the project root.

### Development

| Command            | Description                           |
| ------------------ | ------------------------------------- |
| `pnpm run dev:api` | Start API server (ts-node, port 3001) |
| `pnpm run dev:web` | Start web dev server (port 3000)      |

### Build

| Command              | Description       |
| -------------------- | ----------------- |
| `pnpm run build`     | Build API and web |
| `pnpm run build:api` | Build API only    |
| `pnpm run build:web` | Build web only    |

### Quality

| Command                 | Description                      |
| ----------------------- | -------------------------------- |
| `pnpm run lint`         | Lint API and web                 |
| `pnpm run typecheck`    | TypeScript type checking         |
| `pnpm run test`         | Run API tests                    |
| `pnpm run format`       | Format all files with Prettier   |
| `pnpm run format:check` | Check formatting without writing |
| `pnpm run ci`           | Run lint + typecheck + test      |

### Makefile

A `Makefile` is provided for convenience:

```bash
make install      # Install dependencies (pnpm install)
make dev-api      # Start API
make dev-web      # Start web
make lint         # Lint all
make typecheck    # Type check all
make test         # Run tests
make format       # Format code
make ci           # Full CI pipeline
make docker-up    # Docker compose up --build
make docker-down  # Docker compose down
make clean        # Remove node_modules, dist, .next
```

## CI/CD

GitLab CI is configured in `.gitlab-ci.yml` with the following pipeline:

```
install → lint + typecheck (parallel) → test → build:api + build:web (parallel)
```

## License

Private — all rights reserved.
