import { NotFoundException } from '@nestjs/common';
import { GetResearcherDetailUseCase } from '../get-public-researcher-detail.use-case';
import type { ResearchersReader } from '../../../modules/researchers/researchers.reader.contract';

describe('GetResearcherDetailUseCase', () => {
  let useCase: GetResearcherDetailUseCase;
  let researchersReader: jest.Mocked<ResearchersReader>;

  beforeEach(() => {
    researchersReader = {
      getById: jest.fn(),
    } as unknown as jest.Mocked<ResearchersReader>;

    useCase = new GetResearcherDetailUseCase(researchersReader);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('maps reader entity to ResearcherSummaryResponseDto when found', async () => {
    const mockResearcher = {
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
      photo: 'https://randomuser.me/api/portraits/men/44.jpg',
      institution: null,
      country: null,
      institutions: [],
      linkedUnits: [],
      workUnits: [],
    };
    researchersReader.getById.mockResolvedValue(mockResearcher);

    const result = await useCase.execute('1');

    expect(researchersReader.getById).toHaveBeenCalledWith('1');
    expect(result).toEqual({
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
      photo: 'https://randomuser.me/api/portraits/men/44.jpg',
      institution: null,
      country: null,
      institutions: [],
      linkedUnits: [],
      workUnits: [],
    });
  });

  test.each([
    ['null', null],
    ['undefined', undefined],
  ])('throws NotFoundException when reader returns %s', async (_label, readerValue) => {
    researchersReader.getById.mockResolvedValue(readerValue as never);

    await expect(
      useCase.execute('missing-id' as unknown as string),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(researchersReader.getById).toHaveBeenCalledWith(
      'missing-id' as unknown as string,
    );
  });

  test.each([
    ['numeric id', 123],
    ['object id', { obj: 'type' }],
  ])('forwards %s and throws NotFoundException when not found', async (_label, id) => {
    researchersReader.getById.mockResolvedValue(null);

    await expect(useCase.execute(id as unknown as string)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(researchersReader.getById).toHaveBeenCalledWith(id as unknown as string);
  });

  it('propagates errors thrown by the reader', async () => {
    researchersReader.getById.mockRejectedValue(new Error('DB error'));

    await expect(useCase.execute('1')).rejects.toThrow('DB error');
  });
});
