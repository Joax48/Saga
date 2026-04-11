export class PaginatedListResponseDto<T> {
  items!: Array<T>;
  page!: number;
  limit!: number;
  total!: number;
}
