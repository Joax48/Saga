'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { getResearchers } from '@/services/researchers';
import { getUnits } from '@/services/units';
import { getScientificProductions } from '@/services/scientific-productions';
import { getProjects } from '@/services/projects';

type TopNavKey = 'researchers' | 'units' | 'productions' | 'projects';

type TopNavItem = {
  key: TopNavKey;
  label: string;
  href: string;
  image: string;
};

const ITEMS: TopNavItem[] = [
  {
    key: 'researchers',
    label: 'Perfiles',
    href: '/researchers',
    image: '/icons/icon_researchers_lightblue.png',
  },
  {
    key: 'units',
    label: 'Unidades',
    href: '/units',
    image: '/icons/icon_units_lightblue.png',
  },
  {
    key: 'productions',
    label: 'Producción Científica',
    href: '/scientific-productions',
    image: '/icons/icon_productions_lightblue.png',
  },
  {
    key: 'projects',
    label: 'Proyectos',
    href: '/projects',
    image: '/icons/icon_projects_lightblue.png',
  },
];

function formatCount(n: number): { label: string; tooltip: string | null } {
  if (n >= 10_000) {
    return {
      label: `${Math.floor(n / 1_000)}K`,
      tooltip: `Total: ${n.toLocaleString('es-CR')}`,
    };
  }
  return { label: n.toLocaleString('es-CR'), tooltip: null };
}

export default function TopNavigation() {
  const [counts, setCounts] = useState<Partial<Record<TopNavKey, number>>>({});

  useEffect(() => {
    let cancelled = false;

    const loaders: Array<[TopNavKey, Promise<number>]> = [
      [
        'researchers',
        getResearchers({ page: 1, limit: 1, filters: { profileType: 'UCR' } }).then(
          (r) => r.total,
        ),
      ],
      ['units', getUnits(1, 1).then((r) => r.total)],
      [
        'productions',
        getScientificProductions({ page: 1, limit: 1 }).then((r) => r.total),
      ],
      ['projects', getProjects(1, 1).then((r) => r.total)],
    ];

    for (const [key, promise] of loaders) {
      promise
        .then((total) => {
          if (!cancelled) setCounts((prev) => ({ ...prev, [key]: total }));
        })
        .catch(() => {});
    }

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="bg-white py-8">
      <div className="max-w-6xl mx-auto grid grid-cols-2 gap-4 text-center md:grid-cols-3 lg:grid-cols-4">
        {ITEMS.map((item) => {
          const count = counts[item.key];
          const formatted = count !== undefined ? formatCount(count) : null;
          return (
            <Link
              key={item.label}
              href={item.href}
              className="group flex flex-col items-center gap-1 rounded-xl px-2 py-3 transition-colors hover:bg-[var(--color-bg-neutral-secondary)]"
            >
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full">
                <Image
                  src={item.image}
                  alt={item.label}
                  width={70}
                  height={70}
                  className="object-contain transition-transform duration-200 group-hover:scale-110"
                />
              </div>

              <span className="text-body-sm--line-height text-center text-[var(--color-bg-info-subtle)] group-hover:scale-110">
                {item.label}
              </span>

              {formatted && (
                <span
                  title={formatted.tooltip ?? undefined}
                  className="inline-flex min-w-12 items-center justify-center rounded-md bg-[var(--color-bg-info-subtle)] px-2 py-0.5 text-body-sm font-bold leading-tight text-white"
                >
                  {formatted.label}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
