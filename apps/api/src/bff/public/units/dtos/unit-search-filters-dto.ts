import { IsArray, IsOptional, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';

function normalizeToNumberArray(value: unknown): number[] | undefined {
  if (value === undefined || value === null) return undefined;
  const arr = Array.isArray(value) ? value : [value];
  const numbers = arr
    .map((v) => Number(v))
    .filter((n) => !isNaN(n) && Number.isInteger(n) && n > 0);
  return numbers.length > 0 ? numbers : undefined;
}

export class UnitSearchFiltersDTO {
  @IsOptional()
  @Transform(({ value }) => normalizeToNumberArray(value))
  @IsArray()
  @IsInt({ each: true })
  researcherIds?: number[];

  get isEmpty(): boolean {
    return !this.researcherIds?.length;
  }
}
