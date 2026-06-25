'use client';

import { Info } from 'lucide-react';
import Image from 'next/image';

interface ScientificProductionPanelProps {
  production_title: string;
  production_doi: string;
  production_source: string;
  citation_count: number;
}

const SOURCE_LOGOS: Record<
  string,
  { src: string; alt: string; width: number; height: number }
> = {
  Clarivate: {
    src: '/icons/logo_Clarivate.png',
    alt: 'Clarivate logo',
    width: 330,
    height: 99,
  },
  Scopus: {
    src: '/icons/logo_Scopus.png',
    alt: 'Scopus logo',
    width: 330,
    height: 99,
  },
};

export default function ScientificProductionPanel({
  production_title,
  production_doi,
  production_source,
  citation_count,
}: ScientificProductionPanelProps) {
  const logo = SOURCE_LOGOS[production_source];

  return (
    <aside
      className="w-full max-w-md mx-auto sm:max-w-sm lg:mx-0 lg:w-72 lg:max-w-none lg:shrink-0 border border-gray-400 rounded-xl p-4 lg:p-5"
      aria-label="Métricas de la publicación"
    >
      <h2 className="text-h5 font-bold text-[var(--color-text-neutral-primary)] mb-3">
        Métricas
      </h2>

      {/* Citas */}
      <div>
        <div className="flex items-center gap-2">
          <p className="text-body-sm font-bold text-[var(--color-text-neutral-secondary)] mb-0">
            Citas
          </p>
        </div>
        <div className="mt-2 rounded-md bg-[var(--color-bg-neutral-secondary)] px-3 py-2 text-center">
          <p className="text-xl font-medium text-[var(--color-text-neutral-primary)]">
            {citation_count}
          </p>
        </div>
      </div>

      {/* Métricas alternativas (PlumX) */}
      <div className="mt-5">
        <div className="flex items-center gap-2">
          <p className="text-body-sm font-bold text-[var(--color-text-neutral-secondary)] mb-2">
            Métricas alternativas
          </p>
        </div>
        <div className="mt-2 rounded-md bg-[var(--color-bg-neutral-secondary)] px-3 py-2 text-center">
          {production_doi && (
            <div className="flex justify-center text-[var(--color-text-neutral-primary)]">
              <a
                href={`https://plu.mx/plum/a/?doi=${production_doi}`}
                data-hide-when-empty="true"
                className="plumx-plum-print-popup"
                data-site="plum"
                data-orientation="vertical"
              >
                {production_title}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Fuente */}
      <div className="mt-5">
        <div className="flex items-center gap-2">
          <p className="text-body-sm font-bold text-[var(--color-text-neutral-secondary)] mb-2">
            Fuente
          </p>
        </div>
        <div className="mt-2 rounded-md bg-[var(--color-bg-neutral-secondary)] px-3 py-2 flex justify-center items-center">
          {production_source && logo && (
            <Image
              className="max-w-[150px] w-full h-auto"
              src={logo.src}
              alt={logo.alt}
              width={logo.width}
              height={logo.height}
            />
          )}
        </div>
      </div>
    </aside>
  );
}
