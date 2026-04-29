'use client';

import { useState, useEffect } from 'react';
import Pagination from '../../../components/Pagination.tsx';
import Card from '../../../components/Card.tsx';
import {
  getResearchers,
  type ResearcherQueryFilters,
} from '../../../services/researchers';

import type { Researcher } from '@/types/researcher-data.js';

const PAGE_SIZE = 9;

interface ResearchersListProps {
  searchQuery: string;
  filters: ResearcherQueryFilters;
}

export default function ResearchersList({ searchQuery, filters }: ResearchersListProps) {
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters]);

  useEffect(() => {
    const fetchResearchers = async () => {
      try {
        const response = await getResearchers(
          currentPage,
          PAGE_SIZE,
          searchQuery,
          filters,
        );
        setResearchers(response.data);
        setTotalPages(Math.max(1, Math.ceil(response.total / response.limit)));
      } catch (error) {
        console.error('Error fetching researchers:', error);
      } finally {
      }
    };

    fetchResearchers();
  }, [currentPage, searchQuery, filters]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    globalThis.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getAvatarUrl = (name: string, surname: string): string => {
    const fullName = `${name} ${surname}`;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0D8ABC&color=fff&size=200`;
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
        {researchers.map((researcher) => (
          <Card
            key={researcher.id}
            title={`${researcher.name} ${researcher.firstSurname}`}
            description={researcher.baseUnit}
            excerpt={researcher.ceaCategory || 'Investigador'}
            imageSrc={
              researcher.photoUrl ||
              getAvatarUrl(researcher.name, researcher.firstSurname)
            }
            imageShape="circle"
            href={`/researchers/${researcher.id}`}
            chromeless
            className="flex items-start gap-4"
          />
        ))}
      </div>

      {researchers.length === 0 && searchQuery && (
        <p className="text-center text-gray-500">
          No se encontraron investigadores para `{searchQuery}`
        </p>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
