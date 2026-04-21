export class ProjectManagerReference {
  id!: number;
  name!: string;
}

export class ProjectSummaryResponseDto {
  id!: number;
  projectManager!: ProjectManagerReference;
  code!: string;
  name!: string;
  keywords!: string[];
  projectType!: string;
  researchType!: string;
  startDate!: string;
  endDate!: string;
}
