import { IsOptional, IsString } from 'class-validator';

export class UnitFiltersRequestDto {
  @IsOptional()
  @IsString()
  q?: string;
}
