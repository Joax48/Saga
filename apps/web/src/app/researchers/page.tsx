'use client';

import { useState } from 'react';
import ResearchersList from './components/ResearchersList';
import Breadcrumb from '../../components/Breadcrumb';
import SearchBar from '../../components/SearchBar';
import PageHeroSearch from '../../components/PageHeroSearch.tsx';

export default function ResearchersPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: 'var(--color-bg-neutral-primary)' }}
    >
      <PageHeroSearch
        items={[{ label: 'Investigadores' }]}
        title="Investigadores"
        searchPlaceholder="Buscar por nombre"
        onSearch={handleSearch}
      />

      <div className="max-w-6xl mx-auto px-6 pt-6 mt-6">
        <ResearchersList searchQuery={searchQuery} />
      </div>
    </main>
  );
}
