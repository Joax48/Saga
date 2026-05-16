// Injection token for the researchers reader service
export const RESEARCHERS_READER = Symbol('RESEARCHERS_READER');

// ─── Response DTOs ────────────────────────────────────────────────────────────

/** Shape of a single researcher in the list and detail responses */
export interface ResearcherListItemDto {
  id: string;
  idUcrProfile: string;
  baseUnit: string;
  name: string;
  firstSurname: string;
  secondSurname: string;
  ceaCategory: string | null;
  orcidId: string | null;
  linkedin: string | null;
  researchGate: string | null;
  scopus: string | null;
  photoUrl: string | null;
}

/** Response shape for the paginated researcher list */
export interface ResearchersPaginatedListDto {
  items: ResearcherListItemDto[];
  page: number;
  limit: number;
  total: number;
}

// ─── Filter DTOs ──────────────────────────────────────────────────────────────

/** Filters the client can send in the request */
export interface ResearchersFiltersRequestDto {
  unit?: string[];
}

/**
 * A single unit filter option with its researcher count.
 * The "count" field was added to display how many researchers
 * belong to each unit directly in the filter sidebar.
 */
export interface ResearcherUnitFacet {
  value: string; // unit name (the filter value)
  count: number; // number of researchers in that unit
}

/**
 * Response shape for GET /researchers/filters.
 * Previously returned string[] (unit names only).
 * Now returns ResearcherUnitFacet[] to include the real count
 * so the UI can display it next to each filter option.
 */
export interface ResearchersFiltersDto {
  baseUnit: ResearcherUnitFacet[];
}

// ─── Reader service contract ──────────────────────────────────────────────────

/** Interface that any researchers reader service must implement */
export interface ResearchersReader {
  getPaginatedList(
    page: number,
    limit: number,
    query?: string,
    filters?: ResearchersFiltersRequestDto,
  ): Promise<ResearchersPaginatedListDto>;

  getById(id: string): Promise<ResearcherListItemDto | null>;
  getFilters(): Promise<ResearchersFiltersDto>;
}
