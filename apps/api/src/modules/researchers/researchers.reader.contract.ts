// Researchers Reader Contract — defines the interface for reading researcher data.
export const RESEARCHERS_READER = Symbol('RESEARCHERS_READER');

export interface ResearcherListItemDto {
  id: string;
  idUcrProfile: string;
  baseUnit: string;
  name: string;
  firstSurname: string;
  secondSurname: string;
  ceaCategory: string | null;
  orcidId: string | null;
  linkedin: string | null;
  researchGate: string | null;
  scopus: string | null;
  photoUrl: string | null;
}

export interface ResearchersPaginatedListDto {
  items: ResearcherListItemDto[];
  page: number;
  limit: number;
  total: number;
}

export interface ResearchersReader {
  getPaginatedList(
    page: number,
    limit: number,
    name?: string,
  ): Promise<ResearchersPaginatedListDto>;
}
