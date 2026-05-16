import { IntersectionType } from '@nestjs/mapped-types';
import { PaginatedListRequestDto } from '../../common/dtos/paginated-list-request.dto';
import { UnitSearchFiltersDTO } from './unit-search-filters-dto';
import { UnitSearchSortDTO } from './unit-search-sort-dto';

export class UnitSearchDTO extends IntersectionType(
  IntersectionType(PaginatedListRequestDto, UnitSearchFiltersDTO),
  UnitSearchSortDTO,
) {}
