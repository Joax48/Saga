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

### 4. Run with Docker

#### 4.1 Stop the database container

If you were previously running the project locally, you probably have the database running inside a container. 

Find the name of the database container:

```bash
docker ps
```

Then stop it (replace the name if different):

```bash
docker stop oracle-database
```

*Docker compose will start its own database container on the same port (1521), which will conflict with one already running locally.*

#### 4.2 Set additional environment variables

Assuming your project already runs locally, **make sure you also have the following variables in apps/api/.env**:

- **DB_PATH**: A full path to where the oracle database is located.

- **NEXT_PUBLIC_API_URL**: Default value should work (`http://localhost:3001`),

  - The API URL used by the browser. Must be reachable from the user's machine, even when running in Docker.

- **API_URL_INTERNAL**: Default value should work (`http://api:3001`).

  - The API URL used by the Next.js server itself (server-side rendering, API routes). In Docker, this must use the service name instead of localhost, since the request happens container-to-container.

#### 4.3 Start the project

***Note:** `make` is available on Linux/macOS. In Windows, use the second command below.*

```bash
make docker-up
```

or 

```bash
docker compose -f docker-compose.yml --env-file apps/api/.env up --build -d
```

#### 4.4 Stop the project

```bash
make docker-down
```

or

```bash
docker compose -f docker-compose.yml --env-file apps/api/.env down
```

#### 4.5 Verify the containers were created

Check running containers:

```bash
docker ps
```

Successfully starting the project will create three containers:

- saga_ucr-web-1: The frontend
- saga_ucr-api-1: The backend
- saga_ucr-db-1: The database

*The database could take a while to fully start. If you see no results when navigating the project, consider giving it a minute.*

***Windows users**: if hot-reloading doesn't seem to work (changes don't appear without restarting containers), uncomment `CHOKIDAR_USEPOLLING` and `WATCHPACK_POLLING` in `docker-compose.yml` for the `api` and `web` services respectively.*

#### 4.6 Viewing the logs

Use the Makefile shortcuts to follow logs:

```bash
make docker-api-logs  # Backend logs
make docker-web-logs  # Frontend logs
make docker-db-logs   # Database logs
```

or

```bash
docker compose -f docker-compose.yml --env-file apps/api/.env logs -f --no-log-prefix api
docker compose -f docker-compose.yml --env-file apps/api/.env logs -f --no-log-prefix web
docker compose -f docker-compose.yml --env-file apps/api/.env logs -f --no-log-prefix db
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
| `pnpm run e2e`          | Run all API end-to-end tests     |
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
make e2e          # Run all API end-to-end tests
make format       # Format code
make ci           # Full CI pipeline
make docker-up    # Docker compose up --build
make docker-down  # Docker compose down
make docker-rebuild    # Recreate containers and volumes
make docker-api-logs   # Follow API logs
make docker-web-logs   # Follow web logs
make docker-db-logs    # Follow database logs
make clean        # Remove node_modules, dist, .next
```

## CI/CD

GitLab CI is configured in `.gitlab-ci.yml` with the following pipeline:

```
install → lint + typecheck (parallel) → test → build:api + build:web (parallel)
```

## License

Private — all rights reserved.
