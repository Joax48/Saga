export class ResearcherLinkedUnitSummaryDto {
  id!: string;
  name!: string;
}

export class ResearcherSummaryResponseDto {
  id!: string;
  idUcrProfile!: string;
  baseUnit!: string;
  name!: string;
  firstSurname!: string;
  secondSurname!: string;
  ceaCategory!: string | null;
  orcidId!: string | null;
  linkedin!: string | null;
  researchGate!: string | null;
  scopus!: string | null;
  photoUrl!: string | null;
  linkedUnits!: ResearcherLinkedUnitSummaryDto[];
}
