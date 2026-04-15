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
  position?: string;
  altNames?: string[];
  profileLinks?: { label: string; href: string; icon: any }[];
  education?: { bold: string; rest: string }[];
  keywords?: string[];
  collaborations?: string[];
  publications?: string[];
  projects?: string[];
  otherProductions?: string[];
  biography?: string;
}

export interface PaginatedResearchers {
  data: Researcher[];
  total: number;
  page: number;
  limit: number;
}

export interface FacetOption {
  value: string;
  label: string;
  count: number;
}

export interface ResearcherFilters {
  baseUnit: FacetOption[];
  ceaCategory: FacetOption[];
}

export interface ResearcherQueryFilters {
  baseUnit?: string[];
  ceaCategory?: string[];
}
