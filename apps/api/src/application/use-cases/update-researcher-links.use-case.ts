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

    // Remove any non-alphanumeric characters except X (ORCID checksum digit)
    const digits = v.replace(/[^0-9X]/gi, '').toUpperCase();
    if (digits.length !== 16) return null;

    // Format as 0000-0000-0000-000X (last char may be X per the ORCID spec)
    return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8, 12)}-${digits.slice(12, 16)}`;
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

    // Strip undefined values: class-transformer sets optional DTO fields not present in the
    // request body as undefined own-properties, which would otherwise be treated as explicit
    // nulls and wipe values that were never sent.
    const normalized = Object.fromEntries(
      Object.entries({ ...links }).filter(([, v]) => v !== undefined),
    ) as Partial<typeof links>;

    if ('orcidId' in normalized) {
      normalized.orcidId = this.normalizeOrcid(normalized.orcidId ?? null);
    }

    // Update the researcher's links in the repository
    await this.repo.updateLinks(id, normalized);
  }
}
