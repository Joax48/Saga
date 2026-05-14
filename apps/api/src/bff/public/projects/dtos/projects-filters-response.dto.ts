export class ProjectFilterOptionResponseDto {
  label!: string;
  value!: string;
  count!: number;
}

export class ProjectsFiltersResponseDto {
  researchType!: ProjectFilterOptionResponseDto[];
  projectType!: ProjectFilterOptionResponseDto[];
  startYear!: ProjectFilterOptionResponseDto[];
  status!: ProjectFilterOptionResponseDto[];
  participants!: ProjectFilterOptionResponseDto[];
  keywords!: ProjectFilterOptionResponseDto[];
}
