import { Injectable, NotFoundException } from '@nestjs/common';
import { ResearchersRepository } from '../../modules/researchers/data/researchers.repository';

@Injectable()
export class UpdateResearcherLinksUseCase {
  constructor(private readonly repo: ResearchersRepository) {}
  // Normalizes ORCID iDs by:
  // - Trimming whitespace
  // - Extracting from URL if needed
  // - Removing non-digit characters
  // - Validating length and formatting as 0000-0000-0000-0000
  private normalizeOrcid(value?: string | null): string | null {
    if (!value) return null;
    let v = value.trim();

    // If it's a URL like https://orcid.org/0000-0000-0000-0000, extract the tail
    const urlMatch = v.match(/orcid\.org\/(.+)$/i);
    if (urlMatch) {
      v = urlMatch[1];
    }

    // Remove any non-digit characters
    const digits = v.replace(/[^0-9]/g, '');
    if (digits.length !== 16) return null;

    // Format as 0000-0000-0000-0000
    return digits.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1-$2-$3-$4');
  }

  // Executes the use case to update a researcher's links.
  async execute(
    id: string,
    links: Partial<{
      orcidId: string | null;
      linkedin: string | null;
      researchGate: string | null;
      scopus: string | null;
    }>,
  ) {
    // Verify the researcher exists before attempting to update links
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundException(`Researcher with id "${id}" not found`);
    }

    // Normalize the ORCID iD if provided, and prepare the update data
    const normalized = { ...links };
    if ('orcidId' in normalized) {
      normalized.orcidId = this.normalizeOrcid(normalized.orcidId ?? null);
    }

    // Update the researcher's links in the repository
    await this.repo.updateLinks(id, normalized);
  }
}
