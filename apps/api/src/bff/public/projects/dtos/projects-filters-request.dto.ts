import { Transform } from 'class-transformer';
import { IsArray, IsOptional, IsString } from 'class-validator';

import { normalizeStringArray } from '../../common/dtos/query-transformers';

export class ProjectsFiltersRequestDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeStringArray(value))
  @IsArray()
  @IsString({ each: true })
  researchType?: string[];

  @IsOptional()
  @Transform(({ value }) => normalizeStringArray(value))
  @IsArray()
  @IsString({ each: true })
  projectType?: string[];

  @IsOptional()
  @Transform(({ value }) => normalizeStringArray(value))
  @IsArray()
  @IsString({ each: true })
  startYear?: string[];

  @IsOptional()
  @Transform(({ value }) => normalizeStringArray(value))
  @IsArray()
  @IsString({ each: true })
  status?: string[];

  @IsOptional()
  @Transform(({ value }) => normalizeStringArray(value))
  @IsArray()
  @IsString({ each: true })
  participants?: string[];

  @IsOptional()
  @Transform(({ value }) => normalizeStringArray(value))
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];
}
