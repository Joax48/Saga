import { IntersectionType, OmitType } from '@nestjs/mapped-types';

import { PaginatedListRequestDto } from '../../common/dtos/paginated-list-request.dto';
import { ProjectsFiltersRequestDto } from './projects-filters-request.dto';
import { ProjectsSortRequestDto } from './projects-sort-request.dto';

export class ProjectsListRequestDto extends IntersectionType(
  IntersectionType(
    PaginatedListRequestDto,
    OmitType(ProjectsFiltersRequestDto, ['q'] as const),
  ),
  ProjectsSortRequestDto,
) {}
