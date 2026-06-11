import { NotFoundException } from '@nestjs/common';
import { DeleteResearcherPhotoUseCase } from '../delete-researcher-photo.use-case';
import type { ResearchersRepository } from '../../../modules/researchers/data/researchers.repository';

type RepositoryMock = jest.Mocked<
  Pick<ResearchersRepository, 'findById' | 'deletePhoto'>
>;

describe('DeleteResearcherPhotoUseCase', () => {
  let useCase: DeleteResearcherPhotoUseCase;
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
    orcidId: null,
    linkedin: null,
    researchGate: null,
    scopus: null,
    photoData: null,
    profileType: 'UCR' as const,
  };

  beforeEach(() => {
    repo = {
      findById: jest.fn(),
      deletePhoto: jest.fn(),
    } as unknown as RepositoryMock;

    useCase = new DeleteResearcherPhotoUseCase(repo as unknown as ResearchersRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute — happy path', () => {
    it('should verify the researcher exists then clear the photo', async () => {
      repo.findById.mockResolvedValue(mockResearcher);
      repo.deletePhoto.mockResolvedValue(undefined);

      await useCase.execute('r-001');

      expect(repo.findById).toHaveBeenCalledWith('r-001');
      expect(repo.deletePhoto).toHaveBeenCalledWith('r-001');
      expect(repo.deletePhoto).toHaveBeenCalledTimes(1);
    });
  });

  describe('error handling', () => {
    it('should throw NotFoundException when the researcher does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(useCase.execute('missing-id')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('should include the researcher id in the NotFoundException message', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(useCase.execute('missing-id')).rejects.toThrow(
        'Researcher with id "missing-id" not found',
      );
    });

    it('should not call deletePhoto when the researcher does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(useCase.execute('missing-id')).rejects.toBeInstanceOf(
        NotFoundException,
      );

      expect(repo.deletePhoto).not.toHaveBeenCalled();
    });

    it('should propagate database errors from findById', async () => {
      repo.findById.mockRejectedValue(new Error('DB connection lost'));

      await expect(useCase.execute('r-001')).rejects.toThrow('DB connection lost');
    });

    it('should propagate database errors from deletePhoto', async () => {
      repo.findById.mockResolvedValue(mockResearcher);
      repo.deletePhoto.mockRejectedValue(new Error('Constraint violation'));

      await expect(useCase.execute('r-001')).rejects.toThrow('Constraint violation');
    });
  });
});
