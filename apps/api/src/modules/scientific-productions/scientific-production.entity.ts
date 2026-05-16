// scientific-production.entity.ts

// Lo que devuelve la query del listado
export interface ScientificProductionSummary {
  id: string;
  title: string;
  authors: string | null; // JSON string → [{ id, name }]
  type: string | null;
  openAccess: number | null; // 0/1 de Oracle
  publicationYear: number;
  doi: string | null;
  journal: string | null;
  volume: string | null;
  issue: string | null;
  pages: string | null;
  keywords: string | null; // JSON string → [{ id, value }]
}

// Lo que devuelve la query del detalle
export interface ScientificProductionDetail {
  id: string;
  title: string;
  ucrAuthors: string | null; // JSON string → [{ id, name }]
  externalAuthors: string | null;
  unit: string | null;
  affiliations: string | null;
  type: string | null;
  openAccess: number | null;
  publicationYear: number;
  abstract: string | null;
  doi: string | null;
  journal: string | null;
  volume: string | null;
  issue: string | null;
  pages: string | null;
  citationCount: number | null;
  keywords: string | null;
}
