export interface NamedExternalReference {
  id: number;
  name: string;
}

export interface Project {
  id: number;
  projectManager: NamedExternalReference;
  code: string;
  name: string;
  projectType: string;
  fundingType: string;
  researchType: string;
  status: string;
  startDate: string;
  endDate: string;
}
