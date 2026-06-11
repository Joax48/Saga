'use client';

import { useState, useMemo, useCallback } from 'react';
import ResearchersCardsGrid from '@/app/researchers/components/ResearchersCardsGrid';
import type { UnitProfile } from '@/services/units';
import type { Researcher } from '@/types/researcher-data';

const PAGE_SIZE = 9;

interface UnitProfilesTabProps {
  profiles: UnitProfile[];
}

export function UnitProfilesTab({ profiles }: UnitProfilesTabProps) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(profiles.length / PAGE_SIZE));

  const researchers = useMemo<Researcher[]>(
    () =>
      profiles.map((profile) => ({
        id: String(profile.id),
        idUcrProfile: null,
        baseUnit: profile.baseUnit ?? '',
        name: profile.name,
        firstSurname: '',
        secondSurname: '',
        ceaCategory: profile.ceaCategory,
        institution: null,
        country: null,
        institutions: [],
        orcidId: null,
        linkedin: null,
        researchGate: null,
        scopus: null,
        photo: profile.photoUrl,
        profileType: 'UCR',
        linkedUnits: [],
        workUnits: profile.baseUnit
          ? [{ id: profile.baseUnit, name: profile.baseUnit }]
          : [],
      })),
    [profiles],
  );

  const paginatedResearchers = useMemo(
    () => researchers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [researchers, page],
  );

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-body-lg font-bold text-[var(--color-text-neutral-secondary)]">
          No se encontraron resultados.
        </p>
        <p className="mt-1 text-body-md text-[var(--color-text-neutral-tertiary)]">
          No hay perfiles asociados a esta unidad.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <p
        className="mb-4 text-body-md"
        style={{ color: 'var(--color-text-neutral-secondary)' }}
      >
        {profiles.length} resultado{profiles.length !== 1 ? 's' : ''}
      </p>

      <ResearchersCardsGrid
        researchers={paginatedResearchers}
        pageSize={PAGE_SIZE}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
