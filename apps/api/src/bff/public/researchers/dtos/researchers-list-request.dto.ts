import { Transform } from 'class-transformer';
import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';

import { PaginatedListRequestDto } from '../../common/dtos/paginated-list-request.dto';

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

export class ResearchersListRequestDto extends PaginatedListRequestDto {
  @IsOptional()
  @Transform(({ value }) => normalizeQueryArray(value))
  @IsArray()
  @IsString({ each: true })
  unit?: string[];

  @IsOptional()
  @IsString()
  @IsIn(['UCR', 'EXTERNAL'])
  profileType?: 'UCR' | 'EXTERNAL';

  @IsOptional()
  @Transform(({ value }) => normalizeQueryArray(value))
  @IsArray()
  @IsString({ each: true })
  collaborationCountry?: string[];

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
