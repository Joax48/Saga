import { request } from './api';
import { mapProjectSummaryToProject } from '@/mappers/projects.mappers';
import type { SummaryScientificProduction } from '@/types';
import type {
  PaginatedProjectList,
  ProjectSummaryItem,
  ProjectSummaryApiDto,
} from '@/types/projects.types';
import type { PaginatedResearchers, Researcher } from '@/types/researcher-data';
import type { Unit } from './units';

export interface PaginatedScientificProductions {
  data: SummaryScientificProduction[];
  total: number;
  page: number;
  limit: number;
}

export interface HomeSearchResults {
  query: string;
  projects: PaginatedProjectList;
  researchers: PaginatedResearchers;
  scientificProductions: PaginatedScientificProductions;
  units: { data: Unit[]; total: number; page: number; limit: number };
}

interface PaginatedApiResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}

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
  photoUrl: string | null;
  profileType: 'UCR' | 'EXTERNAL';
  linkedUnits: { id: string; name: string }[];
  workUnits: { id: string; name: string }[];
}

interface ScientificProductionApiDto {
  id: string;
  title: string;
  authors: { id: number; name: string }[] | null;
  type: string | null;
  openAccess: boolean | null;
  publicationYear: number;
  doi: string | null;
  journal: string | null;
  volume: string | null;
  issue: string | null;
  pages: string | null;
  source: string | null;
  keywords: { id: number; value: string }[] | null;
}

interface UnitSummaryApiDto {
  id: number;
  name: string;
  imageUrl: string;
}

interface HomeSearchApiResponse {
  q?: string;
  projects: PaginatedApiResponse<ProjectSummaryApiDto>;
  researchers: PaginatedApiResponse<ResearcherSummaryApiDto>;
  scientificProductions: PaginatedApiResponse<ScientificProductionApiDto>;
  units: PaginatedApiResponse<UnitSummaryApiDto>;
}

function mapScientificProduction(
  item: ScientificProductionApiDto,
): SummaryScientificProduction {
  return {
    id: item.id,
    title: item.title,
    authors: item.authors ?? [],
    type: item.type ?? '',
    open_access: item.openAccess ?? false,
    publication_year: item.publicationYear,
    doi: item.doi ?? '',
    journal: item.journal ?? undefined,
    volume: item.volume != null ? Number(item.volume) : undefined,
    issue: item.issue != null ? Number(item.issue) : undefined,
    pages: item.pages ?? undefined,
    source: item.source ?? '',
    keywords: item.keywords ?? [],
  };
}

function mapResearcher(item: ResearcherSummaryApiDto): Researcher {
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
    photoUrl: item.photoUrl,
    profileType: item.profileType,
    linkedUnits: item.linkedUnits ?? [],
    workUnits: item.workUnits ?? [],
  };
}

function mapProject(item: ProjectSummaryApiDto): ProjectSummaryItem {
  return mapProjectSummaryToProject(item);
}

export async function searchHome(query: string): Promise<HomeSearchResults> {
  const params = new URLSearchParams();
  params.set('q', query.trim());

  const response = await request<HomeSearchApiResponse>(`/home?${params.toString()}`);

  return {
    query: response.q ?? query.trim(),
    projects: {
      data: response.projects.items.map(mapProject),
      page: response.projects.page,
      limit: response.projects.limit,
      total: response.projects.total,
    },
    researchers: {
      data: response.researchers.items.map(mapResearcher),
      page: response.researchers.page,
      limit: response.researchers.limit,
      total: response.researchers.total,
    },
    scientificProductions: {
      data: response.scientificProductions.items.map(mapScientificProduction),
      page: response.scientificProductions.page,
      limit: response.scientificProductions.limit,
      total: response.scientificProductions.total,
    },
    units: {
      data: response.units.items,
      page: response.units.page,
      limit: response.units.limit,
      total: response.units.total,
    },
  };
}
