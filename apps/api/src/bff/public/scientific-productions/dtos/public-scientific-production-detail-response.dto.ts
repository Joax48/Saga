// dtos/scientific-production-detail-response.dto.ts
import {
  AuthorReference,
  KeywordReference,
  UnitReference,
  AffiliationReference,
} from '../../../../modules/scientific-productions/scientific-productions.reader.contract';

export class ScientificProductionDetailResponseDto {
  id!: string;
  title!: string;
  ucrAuthors!: AuthorReference[] | null;
  externalAuthors!: AuthorReference[] | null;
  unit!: UnitReference[] | null;
  affiliations!: AffiliationReference[] | null;
  type!: string | null;
  openAccess!: boolean | null;
  publicationYear!: number;
  abstract!: string | null;
  doi!: string | null;
  journal!: string | null;
  volume!: string | null;
  issue!: string | null;
  pages!: string | null;
  citationCount!: number | null;
  source!: string | null;
  keywords!: KeywordReference[] | null;
}
