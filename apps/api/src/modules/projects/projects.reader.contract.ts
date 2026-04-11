export const PROJECTS_READER = Symbol('PROJECTS_READER');

export interface ProjectListItemDto {
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
  getPaginatedList(page: number, limit: number): Promise<ProjectsPaginatedListDto>;
  searchByNameOrCode(
    query: string,
    page: number,
    limit: number,
  ): Promise<ProjectsPaginatedListDto>;
}
