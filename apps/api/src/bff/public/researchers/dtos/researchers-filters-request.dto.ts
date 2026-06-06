import { Transform } from 'class-transformer';
import { IsArray, IsOptional, IsString } from 'class-validator';

function normalizeQueryArray(value: unknown): string[] | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  const rawValues = Array.isArray(value) ? value : [value];
  const normalizedValues = rawValues
    .flatMap((item) => String(item).split(','))
    .map((item) => item.trim())
    .filter(Boolean);

  return normalizedValues.length > 0 ? normalizedValues : undefined;
}

export class ResearchersFiltersRequestQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeQueryArray(value))
  @IsArray()
  @IsString({ each: true })
  unit?: string[];

  @IsOptional()
  @Transform(({ value }) => normalizeQueryArray(value))
  @IsArray()
  @IsString({ each: true })
  collaborationCountry?: string[];
}
