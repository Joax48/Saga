# Software Quality Plan — Saga UCR


> This Quality Plan summarizes the project's software quality practices and conventions: test file structure, unit test templates, mocking guidelines, pre-PR validation steps, and branch/commit standards. It is a concise, living guide for developers and reviewers to ensure consistent, testable, and maintainable code across the repository. Keep the document up to date and use the team's designated tools for detailed tracking and execution records.
---

## Table of Contents

1. [Test File Structure](#1-test-file-structure)
2. [Unit Test Templates](#2-unit-test-templates)
3. [What to Mock and What Not To](#3-what-to-mock-and-what-not-to)
4. [Running Tests](#4-running-tests)
5. [Pull Request Template](#5-pull-request-template)
6. [Branch and Commit Conventions](#6-branch-and-commit-conventions)
7. [Acceptance Criteria in Tests](#7-acceptance-criteria-in-tests)
8. [Pre-PR Validation Checklist](#8-pre-pr-validation-checklist)
9. [Use Cases](#9-use-cases)

---

## 1. Test File Structure

Each module must have a `__tests__/` folder with one `.ts` file per class.

### 1.1 Naming Convention

| Class under test              | Test file                              |
|-------------------------------|----------------------------------------|
| `researchers.service.ts`      | `__tests__/researchers.service.ts`     |
| `researchers.repository.ts`   | `__tests__/researchers.repository.ts`  |
| `researchers.controller.ts`   | `__tests__/researchers.controller.ts`  |

### 1.2 Full Example Tree

```text
apps/api/src/
  modules/
    researchers/
      researcher.entity.ts
      researchers.module.ts
      researchers.service.ts
      researchers.repository.ts
      __tests__/
        researchers.service.ts
        researchers.repository.ts
    units/
      unit.entity.ts
      units.module.ts
      units.service.ts
      units.repository.ts
      __tests__/
        units.service.ts
        units.repository.ts
    projects/
      projects.service.ts
      projects.repository.ts
      __tests__/
        projects.service.ts
        projects.repository.ts
    scientific-productions/
      scientific-productions.service.ts
      scientific-productions.repository.ts
      __tests__/
        scientific-productions.service.ts
        scientific-productions.repository.ts
  bff/
    public-home.controller.ts
    public-researchers.controller.ts
    public-search.controller.ts
    public-units.controller.ts
    __tests__/
      public-home.controller.ts
      public-researchers.controller.ts
      public-search.controller.ts
      public-units.controller.ts
  application/
    get-home.query.ts
    get-public-researcher-profile.query.ts
    search-global.query.ts
    get-public-unit-detail.query.ts
    __tests__/
      get-home.query.ts
      get-public-researcher-profile.query.ts
      search-global.query.ts
      get-public-unit-detail.query.ts
apps/web/
  src/
    __tests__/
      Home.test.tsx
    app/
      page.tsx
      layout.tsx
e2e/
  tests/
    home.spec.ts
    login.spec.ts
  fixtures/
  playwright.config.ts
```

### 1.3 Practical Rules

- One test file per relevant class (service, repository, controller, query).
- `__tests__/` folder inside each module or layer, next to the source files.
- Do not mix tests from different modules in the same file.
- Do not create tests for entities or simple DTOs (only if they contain logic).

---

## 2. Unit Test Templates

This section contains the base templates for writing unit tests in each layer of the project. All of them use **Jest** with manual mocks and follow this pattern for team consistency:

- **Arrange:** Initialize variables, data, mocks, dependencies, and everything needed to run the test.
- **Act:** Call the method under test.
- **Assert:** Evaluate the result of the test, whether it produces an expected behavior, output, or error message.

> **General rule:** only mock what is injected as a dependency. The class under test is never mocked.

---

### 2.1 Template: Service

**Reference file:** `modules/researchers/researchers.service.ts`  
**Test file:** `modules/researchers/__tests__/researchers.service.ts`

The service contains the domain logic. The repository it receives by injection is mocked. There must be no SQL or HTTP logic in this layer.

**What to mock:** `ResearchersRepository`, and any other injected service.

```typescript
import { ResearchersService } from '../researchers.service';
import { ResearchersRepository } from '../researchers.repository';

describe('ResearchersService', () => {
  let service: ResearchersService;
  let repository: jest.Mocked<ResearchersRepository>;

  // --- ARRANGE (shared setup) ---
  beforeEach(() => {
    repository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
    } as unknown as jest.Mocked<ResearchersRepository>;

    service = new ResearchersService(repository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- Happy path ---
  describe('findAll', () => {
    it('should return the list of researchers', async () => {
      // Arrange
      const mockResearchers = [
        { id: '1', name: 'Ana Pérez', unit: 'CIMPA' },
        { id: '2', name: 'Luis Mora', unit: 'CIGEFI' },
      ];
      repository.findAll.mockResolvedValue(mockResearchers);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual(mockResearchers);
      expect(repository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  // --- Error case ---
  describe('findById', () => {
    it('should throw an error if the researcher does not exist', async () => {
      // Arrange
      repository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findById('non-existent-id'))
        .rejects
        .toThrow('Researcher not found');
    });
  });
});
```

---

### 2.2 Template: Repository

**Reference file:** `modules/researchers/data/researchers.repository.ts`  
**Test file:** `modules/researchers/data/__tests__/researchers.repository.ts`

The repository accesses the Oracle database directly using raw SQL through the `DatabaseClient` contract (`OracleDatabaseProvider`). The database client is mocked — never a real database.

**What to mock:** the `DatabaseClient` (the object with the `query` method), typed as `DatabaseServiceMock`.

```typescript
import { ResearchersRepository } from '../researchers.repository';
import type { DatabaseClient } from '../../../../common/database/database-client.contract';

type DatabaseServiceMock = {
  query: jest.Mock;
};

describe('ResearchersRepository', () => {
  let repository: ResearchersRepository;
  let mockDb: DatabaseServiceMock;

  // --- ARRANGE (shared setup) ---
  beforeEach(() => {
    mockDb = { query: jest.fn() };
    repository = new ResearchersRepository(mockDb as unknown as DatabaseClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- Happy path ---
  describe('findPaginated', () => {
    it('should return items and total count', async () => {
      // Arrange
      const mockItems = [
        { id: 'a1b2c3', name: 'Ana', firstSurname: 'Pérez', secondSurname: 'Mora' },
        { id: 'd4e5f6', name: 'Luis', firstSurname: 'Solano', secondSurname: null },
      ];
      const mockCount = [{ totalCount: 30 }];
      // findPaginated runs two queries in parallel: items first, count second
      mockDb.query.mockResolvedValueOnce(mockItems).mockResolvedValueOnce(mockCount);

      // Act
      const result = await repository.findPaginated(1, 10);

      // Assert
      expect(result.items).toEqual(mockItems);
      expect(result.total).toBe(30);
      expect(mockDb.query).toHaveBeenCalledTimes(2);
    });
  });

  // --- Oracle pagination syntax ---
  describe('findPaginated — Oracle pagination', () => {
    it('should use FETCH NEXT / OFFSET syntax (Oracle SQL:2011)', async () => {
      // Arrange
      mockDb.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ totalCount: 0 }]);

      // Act
      await repository.findPaginated(2, 10);

      // Assert
      const itemsQuery = mockDb.query.mock.calls[0][0] as string;
      expect(itemsQuery).toContain('FETCH NEXT 10 ROWS ONLY');
      expect(itemsQuery).toContain('OFFSET 10 ROWS');
    });
  });

  // --- Bind variables ---
  describe('findById', () => {
    it('should pass the id as the :1 Oracle bind variable', async () => {
      // Arrange
      mockDb.query.mockResolvedValue([]);

      // Act
      await repository.findById('target-id');

      // Assert — verifies safe SQL usage (:1, not string concatenation)
      expect(mockDb.query.mock.calls[0][1]).toEqual(['target-id']);
      const query = mockDb.query.mock.calls[0][0] as string;
      expect(query).toContain('PROFILE_ID = :1');
    });

    it('should return null when the database returns an empty array', async () => {
      // Arrange
      mockDb.query.mockResolvedValue([]);

      // Act
      const result = await repository.findById('nonexistent-id');

      // Assert
      expect(result).toBeNull();
    });
  });
});
```

> **Security note:** bind-variable tests (`:1`) verify that the SQL uses positional Oracle placeholders and not string concatenation. This enforces the project rule that prohibits dynamic literals in queries.

---

### 2.3 Template: Controller (BFF)

**Reference file:** `bff/public-researchers.controller.ts`  
**Test file:** `bff/__tests__/public-researchers.controller.ts`

The controller only handles HTTP: it receives the request, delegates to the corresponding query or service, and returns the response. It must not contain business logic.

**What to mock:** the queries from `application/` or services the controller calls directly.

```typescript
import { PublicResearchersController } from '../public-researchers.controller';
import { GetPublicResearcherProfileQuery } from '../../application/get-public-researcher-profile.query';

describe('PublicResearchersController', () => {
  let controller: PublicResearchersController;
  let profileQuery: jest.Mocked<GetPublicResearcherProfileQuery>;

  // --- ARRANGE (shared setup) ---
  beforeEach(() => {
    profileQuery = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetPublicResearcherProfileQuery>;

    controller = new PublicResearchersController(profileQuery);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- Happy path ---
  describe('getProfile', () => {
    it('should return the researcher profile', async () => {
      // Arrange
      const mockProfile = { id: '1', name: 'Ana Pérez', unit: 'CIMPA' };
      profileQuery.execute.mockResolvedValue(mockProfile);

      // Act
      const result = await controller.getProfile('1');

      // Assert
      expect(result).toEqual(mockProfile);
      expect(profileQuery.execute).toHaveBeenCalledWith({ id: '1' });
    });
  });

  // --- Error case: resource not found ---
  describe('getProfile — not found', () => {
    it('should throw NotFoundException if the profile does not exist', async () => {
      // Arrange
      profileQuery.execute.mockRejectedValue(new Error('Researcher not found'));

      // Act & Assert
      await expect(controller.getProfile('invalid-id'))
        .rejects
        .toThrow('Researcher not found');
    });
  });
});
```

---

### 2.4 Template: Application Query

**Reference file:** `application/get-public-researcher-profile.query.ts`  
**Test file:** `application/__tests__/get-public-researcher-profile.query.ts`

Queries coordinate multiple services to build the full response for a view. All involved services are mocked. Queries do not access repositories directly.

**What to mock:** all services the query receives by injection (`ResearchersService`, `ProjectsService`, `ScientificProductionsService`, etc.).

```typescript
import { GetPublicResearcherProfileQuery } from '../get-public-researcher-profile.query';
import { ResearchersService } from '../../modules/researchers/researchers.service';
import { ProjectsService } from '../../modules/projects/projects.service';

describe('GetPublicResearcherProfileQuery', () => {
  let query: GetPublicResearcherProfileQuery;
  let researchersService: jest.Mocked<ResearchersService>;
  let projectsService: jest.Mocked<ProjectsService>;

  // --- ARRANGE (shared setup) ---
  beforeEach(() => {
    researchersService = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<ResearchersService>;

    projectsService = {
      findByResearcherId: jest.fn(),
    } as unknown as jest.Mocked<ProjectsService>;

    query = new GetPublicResearcherProfileQuery(
      researchersService,
      projectsService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- Happy path: coordinates multiple services ---
  describe('execute', () => {
    it('should return the full profile with its projects', async () => {
      // Arrange
      const mockResearcher = { id: '1', name: 'Ana Pérez' };
      const mockProjects = [{ id: 'p1', title: 'Project Alpha' }];

      researchersService.findById.mockResolvedValue(mockResearcher);
      projectsService.findByResearcherId.mockResolvedValue(mockProjects);

      // Act
      const result = await query.execute({ id: '1' });

      // Assert
      expect(result.researcher).toEqual(mockResearcher);
      expect(result.projects).toEqual(mockProjects);
      expect(researchersService.findById).toHaveBeenCalledWith('1');
      expect(projectsService.findByResearcherId).toHaveBeenCalledWith('1');
    });

    it('should fail if the researcher does not exist', async () => {
      // Arrange
      researchersService.findById.mockRejectedValue(
        new Error('Researcher not found'),
      );

      // Act & Assert
      await expect(query.execute({ id: 'non-existent' }))
        .rejects
        .toThrow('Researcher not found');

      // Should not call other services if the first one fails
      expect(projectsService.findByResearcherId).not.toHaveBeenCalled();
    });
  });
});
```

---

### 2.5 Summary: What to Mock per Layer

| Layer             | Class under test                              | What is mocked                            |
|-------------------|-----------------------------------------------|-------------------------------------------|
| Service           | `researchers.service.ts`                      | Injected repository                       |
| Repository        | `researchers.repository.ts`                   | `DatabaseClient` contract (`query` method) — returns `T[]` directly, Oracle bind vars (`:1`, `:2`, …) |
| Controller (BFF)  | `public-researchers.controller.ts`            | Query or service from `application/`      |
| Application Query | `get-public-researcher-profile.query.ts`      | All coordinated services                  |

Each `describe` groups cases related to the same method. Each `it` tests a single behavior. The `beforeEach` rebuilds clean mocks before each test to prevent side effects between cases.

---

## 3. What to Mock and What Not To

| Always mock                                    | Never mock                                  |
|------------------------------------------------|---------------------------------------------|
| Repositories (database access)                 | The class being tested                      |
| External services (third-party APIs, email)    | Pure logic with no dependencies             |
| Other injected services                        | Simple constructors                         |
| The database client                            | Entities and simple DTOs                    |
| Guards and middleware (in controller tests)    | Utilities with no side effects              |

**Considerations:**

- Do not mock everything indiscriminately — tests will pass even when the system is broken, and integration errors go undetected (over-mocking).
- Mocks should be used to isolate external dependencies in unit tests.
- Do not mock repositories in integration tests — use a real or in-memory database instead.
- Mocks must not replace validation of the real system.
- Complement unit tests with integration tests that validate the actual behavior of the system.

---

## 4. Running Tests

From the root of the monorepo:

```bash
pnpm run test
```

---

## 5. Pull Request Template

Every Pull Request must include the following structure:

---

## Description
*What does this PR do and why is it necessary? Include enough context for someone outside the ticket to understand it.*

---

## Type of Change
- [ ] `feat`     — New feature
- [ ] `fix`      — Bug fix
- [ ] `refactor` — Code improvement with no behavior change
- [ ] `test`     — Tests only
- [ ] `chore`    — Configuration, dependencies, CI
- [ ] `docs`     — Documentation only

- [ ] Breaking change (breaks backward compatibility)

---

## Reference
Closes #___
*Use "Closes" to automatically close the issue on merge.*

---

## Changes Made
*Concrete list of changes. Be specific: affected files/modules.*

Example:
- Files: units.module.ts — register new endpoints and providers.
- Files: apps/api/src/modules/units/units.service.ts — implement findAll with pagination and filtering.
- Files: apps/api/src/modules/units/units.repository.ts — add DB query for paginated units.
- Files: apps/api/src/bff/public-units.controller.ts — add public BFF endpoint /public/units.

---

## How to Test
*Exact and reproducible steps. Include preconditions if applicable.*
**Preconditions:** (data, flags, environment variables)

Example:
1. Start API:
```bash
pnpm run dev:api
```
2. Call the public endpoint
```bash
curl -s "http://localhost:3000/public/units?page=1&limit=10"
```
3. Run unit tests for units module:
```bash
pnpm run test -- apps/api/src/modules/units
```

**Expected result:**

Example:
- HTTP: 200 OK with JSON body containing items (array of units) and meta (pagination info: page, limit, total).
- Behavior: Response respects page and limit query parameters and returns an empty items array when no records match.
- Tests: Unit tests for units.service and units.repository pass locally (pnpm run test).

---

## Impact
**Affected areas:** (modules, services, routes, APIs)

- [ ] Affects database (migrations required)
- [ ] Affects external APIs (contract changes)
- [ ] Performance impact (add metrics or benchmarks)
- [ ] Requires configuration change
- [ ] Requires documentation update

---

## Evidence
*Screenshots, GIFs, logs, terminal outputs. Mostly for UI changes.*

---

## Quality Checklist

### Code
- [ ] Follows project conventions
- [ ] No dead code or unnecessary comments
- [ ] No forgotten `console.log` / debuggers
- [ ] Proper error handling

### Tests
- [ ] Tests added or updated
- [ ] Cover happy paths, edge cases, and errors
- [ ] `pnpm run test` passes locally

### Technical Validations
- [ ] `pnpm run typecheck` passes
- [ ] `pnpm run lint` passes
- [ ] `pnpm run build` passes
- [ ] Pipeline is green

### Functional QA
- [ ] Acceptance criteria verified
- [ ] Happy paths tested
- [ ] Relevant edge cases tested
- [ ] Tested on mobile / responsive (if applicable)
- [ ] Tested on multiple browsers (if applicable)

### Review
- [ ] At least 1 reviewer assigned
- [ ] Previous comments resolved
- [ ] PR has a reasonable size (< 400 lines)

---

## Notes for the Reviewer
*Technical decisions made, discarded alternatives, generated technical debt, or anything the reviewer should know before reviewing.*


---

## 6. Branch and Commit Conventions

### Branches

| Type    | Format                            | Example                        |
|---------|-----------------------------------|--------------------------------|
| Feature | `feature/<id>-<description>`      | `feature/12-researcher-profile`|
| Fix     | `fix/<id>-<description>`          | `fix/45-search-filter`         |
| Hotfix  | `hotfix/<id>-<description>`       | `hotfix/78-500-error-home`     |

### Commits

Use descriptive prefixes:

| Prefix   | Use                              | Example                                        |
|----------|----------------------------------|------------------------------------------------|
| `feat:`  | New feature                      | `feat: add units endpoint`                     |
| `fix:`   | Bug fix                          | `fix: correct global search filter`            |
| `test:`  | Add or modify tests              | `test: add tests for researchers.service`      |
| `chore:` | Maintenance, config              | `chore: update pipeline`                       |
| `docs:`  | Documentation                    | `docs: update quality guide`                   |

---

## 7. Acceptance Criteria in Tests

For each user story:

1. Define verifiable criteria using **Given / When / Then** or a clear checklist.
2. Map each criterion to an automated test whenever possible.
3. Document in the Merge Request which criteria were verified and how.
4. The reviewer validates that the tests cover the logic of the criterion.

---

## 8. Pre-PR Validation Checklist

Run these commands before opening a Merge Request:

```bash
# 1. Install dependencies (first time only)
pnpm install

# 2. Check types
pnpm run typecheck

# 3. Run tests
pnpm run test

# 4. Verify build
pnpm run build
```

---

## 9. Use Cases

Use cases are maintained in a single Google Sheet to centralize planning, execution and results. Please use the following sheet as the source of truth:

- Use Cases Sheet: https://docs.google.com/spreadsheets/d/1PTf0qjmqrM5ZlvBMzrxCt1sWaWWGv1sdtC_bAdCR4ow

Each row in the sheet represents one use case. The sheet columns are described below:

- ID: Unique identifier for the use case (e.g., CU-001 or a numeric sequence).
- Description: Short title or summary of the use case — what is being verified.
- Preconditions: Conditions, data, or setup that must exist before executing the steps.
- Steps: Ordered actions to execute the use case (clear, reproducible steps).
- Expected Result: The acceptance criteria or expected outcome for each step or for the whole case.
- Actual Result: The observed outcome after execution (filled during test runs).
- Sprint: Sprint number or milestone where the case is planned or executed.
- Status: Current state of the case — use one of: approved, failed, in progress.

### Notes
- The sheet replaces the per-module Markdown use case files previously described. Keep the Google Sheet updated for traceability and link use cases from PRs when relevant.
- When adding a new use case, populate all columns except Actual Result and Status (those are filled during or after execution).
