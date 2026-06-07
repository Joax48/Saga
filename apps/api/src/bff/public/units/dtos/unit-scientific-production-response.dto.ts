class AuthorDto {
  id!: number;
  name!: string;
}

class KeywordDto {
  id!: number;
  value!: string;
}

export class UnitScientificProductionResponseDto {
  id!: string;
  title!: string;
  authors!: AuthorDto[] | null;
  type!: string | null;
  openAccess!: number | null;
  publicationYear!: number;
  doi!: string | null;
  journal!: string | null;
  pages!: string | null;
  source!: string | null;
  keywords!: KeywordDto[] | null;
}
