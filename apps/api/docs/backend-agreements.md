# Backend agreements

## Query DTO responsibilities

Keep each query DTO focused on one responsibility.

- Pagination and text search are the only exception to this rule: both belong in `PaginatedListRequestDto`.
- Filtering fields belong in a filter DTO.
- Sorting fields belong in a sorting DTO.

Do not mix filtering, sorting, searching, and pagination fields in the same DTO unless the DTO is only composing other DTOs.

## Endpoints with several query responsibilities

When a GET endpoint needs more than one query responsibility, create one DTO per responsibility and then expose one request DTO for the controller.

For example, a list endpoint that supports pagination, search, and filters should use:

- `PaginatedListRequestDto` for `page`, `limit`, and `q`.
- A filters DTO for filter criteria attributes.
- A controller request DTO that only combines those DTOs.

The controller request DTO should not declare new fields. Its only purpose is to compose the other DTOs with NestJS intersection support.

Example:

```ts
export class ProjectsFiltersRequestDto {
  keywords?: string[];
}

export class ProjectsListRequestDto extends IntersectionType(
  PaginatedListRequestDto,
  ProjectsFiltersRequestDto,
) {}
```

This keeps the controller query flat:

```txt
GET /api/projects?limit=5&page=1&keywords=pobreza&q=vida
```

At the same time, the backend keeps pagination, search, filters, and sorting separated in code.
