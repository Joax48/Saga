'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Tag } from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import { ScientificProductionTabs } from './components/ScientificProductionTabs';
import { getScientificProductionById } from '@/services/scientific-productions';
import type { ScientificProduction } from '@/types';

interface Props {
  params: { id: string };
}

/** Circular DOI badge — matches the official doi.org disc logo style */
function DoiBadge() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      className="shrink-0 mt-0.5"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="11" fill="#013169" />
      <text
        x="11"
        y="15"
        textAnchor="middle"
        fill="white"
        fontSize="7.5"
        fontWeight="700"
        fontFamily="Arial, sans-serif"
        letterSpacing="0.3"
      >
        DOI
      </text>
    </svg>
  );
}

export default function ScientificProductionsDetailPage({ params }: Props) {
  const [activeTab, setActiveTab] = useState('general');
  const [production, setProduction] = useState<ScientificProduction | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getScientificProductionById(params.id)
      .then(setProduction)
      .catch(() => setNotFound(true));
  }, [params.id]);

  // Load or re-init PlumX AFTER production data is in the DOM
  useEffect(() => {
    if (!production?.doi) return;

    const existing = document.getElementById('plumx-script');
    if (existing) {
      // Script already present — ask PlumX to re-scan the DOM for new anchors
      const w = window as Window & { __plumX?: { widgets?: { init?: () => void } } };
      w.__plumX?.widgets?.init?.();
      return;
    }

    const script = document.createElement('script');
    script.id = 'plumx-script';
    script.src = '//cdn.plu.mx/widget-popup.js';
    script.async = true;
    document.body.appendChild(script);
  }, [production?.doi]);

  if (notFound) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-[18px] text-(--color-text-neutral-secondary)">
          Producción científica no encontrada.
        </p>
      </main>
    );
  }

  if (!production) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-[18px] text-(--color-text-neutral-secondary)">Cargando...</p>
      </main>
    );
  }

  const breadcrumbTitle =
    production.title.length > 50
      ? production.title.slice(0, 50).trimEnd() + '...'
      : production.title;

  const tabs = [
    { id: 'general', label: 'Información general', icon: <FileText size={18} /> },
    { id: 'keywords', label: 'Palabras clave', icon: <Tag size={18} /> },
  ];

  return (
    <main className="bg-(--color-bg-neutral-secondary)">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <section className="bg-(--color-bg-neutral-primary) px-6 lg:px-10 pt-10 pb-18">
        <div className="max-w-7xl mx-auto space-y-8">
          <Breadcrumb
            items={[
              { label: 'Producción científica', href: '/scientific-productions' },
              { label: breadcrumbTitle },
            ]}
          />

          <div className="flex flex-col lg:flex-row">
            {/* Left */}
            <div className="flex-1 space-y-4 lg:pr-10">
              <h1 className="text-[32px] leading-[1.2] font-normal text-(--color-text-neutral-primary)">
                {production.title}
              </h1>

              <p className="text-[18px] leading-[1.6]">
                {production.authors.map((author, index) => {
                  const isPrincipal = author === production.principalAuthor;
                  return (
                    <span key={author}>
                      <Link
                        href={`/researchers?q=${encodeURIComponent(author)}`}
                        className="hover:underline"
                        style={{
                          color: isPrincipal
                            ? 'var(--color-text-brand-primary)'
                            : 'var(--color-text-neutral-primary)',
                        }}
                      >
                        {author}
                      </Link>
                      {index < production.authors.length - 1 && (
                        <span className="text-(--color-text-neutral-secondary)">
                          {', '}
                        </span>
                      )}
                    </span>
                  );
                })}
              </p>

              {production.unit && (
                <p>
                  <Link
                    href="/units"
                    className="text-[18px] hover:underline"
                    style={{ color: 'var(--color-text-brand-primary)' }}
                  >
                    {production.unit}
                  </Link>
                </p>
              )}

              {production.affiliations.length > 0 && (
                <p className="text-[16px] text-(--color-text-neutral-secondary)">
                  {production.affiliations.join(', ')}
                </p>
              )}

              <p className="text-[16px] text-(--color-text-neutral-secondary)">
                Tipo: {production.type.subcategory}
              </p>
            </div>

            {/* Vertical divider */}
            <div className="hidden lg:block w-px bg-gray-300 self-stretch mx-2" />

            {/* Right */}
            <div className="flex flex-row lg:flex-col gap-8 lg:gap-6 mt-6 lg:mt-0 lg:pl-10 lg:w-55 shrink-0">
              <div className="space-y-1">
                <p className="text-[16px] font-semibold text-(--color-text-neutral-secondary)">
                  Citas
                </p>
                <p
                  className="text-[56px] font-light leading-none text-center"
                  style={{ color: 'var(--color-text-brand-primary)' }}
                >
                  {production.citation_count}
                </p>
              </div>

              {production.doi && (
                <div className="space-y-2">
                  <p className="text-[16px] font-semibold text-(--color-text-neutral-secondary)">
                    Métricas alternativas
                  </p>
                  <div className="flex justify-center">
                    <a
                      href={`https://plu.mx/plum/a/?doi=${production.doi}`}
                      data-hide-when-empty="true"
                      className="plumx-plum-print-popup"
                      data-site="plum"
                      data-orientation="vertical"
                    >
                      {production.title}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Tabs — bg spans full width, content aligned to max-w ─────── */}
      <div className="bg-(--color-bg-neutral-tertiary)">
        <div className="max-w-7xl mx-auto space-y-8">
          <ScientificProductionTabs
            tabs={tabs}
            defaultActive="general"
            onChange={setActiveTab}
          />
        </div>
      </div>

      {/* ── Keywords title strip (gray, full-width) ────────────────────── */}
      {activeTab === 'keywords' && (
        <div className="bg-(--color-bg-neutral-secondary) px-6 lg:px-10 py-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[26px] font-normal text-(--color-text-neutral-primary)">
              Palabras claves
            </h2>
          </div>
        </div>
      )}

      {/* ── Tab content ────────────────────────────────────────────────── */}
      <section className="bg-(--color-bg-neutral-primary) px-6 lg:px-10 pt-12 pb-12">
        {/* Exact same inner container — aligns with tabs above */}
        <div className="max-w-7xl mx-auto">
          {/* ── General Information ──────────────────────────────────── */}
          {activeTab === 'general' && (
            <div className="flex flex-col lg:flex-row gap-12">
              <div className="flex-1 space-y-8">
                <div className="space-y-3">
                  <h3 className="text-[22px] font-normal text-(--color-text-neutral-primary)">
                    Resumen
                  </h3>
                  <p className="text-[18px] leading-[1.7] text-(--color-text-neutral-secondary)">
                    {production.abstract}
                  </p>
                </div>

                <div className="space-y-5">
                  <DetailRow label="Estado:" value="Publicada" />
                  {production.journal && (
                    <DetailRow label="Revista:" value={production.journal} />
                  )}
                  <DetailRow
                    label="Año de publicación:"
                    value={String(production.publication_year)}
                  />
                </div>
              </div>

              {/* Access sidebar */}
              <div className="lg:w-65 shrink-0 space-y-4">
                <p className="text-[18px] font-medium text-(--color-text-neutral-primary)">
                  Acceso
                </p>

                {production.open_access && (
                  <div className="flex items-center gap-2">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-green-600 shrink-0"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                    </svg>
                    <span className="text-[16px] text-green-700">Acceso abierto</span>
                  </div>
                )}

                {production.doi && (
                  <a
                    href={`https://doi.org/${production.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2 text-[15px] break-all hover:underline"
                    style={{ color: 'var(--color-text-brand-primary)' }}
                  >
                    <DoiBadge />
                    {production.doi}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* ── Keywords ───────────────────────────────────────── */}
          {activeTab === 'keywords' && (
            <div className="space-y-8">
              <h3
                className="text-[1.25rem] leading-7 font-normal"
                style={{ color: '#0F0F0F' }}
              >
                Categoría
              </h3>
              <div className="flex flex-wrap gap-2 pb-8">
                {production.keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-full px-4 py-1.5 text-xs font-medium text-white"
                    style={{ backgroundColor: 'var(--color-bg-info-subtle)' }}
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-10">
      <p
        className="text-[18px] leading-[1.6] shrink-0 sm:w-45"
        style={{ color: 'var(--color-text-neutral-secondary)' }}
      >
        {label}
      </p>
      <p
        className="text-[18px] leading-[1.6]"
        style={{ color: 'var(--color-text-neutral-secondary)' }}
      >
        {value}
      </p>
    </div>
  );
}
