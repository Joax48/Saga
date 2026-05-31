import { NotFoundException } from '@nestjs/common';
import { GetResearcherProfileUseCase } from '../get-public-researcher-profile.use-case';
import type { ResearchersReader } from '../../../modules/researchers/researchers.reader.contract';

describe('GetResearcherProfileUseCase', () => {
  let useCase: GetResearcherProfileUseCase;
  let researchersReader: jest.Mocked<ResearchersReader>;

  beforeEach(() => {
    researchersReader = {
      getProfile: jest.fn(),
    } as unknown as jest.Mocked<ResearchersReader>;

    useCase = new GetResearcherProfileUseCase(researchersReader);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return complete researcher profile when found', async () => {
      const mockProfile = {
        id: '1',
        idUcrProfile: 'UCR001',
        profileType: 'UCR' as const,
        baseUnit: 'CIMPA',
        name: 'Juan',
        firstSurname: 'Perez',
        secondSurname: 'Mora',
        ceaCategory: 'Catedrático',
        orcidId: '0000-0001-2345-6789',
        linkedin: 'https://www.linkedin.com/in/juan-perez-mora',
        researchGate: 'https://www.researchgate.net/profile/Juan-Perez-Mora',
        scopus: 'https://www.scopus.com/authid/detail.uri?authorId=12345678900',
        photoUrl: 'https://randomuser.me/api/portraits/men/44.jpg',
        linkedUnits: [
          { id: '1', name: 'CIMPA' },
          { id: '2', name: 'CIGEFI' },
        ],
        alternativeNames: [
          { name: 'Juan C.', firstSurname: 'Pérez', lastSurname: 'Mora' },
          { name: 'J.C.', firstSurname: 'Perez', lastSurname: null },
        ],
        keywords: ['machine-learning', 'artificial-intelligence', 'data-science'],
        education: [
          {
            degree: 'PhD',
            fieldOfStudy: 'Computer Science',
            institution: 'University of Costa Rica',
            country: 'Costa Rica',
            graduationYear: 2015,
          },
          {
            degree: 'MSc',
            fieldOfStudy: 'Mathematics',
            institution: 'University of Costa Rica',
            country: 'Costa Rica',
            graduationYear: 2010,
          },
        ],
        experience: [
          {
            position: 'Full Professor',
            organization: 'University of Costa Rica',
            startDate: '2016-01-01T00:00:00.000Z',
            endDate: null,
          },
          {
            position: 'Postdoctoral Researcher',
            organization: 'MIT',
            startDate: '2015-08-01T00:00:00.000Z',
            endDate: '2015-12-31T00:00:00.000Z',
          },
        ],
        projects: [
          {
            id: '1',
            code: 'PR-001',
            name: 'Research Project 1',
            manager: 'Dr. Garcia',
            startDate: '2020-01-01T00:00:00.000Z',
            endDate: '2023-12-31T00:00:00.000Z',
            researchType: 'Fundamental',
            projectType: 'International',
            status: 'Completed',
            keywords: ['AI', 'ML'],
          },
        ],
        scientificOutputs: [
          {
            id: '1',
            title: 'A Study on Machine Learning',
            authors: ['Juan Perez', 'Maria Garcia', 'Carlos Lopez'],
            type: {
              category: 'Artículo en revista',
              subcategory: 'Revista indexada',
            },
            openAccess: true,
            publicationYear: 2022,
            doi: '10.1000/xyz123',
            journal: 'Nature Machine Intelligence',
            volume: '5',
            issue: '2',
            pages: '123-145',
            keywords: ['machine-learning', 'neural-networks'],
          },
        ],
      };

      researchersReader.getProfile.mockResolvedValue(mockProfile);

      const result = await useCase.execute('1');

      expect(researchersReader.getProfile).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockProfile);
    });

    it('should include all sections of the profile', async () => {
      const mockProfile = {
        id: '1',
        idUcrProfile: 'UCR001',
        profileType: 'UCR' as const,
        baseUnit: 'CIMPA',
        name: 'Ana',
        firstSurname: 'Lopez',
        secondSurname: 'Vargas',
        ceaCategory: 'Investigador Asociado',
        orcidId: '0000-0002-9876-5432',
        linkedin: null,
        researchGate: null,
        scopus: null,
        photoUrl: null,
        linkedUnits: [],
        alternativeNames: [],
        keywords: [],
        education: [],
        experience: [],
        projects: [],
        scientificOutputs: [],
      };

      researchersReader.getProfile.mockResolvedValue(mockProfile);

      const result = await useCase.execute('1');

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('alternativeNames');
      expect(result).toHaveProperty('keywords');
      expect(result).toHaveProperty('education');
      expect(result).toHaveProperty('experience');
      expect(result).toHaveProperty('projects');
      expect(result).toHaveProperty('scientificOutputs');
    });

    it('should handle multiple linked units', async () => {
      const mockProfile = {
        id: '1',
        idUcrProfile: 'UCR001',
        profileType: 'UCR' as const,
        baseUnit: 'CIMPA',
        name: 'Carlos',
        firstSurname: 'Solano',
        secondSurname: 'Quesada',
        ceaCategory: null,
        orcidId: null,
        linkedin: null,
        researchGate: null,
        scopus: null,
        photoUrl: null,
        linkedUnits: [
          { id: '1', name: 'CIMPA' },
          { id: '2', name: 'CIGEFI' },
          { id: '3', name: 'CIBCM' },
        ],
        alternativeNames: [],
        keywords: [],
        education: [],
        experience: [],
        projects: [],
        scientificOutputs: [],
      };

      researchersReader.getProfile.mockResolvedValue(mockProfile);

      const result = await useCase.execute('1');

      expect(result.linkedUnits).toHaveLength(3);
      expect(result.linkedUnits[0].name).toBe('CIMPA');
      expect(result.linkedUnits[1].name).toBe('CIGEFI');
      expect(result.linkedUnits[2].name).toBe('CIBCM');
    });

    it('should handle researcher with no education records', async () => {
      const mockProfile = {
        id: '1',
        idUcrProfile: 'UCR001',
        profileType: 'UCR' as const,
        baseUnit: 'CIMPA',
        name: 'Diego',
        firstSurname: 'Martinez',
        secondSurname: 'Romero',
        ceaCategory: null,
        orcidId: null,
        linkedin: null,
        researchGate: null,
        scopus: null,
        photoUrl: null,
        linkedUnits: [],
        alternativeNames: [],
        keywords: [],
        education: [],
        experience: [],
        projects: [],
        scientificOutputs: [],
      };

      researchersReader.getProfile.mockResolvedValue(mockProfile);

      const result = await useCase.execute('1');

      expect(result.education).toEqual([]);
    });
  });

  describe('error handling', () => {
    test.each([
      ['null', null],
      ['undefined', undefined],
    ])(
      'throws NotFoundException when profile returns %s',
      async (_label, profileValue) => {
        researchersReader.getProfile.mockResolvedValue(profileValue as never);

        await expect(useCase.execute('missing-id')).rejects.toBeInstanceOf(
          NotFoundException,
        );
        expect(researchersReader.getProfile).toHaveBeenCalledWith('missing-id');
      },
    );

    it('throws NotFoundException with appropriate message', async () => {
      researchersReader.getProfile.mockResolvedValue(null);

      await expect(useCase.execute('nonexistent-id')).rejects.toThrow(
        'Researcher with id "nonexistent-id" not found',
      );
    });

    it('propagates errors thrown by the reader', async () => {
      researchersReader.getProfile.mockRejectedValue(
        new Error('Database connection lost'),
      );

      await expect(useCase.execute('1')).rejects.toThrow('Database connection lost');
    });

    it('propagates query timeout errors', async () => {
      researchersReader.getProfile.mockRejectedValue(new Error('Query timeout'));

      await expect(useCase.execute('1')).rejects.toThrow('Query timeout');
    });
  });
});
