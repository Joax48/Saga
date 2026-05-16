import { IsArray, IsOptional, IsInt, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class UnitSearchFiltersDTO {
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  researcherIds?: number[];

  constructor(
    researcherIds?: number[],
  ) {
    this.researcherIds = researcherIds?.length ? researcherIds : undefined;
  }

  get isEmpty(): boolean {
    return !this.researcherIds?.length;
  }
}
