import { Transform } from 'class-transformer';
import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';

import { PaginatedListRequestDto } from '../../common/dtos/paginated-list-request.dto';
import { normalizeStringArray } from '../../common/dtos/query-transformers';

export class ResearchersListRequestDto extends PaginatedListRequestDto {
  @IsOptional()
  @Transform(({ value }) => normalizeStringArray(value))
  @IsArray()
  @IsString({ each: true })
  unit?: string[];

  @IsOptional()
  @IsString()
  @IsIn(['UCR', 'EXTERNAL'])
  profileType?: 'UCR' | 'EXTERNAL';

  @IsOptional()
  @Transform(({ value }) => normalizeStringArray(value))
  @IsArray()
  @IsString({ each: true })
  collaborationCountry?: string[];

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
