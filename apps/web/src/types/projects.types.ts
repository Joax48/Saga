export interface Project {
  id: string;
  code: string;
  title: string;
  description: string;
  manager: string;
  institute: string;
  disciplines: string[];
  researchType: string;
  projectType: string;
  fundingType: string;
  status: string;
  startDate: string;
  endDate: string;
  keywords: string[];
  associatedProfiles: Array<{
    id: string;
    name: string;
    role?: string;
  }>;
}

export interface FilterOption {
  label: string;
  count?: number;
  value: string;
}

export interface ProjectFilters {
  researchType: FilterOption[];
  projectType: FilterOption[];
  startYear: FilterOption[];
  status: FilterOption[];
  participants: FilterOption[];
  keywords: FilterOption[];
}

export interface ProjectQueryFilters {
  researchType?: string[];
  projectType?: string[];
  startYear?: string[];
  status?: string[];
  participants?: string[];
  keywords?: string[];
}

export interface ManagerReferenceApiDto {
  id: number;
  name: string;
}

export interface UnitReferenceApiDto {
  id: number;
  name: string;
}

export interface ProjectAssociatedProfileApiDto {
  id: string;
  name: string;
  role?: string;
}

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

export interface ProjectDetailApiDto {
  id: string;
  code: string;
  title: string;
  description: string;
  manager: ManagerReferenceApiDto;
  unit: UnitReferenceApiDto;
  disciplines: string[];
  researchType: string;
  projectType: string;
  fundingType: string;
  status: string;
  startDate: string;
  endDate: string;
  keywords: string[];
  associatedProfiles: ProjectAssociatedProfileApiDto[];
}

export interface PaginatedListResponseDto<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
