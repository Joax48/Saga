/**
 * Shared TypeScript type definitions for the web application.
 */

/* ─── Scientific Productions ─────────────────────────────────────────── */

interface AuthorReference {
  id: number;
  name: string;
}

export interface KeywordReference {
  id: number;
  value: string;
}

export interface SummaryScientificProduction {
  id: string;
  title: string;
  authors: AuthorReference[];
  type: string;
  open_access: boolean;
  publication_year: number;
  doi: string;
  journal?: string;
  volume?: number;
  issue?: number;
  pages?: string;
  source?: string;
  keywords: KeywordReference[];
}
export interface ScientificProduction {
  id: string;
  title: string;
  ucrAuthors: AuthorReference[];
  externalAuthors: AuthorReference[];
  authors: AuthorReference[];
  unit: string;
  affiliations: string[];
  type: string;
  open_access: boolean;
  publication_year: number;
  abstract: string;
  doi: string;
  journal?: string;
  volume?: number;
  issue?: number;
  pages?: string;
  citation_count: number;
  source: string;
  keywords: string[];
  collaborationCountries: { country: string; count: number }[];
}

/* ─── Filters ────────────────────────────────────────────────────────── */

export interface ProductionFilters {
  searchQuery: string;
  selectedTypes: string[];
  openAccessOnly: boolean;
  selectedYears: number[];
  selectedKeywords: string[];
}
