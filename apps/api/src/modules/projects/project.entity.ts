export interface NamedExternalReference {
  id: number;
  name: string;
}

export interface ProjectAssociatedProfile {
  id: number;
  name: string;
  workUnits: NamedExternalReference[];
  role?: string;
  participationStartDate?: string;
  participationEndDate?: string;
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

export interface ProjectDetail extends Omit<Project, 'id' | 'projectManager'> {
  id: string;
  projectManager: NamedExternalReference & {
    participationStartDate?: string;
    participationEndDate?: string;
  };
  description: string;
  unit: NamedExternalReference;
  disciplines: string[];
  associatedProfiles: ProjectAssociatedProfile[];
}
