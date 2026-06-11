'use client';
import { useState } from 'react';

import CollaborationMapPreview from '@/components/CollaborationMapPreview';
import PageHeroSearch from '@/components/PageHeroSearch';
import TopNavigation from './TopNavigation';
import { searchHome, type HomeSearchResults } from '@/services/home';
import SearchResults from './SearchResults';

type SearchTab = 'profiles' | 'projects' | 'science' | 'units';

export function HomeView() {
  const [searchResults, setSearchResults] = useState<HomeSearchResults | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SearchTab>('profiles');

  const handleSearch = async (query: string) => {
    const normalizedQuery = query.trim();

    setSearchQuery(normalizedQuery);
    setSearchError(null);

    if (!normalizedQuery) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setActiveTab('profiles');

    try {
      const response = await searchHome(normalizedQuery);
      setSearchResults(response);
    } catch (error) {
      console.error('Error searching home results:', error);
      setSearchResults(null);
      setSearchError(
        'No se pudieron cargar los resultados de la búsqueda. Intenta nuevamente más tarde.',
      );
    } finally {
      setIsSearching(false);
    }
  };

  const hasResults = Boolean(searchResults && searchQuery);
  const hasAnyResult =
    (searchResults?.projects.total ?? 0) > 0 ||
    (searchResults?.researchers.total ?? 0) > 0 ||
    (searchResults?.scientificProductions.total ?? 0) > 0 ||
    (searchResults?.units.total ?? 0) > 0;

  const searchMode =
    Boolean(searchQuery) || isSearching || Boolean(searchError) || hasResults;

  const tabs: Array<{ id: SearchTab; label: string; count: number }> = [
    {
      id: 'profiles',
      label: 'Perfiles',
      count: searchResults?.researchers.total ?? 0,
    },
    {
      id: 'projects',
      label: 'Proyectos',
      count: searchResults?.projects.total ?? 0,
    },
    {
      id: 'science',
      label: 'Producción científica',
      count: searchResults?.scientificProductions.total ?? 0,
    },
    {
      id: 'units',
      label: 'Unidades',
      count: searchResults?.units.total ?? 0,
    },
  ];

  return (
    <div>
      <PageHeroSearch
        items={[{ label: '' }]}
        title="Inicio"
        searchPlaceholder="Buscar por proyecto, perfil, producción o unidad"
        onSearch={handleSearch}
        initialSearchValue={searchQuery}
        variant="home"
      />

      <section className="px-6 lg:px-10">
        <div className="mx-auto max-w-6xl">
          {!searchMode && (
            <>
              <TopNavigation />
              <hr className="mt-2 border-t border-gray-300" />

              <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-[var(--color-secondary)]">
                <div className="mx-auto max-w-6xl px-6 py-8 lg:px-10">
                  <h1 className="mb-4 text-h3 font-bold text-gray-0">
                    Sistema de Gestión de Investigación y Producción Académica de la UCR
                  </h1>

                  <p className="text-body-md leading-relaxed text-gray-900">
                    El Sistema de Información de Investigación de la Universidad de Costa
                    Rica (UCR) es un CRIS que integra perfiles de investigadores, unidades
                    académicas, producción científica y proyectos, así como producciones
                    no científicas. Además, ofrece un espacio interactivo de visualización
                    estadística mediante dashboards, permitiendo monitorear tendencias,
                    analizar datos institucionales y facilitar la toma de decisiones
                    estratégicas. La plataforma busca mejorar la visibilidad de la
                    actividad actividad actividad académica, promover la colaboración y
                    apoyar la científica y académica de la Universidad.
                  </p>
                </div>
              </div>

              <div>
                <CollaborationMapPreview />
              </div>
            </>
          )}

          {searchMode && (
            <SearchResults
              searchQuery={searchQuery}
              isSearching={isSearching}
              searchError={searchError}
              searchResults={searchResults}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          )}

          {!searchMode && <hr className="mt-2 border-t border-gray-300 py-5" />}

          {!searchMode && (
            <div className="hidden">
              <h1 className="text-h3 font-bold mb-6">
                {' '}
                Producción científica destacada{' '}
              </h1>
              <div className="flex-1 min-w-0">
                <div
                  className="flex flex-col items-center justify-center py-16 text-center"
                  role="status"
                  aria-live="polite"
                >
                  <p className="text-body-lg font-medium text-[var(--color-text-neutral-secondary)]">
                    No se encontraron resultados.
                  </p>
                  <p className="mt-1 text-body-md text-[var(--color-text-neutral-tertiary)]">
                    Intenta ajustar los filtros o el término de búsqueda.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
