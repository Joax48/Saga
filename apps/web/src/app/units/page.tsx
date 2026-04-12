'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import PageHeroSearch from '@/components/PageHeroSearch';
import Pagination from '@/components/Pagination';
import UnitCard from './components/unitCard';

import { getUnits } from '@/services/units';

import type { Unit } from '@/services/units';

/**
 * Units listing page.
 *
 * This client component owns the page state for search and pagination,
 * and fetches the matching unit records from the service on demand.
 */
export default function UnitsPage() {
  const router = useRouter();
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

      {/* Listing section */}
      <section className="px-6 py-10 max-w-7xl mx-auto mt-5">
        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 mb-12">
          {units.length > 0 ? (
            units.map((unit) => (
              <UnitCard
                key={unit.id}
                name={unit.name}
                url={'/units/mock-images/logos/' + unit.id + '.png'}
                onClick={() => router.push(`/units/${unit.id}`)}
              />
            ))
          ) : (
            <div
              className="col-span-full flex flex-col items-center justify-center py-16 text-center"
              role="status"
              aria-live="polite"
            >
              <p
                className="text-base font-medium"
                style={{ color: 'var(--color-text-neutral-secondary)' }}
              >
                No se encontraron resultados.
              </p>
              <p
                className="mt-1 text-sm"
                style={{ color: 'var(--color-text-neutral-tertiary)' }}
              >
                Intenta ajustar los filtros o el término de búsqueda.
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </section>
    </main>
  );
}
