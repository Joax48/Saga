'use client';

import { useEffect, useMemo, useState } from 'react';
import { FilterSidebar, type FilterGroupConfig } from '@/components/FilterSidebar';
import {
  getResearcherFilters,
  type ResearcherQueryFilters,
} from '@/services/researchers';
import type { ResearcherFilters } from '@/services/researchers';

interface FilterSectionProps {
  filters: ResearcherQueryFilters;
  onToggleFilter: (key: keyof ResearcherQueryFilters, value: string) => void;
  onClearAll: () => void;
  hasActiveFilters: boolean;
}

export default function FilterSection({
  filters,
  onToggleFilter,
  onClearAll,
  hasActiveFilters,
}: FilterSectionProps) {
  const [filterOptions, setFilterOptions] = useState<ResearcherFilters | null>(null);

  useEffect(() => {
    const loadFilters = async () => {
      const options = await getResearcherFilters();
      setFilterOptions(options);
    };

    loadFilters();
  }, []);

  const filterGroups = useMemo<FilterGroupConfig[]>(() => {
    if (!filterOptions) return [];

    return [
      {
        kind: 'options',
        title: 'Unidad Base',
        groupKey: 'base-unit',
        options: filterOptions.baseUnit,
        selectedValues: filters.baseUnit ?? [],
        onToggle: (value) => onToggleFilter('baseUnit', value),
      },
      {
        kind: 'options',
        title: 'Categoría CEA',
        groupKey: 'cea-category',
        options: filterOptions.ceaCategory,
        selectedValues: filters.ceaCategory ?? [],
        onToggle: (value) => onToggleFilter('ceaCategory', value),
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
