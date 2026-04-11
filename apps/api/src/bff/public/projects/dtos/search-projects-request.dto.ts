import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { PaginatedListRequestDto } from '../../common/dtos/paginated-list-request.dto';

export class SearchProjectsRequestDto extends PaginatedListRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  q!: string;
}
