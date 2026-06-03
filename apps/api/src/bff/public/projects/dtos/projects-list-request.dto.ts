import { IntersectionType, OmitType } from '@nestjs/mapped-types';

import { PaginatedListRequestDto } from '../../common/dtos/paginated-list-request.dto';
import { ProjectsFiltersRequestDto } from './projects-filters-request.dto';

export class ProjectsListRequestDto extends IntersectionType(
  PaginatedListRequestDto,
  OmitType(ProjectsFiltersRequestDto, ['q'] as const),
) {}
