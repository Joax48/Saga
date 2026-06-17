// dtos/scientific-productions-facets-request.dto.ts
import { Type, Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

import { normalizeStringArray } from '../../common/dtos/query-transformers';

export class ScientificProductionsFiltersRequestDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeStringArray(value))
  @IsArray()
  @IsString({ each: true })
  type?: string[];

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  openAccess?: boolean;

  @IsOptional()
  @Transform(({ value }) => normalizeStringArray(value))
  @IsArray()
  @IsString({ each: true })
  year?: string[];

  @IsOptional()
  @Transform(({ value }) => normalizeStringArray(value))
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];
}
