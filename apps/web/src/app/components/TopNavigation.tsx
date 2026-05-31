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

export default function TopNavigation() {
  const [counts, setCounts] = useState<Partial<Record<TopNavKey, number>>>({});

  useEffect(() => {
    let cancelled = false;

    // Each list endpoint returns the full `total`, so we request a single
    // item per entity just to read the count without fetching whole pages.
    const loaders: Array<[TopNavKey, Promise<number>]> = [
      ['researchers', getResearchers(1, 1, '', undefined, 'UCR').then((r) => r.total)],
      ['units', getUnits(1, 1).then((r) => r.total)],
      ['productions', getScientificProductions({ page: 1, limit: 1 }).then((r) => r.total)],
      ['projects', getProjects(1, 1).then((r) => r.total)],
    ];

    for (const [key, promise] of loaders) {
      promise
        .then((total) => {
          if (!cancelled) setCounts((prev) => ({ ...prev, [key]: total }));
        })
        .catch(() => {
          // Leave the badge hidden if a count fails to load.
        });
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

          return (
            <Link
              key={item.label}
              href={item.href}
              className="group flex flex-col items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-[var(--color-bg-neutral-secondary)]"
            >
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full">
                <Image
                  src={item.image}
                  alt={item.label}
                  width={70}
                  height={70}
                  className="object-contain transition-transform duration-200 group-hover:scale-110"
                />
                {count !== undefined && (
                  <span className="absolute right-0 top-1 inline-flex min-w-6 items-center justify-center rounded-md border border-[var(--color-secondary)] bg-white px-1.5 py-0.5 text-xs font-semibold text-[var(--color-secondary)]">
                    {count}
                  </span>
                )}
              </div>

              <span className="text-sm text-center text-[var(--color-secondary)] group-hover:scale-110">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
