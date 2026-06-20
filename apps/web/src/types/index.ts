/**
 * Shared TypeScript type definitions for the web application.
 */

/* ─── Researchers (shared) ───────────────────────────────────────────── */

export type ProfileType = 'UCR' | 'EXTERNAL';

export interface ResearcherLinkedUnit {
  id: string;
  name: string;
}

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
  openAccess: boolean;
  publicationYear: number;
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
  openAccess: boolean;
  publicationYear: number;
  abstract: string;
  doi: string;
  journal?: string;
  volume?: number;
  issue?: number;
  pages?: string;
  citationCount: number;
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
