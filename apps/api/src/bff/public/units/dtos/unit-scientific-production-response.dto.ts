export class UnitScientificProductionResponseDto {
  id!: string;
  title!: string;
  authors!: string;
  type!: string;
  publicationYear!: number;
  doi!: string | null;
  journal!: string | null;
  volume!: number | null;
  issue!: number | null;
  pages!: string | null;
  keywords!: string;
}
