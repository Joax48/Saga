import type { Project, ProjectFilters, ProjectQueryFilters } from '@/mocks/projects-data';

export type { Project, ProjectFilters, ProjectQueryFilters };

export interface ProjectSummaryItem {
  id: string;
  code: string;
  title: string;
  manager: string;
  startDate: string;
  endDate: string;
  researchType: string;
  projectType: string;
  keywords: string[];
  associatedProfiles: Array<{
    id: string;
    name: string;
    role?: string;
  }>;
}

export interface PaginatedProjectList {
  data: ProjectSummaryItem[];
  total: number;
  page: number;
  limit: number;
}

export interface ProjectSummaryApiDto {
  id: number;
  projectManager?: {
    id: number;
    name: string;
  };
  code: string;
  name: string;
  keywords: string[];
  projectType: string;
  researchType: string;
  startDate: string;
  endDate: string;
}

export interface PaginatedListResponseDto<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
