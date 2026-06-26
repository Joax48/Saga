'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronUp, FileText, Tag, Globe } from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import BackButton from '@/components/BackButton';
import type { Category } from '@/components/DetailNavbar';
import DetailNavbar from '@/components/DetailNavbar';
import { getScientificProductionById } from '@/services/scientific-productions';
import type { ScientificProduction } from '@/types';
import ApiErrorMessage from '@/components/ApiErrorMessage';
import { DetailPageSkeleton } from '@/components/skeletons/DetailPageSkeleton';
import CollaborationMapPreview from '@/components/CollaborationMapPreview';
import { countriesToCollaborationPoints } from '@/utils/collaboration-map';
import ScientificProductionPanel from './components/ScientificProductionPanel';

interface Props {
  params: { id: string };
}

// TODO: remove once backend returns real country data per author
const MOCK_COLLABORATION_COUNTRIES = [
  { country: 'Costa Rica', count: 3 },
  { country: 'Estados Unidos', count: 5 },
  { country: 'España', count: 2 },
  { country: 'México', count: 2 },
  { country: 'Brasil', count: 1 },
  { country: 'Alemania', count: 1 },
  { country: 'Francia', count: 1 },
];

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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setLoadError(null);
    setNotFound(false);
    getScientificProductionById(params.id)
      .then(setProduction)
      .catch((error) => {
        console.error('Error loading scientific production detail:', error);
        setLoadError(
          'No se pudo cargar la producción científica. Intenta nuevamente más tarde.',
        );
      })
      .finally(() => setIsLoading(false));
  }, [params.id]);

  useEffect(() => {
    const handleScroll = () => setShowScrollTopButton(window.scrollY > 400);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  if (isLoading) return <DetailPageSkeleton />;

  if (loadError) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <ApiErrorMessage message={loadError} />
      </main>
    );
  }

  if (notFound || !production) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-body-lg text-[var(--color-text-neutral-secondary)]">
          Producción científica no encontrada.
        </p>
      </main>
    );
  }

  const breadcrumbTitle =
    production.title.length > 50
      ? production.title.slice(0, 50).trimEnd() + '...'
      : production.title;

  const categories: Category[] = [
    {
      id: 'general',
      name: 'Información general',
      sectionTitle: 'Información general',
    },
    {
      id: 'keywords',
      name: 'Palabras clave',
      sectionTitle: 'Palabras claves',
    },
    {
      id: 'collaborations',
      name: 'Redes de colaboración',
      sectionTitle: 'Colaboradores',
    },
  ];

  return (
    <main className="bg-[var(--color-bg-neutral-secondary)]">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <section className="bg-[var(--color-bg-neutral-primary)] px-6 lg:px-10 pt-10 pb-18">
        <div className="max-w-7xl mx-auto space-y-8">
          <Breadcrumb
            items={[
              { label: 'Producción científica', href: '/scientific-productions' },
              { label: breadcrumbTitle },
            ]}
          />

          <BackButton
            fallbackHref="/scientific-productions"
            ariaLabel="Volver al listado de producciones científicas"
          />

          <div className="flex flex-col lg:flex-row">
            {/* Left */}
            <div className="flex-1 space-y-4 lg:pr-10">
              <h1 className="text-h3 font-bold text-[var(--color-text-neutral-primary)]">
                {production.title}
              </h1>

              <p className="text-h5 leading-relaxed">
                {production.ucrAuthors.map((author, index) => (
                  <span key={`ucr-${author.id}`}>
                    <Link
                      href={`/researchers/${encodeURIComponent(author.id)}`}
                      className="text-h5 hover:underline"
                      style={{ color: 'var(--color-text-brand-primary)' }}
                    >
                      {author.name}
                    </Link>
                    {index < production.ucrAuthors.length - 1 ||
                    production.externalAuthors.length > 0 ? (
                      <span className="text-h5 text-[var(--color-text-neutral-secondary)]">
                        {', '}
                      </span>
                    ) : null}
                  </span>
                ))}
                {production.externalAuthors.length > 0 && (
                  <>
                    {production.externalAuthors.map((author, index) => (
                      <span key={`external-${author.id}`}>
                        <span className="text-body-lg text-[var(--color-text-neutral-primary)]">
                          {author.name}
                        </span>
                        {index < production.externalAuthors.length - 1 ? (
                          <span className="text-body-lg text-[var(--color-text-neutral-secondary)]">
                            {', '}
                          </span>
                        ) : null}
                      </span>
                    ))}
                  </>
                )}
              </p>

              {production.unit && (
                <p>
                  <Link
                    href="/units"
                    className="text-body-lg hover:underline"
                    style={{ color: 'var(--color-text-brand-primary)' }}
                  >
                    {production.unit}
                  </Link>
                </p>
              )}

              {production.affiliations.length > 0 && (
                <p className="text-body-lg text-[var(--color-text-neutral-secondary)]">
                  {production.affiliations.join(', ')}
                </p>
              )}

              <p className="text-body-lg text-[var(--color-text-neutral-secondary)]">
                Tipo: {production.type}
              </p>
            </div>

            {/* Right */}
            <ScientificProductionPanel
              production_title={production.title}
              production_doi={production.doi}
              production_source={production.source}
              citation_count={production.citationCount}
            />
          </div>
        </div>
      </section>

      {/* ── Tab content ────────────────────────────────────────────────── */}
      <section>
        <div className="bg-[var(--color-bg-neutral-secondary)] pb-15">
          <DetailNavbar
            categories={categories}
            defaultActive={activeTab}
            onCategoryChange={(id) => setActiveTab(id)}
          />
          <div className="max-w-6xl mx-auto px-6 pt-10 lg:px-10">
            {/* ── General Information ──────────────────────────────────── */}
            {activeTab === 'general' && (
              <div className="flex flex-col lg:flex-row gap-12">
                <div className="flex-1 space-y-8">
                  <div className="space-y-3">
                    <h3 className="text-h3 font-bold text-[var(--color-text-neutral-primary)]">
                      Resumen
                    </h3>
                    <p className="text-body-lg text-[var(--color-text-neutral-secondary)]">
                      {production.abstract}
                    </p>
                  </div>

                  <div className="space-y-5">
                    <DetailRow label="Estado" value="Publicada" />
                    {production.journal && (
                      <DetailRow label="Revista" value={production.journal} />
                    )}
                    <DetailRow
                      label="Año de publicación"
                      value={String(production.publicationYear)}
                    />
                  </div>
                </div>

                {/* Access sidebar */}
                <div className="lg:w-65 shrink-0 space-y-4">
                  <p className="text-h4 font-bold text-[var(--color-text-neutral-primary)]">
                    Acceso
                  </p>

                  {production.openAccess && (
                    <div className="flex items-center gap-2">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-body-lg text-green-600 shrink-0"
                      >
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                      </svg>
                      <span className="text-body-lg text-green-700">Acceso abierto</span>
                    </div>
                  )}

                  {production.doi && (
                    <a
                      href={`https://doi.org/${production.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-2 text-body-lg break-all hover:underline"
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
                {production.keywords.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pb-8">
                    {production.keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="inline-flex items-center rounded-full bg-[var(--color-bg-info-subtle)] px-4 py-2 text-body-md text-white"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-16">
                    <p className="text-body-lg text-[var(--color-text-neutral-secondary)]">
                      No hay palabras clave asociadas.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ── Collaborations map ──────────────────────────────── */}
            {activeTab === 'collaborations' && (
              <div className="pb-8">
                <CollaborationMapPreview
                  title="Colaboradores por país"
                  subtitle="Distribución geográfica de los autores colaboradores de esta producción científica."
                  scopeLabel={`${production.authors.length} autor${production.authors.length !== 1 ? 'es' : ''}`}
                  points={countriesToCollaborationPoints(
                    MOCK_COLLABORATION_COUNTRIES,
                    production.authors.length,
                  )}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {showScrollTopButton && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-bg-info-subtle)] text-white shadow-lg transition-transform hover:scale-110"
          aria-label="Volver al inicio"
        >
          <ChevronUp size={20} strokeWidth={2} />
        </button>
      )}
    </main>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-10">
      <p
        className="text-body-lg font-bold shrink-0 sm:w-45"
        style={{ color: 'var(--color-text-neutral-primary)' }}
      >
        {label}
      </p>
      <p
        className="text-body-lg"
        style={{ color: 'var(--color-text-neutral-secondary)' }}
      >
        {value}
      </p>
    </div>
  );
}
