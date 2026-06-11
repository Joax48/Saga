import { Injectable, NotFoundException } from '@nestjs/common';
import { ResearchersRepository } from '../../modules/researchers/data/researchers.repository';

@Injectable()
export class DeleteResearcherPhotoUseCase {
  constructor(private readonly repo: ResearchersRepository) {}

  /**
   * Removes the researcher's stored profile photo so the profile falls back to
   * its generated avatar. Validates the researcher exists first to return a
   * proper 404 instead.
   */
  async execute(id: string): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundException(`Researcher with id "${id}" not found`);
    }

    await this.repo.deletePhoto(id);
  }
}
