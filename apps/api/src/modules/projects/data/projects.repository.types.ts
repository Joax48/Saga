import type {
  ProjectsFilterOptionDto,
  ProjectsFiltersRequestDto,
} from '../projects.reader.contract';

export type PaginatedResult<T> = {
  items: T[];
  total: number;
};

export type ProjectCountRow = {
  totalCount: number;
};

export type ProjectRow = {
  id: number;
  projectManagerId: number;
  projectManagerName: string;
  code: string;
  name: string;
  projectType: string;
  fundingType: string;
  researchType: string;
  status: string;
  startDate: string;
  endDate: string;
};

export type ProjectFilterValueRow = {
  label: string;
  optionValue?: string;
  optionCount: number;
};

export type ProjectDetailRow = {
  id: string;
  projectManagerId: number | null;
  projectManagerName: string | null;
  code: string;
  name: string;
  description: string | null;
  unitId: number | null;
  unitName: string | null;
  projectType: string | null;
  fundingType: string | null;
  researchType: string | null;
  status: string | null;
  startDate: string | null;
  endDate: string | null;
  principalParticipationStartDate: string | null;
  principalParticipationEndDate: string | null;
};

export type ProjectParticipationRow = {
  id: number;
  name: string;
  role: string;
  participationTypeId: number;
  workUnits?: Buffer | string | null;
  participationStartDate: string;
  participationEndDate: string;
  participationStartTs: Date | string | null;
  participationEndTs: Date | string | null;
};

export type ProjectKeywordByProjectRow = {
  projectId: number;
  description: string;
};

export type BuiltPaginatedProjectsWhereClause = {
  clause: string;
  params: Record<string, unknown>;
};

export type BuiltNamedWhereClause = {
  clause: string;
  params: Record<string, unknown>;
};

export type FilterField = keyof ProjectsFiltersRequestDto;

export type BindAccumulator = {
  nextIndex: number;
  params: Record<string, unknown>;
};

export type FilterQueryInput = {
  searchTerm?: string | null;
  filters?: ProjectsFiltersRequestDto;
  excludedFilters?: FilterField[];
};

export type DistinctFilterOptionsMapper = (
  rows: ProjectFilterValueRow[],
) => ProjectsFilterOptionDto[];
