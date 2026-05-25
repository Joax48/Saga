'use client';

import { useState, useEffect } from 'react';
import Breadcrumb from '../../../components/Breadcrumb';
import DetailNavbar from '../../../components/DetailNavbar';
import Image from 'next/image';
import Link from 'next/link';

import { ExternalLink, Link2, Globe } from 'lucide-react';
import { getResearcherProfile } from '../../../services/researchers';
import { ResearcherDetailSkeleton } from '@/components/skeletons/DetailPageSkeleton';
import { ProductionCard } from '../../scientific-productions/components';
import ProjectListItem from '../../projects/components/ProjectListItem';
import MetricsPanel from '../components/MetricsPanel';
import type { SummaryScientificProduction } from '../../../types';
import type {
  ResearcherProfile,
  ResearcherScientificOutput,
} from '../../../types/researcher-profile';

interface ResearchersDetailPageProps {
  params: { id: string };
}

const profileSections = [
  {
    id: 'personal',
    name: 'Perfil Personal',
  },
  // {
  //   id: 'keywords',
  //   name: 'Palabras clave',
  // },
  {
    id: 'production',
    name: 'Producción científica',
  },
  {
    id: 'projects',
    name: 'Proyectos',
  },
];

// Builds the profile links array from the researcher's real data,
// only including links that are not null.
function buildProfileLinks(researcher: ResearcherProfile) {
  const links = [];

  if (researcher.orcidId) {
    links.push({
      label: 'ORCID',
      href: researcher.orcidId.startsWith('http')
        ? researcher.orcidId
        : `https://orcid.org/${researcher.orcidId}`,
      icon: <Globe size={16} />,
    });
  }

  if (researcher.linkedin) {
    links.push({
      label: 'LinkedIn',
      href: researcher.linkedin,
      icon: <Link2 size={16} />,
    });
  }

  if (researcher.researchGate) {
    links.push({
      label: 'ResearchGate',
      href: researcher.researchGate,
      icon: <ExternalLink size={16} />,
    });
  }

  if (researcher.scopus) {
    links.push({
      label: 'Scopus',
      href: researcher.scopus,
      icon: <ExternalLink size={16} />,
    });
  }

  return links;
}

