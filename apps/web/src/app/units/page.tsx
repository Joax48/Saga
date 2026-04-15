'use client';

import { useEffect, useState } from 'react';
import PageHeroSearch from '@/components/PageHeroSearch';
import Pagination from '@/components/Pagination';
import UnitsList from './components/UnitsList';
import { getUnits } from '@/services/units';
import type { Unit } from '@/services/units';

/**
 * Units listing page.
 *
 * This client component owns the page state for search and pagination,
 * and fetches the matching unit records from the service on demand.
 */
export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Reset pagination whenever the search term changes.
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getUnits(currentPage, 9, searchQuery);
        setUnits(response.data);
        setTotalPages(Math.max(1, Math.ceil(response.total / response.limit)));
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [currentPage, searchQuery]);

  return (
    <main>
      <PageHeroSearch
        items={[{ label: 'Unidades' }]}
        title="Unidades"
        searchPlaceholder="Buscar por nombre de la unidad"
        onSearch={handleSearch}
      />

      <section className="px-6 py-10 max-w-7xl mx-auto mt-5">
        <UnitsList units={units} />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </section>
    </main>
  );
}
