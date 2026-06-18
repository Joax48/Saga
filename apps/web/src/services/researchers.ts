import { request, API_BASE } from './api';

import type { Researcher } from '@/types/researcher-data';
import type { ResearcherProfile } from '@/types/researcher-profile';

import type {
  FacetOption,
  PaginatedResearchers,
  ResearcherFilters,
  ResearcherQueryFilters,
} from '@/types/researcher-data';

export type { PaginatedResearchers, ResearcherFilters, ResearcherQueryFilters };
export type { Researcher } from '@/types/researcher-data';
export type {
  ResearcherProfile,
  ResearcherAlternativeName,
  ResearcherEducation,
  ResearcherExperience,
  ResearcherLinkedUnit,
  ResearcherProject,
  ResearcherScientificOutput,
} from '@/types/researcher-profile';

/**
 * Shape of the researcher returned by the backend API.
 * Matches ResearcherSummaryResponseDto from the BFF.
 */
interface ResearcherSummaryApiDto {
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
  photo: string | null;
  profileType: 'UCR' | 'EXTERNAL';
  linkedUnits: { id: string; name: string }[];
  workUnits: { id: string; name: string }[];
}

/** Generic paginated response shape from the BFF */
interface PaginatedListResponseDto<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}

/** Transforms the API DTO into the UI model */
function mapResearcherSummaryToResearcher(item: ResearcherSummaryApiDto): Researcher {
  return {
    id: item.id,
    idUcrProfile: item.idUcrProfile,
    baseUnit: item.baseUnit,
    name: item.name,
    firstSurname: item.firstSurname,
    secondSurname: item.secondSurname,
    ceaCategory: item.ceaCategory,
    institution: item.institution,
    country: item.country,
    institutions: item.institutions ?? [],
    orcidId: item.orcidId,
    linkedin: item.linkedin,
    researchGate: item.researchGate,
    scopus: item.scopus,
    photo: item.photo,
    profileType: item.profileType,
    linkedUnits: item.linkedUnits ?? [],
    workUnits: item.workUnits ?? [],
  };
}

/** Generic parameters for fetching researchers */
interface GetResearchersParams {
  page?: number;
  limit?: number;
  q?: string;
  filters?: {
    baseUnit?: string[];
    collaborationCountry?: string[];
    profileType?: 'UCR' | 'EXTERNAL';
  };
  sort?: {
    order?: 'asc' | 'desc';
  };
}

/** Fetches a paginated list of researchers with optional search query, filters and sorting */
export function getResearchers({
  page = 1,
  limit = 9,
  q = '',
  filters,
  sort,
}: GetResearchersParams = {}): Promise<PaginatedResearchers> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });

  if (q) params.set('q', q);

  if (filters?.baseUnit?.length) {
    filters.baseUnit.forEach((unit) => params.append('unit', unit));
  }

  if (filters?.profileType) params.set('profileType', filters.profileType);

  if (filters?.collaborationCountry?.length) {
    filters.collaborationCountry.forEach((country) =>
      params.append('collaborationCountry', country),
    );
  }

  if (sort?.order) params.set('sortOrder', sort.order);

  return request<PaginatedListResponseDto<ResearcherSummaryApiDto>>(
    `/researchers?${params.toString()}`,
  ).then((response) => ({
    data: response.items.map(mapResearcherSummaryToResearcher),
    page: response.page,
    limit: response.limit,
    total: response.total,
  }));
}

/**
 * Uploads a profile photo for a researcher.
 * Sends the file as multipart/form-data under the field name "photo".
 * Returns the updated ResearcherProfile after the change is applied.
 */
