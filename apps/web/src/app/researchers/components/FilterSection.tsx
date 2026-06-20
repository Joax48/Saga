'use client';

import { useMemo } from 'react';
import { FilterSidebar, type FilterGroupConfig } from '@/components/FilterSidebar';
import {
  getResearcherFilters,
  type ResearcherQueryFilters,
} from '@/services/researchers';
import type { ResearcherFilters } from '@/services/researchers';

interface FilterSectionProps {
  filters: ResearcherQueryFilters;
  filterOptions: ResearcherFilters;
  onToggleFilter: (key: keyof ResearcherQueryFilters, value: string) => void;
  onClearAll: () => void;
  hasActiveFilters: boolean;
}

export default function FilterSection({
  filters,
  onToggleFilter,
  filterOptions,
  onClearAll,
  hasActiveFilters,
}: FilterSectionProps) {
  const filterGroups = useMemo<FilterGroupConfig[]>(() => {
    return [
      {
        kind: 'options',
        title: 'Unidad de Trabajo',
        groupKey: 'base-unit',
        options: filterOptions.baseUnit,
        selectedValues: filters.baseUnit ?? [],
        onToggle: (value) => onToggleFilter('baseUnit', value),
      },
      {
        kind: 'options',
        title: 'Redes de colaboración',
        groupKey: 'collaboration-country',
        options: filterOptions.collaborationCountry,
        selectedValues: filters.collaborationCountry ?? [],
        onToggle: (value) => onToggleFilter('collaborationCountry', value),
      },
    ];
  }, [filterOptions, filters, onToggleFilter]);

  return (
    <FilterSidebar
      groups={filterGroups}
      hasActiveFilters={hasActiveFilters}
      onClearAll={onClearAll}
    />
  );
}
