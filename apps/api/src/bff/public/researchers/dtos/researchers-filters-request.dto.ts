import { Transform } from 'class-transformer';
import { IsArray, IsOptional, IsString } from 'class-validator';

import { normalizeStringArray } from '../../common/dtos/query-transformers';

export class ResearchersFiltersRequestQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeStringArray(value))
  @IsArray()
  @IsString({ each: true })
  unit?: string[];

  @IsOptional()
  @Transform(({ value }) => normalizeStringArray(value))
  @IsArray()
  @IsString({ each: true })
  collaborationCountry?: string[];
}
