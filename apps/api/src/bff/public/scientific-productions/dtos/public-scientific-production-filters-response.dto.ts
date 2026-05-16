// dtos/scientific-productions-facets-response.dto.ts
class FilterOptionDto {
  value!: string;
  label!: string;
  count!: number;
}

export class ScientificProductionsFiltersResponseDto {
  types?: FilterOptionDto[];
  years?: FilterOptionDto[];
  keywords?: FilterOptionDto[];
  openAccessCount?: number;
}
