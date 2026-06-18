import { ResearcherSummaryResponseDto } from './researcher-summary-response.dto';

export class ResearcherAlternativeNameResponseDto {
  name!: string;
  firstSurname!: string;
  secondSurname!: string | null;
}

export class ResearcherEducationResponseDto {
  degree!: string;
  fieldOfStudy!: string;
  institution!: string;
  country!: string | null;
  graduationYear!: number | null;
}

export class ResearcherExperienceResponseDto {
  position!: string;
  organization!: string;
  startDate!: string | null;
  endDate!: string | null;
}

export class ResearcherProjectResponseDto {
  id!: string;
  code!: string;
  name!: string;
  manager!: string;
  startDate!: string | null;
  endDate!: string | null;
  researchType!: string | null;
  projectType!: string | null;
  status!: string | null;
  keywords!: string[];
}

export class ResearcherScientificOutputResponseDto {
  id!: string;
  title!: string;
  authors!: string[];
  type!: { category: string; subcategory: string };
  openAccess!: boolean;
  publicationYear!: number;
  doi!: string | null;
  journal!: string | null;
  volume!: string | null;
  issue!: string | null;
  pages!: string | null;
  keywords!: string[];
}

export class ResearcherProfileResponseDto extends ResearcherSummaryResponseDto {
  alternativeNames!: ResearcherAlternativeNameResponseDto[];
  keywords!: string[];
  education!: ResearcherEducationResponseDto[];
  experience!: ResearcherExperienceResponseDto[];
  projects!: ResearcherProjectResponseDto[];
  scientificOutputs!: ResearcherScientificOutputResponseDto[];
  hIndex!: number | null;
}