export async function updateResearcherPhoto(
  id: string,
  file: File,
): Promise<ResearcherProfile> {
  const formData = new FormData();
  formData.append('photo', file);

  const response = await fetch(`${API_BASE}/researchers/${id}/photo`, {
    method: 'PATCH',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Photo upload failed: ${response.status}`);
  }

  return response.json() as Promise<ResearcherProfile>;
}

/**
 * Deletes the currently stored profile photo for a researcher (the one persisted
 * in Dropbox). This is different from clearing a newly selected, not-yet-uploaded
 * file in the UI — it removes the saved photo on the backend so the profile falls
 * back to its generated avatar.
 * Returns the updated ResearcherProfile after the photo is removed.
 */
export function deleteResearcherPhoto(id: string): Promise<ResearcherProfile> {
  return request<ResearcherProfile>(`/researchers/${id}/photo`, {
    method: 'DELETE',
  });
}

/** Updates the profile links for a researcher
 * The links object can contain any subset of the following optional properties:
 * - orcidId: string (URL to ORCID profile)
 * - linkedin: string (URL to LinkedIn profile)
 * - researchGate: string (URL to ResearchGate profile)
 * - scopus: string (URL to Scopus profile)
 * The backend will normalize the ORCID iD and validate the URLs. Only the provided links will be updated; others will remain unchanged.
 * Returns the updated ResearcherProfile after the changes are applied.
 */
export function updateResearcherLinks(
  id: string,
  links: { orcidId?: string; linkedin?: string; researchGate?: string; scopus?: string },
): Promise<ResearcherProfile> {
  return request<ResearcherProfile>(`/researchers/${id}/links`, {
    method: 'PATCH',
    body: JSON.stringify(links),
  });
}

/** Fetches a single researcher by ID */
export function getResearcherById(id: string): Promise<Researcher> {
  return request<ResearcherSummaryApiDto>(`/researchers/${id}`).then(
    mapResearcherSummaryToResearcher,
  );
}

/**
 * Fetches the full researcher profile: basic info + keywords, education,
 * experience, linked units, projects and scientific outputs. Each section is
 * resolved server-side from the corresponding tables in PRODUCCION_CIENTIFICA
 * for the requested researcher only.
 */
export function getResearcherProfile(id: string): Promise<ResearcherProfile> {
  return request<ResearcherProfile>(`/researchers/${id}/profile`);
}

// Generic parameters for fetching researcher facet options (base unit and collaboration country)
interface GetResearcherFacetParams {
  q?: string;
  baseUnit?: string[];
  collaborationCountry?: string[];
}

/**
 * Unit ("Unidad de Pago") facet only — fast and reliable. The collaboration
 * facet is fetched separately (getResearcherCollaborationFacet) because it is
 * slow and must never block this one.
 *
 * The `baseUnit` filter is intentionally still sent: the backend excludes it
 * from the WHERE clause when counting the unit facet, so the other unit options
 * do NOT zero out after the user picks one — they show the count they *would*
 * have if the user switched selection.
 */
export async function getResearcherFilters({
  q = '',
  baseUnit,
  collaborationCountry,
}: GetResearcherFacetParams = {}): Promise<Pick<ResearcherFilters, 'baseUnit'>> {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  baseUnit?.forEach((unit) => params.append('unit', unit));
  collaborationCountry?.forEach((c) => params.append('collaborationCountry', c));
  const qs = params.toString();

  const response = await request<{
    baseUnit: Array<{ value: string; count: number }>;
  }>(`/researchers/filters${qs ? `?${qs}` : ''}`);

  return {
    baseUnit: response.baseUnit.map(({ value, count }) => ({
      value,
      label: value,
      count,
    })),
  };
}

/**
 * Collaboration-country facet — separate (slow) endpoint. Loaded on its own so
 * a slow/failed response never affects the unit filter.
 */
export async function getResearcherCollaborationFacet({
  q = '',
  baseUnit,
  collaborationCountry,
}: GetResearcherFacetParams = {}): Promise<FacetOption[]> {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  baseUnit?.forEach((unit) => params.append('unit', unit));
  collaborationCountry?.forEach((c) => params.append('collaborationCountry', c));
  const qs = params.toString();

  const response = await request<{
    collaborationCountry: Array<{ value: string; count: number }>;
  }>(`/researchers/filters/collaboration${qs ? `?${qs}` : ''}`);

  return (response.collaborationCountry ?? []).map(({ value, count }) => ({
    value,
    label: value,
    count,
  }));
}

/**
 * Collaboration-network countries for a single researcher (with a weight per
 * country), used to render the real collaboration map on the profile page.
 */
export function getResearcherCollaborationCountries(
  id: string,
): Promise<{ country: string; count: number }[]> {
  return request<{ country: string; count: number }[]>(
    `/researchers/${id}/collaboration-countries`,
  );
}
