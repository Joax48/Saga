export const PROJECTS_READER = Symbol('PROJECTS_READER');

export type ProjectsSortBy = 'title' | 'year' | 'code';
export type ProjectsSortOrder = 'asc' | 'desc';

export interface ManagerReferenceDto {
  id: number;
  name: string;
  participationStartDate?: string;
  participationEndDate?: string;
}

export interface UnitReferenceDto {
  id: number;
  name: string;
}

export interface ProjectAssociatedProfileDto {
  id: string;
  name: string;
  role?: string;
  participationStartDate?: string;
  participationEndDate?: string;
}

export interface ProjectListItemDto {
  id: number;
  projectManager: ManagerReferenceDto;
  code: string;
  name: string;
  keywords: string[];
  projectType: string;
  researchType: string;
  startDate: string;
  endDate: string;
}

export interface ProjectsFilterOptionDto {
  label: string;
  value: string;
  count: number;
}

export interface ProjectsFiltersDto {
  researchType: ProjectsFilterOptionDto[];
  projectType: ProjectsFilterOptionDto[];
  startYear: ProjectsFilterOptionDto[];
  status: ProjectsFilterOptionDto[];
  participants: ProjectsFilterOptionDto[];
  keywords: ProjectsFilterOptionDto[];
}

export interface ProjectsPaginatedListDto {
  items: ProjectListItemDto[];
  page: number;
  limit: number;
  total: number;
}

export interface ProjectDetailItemDto {
  id: string;
  code: string;
  title: string;
  description: string;
  manager: ManagerReferenceDto;
  unit: UnitReferenceDto;
  disciplines: string[];
  researchType: string;
  projectType: string;
  fundingType: string;
  status: string;
  startDate: string;
  endDate: string;
  keywords: string[];
  associatedProfiles: ProjectAssociatedProfileDto[];
}

export interface ProjectsFiltersRequestDto {
  researchType?: string[];
  projectType?: string[];
  startYear?: string[];
  status?: string[];
  participants?: string[];
  keywords?: string[];
}

export interface ProjectsSortRequestDto {
  sortBy?: ProjectsSortBy;
  sortOrder?: ProjectsSortOrder;
}

export interface ProjectsReader {
  getPaginatedList(
    page: number,
    limit: number,
    query?: string,
    filters?: ProjectsFiltersRequestDto,
    sort?: ProjectsSortRequestDto,
  ): Promise<ProjectsPaginatedListDto>;

  getFilters(
    query?: string,
    filters?: ProjectsFiltersRequestDto,
  ): Promise<ProjectsFiltersDto>;

  getById(id: string): Promise<ProjectDetailItemDto | null>;
}
