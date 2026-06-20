export interface ResearcherListLinkedUnit {
  id: string;
  name: string;
}

export type ProfileType = 'UCR' | 'EXTERNAL';

export interface Researcher {
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
  profileType: ProfileType;
  linkedUnits: ResearcherListLinkedUnit[];
  workUnits: ResearcherListLinkedUnit[];
  participationStartDate?: string;
  participationEndDate?: string;
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
  collaborationCountry: FacetOption[];
}

export interface ResearcherQueryFilters {
  baseUnit?: string[];
  profileType?: 'UCR' | 'EXTERNAL';
  collaborationCountry?: string[];
  sortOrder?: 'asc' | 'desc';
}
