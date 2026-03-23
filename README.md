# Scientific Production Portal

Public portal for researchers, projects, and scientific productions.

## Tech Stack

| Layer      | Technology                  | Port |
|------------|-----------------------------|------|
| Frontend   | Next.js 14 (App Router)     | 3000 |
| Backend    | NestJS 10 (BFF pattern)     | 3001 |
| Database   | PostgreSQL 16               | 5432 |
| Language   | TypeScript 5                |      |

## Project Structure

```
├── apps/
│   ├── api/              # NestJS backend
│   │   └── src/
│   │       ├── main.ts              # Entry point
│   │       ├── app.module.ts        # Root module
│   │       ├── bff/                 # BFF controllers (one per view)
│   │       ├── application/         # Application query coordinators
│   │       ├── common/              # Database, guards, filters, middleware
│   │       └── modules/             # Domain modules
│   │           ├── researchers/     # Entity, repository, service, module
│   │           ├── units/
│   │           ├── projects/
│   │           ├── scientific-productions/
│   │           └── auth/
│   └── web/              # Next.js frontend
│       └── src/app/
│           ├── layout.tsx
│           └── page.tsx
├── docker-compose.yml
├── .gitlab-ci.yml
├── .env.development
├── Makefile
└── package.json          # npm workspaces root
```

### Architecture (BFF Pattern)

```
Browser → Next.js (web) → NestJS BFF controllers → Application queries → Services → Repositories → PostgreSQL
```

- **BFF controllers** — one controller per frontend view (home, search, researchers, units)
- **Application queries** — orchestrate multiple services to build view-specific responses
- **Services** — business logic per domain entity
- **Repositories** — raw SQL with parameterized queries (`$1`, `$2`) via `pg`

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [Docker](https://www.docker.com/) and Docker Compose (for containerized setup)

## Getting Started

### 1. Install dependencies

```bash
npm install
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
npm run dev:api

# Terminal 2 — Web on port 3000
npm run dev:web
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

## Available Commands

All commands are run from the project root.

### Development

| Command          | Description                        |
|------------------|------------------------------------|
| `npm run dev:api`  | Start API server (ts-node, port 3001) |
| `npm run dev:web`  | Start web dev server (port 3000)   |

### Build

| Command            | Description              |
|--------------------|--------------------------|
| `npm run build`      | Build API and web        |
| `npm run build:api`  | Build API only           |
| `npm run build:web`  | Build web only           |

### Quality

| Command              | Description                      |
|----------------------|----------------------------------|
| `npm run lint`         | Lint API and web                 |
| `npm run typecheck`    | TypeScript type checking         |
| `npm run test`         | Run API tests                    |
| `npm run format`       | Format all files with Prettier   |
| `npm run format:check` | Check formatting without writing |
| `npm run ci`           | Run lint + typecheck + test      |

### Makefile

A `Makefile` is provided for convenience:

```bash
make install      # Install dependencies
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
