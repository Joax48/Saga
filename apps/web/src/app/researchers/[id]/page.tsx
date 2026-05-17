'use client';

import { useState, useEffect } from 'react';
import Breadcrumb from '../../../components/Breadcrumb';
import DetailNavbar from '../../../components/DetailNavbar';
import Image from 'next/image';
import Link from 'next/link';

import {
  ExternalLink,
  Link2,
  Globe,
  Users,
  Tag,
  BookOpen,
  Briefcase,
} from 'lucide-react';
import { getResearcherProfile } from '../../../services/researchers';
import { ProductionCard } from '../../scientific-productions/components';
import ProjectListItem from '../../projects/components/ProjectListItem';
import type { SummaryScientificProduction } from '../../../types';
import type {
  ResearcherProfile,
  ResearcherScientificOutput,
} from '../../../types/researcher-profile';

interface ResearchersDetailPageProps {
  params: { id: string };
}

const profileSections = [
  { id: 'personal', name: 'Perfil Personal', icon: <Users size={18} /> },
  { id: 'keywords', name: 'Palabras clave', icon: <Tag size={18} /> },
  { id: 'production', name: 'Producción científica', icon: <BookOpen size={18} /> },
  { id: 'projects', name: 'Proyectos', icon: <Briefcase size={18} /> },
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

  if (loading) {
    return <div className="p-6">Cargando...</div>;
  }

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

  const productions = profile.scientificOutputs.map(toSummaryScientificProduction);
  const projects = profile.projects;

  return (
    <main className="min-h-screen bg-[var(--color-bg-neutral-primary)]">
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Breadcrumb
            items={[{ label: 'Perfiles', href: '/researchers' }, { label: fullName }]}
          />

          <div className="mt-8 flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            <div className="relative shrink-0 w-20 h-20 md:w-44 md:h-44 overflow-hidden rounded-2xl bg-slate-100">
              <Image
                src={photo}
                alt={fullName}
                fill
                sizes="(max-width: 768px) 80px, 176px"
                className="object-cover"
              />
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
                <h1 className="text-[32px] font-normal text-[var(--color-text-neutral-primary)] truncate">
                  {fullName}
                </h1>
              </div>

              {profile.alternativeNames.length > 0 && (
                <p className="text-[16px] text-[var(--color-text-neutral-secondary)]">
                  También conocido como:{' '}
                  {profile.alternativeNames.map(formatAlternativeName).join(' · ')}
                </p>
              )}

              {profile.ceaCategory && (
                <p className="text-[16px] text-[var(--color-text-neutral-secondary)]">
                  {profile.ceaCategory}
                </p>
              )}

              <div className="space-y-1">
                <p
                  className="text-[16px] font-semibold"
                  style={{ color: 'var(--color-text-neutral-secondary)' }}
                >
                  Unidad base
                </p>
                {profile.baseUnit ? (
                  <p
                    className="text-[16px]"
                    style={{ color: 'var(--color-text-brand-primary)' }}
                  >
                    {profile.baseUnit}
                  </p>
                ) : (
                  <p
                    className="text-[16px]"
                    style={{ color: 'var(--color-text-neutral-secondary)' }}
                  >
                    Sin unidad base registrada
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <p
                  className="text-[16px] font-semibold"
                  style={{ color: 'var(--color-text-neutral-secondary)' }}
                >
                  Unidades asociadas
                </p>
                {profile.linkedUnits.length > 0 ? (
                  <p className="text-[16px]">
                    {profile.linkedUnits.map((unit, idx) => (
                      <span key={unit.id}>
                        {idx > 0 && ', '}
                        <Link
                          href={`/units/${unit.id}`}
                          className="hover:underline"
                          style={{ color: 'var(--color-text-brand-primary)' }}
                        >
                          {unit.name}
                        </Link>
                      </span>
                    ))}
                  </p>
                ) : (
                  <p
                    className="text-[16px]"
                    style={{ color: 'var(--color-text-neutral-secondary)' }}
                  >
                    Sin unidades asociadas registradas
                  </p>
                )}
              </div>

              <div className="space-y-1 pt-4">
                <p
                  className="text-[16px] font-semibold"
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
                    className="text-[16px]"
                    style={{ color: 'var(--color-text-neutral-secondary)' }}
                  >
                    Sin enlaces de interés asociados
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[var(--color-bg-neutral-secondary)]">
        <DetailNavbar
          categories={profileSections}
          defaultActive="personal"
          onCategoryChange={setActiveSection}
          containerClassName="max-w-7xl mx-auto flex items-center px-6 h-16"
          itemClassName="flex items-center gap-2 px-4 h-full border-b-2 border-transparent text-[16px] text-[var(--color-text-neutral-secondary)] transition cursor-pointer hover:text-[var(--color-text-neutral-primary)]"
          activeItemClassName="border-b-2 border-[var(--color-text-brand-primary)] text-[var(--color-text-brand-primary)] font-medium"
          hideSectionTitle
        />

        <div className="max-w-7xl mx-auto px-6 py-8">
          {activeSection === 'personal' && (
            <section className="space-y-8">
              <div>
                <h3 className="text-[22px] font-normal text-[var(--color-text-neutral-primary)] mb-4">
                  Información
                </h3>
                <div className="space-y-4 text-[16px]">
                  <div>
                    <p
                      className="text-[16px] font-semibold mb-1"
                      style={{ color: 'var(--color-text-neutral-secondary)' }}
                    >
                      Unidad base
                    </p>
                    {profile.baseUnit ? (
                      <p style={{ color: 'var(--color-text-brand-primary)' }}>
                        {profile.baseUnit}
                      </p>
                    ) : (
                      <span style={{ color: 'var(--color-text-neutral-secondary)' }}>
                        Sin unidad base registrada
                      </span>
                    )}
                  </div>

                  <div>
                    <p
                      className="text-[16px] font-semibold mb-1"
                      style={{ color: 'var(--color-text-neutral-secondary)' }}
                    >
                      Unidades asociadas
                    </p>
                    {profile.linkedUnits.length > 0 ? (
                      <p className="text-[var(--color-text-neutral-primary)]">
                        {profile.linkedUnits.map((unit, idx) => (
                          <span key={unit.id}>
                            {idx > 0 && ', '}
                            <Link
                              href={`/units/${unit.id}`}
                              className="hover:underline"
                              style={{ color: 'var(--color-text-brand-primary)' }}
                            >
                              {unit.name}
                            </Link>
                          </span>
                        ))}
                      </p>
                    ) : (
                      <span style={{ color: 'var(--color-text-neutral-secondary)' }}>
                        Sin unidades asociadas registradas
                      </span>
                    )}
                  </div>

                  <div>
                    <p
                      className="text-[16px] font-semibold mb-1"
                      style={{ color: 'var(--color-text-neutral-secondary)' }}
                    >
                      Categoría
                    </p>
                    <p className="text-[var(--color-text-neutral-primary)]">
                      {profile.ceaCategory ?? (
                        <span style={{ color: 'var(--color-text-neutral-secondary)' }}>
                          No disponible
                        </span>
                      )}
                    </p>
                  </div>

                  <div>
                    <p
                      className="text-[16px] font-semibold mb-1"
                      style={{ color: 'var(--color-text-neutral-secondary)' }}
                    >
                      ORCID
                    </p>
                    <p className="text-[var(--color-text-neutral-primary)]">
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
                <h3 className="text-[22px] font-normal text-[var(--color-text-neutral-primary)] mb-4">
                  Formación académica
                </h3>
                {profile.education.length > 0 ? (
                  <ul className="space-y-3 text-[16px] text-[var(--color-text-neutral-primary)]">
                    {profile.education.map((edu, idx) => (
                      <li key={`${edu.degree}-${edu.institution}-${idx}`}>
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
                  <p className="text-[16px] text-[var(--color-text-neutral-secondary)]">
                    No hay formación académica registrada para este perfil.
                  </p>
                )}
              </div>

              <div>
                <h3 className="text-[22px] font-normal text-[var(--color-text-neutral-primary)] mb-4">
                  Experiencia laboral relevante
                </h3>
                {profile.experience.length > 0 ? (
                  <ul className="space-y-3 text-[16px] text-[var(--color-text-neutral-primary)]">
                    {profile.experience.map((exp, idx) => (
                      <li key={`${exp.position}-${exp.organization}-${idx}`}>
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
                  <p className="text-[16px] text-[var(--color-text-neutral-secondary)]">
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
              {productions.length > 0 ? (
                <div className="space-y-4">
                  {productions.map((production) => (
                    <ProductionCard key={production.id} production={production} />
                  ))}
                </div>
              ) : (
                <p className="text-[16px] text-[var(--color-text-neutral-secondary)]">
                  No hay producción científica registrada.
                </p>
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
                <p className="text-[16px] text-[var(--color-text-neutral-secondary)]">
                  No hay proyectos registrados.
                </p>
              )}
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
