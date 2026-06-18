import { IntersectionType } from '@nestjs/mapped-types';

import { PaginatedListRequestDto } from '../../common/dtos/paginated-list-request.dto';
import { ResearchersSearchFiltersDto } from './researchers-search-filters.dto';

export class ResearchersListRequestNestedDto extends IntersectionType(
  PaginatedListRequestDto,
  ResearchersSearchFiltersDto,
) {}
