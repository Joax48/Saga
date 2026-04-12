export interface Researcher {
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

export interface PaginatedResearchers {
  data: Researcher[];
  total: number;
  page: number;
  limit: number;
}

export interface ResearcherQueryFilters {
  baseUnit?: string[];
  ceaCategory?: string[];
}
