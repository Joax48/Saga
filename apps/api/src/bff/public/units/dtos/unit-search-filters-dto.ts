import { IsArray, IsOptional, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';

import { normalizeNumberArray } from '../../common/dtos/query-transformers';

export class UnitSearchFiltersDTO {
  @IsOptional()
  @Transform(({ value }) => normalizeNumberArray(value))
  @IsArray()
  @IsInt({ each: true })
  researcherIds?: number[];

  @IsOptional()
  @Transform(({ value }) => normalizeNumberArray(value))
  @IsArray()
  @IsInt({ each: true })
  researcherBaseUnitIds?: number[];

  get isEmpty(): boolean {
    return !this.researcherIds?.length && !this.researcherBaseUnitIds?.length;
  }
}
