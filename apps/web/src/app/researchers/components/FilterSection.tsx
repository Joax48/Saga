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
        title: 'Unidad Base',
        groupKey: 'base-unit',
        options: filterOptions.baseUnit,
        selectedValues: filters.baseUnit ?? [],
        onToggle: (value) => onToggleFilter('baseUnit', value),
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
