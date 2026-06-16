import { NotFoundException } from '@nestjs/common';
import { UpdateResearcherLinksUseCase } from '../update-researcher-links.use-case';
import type { ResearchersRepository } from '../../../modules/researchers/data/researchers.repository';

type RepositoryMock = jest.Mocked<
  Pick<ResearchersRepository, 'findById' | 'updateLinks'>
>;

describe('UpdateResearcherLinksUseCase', () => {
  let useCase: UpdateResearcherLinksUseCase;
  let repo: RepositoryMock;

  const mockResearcher = {
    id: 'r-001',
    idUcrProfile: 'UCR001',
    baseUnit: 'CIMPA',
    name: 'Ana',
    firstSurname: 'Pérez',
    secondSurname: 'Mora',
    ceaCategory: null,
    institution: null,
    country: null,
    orcidId: '0000-0001-2345-6789',
    linkedin: null,
    researchGate: null,
    scopus: null,
    photoData: null,
    profileType: 'UCR' as const,
  };

  beforeEach(() => {
    repo = {
      findById: jest.fn(),
      updateLinks: jest.fn(),
    } as unknown as RepositoryMock;

    useCase = new UpdateResearcherLinksUseCase(repo as unknown as ResearchersRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute — happy path', () => {
    it('should verify researcher exists then call updateLinks', async () => {
      repo.findById.mockResolvedValue(mockResearcher);
      repo.updateLinks.mockResolvedValue(undefined);

      await useCase.execute('r-001', { linkedin: 'https://linkedin.com/in/ana' });

      expect(repo.findById).toHaveBeenCalledWith('r-001');
      expect(repo.findById).toHaveBeenCalledTimes(1);
      expect(repo.updateLinks).toHaveBeenCalledTimes(1);
    });

    it('should pass only the provided fields to updateLinks — not touch fields that were not sent', async () => {
      repo.findById.mockResolvedValue(mockResearcher);
      repo.updateLinks.mockResolvedValue(undefined);

      await useCase.execute('r-001', { linkedin: 'https://linkedin.com/in/ana' });

      const [, updatePayload] = repo.updateLinks.mock.calls[0];
      expect(updatePayload).not.toHaveProperty('orcidId');
      expect(updatePayload).not.toHaveProperty('researchGate');
      expect(updatePayload).not.toHaveProperty('scopus');
      expect(updatePayload).toEqual({ linkedin: 'https://linkedin.com/in/ana' });
    });

    it('should strip undefined own-properties injected by class-transformer on absent DTO fields', async () => {
      repo.findById.mockResolvedValue(mockResearcher);
      repo.updateLinks.mockResolvedValue(undefined);

      const dtoWithUndefinedProps = {
        orcidId: undefined,
        linkedin: 'https://linkedin.com/in/ana',
        researchGate: undefined,
        scopus: undefined,
      };

      await useCase.execute('r-001', dtoWithUndefinedProps);

      const [, updatePayload] = repo.updateLinks.mock.calls[0];
      expect(updatePayload).not.toHaveProperty('orcidId');
      expect(updatePayload).not.toHaveProperty('researchGate');
      expect(updatePayload).not.toHaveProperty('scopus');
      expect(updatePayload).toEqual({ linkedin: 'https://linkedin.com/in/ana' });
    });

    it('should pass linkedin, researchGate and scopus through without transformation', async () => {
      repo.findById.mockResolvedValue(mockResearcher);
      repo.updateLinks.mockResolvedValue(undefined);
      const links = {
        linkedin: 'https://linkedin.com/in/ana',
        researchGate: 'https://researchgate.net/profile/Ana',
        scopus: 'https://scopus.com/authid/detail.uri?authorId=12345',
      };

      await useCase.execute('r-001', links);

      expect(repo.updateLinks).toHaveBeenCalledWith('r-001', links);
    });
  });

  describe('execute — ORCID normalization', () => {
    it('should extract the bare iD from a full orcid.org URL', async () => {
      repo.findById.mockResolvedValue(mockResearcher);
      repo.updateLinks.mockResolvedValue(undefined);

      await useCase.execute('r-001', {
        orcidId: 'https://orcid.org/0000-0001-2345-6789',
      });

      const [, updatePayload] = repo.updateLinks.mock.calls[0];
      expect(updatePayload.orcidId).toBe('0000-0001-2345-6789');
    });

    it('should accept a bare iD without URL prefix', async () => {
      repo.findById.mockResolvedValue(mockResearcher);
      repo.updateLinks.mockResolvedValue(undefined);

      await useCase.execute('r-001', { orcidId: '0000-0001-2345-6789' });

      const [, updatePayload] = repo.updateLinks.mock.calls[0];
      expect(updatePayload.orcidId).toBe('0000-0001-2345-6789');
    });

    it('should normalize ORCID with uppercase X checksum digit', async () => {
      repo.findById.mockResolvedValue(mockResearcher);
      repo.updateLinks.mockResolvedValue(undefined);

      await useCase.execute('r-001', { orcidId: '0000-0001-5000-282X' });

      const [, updatePayload] = repo.updateLinks.mock.calls[0];
      expect(updatePayload.orcidId).toBe('0000-0001-5000-282X');
    });

    it('should normalize ORCID URL with lowercase x checksum digit', async () => {
      repo.findById.mockResolvedValue(mockResearcher);
      repo.updateLinks.mockResolvedValue(undefined);

      await useCase.execute('r-001', {
        orcidId: 'https://orcid.org/0000-0001-5000-282x',
      });

      const [, updatePayload] = repo.updateLinks.mock.calls[0];
      expect(updatePayload.orcidId).toBe('0000-0001-5000-282X');
    });

    it('should set orcidId to null when an empty string is sent (clear operation)', async () => {
      repo.findById.mockResolvedValue(mockResearcher);
      repo.updateLinks.mockResolvedValue(undefined);

      await useCase.execute('r-001', { orcidId: '' });

      const [, updatePayload] = repo.updateLinks.mock.calls[0];
      expect(updatePayload.orcidId).toBeNull();
    });

    it('should set orcidId to null when null is sent explicitly', async () => {
      repo.findById.mockResolvedValue(mockResearcher);
      repo.updateLinks.mockResolvedValue(undefined);

      await useCase.execute('r-001', { orcidId: null });

      const [, updatePayload] = repo.updateLinks.mock.calls[0];
      expect(updatePayload.orcidId).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should throw NotFoundException when the researcher does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(
        useCase.execute('missing-id', { linkedin: 'https://linkedin.com/in/x' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should include the researcher id in the NotFoundException message', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(useCase.execute('missing-id', {})).rejects.toThrow(
        'Researcher with id "missing-id" not found',
      );
    });

    it('should not call updateLinks when the researcher does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(
        useCase.execute('missing-id', { linkedin: 'https://linkedin.com/in/x' }),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(repo.updateLinks).not.toHaveBeenCalled();
    });

    it('should propagate database errors from findById', async () => {
      repo.findById.mockRejectedValue(new Error('DB connection lost'));

      await expect(useCase.execute('r-001', {})).rejects.toThrow('DB connection lost');
    });

    it('should propagate database errors from updateLinks', async () => {
      repo.findById.mockResolvedValue(mockResearcher);
      repo.updateLinks.mockRejectedValue(new Error('Constraint violation'));

      await expect(
        useCase.execute('r-001', { linkedin: 'https://linkedin.com/in/x' }),
      ).rejects.toThrow('Constraint violation');
    });
  });
});
