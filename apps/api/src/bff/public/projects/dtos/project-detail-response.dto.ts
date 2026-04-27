export class ProjectAssociatedProfileResponseDto {
  id!: string;
  name!: string;
  role?: string;
}

export class ManagerReferenceResponseDto {
  id!: number;
  name!: string;
}

export class UnitReferenceResponseDto {
  id!: number;
  name!: string;
}

export class ProjectDetailResponseDto {
  id!: string;
  code!: string;
  title!: string;
  description!: string;
  manager!: ManagerReferenceResponseDto;
  unit!: UnitReferenceResponseDto;
  disciplines!: string[];
  researchType!: string;
  projectType!: string;
  fundingType!: string;
  status!: string;
  startDate!: string;
  endDate!: string;
  keywords!: string[];
  associatedProfiles!: ProjectAssociatedProfileResponseDto[];
}
