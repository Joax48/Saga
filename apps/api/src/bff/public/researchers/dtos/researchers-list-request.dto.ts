import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginatedListRequestDto } from '../../common/dtos/paginated-list-request.dto.ts';

export class ResearchersListRequestDto extends PaginatedListRequestDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;
}
