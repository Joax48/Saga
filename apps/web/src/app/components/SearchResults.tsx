'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type ReactNode } from 'react';

import ProjectListItem from '@/app/projects/components/ProjectListItem';
import ResearchersCardsGrid from '@/app/researchers/components/ResearchersCardsGrid';
import { ProductionCard } from '@/app/scientific-productions/components';
import UnitCard from '@/app/units/components/unitCard';
import { CardSkeleton, UnitCardSkeleton } from '@/components/skeletons/CardSkeleton';
import type { HomeSearchResults } from '@/services/home';

function formatDate(value: string): string {
  const parsed = new Date(`${value}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('es-CR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(parsed);
}

type SearchTab = 'profiles' | 'projects' | 'science' | 'units';

export default function SearchResults({
  searchQuery,
  isSearching,
  searchError,
  searchResults,
  activeTab,
  setActiveTab,
}: {
  searchQuery: string;
  isSearching: boolean;
  searchError: string | null;
  searchResults: HomeSearchResults | null;
  activeTab: SearchTab;
  setActiveTab: (v: SearchTab) => void;
}) {
  const router = useRouter();
  const hasResults = Boolean(searchResults && searchQuery);
  const hasAnyResult =
    (searchResults?.projects.total ?? 0) > 0 ||
    (searchResults?.researchers.total ?? 0) > 0 ||
    (searchResults?.scientificProductions.total ?? 0) > 0 ||
    (searchResults?.units.total ?? 0) > 0;

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
    <section className="space-y-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text-neutral-primary)]">
            Resultados de búsqueda
          </h2>
          <p className="text-sm text-[var(--color-text-neutral-secondary)]">
            {searchQuery
              ? `Buscando: ${searchQuery}`
              : 'Escribe algo para buscar en las cuatro secciones.'}
          </p>
        </div>
      </div>

      {searchError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
          {searchError}
        </div>
      )}

      {isSearching && searchQuery && <SearchResultsSkeleton activeTab={activeTab} />}

      {!isSearching && hasResults && searchResults && hasAnyResult && (
        <div className="rounded-2xl bg-white">
          <div className="flex flex-wrap gap-2 border-b border-[var(--color-gray-300)] pb-4">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTab;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={[
                    'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[var(--color-bg-brand-primary)] text-white'
                      : 'bg-[var(--color-bg-neutral-secondary)] text-[var(--color-text-neutral-primary)] hover:bg-[var(--color-bg-brand-secondary)]',
                  ].join(' ')}
                >
                  {tab.label}
                  <span className="ml-2 opacity-80">({tab.count})</span>
                </button>
              );
            })}
          </div>

          <div className="pt-6">
            {activeTab === 'profiles' && (
              <SearchSection
                title="Perfiles"
                total={searchResults.researchers.total}
                href={`/researchers?q=${encodeURIComponent(searchQuery)}`}
              >
                {searchResults.researchers.data.length > 0 ? (
                  <ResearchersCardsGrid
                    researchers={searchResults.researchers.data}
                    currentPage={1}
                    totalPages={1}
                    onPageChange={() => {}}
                  />
                ) : (
                  <EmptySectionMessage label="perfiles" />
                )}
              </SearchSection>
            )}

            {activeTab === 'projects' && (
              <SearchSection
                title="Proyectos"
                total={searchResults.projects.total}
                href={`/projects?q=${encodeURIComponent(searchQuery)}`}
              >
                {searchResults.projects.data.length > 0 ? (
                  <div className="space-y-4">
                    {searchResults.projects.data.map((project) => (
                      <ProjectListItem
                        key={project.id}
                        code={project.code}
                        title={project.title}
                        href={`/projects/${project.id}`}
                        manager={project.manager}
                        managerHref={`/researchers?q=${encodeURIComponent(project.manager)}`}
                        startDate={formatDate(project.startDate)}
                        endDate={formatDate(project.endDate)}
                        researchType={project.researchType}
                        actionType={project.projectType}
                        keywords={project.keywords}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptySectionMessage label="proyectos" />
                )}
              </SearchSection>
            )}

            {activeTab === 'science' && (
              <SearchSection
                title="Producción científica"
                total={searchResults.scientificProductions.total}
                href={`/scientific-productions?q=${encodeURIComponent(searchQuery)}`}
              >
                {searchResults.scientificProductions.data.length > 0 ? (
                  <div className="space-y-4">
                    {searchResults.scientificProductions.data.map((production) => (
                      <ProductionCard key={production.id} production={production} />
                    ))}
                  </div>
                ) : (
                  <EmptySectionMessage label="producciones científicas" />
                )}
              </SearchSection>
            )}

            {activeTab === 'units' && (
              <SearchSection
                title="Unidades"
                total={searchResults.units.total}
                href={`/units?q=${encodeURIComponent(searchQuery)}`}
              >
                {searchResults.units.data.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 mb-12">
                    {searchResults.units.data.map((unit) => (
                      <UnitCard
                        key={unit.id}
                        name={unit.name}
                        url={`/units/mock-images/logos/${unit.id}.png`}
                        onClick={() => router.push(`/units/${unit.id}`)}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptySectionMessage label="unidades" />
                )}
              </SearchSection>
            )}
          </div>
        </div>
      )}

      {!isSearching && hasResults && searchResults && !hasAnyResult && (
        <div className="rounded-xl border border-[var(--color-gray-300)] bg-white px-4 py-10 text-center">
          <p className="text-base font-medium text-[var(--color-text-neutral-primary)]">
            No se encontraron coincidencias para “{searchQuery}”.
          </p>
          <p className="mt-1 text-sm text-[var(--color-text-neutral-secondary)]">
            Prueba con otro término o ve a una página de módulo para afinar la búsqueda.
          </p>
        </div>
      )}
    </section>
  );
}

function SearchSection({
  title,
  total,
  href,
  children,
}: {
  title: string;
  total: number;
  href: string;
  children: ReactNode;
}) {
  return (
    <article className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-[var(--color-text-neutral-primary)]">
            {title}
          </h3>
          <p className="text-sm text-[var(--color-text-neutral-secondary)]">
            {total} resultado{total !== 1 ? 's' : ''}
          </p>
        </div>

        <Link
          href={href}
          className="text-sm font-medium text-[var(--color-text-brand-primary)] hover:underline"
        >
          Ver todo
        </Link>
      </div>

      {children}
    </article>
  );
}

function EmptySectionMessage({ label }: { label: string }) {
  return (
    <div className="rounded-xl bg-[var(--color-bg-neutral-secondary)] px-4 py-8 text-center text-sm text-[var(--color-text-neutral-secondary)]">
      No se encontraron {label}.
    </div>
  );
}

function SearchResultsSkeleton({ activeTab }: { activeTab: SearchTab }) {
  return (
    <div className="rounded-2xl bg-white">
      <div className="flex flex-wrap gap-2 border-b border-[var(--color-gray-300)] pb-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className={[
              'skeleton h-9 rounded-full',
              index === 0 ? 'w-32' : index === 1 ? 'w-28' : 'w-44',
            ].join(' ')}
          />
        ))}
      </div>

      <div className="pt-6">
        <article className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="skeleton h-6 w-32 rounded" />
              <div className="skeleton h-4 w-24 rounded" />
            </div>
            <div className="skeleton h-4 w-16 rounded" />
          </div>

          {activeTab === 'profiles' && (
            <ResearchersCardsGrid
              researchers={[]}
              isLoading
              pageSize={6}
              currentPage={1}
              totalPages={1}
              onPageChange={() => {}}
            />
          )}

          {(activeTab === 'projects' || activeTab === 'science') && (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <CardSkeleton key={index} />
              ))}
            </div>
          )}

          {activeTab === 'units' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 mb-12">
              {Array.from({ length: 6 }).map((_, index) => (
                <UnitCardSkeleton key={index} />
              ))}
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
