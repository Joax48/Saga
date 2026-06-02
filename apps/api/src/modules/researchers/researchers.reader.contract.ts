// Injection token for the researchers reader service
export const RESEARCHERS_READER = Symbol('RESEARCHERS_READER');

// ─── Response DTOs ────────────────────────────────────────────────────────────

/** Lightweight unit reference used both in lists and full profiles */
export interface ResearcherUnitDto {
  id: string;
  name: string;
}

/** Whether a profile is an internal UCR member or an external co-author */
export type ProfileTypeDto = 'UCR' | 'EXTERNAL';

/** Shape of a single researcher in the list and detail responses */
export interface ResearcherListItemDto {
  id: string;
  idUcrProfile: string | null;
  baseUnit: string;
  name: string;
  firstSurname: string;
  secondSurname: string;
  ceaCategory: string | null;
  institution: string | null;
  country: string | null;
  institutions: { name: string; country: string | null }[];
  orcidId: string | null;
  linkedin: string | null;
  researchGate: string | null;
  scopus: string | null;
  photoUrl: string | null;
  profileType: ProfileTypeDto;
  linkedUnits: ResearcherUnitDto[];
  workUnits: ResearcherUnitDto[];
}

export interface ResearcherInstitutionDto {
  name: string;
  country: string | null;
}

export interface ResearcherInstitutionDto {
  name: string;
  country: string | null;
}

// ─── Profile DTOs (full researcher profile) ───────────────────────────────────

export interface ResearcherAlternativeNameDto {
  name: string;
  firstSurname: string;
  lastSurname: string | null;
}

export interface ResearcherEducationDto {
  degree: string;
  fieldOfStudy: string;
  institution: string;
  country: string | null;
  graduationYear: number | null;
}

export interface ResearcherExperienceDto {
  position: string;
  organization: string;
  startDate: string | null;
  endDate: string | null;
}

export interface ResearcherProjectDto {
  id: string;
  code: string;
  name: string;
  manager: string;
  startDate: string | null;
  endDate: string | null;
  researchType: string | null;
  projectType: string | null;
  status: string | null;
  keywords: string[];
}

export interface ResearcherScientificOutputDto {
  id: string;
  title: string;
  authors: string[];
  type: {
    category: string;
    subcategory: string;
  };
  openAccess: boolean;
  publicationYear: number;
  doi: string | null;
  journal: string | null;
  volume: string | null;
  issue: string | null;
  pages: string | null;
  citationCount: number | null;
  keywords: string[];
}

/** Full researcher profile aggregating basic info, keywords, education, etc. */
export interface ResearcherProfileDto extends ResearcherListItemDto {
  institutions: ResearcherInstitutionDto[];
  alternativeNames: ResearcherAlternativeNameDto[];
  linkedUnits: ResearcherUnitDto[];
  keywords: string[];
  education: ResearcherEducationDto[];
  experience: ResearcherExperienceDto[];
  projects: ResearcherProjectDto[];
  scientificOutputs: ResearcherScientificOutputDto[];
  // Precomputed h-index from UCR_PROFILE_METRIC. Null when the profile has
  // no row there — callers should fall back to computing it from the
  // citation counts on scientificOutputs.
  hIndex: number | null;
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
  profileType?: 'UCR' | 'EXTERNAL';
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
  getProfile(id: string): Promise<ResearcherProfileDto | null>;
  getFilters(
    query?: string,
    filters?: ResearchersFiltersRequestDto,
  ): Promise<ResearchersFiltersDto>;
}
