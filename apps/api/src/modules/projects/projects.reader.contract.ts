export const PROJECTS_READER = Symbol('PROJECTS_READER');

export interface ProjectManagerReferenceDto {
  id: number;
  name: string;
}

export interface ProjectListItemDto {
  id: number;
  projectManager: ProjectManagerReferenceDto;
  code: string;
  name: string;
  projectType: string;
  researchType: string;
  startDate: string;
  endDate: string;
}

export interface ProjectsPaginatedListDto {
  items: ProjectListItemDto[];
  page: number;
  limit: number;
  total: number;
}

export interface ProjectsReader {
  getPaginatedList(
    page: number,
    limit: number,
    query?: string,
  ): Promise<ProjectsPaginatedListDto>;
}
