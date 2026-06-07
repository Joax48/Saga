export class UnitFilterOptionDto {
  label!: string;
  value!: string;
  count!: number;
}

export class UnitFiltersResponseDto {
  researchers!: UnitFilterOptionDto[];
  researchersByBaseUnit!: UnitFilterOptionDto[];
}
