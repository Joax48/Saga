// dtos/scientific-productions-facets-request.dto.ts
import { Type, Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

function normalizeQueryArray(value: unknown): string[] | undefined {
  if (value === undefined || value === null) return undefined;
  const rawValues = Array.isArray(value) ? value : [value];
  const normalized = rawValues
    .flatMap((item) => String(item).split(','))
    .map((item) => item.trim())
    .filter(Boolean);
  return normalized.length > 0 ? normalized : undefined;
}

export class ScientificProductionsFiltersRequestDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeQueryArray(value))
  @IsArray()
  @IsString({ each: true })
  type?: string[];

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  openAccess?: boolean;

  @IsOptional()
  @Transform(({ value }) => normalizeQueryArray(value))
  @IsArray()
  @IsString({ each: true })
  year?: string[];

  @IsOptional()
  @Transform(({ value }) => normalizeQueryArray(value))
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];
}
