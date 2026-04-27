import type { DatabaseTableDefinition } from './database-table';

const insertUnitSql = `
  INSERT INTO Unit (
    id,
    is_part_of,
    name,
    description,
    email,
    page_url,
    image_url,
    phone_number
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`;

type UnitSeedRow = {
  id: number;
  isPartOf: number | null;
  name: string;
  description: string;
  email: string;
  pageUrl: string;
  imageUrl: string;
  phoneNumber: string;
};

const unitRows: UnitSeedRow[] = [
  {
    id: 1,
    isPartOf: null,
    name: 'Centro de Investigación en Biodiversidad y Ecología Tropical',
    description:
      'El Centro de Investigación en Biodiversidad y Ecología Tropical (CIBET) fue creado en febrero del 2020 y es una unidad de investigación científica multi-e interdisciplinaria, adscrita a la Vicerrectoría de Investigación de la Universidad de Costa Rica. Se dedica a la investigación, formación de profesionales y a la acción social en diversos temas relacionados con la biodiversidad y ecología tropical, así como la custodia y el manejo de las colecciones científicas del Museo de Zoología (MZUCR) y del Herbario Luis Fournier Origgi (USJ) de la Universidad de Costa Rica.',
    email: 'cibet@ucr.ac.cr',
    pageUrl: 'https://cibet.ucr.ac.cr',
    imageUrl: 'cibet.jpg',
    phoneNumber: '+506 2511-4183',
  },
  {
    id: 2,
    isPartOf: null,
    name: 'Centro de Investigación en Biología Celular y Molecular',
    description:
      'Somos un Centro de Investigación básica y aplicada, integrado por grupos multi- e interdisciplinarios que aplican herramientas de la biología celular y molecular para enfrentar retos científicos y de desarrollo',
    email: 'cibcm@ucr.ac.cr',
    pageUrl: 'https://cibcm.ucr.ac.cr',
    imageUrl: 'cibcm.jpg',
    phoneNumber: '+506 2511-2275',
  },
  {
    id: 3,
    isPartOf: null,
    name: 'Centro de Investigación en Ciencia e Ingeniería de Materiales',
    description:
      'El Centro de Investigación en Ciencia e Ingeniería de Materiales - CICIMA es pionero del desarrollo de nuevos materiales y nanotecnología en Costa Rica. Es una unidad de investigación científica y tecnológica de carácter multi e interdisciplinario dedicada al estudio de las propiedades físicas y químicas de los materiales, para su desarrollo y adaptación en procesos industriales.',
    email: 'cicima@ucr.ac.cr',
    pageUrl: 'https://cicima.ucr.ac.cr',
    imageUrl: 'cicima.jpg',
    phoneNumber: '+506 2511-5003',
  },
  {
    id: 4,
    isPartOf: null,
    name: 'Centro de Investigación en Ciencias del Mar y Limnología',
    description:
      'El Centro de Investigación en Ciencias del Mar y Limnología (CIMAR) de la Universidad de Costa Rica, desarrolla investigación científica para generar y difundir nuevo conocimiento en las ciencias marinas y de aguas continentales, que contribuya a la conservación, el aprovechamiento sustentable y la toma de decisiones sobre los recursos acuáticos, mediante un enfoque ecosistémico y de gestión integrada, que se proyecte por medio de la divulgación, la acción social y la docencia, a escala nacional, regional y global.',
    email: 'cimar@ucr.ac.cr',
    pageUrl: 'https://cimar.ucr.ac.cr',
    imageUrl: 'cimar.jpg',
    phoneNumber: '+506 2511-2200',
  },
  {
    id: 5,
    isPartOf: null,
    name: 'Centro de Investigación en Ciencias del Movimiento Humano',
    description:
      'El Centro de Investigación en Ciencias del Movimiento Humano (CIMOHU), busca planear, desarrollar, ejecutar y difundir proyectos de investigación que ayuden a resolver problemas relevantes relacionado con tres áreas de las ciencias del movimiento humano: Pedagogía del movimiento, rendimiento deportivo y ejercicio, bienestar y salud. El CIMOHU busca desarrollar conocimiento sobre el movimiento humano y la recreación a la luz del contexto nacional, para ofrecer políticas y lineamientos definidos para el campo de acción; demostrar el efecto del ejercicio físico, el deporte y el movimiento humano, en los procesos educativos, en el desarrollo motor y en aspectos afectivos de las personas.',
    email: 'digital.vi@ucr.ac.cr',
    pageUrl: 'https://vinv.ucr.ac.cr',
    imageUrl: 'cimohu.jpg',
    phoneNumber: '+506 2511-1350',
  },
  {
    id: 6,
    isPartOf: null,
    name: 'Centro de Investigación en Ciencias Geológicas',
    description:
      'El Centro de Investigaciones en Ciencias Geológicas (CICG) es una unidad de investigación científica de carácter multidisciplinario, dedicada al estudio de los procesos geológicos que han dado origen al planeta y lo continúan modificando. Esto con el propósito de brindar a la sociedad los insumos necesarios para una gestión adecuada de los recursos geológicos, del territorio y del riesgo.',
    email: 'digital.vi@ucr.ac.cr',
    pageUrl: 'https://vinv.ucr.ac.cr',
    imageUrl: 'cicg.jpg',
    phoneNumber: '+506 2511-1350',
  },
  {
    id: 7,
    isPartOf: null,
    name: 'Centro de Investigación en Desarrollo Sostenible',
    description:
      'El Centro de Investigación y Estudios para el Desarrollo Sostenible (CIEDES) es una unidad de carácter multidisciplinario, dedicada a la investigación y estudio de la estructura, los procesos y los resultados de la interacción entre las sociedades y el medio ambiente, con el propósito de determinar mecanismos justos que permitan el desarrollo integral del ser humano, propiciando a la vez la recuperación o conservación de los ecosistemas y geosistemas naturales, bajo una perspectiva de coexistencia de largo plazo.',
    email: 'digital.vi@ucr.ac.cr',
    pageUrl: 'https://vinv.ucr.ac.cr',
    imageUrl: 'ciedes.jpg',
    phoneNumber: '+506 2511-1350',
  },
  {
    id: 8,
    isPartOf: null,
    name: 'Centro de Investigación en Tecnología de Alimentos',
    description:
      'Ofrece soluciones y herramientas útiles para elevar los niveles de competitividad del sector agroalimentario nacional y regional por medio de la investigación, la docencia y la transferencia en ciencia y tecnología de alimentos. Brinda servicios en gestión de calidad en la industria alimenticia, servicios analíticos y de mercadeo y desarrolla el Programa de Desarrollo Agroindustrial Rural y Pequeña Empresa (PYMES-DAIR)',
    email: 'digital.vi@ucr.ac.cr',
    pageUrl: 'https://vinv.ucr.ac.cr',
    imageUrl: 'cita.jpg',
    phoneNumber: '+506 2511-1350',
  },
  {
    id: 9,
    isPartOf: null,
    name: 'Escuela de Ciencias de la Computación',
    description:
      'Innovación en inteligencia artificial, aprendizaje automático, ingeniería de software y ciberseguridad. Nuestro departamento está en la vanguardia del desarrollo de sistemas inteligentes y soluciones de computación segura. Realizamos investigación que abarca desde el desarrollo de algoritmos fundamentales hasta aplicaciones prácticas en escenarios del mundo real. Nuestro personal académico y estudiantes trabajan en proyectos que expanden los límites de la ciencia computacional.',
    email: 'cs@ucr.ac.cr',
    pageUrl: 'https://ecci.ucr.ac.cr',
    imageUrl: 'ecci.jpg',
    phoneNumber: '+506 2511-8000',
  },
  {
    id: 10,
    isPartOf: null,
    name: 'Escuela de Estadística',
    description:
      'Formar profesionales en la ciencia de la Estadística con un alto nivel académico y ético para el ejercicio de su profesión, además de contribuir con la formación estadística en otras disciplinas mediante acciones integradas en la docencia, la investigación científica y la acción social, para coadyuvar en los procesos de toma de decisiones y el mejoramiento de la calidad de vida de la sociedad.',
    email: 'estadistica@ucr.ac.cr',
    pageUrl: 'https://estadistica.ucr.ac.cr',
    imageUrl: 'estadistica.jpg',
    phoneNumber: '+506 2511-6500',
  },
  {
    id: 11,
    isPartOf: null,
    name: 'Escuela de Ingeniería Eléctrica',
    description:
      'a Ingeniería Eléctrica es una ciencia aplicada basada en las matemáticas y la física, y por tanto requiere de una sólida formación en estas áreas, que se complementan con técnicas de análisis de sistemas eléctricos, electrónicos y computacionales. Con estos conocimientos se logra la oportuna utilización de la teoría dentro de las miles de aplicaciones que la Ingeniería Eléctrica moderna ofrece a la sociedad.',
    email: 'eie@ucr.ac.cr',
    pageUrl: 'https://eie.ucr.ac.cr',
    imageUrl: 'eie.jpg',
    phoneNumber: '+506 2511-2600',
  },
  {
    id: 12,
    isPartOf: null,
    name: 'Escuela de Química',
    description:
      'Formar profesionales en la ciencia de la Estadística con un alto nivel académico y ético para el ejercicio de su profesión, además de contribuir con la formación estadística en otras disciplinas mediante acciones integradas en la docencia, la investigación científica y la acción social, para coadyuvar en los procesos de toma de decisiones y el mejoramiento de la calidad de vida de la sociedad.',
    email: 'quimica@ucr.ac.cr',
    pageUrl: 'https://quimica.ucr.ac.cr',
    imageUrl: 'quimica.jpg',
    phoneNumber: '+506 2511-8520',
  },
  {
    id: 13,
    isPartOf: null,
    name: 'Instituto de Investigaciones Sociales',
    description:
      'Unidad academica dedicada a la investigacion social interdisciplinaria y al analisis de fenomenos sociales, economicos y politicos relevantes para Costa Rica y la region.',
    email: 'iis@ucr.ac.cr',
    pageUrl: 'https://iis.ucr.ac.cr',
    imageUrl: 'iis.jpg',
    phoneNumber: '+506 2511-4300',
  },
  {
    id: 14,
    isPartOf: null,
    name: 'Escuela de Matemática',
    description:
      'Unidad dedicada a la docencia, investigacion y accion social en matematica pura, aplicada y estadistica matematica.',
    email: 'matematica@ucr.ac.cr',
    pageUrl: 'https://emate.ucr.ac.cr',
    imageUrl: 'matematica.jpg',
    phoneNumber: '+506 2511-6550',
  },
  {
    id: 15,
    isPartOf: null,
    name: 'Escuela de Ciencias Políticas',
    description:
      'Unidad academica enfocada en el estudio de la teoria politica, las instituciones publicas, la participacion ciudadana y las politicas publicas.',
    email: 'cpoliticas@ucr.ac.cr',
    pageUrl: 'https://cpoliticas.ucr.ac.cr',
    imageUrl: 'cpoliticas.jpg',
    phoneNumber: '+506 2511-6400',
  },
  {
    id: 16,
    isPartOf: null,
    name: 'Escuela de Agronomía',
    description:
      'Unidad academica dedicada a la investigacion y formacion en agronomia, produccion vegetal, manejo sostenible de cultivos y transferencia tecnologica al sector agropecuario.',
    email: 'agronomia@ucr.ac.cr',
    pageUrl: 'https://agro.ucr.ac.cr',
    imageUrl: 'agronomia.jpg',
    phoneNumber: '+506 2511-2205',
  },
];

export const unitTable: DatabaseTableDefinition = {
  name: 'Unit',
  dropSql: 'DROP TABLE IF EXISTS Unit',
  createSql: `
    CREATE TABLE Unit (
      id INT,
      is_part_of INT,
      name STRING,
      description STRING,
      email STRING,
      page_url STRING,
      image_url STRING,
      phone_number STRING
    )
  `,
  seedSql: insertUnitSql,
  seedRows: unitRows.map((unit) => ({
    params: [
      unit.id,
      unit.isPartOf,
      unit.name,
      unit.description,
      unit.email,
      unit.pageUrl,
      unit.imageUrl,
      unit.phoneNumber,
    ],
  })),
};