function getAvatarUrl(...nameParts: (string | null)[]): string {
  const fullName = nameParts.filter(Boolean).join(' ');
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0D8ABC&color=fff&size=200`;
}

function formatAlternativeName(altName: {
  name: string;
  firstSurname: string;
  lastSurname: string | null;
}): string {
  return [altName.name, altName.firstSurname, altName.lastSurname]
    .filter(Boolean)
    .join(' ');
}

// Adapts a backend ResearcherScientificOutput to the SummaryScientificProduction
// shape consumed by the existing ProductionCard component, preserving the visual
// design without forking the component.
function toSummaryScientificProduction(
  output: ResearcherScientificOutput,
): SummaryScientificProduction {
  return {
    id: output.id,
    title: output.title,
    authors: output.authors,
    type: {
      category: output.type.category,
      subcategory: output.type.subcategory,
    },
    open_access: output.openAccess,
    publication_year: output.publicationYear,
    doi: output.doi ?? '',
    journal: output.journal ?? undefined,
    volume: output.volume != null ? Number(output.volume) : undefined,
    issue: output.issue != null ? Number(output.issue) : undefined,
    pages: output.pages ?? undefined,
    keywords: output.keywords,
  };
}

function formatDateOnly(value: string | null): string {
  if (!value) return '';
  // Strip the time portion; the backend returns ISO timestamps from Oracle.
  return value.slice(0, 10);
}

export default function ResearchersDetailPage({ params }: ResearchersDetailPageProps) {
  const [activeSection, setActiveSection] = useState('personal');
  const [profile, setProfile] = useState<ResearcherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showAllLinkedUnitsHeader, setShowAllLinkedUnitsHeader] = useState(false);
  const [showAllLinkedUnitsSection, setShowAllLinkedUnitsSection] = useState(false);
  const [selectedYearFilter, setSelectedYearFilter] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getResearcherProfile(params.id);
        setProfile(data);
      } catch (error) {
        console.error(error);
        setLoadError('No se pudo cargar el perfil.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [params.id]);

  if (loading) return <ResearcherDetailSkeleton />;

  if (loadError) {
    return <div className="p-6">{loadError}</div>;
  }

  if (!profile) {
    return <div className="p-6">Perfil no encontrado.</div>;
  }

  const fullName = [profile.name, profile.firstSurname, profile.secondSurname]
    .filter(Boolean)
    .join(' ');

  const profileLinks = buildProfileLinks(profile);

  const photo =
    profile.photoUrl ||
    getAvatarUrl(profile.name, profile.firstSurname, profile.secondSurname);

  const allProductions = profile.scientificOutputs.map(toSummaryScientificProduction);
  const productions = selectedYearFilter
    ? allProductions.filter((p) => p.publication_year === selectedYearFilter)
    : allProductions;
  const projects = profile.projects;

  const handleYearSelected = (year: number | null) => {
    setSelectedYearFilter(year);
    if (year) {
      const productionTab = document.getElementById('navbar-tab-production');
      productionTab?.click();

      const navbarEl = document.getElementById('profile-detail-navbar');
      if (navbarEl) {
        const navbar = document.querySelector('header') ?? document.querySelector('nav');
        const navbarHeight = navbar ? navbar.getBoundingClientRect().height : 0;
        const top = navbarEl.getBoundingClientRect().top + window.scrollY - navbarHeight;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }
  };

  return (
    <main className="min-h-screen bg-[var(--color-bg-neutral-secondary)]">
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <Breadcrumb
            items={[{ label: 'Perfiles', href: '/researchers' }, { label: fullName }]}
          />

          <div className="mt-6 sm:mt-8 flex flex-col lg:flex-row gap-6 lg:gap-8 lg:items-start">
            <div className="flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-8 items-start flex-1 min-w-0">
              <div className="relative shrink-0 w-24 h-24 sm:w-32 sm:h-32 md:w-44 md:h-44 overflow-hidden rounded-2xl bg-slate-100 mx-auto md:mx-0">
                <Image
                  src={photo}
                  alt={fullName}
                  fill
                  sizes="(max-width: 640px) 96px, (max-width: 768px) 128px, 176px"
                  className="object-cover"
                />
              </div>

              <div className="flex-1 min-w-0 w-full space-y-1">
                <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
                  <h1 className="text-2xl sm:text-3xl md:text-[32px] font-normal text-[var(--color-text-neutral-primary)] break-words">
                    {fullName}
                  </h1>
                </div>

                {profile.alternativeNames.length > 0 && (
                  <p className="text-sm sm:text-[16px] text-[var(--color-text-neutral-secondary)] break-words">
                    También conocido como:{' '}
                    {profile.alternativeNames.map(formatAlternativeName).join(' · ')}
                  </p>
                )}

                {profile.ceaCategory && (
                  <p className="text-sm sm:text-[16px] text-[var(--color-text-neutral-secondary)]">
                    {profile.ceaCategory}
                  </p>
                )}

                <div className="space-y-1">
                  <p
                    className="text-sm sm:text-[16px] font-semibold"
                    style={{ color: 'var(--color-text-neutral-secondary)' }}
                  >
                    Unidad base
                  </p>
                  {profile.baseUnit ? (
                    (() => {
                      const baseUnitMatch = profile.linkedUnits.find(
                        (u) => u.name === profile.baseUnit,
                      );
                      return (
                        <p className="text-sm sm:text-[16px] break-words">
                          <Link
                            href={baseUnitMatch ? `/units/${baseUnitMatch.id}` : '/units'}
                            className="hover:underline"
                            style={{ color: 'var(--color-text-brand-primary)' }}
                          >
                            {profile.baseUnit}
                          </Link>
                        </p>
                      );
                    })()
                  ) : (
                    <p
                      className="text-sm sm:text-[16px]"
                      style={{ color: 'var(--color-text-neutral-secondary)' }}
                    >
                      Sin unidad base registrada
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <p
                    className="text-sm sm:text-[16px] font-semibold"
                    style={{ color: 'var(--color-text-neutral-secondary)' }}
                  >
                    Unidades de Colaboración
                  </p>
                  {profile.linkedUnits.length > 0 ? (
                    <>
                      <ul className="list-disc pl-5 text-sm sm:text-[16px] space-y-1">
                        {(showAllLinkedUnitsHeader
                          ? profile.linkedUnits
                          : profile.linkedUnits.slice(0, 3)
                        ).map((unit) => (
                          <li key={unit.id} className="break-words">
                            <Link
                              href={`/units/${unit.id}`}
                              className="hover:underline"
                              style={{ color: 'var(--color-text-brand-primary)' }}
                            >
                              {unit.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                      {profile.linkedUnits.length > 3 && (
                        <button
                          type="button"
                          onClick={() => setShowAllLinkedUnitsHeader((prev) => !prev)}
                          className="text-sm hover:underline cursor-pointer mt-1"
                          style={{ color: 'var(--color-text-brand-primary)' }}
                        >
                          {showAllLinkedUnitsHeader
                            ? 'Ver menos'
                            : `Ver todas (${profile.linkedUnits.length})`}
                        </button>
                      )}
                    </>
                  ) : (
                    <p
                      className="text-sm sm:text-[16px]"
                      style={{ color: 'var(--color-text-neutral-secondary)' }}
                    >
                      Sin unidades de colaboración registradas
                    </p>
                  )}
                </div>

                <div className="space-y-1 pt-4">
                  <p
                    className="text-sm sm:text-[16px] font-semibold"
                    style={{ color: 'var(--color-text-neutral-secondary)' }}
                  >
                    Enlaces de interés
                  </p>
                  {profileLinks.length > 0 ? (
                    <div className="flex items-center gap-3 pt-1">
                      {profileLinks.map((link) => (
                        <a
                          key={link.label}
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--color-bg-brand-primary)] text-white shrink-0 hover:bg-[var(--color-bg-brand-primary-hover)] transition-colors"
                          title={link.label}
                        >
                          {link.icon}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p
                      className="text-sm sm:text-[16px]"
                      style={{ color: 'var(--color-text-neutral-secondary)' }}
                    >
                      Sin enlaces de interés asociados
                    </p>
                  )}
                </div>
              </div>
            </div>

            <MetricsPanel
              scientificOutputs={profile.scientificOutputs}
              onYearSelected={handleYearSelected}
            />
          </div>
        </div>
      </div>

      <div id="profile-detail-navbar" className="bg-[var(--color-bg-neutral-secondary)]">
        <DetailNavbar
          categories={profileSections}
          defaultActive="personal"
          onCategoryChange={setActiveSection}
          containerClassName="max-w-7xl mx-auto flex items-center px-4 sm:px-6 h-16"
          itemClassName="flex items-center gap-2 px-4 h-full border-b-2 border-transparent text-[16px] text-[var(--color-text-neutral-secondary)] transition cursor-pointer hover:text-[var(--color-text-neutral-primary)]"
          activeItemClassName="border-b-2 border-[var(--color-text-brand-primary)] text-[var(--color-text-brand-primary)] font-medium"
          hideSectionTitle
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 min-h-[20vh]">
          {activeSection === 'personal' && (
            <section className="space-y-6 sm:space-y-8">
              <div>
                <h3 className="text-xl sm:text-[22px] font-normal text-[var(--color-text-neutral-primary)] mb-4">
                  Información
                </h3>
                <div className="space-y-4 text-sm sm:text-[16px]">
                  <div>
                    <p
                      className="text-sm sm:text-[16px] font-semibold mb-1"
                      style={{ color: 'var(--color-text-neutral-secondary)' }}
                    >
                      Unidad base
                    </p>
                    {profile.baseUnit ? (
                      (() => {
                        const baseUnitMatch = profile.linkedUnits.find(
                          (u) => u.name === profile.baseUnit,
                        );
                        return (
                          <p>
                            <Link
                              href={
                                baseUnitMatch ? `/units/${baseUnitMatch.id}` : '/units'
                              }
                              className="hover:underline"
                              style={{ color: 'var(--color-text-brand-primary)' }}
                            >
                              {profile.baseUnit}
                            </Link>
                          </p>
                        );
                      })()
                    ) : (
                      <span style={{ color: 'var(--color-text-neutral-secondary)' }}>
                        Sin unidad base registrada
                      </span>
                    )}
                  </div>

                  <div>
                    <p
                      className="text-sm sm:text-[16px] font-semibold mb-1"
                      style={{ color: 'var(--color-text-neutral-secondary)' }}
                    >
                      Unidades de Colaboración
                    </p>
                    {profile.linkedUnits.length > 0 ? (
                      <>
                        <ul className="list-disc pl-5 space-y-1 text-[var(--color-text-neutral-primary)]">
                          {(showAllLinkedUnitsSection
                            ? profile.linkedUnits
                            : profile.linkedUnits.slice(0, 3)
                          ).map((unit) => (
                            <li key={unit.id} className="break-words">
                              <Link
                                href={`/units/${unit.id}`}
                                className="hover:underline"
                                style={{ color: 'var(--color-text-brand-primary)' }}
                              >
                                {unit.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                        {profile.linkedUnits.length > 3 && (
                          <button
                            type="button"
                            onClick={() => setShowAllLinkedUnitsSection((prev) => !prev)}
                            className="text-sm hover:underline cursor-pointer mt-1"
                            style={{ color: 'var(--color-text-brand-primary)' }}
                          >
                            {showAllLinkedUnitsSection
                              ? 'Ver menos'
                              : `Ver todas (${profile.linkedUnits.length})`}
                          </button>
                        )}
                      </>
                    ) : (
                      <span style={{ color: 'var(--color-text-neutral-secondary)' }}>
                        Sin unidades de colaboración registradas
                      </span>
                    )}
                  </div>

                  <div>
                    <p
                      className="text-sm sm:text-[16px] font-semibold mb-1"
                      style={{ color: 'var(--color-text-neutral-secondary)' }}
                    >
                      Categoría
                    </p>
                    <p className="text-[var(--color-text-neutral-primary)] break-words">
                      {profile.ceaCategory ?? (
                        <span style={{ color: 'var(--color-text-neutral-secondary)' }}>
                          No disponible
                        </span>
                      )}
                    </p>
                  </div>

                  <div>
                    <p
                      className="text-sm sm:text-[16px] font-semibold mb-1"
                      style={{ color: 'var(--color-text-neutral-secondary)' }}
                    >
                      ORCID
                    </p>
                    <p className="text-[var(--color-text-neutral-primary)] break-all">
                      {profile.orcidId ?? (
                        <span style={{ color: 'var(--color-text-neutral-secondary)' }}>
                          No disponible
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl sm:text-[22px] font-normal text-[var(--color-text-neutral-primary)] mb-4">
                  Formación académica
                </h3>
                {profile.education.length > 0 ? (
                  <ul className="space-y-3 text-sm sm:text-[16px] text-[var(--color-text-neutral-primary)]">
                    {profile.education.map((edu, idx) => (
                      <li
                        key={`${edu.degree}-${edu.institution}-${idx}`}
                        className="break-words"
                      >
                        <span className="font-bold">
                          {edu.degree}
                          {edu.fieldOfStudy ? ` en ${edu.fieldOfStudy}` : ''}
                        </span>
                        {edu.institution ? ` — ${edu.institution}` : ''}
                        {edu.country ? `, ${edu.country}` : ''}
                        {edu.graduationYear ? ` (${edu.graduationYear})` : ''}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm sm:text-[16px] text-[var(--color-text-neutral-secondary)]">
                    No hay formación académica registrada para este perfil.
                  </p>
                )}
              </div>

              <div>
                <h3 className="text-xl sm:text-[22px] font-normal text-[var(--color-text-neutral-primary)] mb-4">
                  Experiencia laboral relevante
                </h3>
                {profile.experience.length > 0 ? (
                  <ul className="space-y-3 text-sm sm:text-[16px] text-[var(--color-text-neutral-primary)]">
                    {profile.experience.map((exp, idx) => (
                      <li
                        key={`${exp.position}-${exp.organization}-${idx}`}
                        className="break-words"
                      >
                        <span className="font-bold">{exp.position}</span>
                        {exp.organization ? ` — ${exp.organization}` : ''}
                        {exp.startDate || exp.endDate ? (
                          <span className="text-[var(--color-text-neutral-secondary)]">
                            {' ('}
                            {formatDateOnly(exp.startDate)}
                            {' → '}
                            {formatDateOnly(exp.endDate) || 'Actual'}
                            {')'}
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm sm:text-[16px] text-[var(--color-text-neutral-secondary)]">
                    No hay experiencia laboral registrada para este perfil.
                  </p>
                )}
              </div>
            </section>
          )}

          {activeSection === 'keywords' && (
            <section className="space-y-4">
              {profile.keywords.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="px-3 py-1 rounded-full bg-[var(--color-bg-brand-primary)]/10 text-[var(--color-text-brand-primary)] text-[16px]"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[16px] text-[var(--color-text-neutral-secondary)]">
                  No hay palabras clave registradas para este perfil.
                </p>
              )}
            </section>
          )}

          {activeSection === 'production' && (
            <section className="space-y-4">
              {selectedYearFilter && (
                <div className="flex items-center gap-2 py-2">
                  <p className="text-xs text-[var(--color-text-neutral-secondary)]">
                    Filtrado por año:{' '}
                    <span className="font-semibold text-[var(--color-text-neutral-primary)]">
                      {selectedYearFilter}
                    </span>{' '}
                    ({productions.length}{' '}
                    {productions.length === 1 ? 'publicación' : 'publicaciones'})
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedYearFilter(null)}
                    className="text-xs hover:underline ml-2"
                    style={{ color: 'var(--color-text-brand-primary)' }}
                  >
                    ✕
                  </button>
                </div>
              )}
              {productions.length > 0 ? (
                <div className="space-y-4">
                  {productions.map((production) => (
                    <ProductionCard key={production.id} production={production} />
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-16">
                  <p className="text-[16px] text-[var(--color-text-neutral-secondary)]">
                    {selectedYearFilter
                      ? `No hay publicaciones registradas para ${selectedYearFilter}.`
                      : 'No hay producción científica registrada.'}
                  </p>
                </div>
              )}
            </section>
          )}

          {activeSection === 'projects' && (
            <section className="space-y-4">
              {projects.length > 0 ? (
                <div className="space-y-4">
                  {projects.map((project) => (
                    <ProjectListItem
                      key={project.id}
                      code={project.code}
                      title={project.name}
                      href={`/projects/${project.id}`}
                      manager={project.manager || 'Sin asignar'}
                      managerHref={
                        project.manager
                          ? `/researchers?q=${encodeURIComponent(project.manager)}`
                          : undefined
                      }
                      startDate={formatDateOnly(project.startDate)}
                      endDate={formatDateOnly(project.endDate)}
                      researchType={project.researchType ?? '—'}
                      actionType={project.projectType ?? '—'}
                      keywords={project.keywords}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-16">
                  <p className="text-[16px] text-[var(--color-text-neutral-secondary)]">
                    No hay proyectos registrados.
                  </p>
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
