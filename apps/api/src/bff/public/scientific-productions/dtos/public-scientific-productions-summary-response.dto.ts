import {
  AuthorReference,
  KeywordReference,
} from '../../../../modules/scientific-productions/scientific-productions.reader.contract';

export class ScientificProductioSummaryResponseDto {
  id!: string;
  title!: string;
  authors!: AuthorReference[] | null;
  type!: string | null;
  openAccess!: boolean | null;
  publicationYear!: number;
  doi!: string | null;
  journal!: string | null;
  volume!: string | null;
  issue!: string | null;
  pages!: string | null;
  source!: string | null;
  keywords!: KeywordReference[] | null;
}
