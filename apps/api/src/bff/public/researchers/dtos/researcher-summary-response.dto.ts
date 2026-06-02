export class ResearcherLinkedUnitSummaryDto {
  id!: string;
  name!: string;
}

export type ProfileType = 'UCR' | 'EXTERNAL';

export class ResearcherSummaryResponseDto {
  id!: string;
  idUcrProfile!: string | null;
  baseUnit!: string;
  name!: string;
  firstSurname!: string;
  secondSurname!: string;
  ceaCategory!: string | null;
  institution!: string | null;
  country!: string | null;
  institutions!: { name: string; country: string | null }[];
  orcidId!: string | null;
  linkedin!: string | null;
  researchGate!: string | null;
  scopus!: string | null;
  photoUrl!: string | null;
  profileType!: ProfileType;
  linkedUnits!: ResearcherLinkedUnitSummaryDto[];
  workUnits!: ResearcherLinkedUnitSummaryDto[];
}
