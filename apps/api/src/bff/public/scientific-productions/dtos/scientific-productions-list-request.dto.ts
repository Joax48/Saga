import { IntersectionType } from '@nestjs/mapped-types';
import { PaginatedListRequestDto } from '../../common/dtos/paginated-list-request.dto';
import { ScientificProductionsFiltersRequestDto } from './scientific-productions-filters-request.dto';
import { ScientificProductionSortDto } from './public-scientific-production-sorting-request.dto';

export class ScientificProductionsListRequestDto extends IntersectionType(
  PaginatedListRequestDto,
  ScientificProductionsFiltersRequestDto,
  ScientificProductionSortDto,
) {}
