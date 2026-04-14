import type { DatabaseTableDefinition } from './database-table';

const insertResearcherSql = `
  INSERT INTO Researcher (
    id,
    id_ucr_profile,
    base_unit,
    name,
    first_surname,
    second_surname,
    cea_category,
    orcid_id,
    linkedin,
    research_gate,
    scopus,
    photo_url
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

type ResearcherSeedRow = {
  id: number;
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
};

const researcherRows: ResearcherSeedRow[] = [
  {
    id: 1,
    idUcrProfile: '1',
    baseUnit: 'Escuela de Estadística',
    name: 'Alejandra',
    firstSurname: 'Arias',
    secondSurname: 'Salazar',
    ceaCategory: 'Catedrática',
    orcidId: '0000-0002-1234-5678',
    linkedin: 'https://www.linkedin.com/in/alejandra-arias-salazar',
    researchGate: 'https://www.researchgate.net/profile/Alejandra-Arias-Salazar',
    scopus: 'https://www.scopus.com/authid/detail.uri?authorId=12345678900',
    photoUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    id: 2,
    idUcrProfile: '2',
    baseUnit: 'Escuela de Ciencias de la Comunicación Colectiva',
    name: 'Koen',
    firstSurname: 'Voorend',
    secondSurname: '',
    ceaCategory: 'Profesor asociado',
    orcidId: '0000-0001-2345-6789',
    linkedin: 'https://www.linkedin.com/in/koen-voorend',
    researchGate: 'https://www.researchgate.net/profile/Koen-Voorend',
    scopus: null,
    photoUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id: 3,
    idUcrProfile: '3',
    baseUnit: 'Escuela de Estadística',
    name: 'Shu Wei',
    firstSurname: 'Chou',
    secondSurname: 'Chen',
    ceaCategory: 'Profesor asociado',
    orcidId: '0000-0003-2345-6789',
    linkedin: null,
    researchGate: null,
    scopus: null,
    photoUrl: 'https://randomuser.me/api/portraits/men/12.jpg',
  },
  {
    id: 4,
    idUcrProfile: '4',
    baseUnit: 'Escuela de Ciencias Políticas',
    name: 'Daniel José',
    firstSurname: 'Alvarado',
    secondSurname: 'Abarca',
    ceaCategory: 'Licenciado',
    orcidId: null,
    linkedin: null,
    researchGate: null,
    scopus: null,
    photoUrl: 'https://randomuser.me/api/portraits/men/55.jpg',
  },
  {
    id: 5,
    idUcrProfile: '5',
    baseUnit: 'Escuela de Matemática',
    name: 'Fabio Ariel',
    firstSurname: 'Sánchez',
    secondSurname: 'Peña',
    ceaCategory: 'Catedrático',
    orcidId: '0000-0004-2345-6789',
    linkedin: null,
    researchGate: null,
    scopus: null,
    photoUrl: 'https://randomuser.me/api/portraits/men/65.jpg',
  },
  {
    id: 6,
    idUcrProfile: '6',
    baseUnit: 'Escuela de Matemática',
    name: 'Luis Alberto',
    firstSurname: 'Barboza',
    secondSurname: 'Chinchilla',
    ceaCategory: 'Catedrático',
    orcidId: '0000-0005-2345-6789',
    linkedin: null,
    researchGate: null,
    scopus: null,
    photoUrl: 'https://randomuser.me/api/portraits/men/75.jpg',
  },
  {
    id: 7,
    idUcrProfile: '7',
    baseUnit: 'Escuela de Biología',
    name: 'María Fernanda',
    firstSurname: 'Rojas',
    secondSurname: 'Pérez',
    ceaCategory: 'Profesora asociada',
    orcidId: null,
    linkedin: null,
    researchGate: null,
    scopus: null,
    photoUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
  },
  {
    id: 8,
    idUcrProfile: '8',
    baseUnit: 'Escuela de Ingeniería Eléctrica',
    name: 'Carlos Andrés',
    firstSurname: 'Gómez',
    secondSurname: 'Vargas',
    ceaCategory: 'Profesor asociado',
    orcidId: null,
    linkedin: null,
    researchGate: null,
    scopus: null,
    photoUrl: 'https://randomuser.me/api/portraits/men/81.jpg',
  },
  {
    id: 9,
    idUcrProfile: '9',
    baseUnit: 'Escuela de Química',
    name: 'Laura',
    firstSurname: 'Chaves',
    secondSurname: 'Morales',
    ceaCategory: 'Doctora',
    orcidId: null,
    linkedin: null,
    researchGate: null,
    scopus: null,
    photoUrl: 'https://randomuser.me/api/portraits/women/72.jpg',
  },
  {
    id: 10,
    idUcrProfile: '10',
    baseUnit: 'Escuela de Informática',
    name: 'Andrés Felipe',
    firstSurname: 'Ramírez',
    secondSurname: 'Solano',
    ceaCategory: 'Profesor asociado',
    orcidId: '0000-0006-2345-6789',
    linkedin: 'https://www.linkedin.com/in/andres-ramirez-solano',
    researchGate: 'https://www.researchgate.net/profile/Andres-Ramirez-Solano',
    scopus: null,
    photoUrl: 'https://randomuser.me/api/portraits/men/45.jpg',
  },
  {
    id: 11,
    idUcrProfile: '11',
    baseUnit: 'Escuela de Psicología',
    name: 'Valeria',
    firstSurname: 'Mora',
    secondSurname: 'Jiménez',
    ceaCategory: 'Profesora asociada',
    orcidId: null,
    linkedin: 'https://www.linkedin.com/in/valeria-mora-jimenez',
    researchGate: null,
    scopus: null,
    photoUrl: 'https://randomuser.me/api/portraits/women/50.jpg',
  },
];

export const researcherTable: DatabaseTableDefinition = {
  name: 'Researcher',
  dropSql: 'DROP TABLE IF EXISTS Researcher',
  createSql: `
    CREATE TABLE Researcher (
      id INT,
      id_ucr_profile STRING,
      base_unit STRING,
      name STRING,
      first_surname STRING,
      second_surname STRING,
      cea_category STRING,
      orcid_id STRING,
      linkedin STRING,
      research_gate STRING,
      scopus STRING,
      photo_url STRING
    )
  `,
  seedSql: insertResearcherSql,
  seedRows: researcherRows.map((researcher) => ({
    params: [
      researcher.id,
      researcher.idUcrProfile,
      researcher.baseUnit,
      researcher.name,
      researcher.firstSurname,
      researcher.secondSurname,
      researcher.ceaCategory,
      researcher.orcidId,
      researcher.linkedin,
      researcher.researchGate,
      researcher.scopus,
      researcher.photoUrl,
    ],
  })),
};
