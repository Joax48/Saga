export class UnitProjectResponseDto {
  id!: string;
  code!: string;
  name!: string;
  managerName!: string;
  managerId!: number;
  startDate!: string;
  endDate!: string;
  researchType!: string;
  projectType!: string;
  keywords!: string | null;
}
