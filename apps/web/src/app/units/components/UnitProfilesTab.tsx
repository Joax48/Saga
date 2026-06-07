'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Pagination from '@/components/Pagination';
import Card from '@/components/Card';
import type { UnitProfile } from '@/services/units';

const PAGE_SIZE = 9;

interface UnitProfilesTabProps {
  profiles: UnitProfile[];
}

function getAvatarUrl(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff&size=200`;
}

export function UnitProfilesTab({ profiles }: UnitProfilesTabProps) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(profiles.length / PAGE_SIZE));

  const paginated = useMemo(
    () => profiles.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [profiles, page],
  );

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-base font-medium text-[var(--color-text-neutral-secondary)]">
          No se encontraron resultados.
        </p>
        <p className="mt-1 text-sm text-[var(--color-text-neutral-tertiary)]">
          No hay perfiles asociados a esta unidad.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <p
        className="mb-4 text-sm"
        style={{ color: 'var(--color-text-neutral-secondary)' }}
      >
        {profiles.length} resultado{profiles.length !== 1 ? 's' : ''}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10 items-stretch">
        {paginated.map((profile) => (
          <Card
            key={profile.id}
            title={profile.name}
            titleClassName="text-sm font-bold leading-snug text-[var(--color-text-neutral-primary)]"
            titleLinkClassName="after:absolute after:inset-0 after:z-[0]"
            description={
              <span className="flex flex-col gap-0.5">
                <span
                  className="text-xs font-medium uppercase tracking-wide"
                  style={{ color: 'var(--color-text-neutral-secondary)' }}
                >
                  Unidad de pago
                </span>
                {profile.baseUnit ? (
                  <Link
                    href={`/units?q=${encodeURIComponent(profile.baseUnit)}`}
                    className="relative z-[1] hover:underline"
                    style={{ color: 'var(--color-text-brand-primary)' }}
                  >
                    {profile.baseUnit}
                  </Link>
                ) : (
                  <span style={{ color: 'var(--color-text-neutral-secondary)' }}>
                    Sin unidad de pago registrada
                  </span>
                )}
              </span>
            }
            excerpt={profile.ceaCategory ?? 'Sin categoría registrada'}
            imageSrc={profile.photoUrl ?? getAvatarUrl(profile.name)}
            imageShape="circle"
            href={`/researchers/${profile.id}`}
            chromeless
            className="relative z-0 hover:z-10 flex items-start gap-4 h-full transition-transform duration-200 hover:scale-[1.02] cursor-pointer"
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
