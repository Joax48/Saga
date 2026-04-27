import { Type, Transform } from 'class-transformer';
import { IsOptional, IsString, IsBoolean, IsInt, IsArray } from 'class-validator';

export class ScientificProductionsFiltersRequestDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  openAccess?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      return value.includes(',') ? value.split(',').map((v) => v.trim()) : [value];
    }
    return [];
  })
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];
}
