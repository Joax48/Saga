/**
 * Shared TypeScript type definitions for the web application.
 */

/* ─── Scientific Productions ─────────────────────────────────────────── */

export interface ScientificProductionType {
  category: string;
  subcategory: string;
  review_type?: string;
}

export interface ScientificProduction {
  id: string;
  title: string;
  authors: string[];
  type: ScientificProductionType;
  open_access: boolean;
  publication_year: number;
  abstract: string;
  doi: string;
  journal?: string;
  volume?: number;
  issue?: number;
  pages?: string;
  citation_count: number;
  keywords: string[];
}

/* ─── Filters ────────────────────────────────────────────────────────── */

export interface ProductionFilters {
  searchQuery: string;
  selectedTypes: string[];
  openAccessOnly: boolean;
  selectedYears: number[];
  selectedKeywords: string[];
}
