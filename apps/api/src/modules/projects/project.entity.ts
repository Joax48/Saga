export interface NamedExternalReference {
  id: number;
  name: string;
}

export interface ProjectAssociatedProfile {
  id: number;
  name: string;
  role?: string;
}

export interface Project {
  id: number;
  projectManager: NamedExternalReference;
  code: string;
  name: string;
  keywords: string[];
  projectType: string;
  fundingType: string;
  researchType: string;
  status: string;
  startDate: string;
  endDate: string;
}

export interface ProjectDetail extends Project {
  description: string;
  unit: NamedExternalReference;
  disciplines: string[];
  associatedProfiles: ProjectAssociatedProfile[];
}
