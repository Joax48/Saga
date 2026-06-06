import { IsOptional, IsString } from 'class-validator';

export class HomeSearchRequestDto {
  @IsOptional()
  @IsString()
  q?: string;
}
