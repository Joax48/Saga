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
      <div className="flex items-center justify-center py-16">
        <p className="text-[16px] text-[var(--color-text-neutral-secondary)]">
          No hay perfiles asociados.
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
        {paginated.map((profile) => (
          <Card
            key={profile.id}
            title={profile.name}
            description={
              <span className="flex flex-col gap-0.5">
                <span
                  className="text-xs font-medium uppercase tracking-wide"
                  style={{ color: 'var(--color-text-neutral-secondary)' }}
                >
                  Unidad base
                </span>
                {profile.baseUnit ? (
                  <Link
                    href={`/units?q=${encodeURIComponent(profile.baseUnit)}`}
                    className="hover:underline"
                    style={{ color: 'var(--color-text-brand-primary)' }}
                  >
                    {profile.baseUnit}
                  </Link>
                ) : (
                  <span style={{ color: 'var(--color-text-neutral-secondary)' }}>
                    Sin unidad registrada
                  </span>
                )}
              </span>
            }
            excerpt={profile.ceaCategory ?? 'Sin categoría registrada'}
            imageSrc={profile.photoUrl ?? getAvatarUrl(profile.name)}
            imageShape="circle"
            href={`/researchers/${profile.id}`}
            chromeless
            className="flex items-start gap-4 h-full"
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
