export interface ResearcherAlternativeName {
  name: string;
  firstSurname: string;
  lastSurname: string | null;
}

export interface ResearcherEducation {
  degree: string;
  fieldOfStudy: string;
  institution: string;
  country: string | null;
  graduationYear: number | null;
}

export interface ResearcherExperience {
  position: string;
  organization: string;
  startDate: string | null;
  endDate: string | null;
}

export interface ResearcherLinkedUnit {
  id: string;
  name: string;
}

export interface ResearcherProject {
  id: string;
  code: string;
  name: string;
  manager: string;
  startDate: string | null;
  endDate: string | null;
  researchType: string | null;
  projectType: string | null;
  status: string | null;
  keywords: string[];
}

export interface ResearcherScientificOutput {
  id: string;
  title: string;
  authors: string[];
  type: {
    category: string;
    subcategory: string;
  };
  openAccess: boolean;
  publicationYear: number;
  doi: string | null;
  journal: string | null;
  volume: string | null;
  issue: string | null;
  pages: string | null;
  citationCount: number | null;
  keywords: string[];
}

export type ProfileType = 'UCR' | 'EXTERNAL';

export interface ResearcherProfile {
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
  profileType: ProfileType;
  alternativeNames: ResearcherAlternativeName[];
  linkedUnits: ResearcherLinkedUnit[];
  keywords: string[];
  education: ResearcherEducation[];
  experience: ResearcherExperience[];
  projects: ResearcherProject[];
  scientificOutputs: ResearcherScientificOutput[];
  hIndex: number | null;
}
