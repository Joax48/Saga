import { IsOptional, IsString, MaxLength, ValidateIf, Matches } from 'class-validator';

export class UpdateResearcherLinksDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @ValidateIf((o) => o.orcidId !== '')
  @Matches(/^https?:\/\/(?:www\.)?orcid\.org\/\d{4}-\d{4}-\d{4}-\d{3}[\dX]\/?$/i, {
    message: 'orcidId must be an ORCID URL like https://orcid.org/0000-0000-0000-0000',
  })
  orcidId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @ValidateIf((o) => o.linkedin !== '')
  @Matches(/^https?:\/\/(?:www\.)?linkedin\.com\/.*$/i, {
    message: 'linkedin must be a LinkedIn URL (https://linkedin.com/...) or empty',
  })
  linkedin?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @ValidateIf((o) => o.researchGate !== '')
  @Matches(/^https?:\/\/(?:www\.)?researchgate\.net\/.*$/i, {
    message:
      'researchGate must be a ResearchGate URL (https://researchgate.net/...) or empty',
  })
  researchGate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @ValidateIf((o) => o.scopus !== '')
  @Matches(/^https?:\/\/(?:www\.)?scopus\.com\/.*$/i, {
    message: 'scopus must be a Scopus URL (https://scopus.com/...) or empty',
  })
  scopus?: string;
}
