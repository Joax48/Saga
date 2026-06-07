/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import Breadcrumb from '@/components/Breadcrumb';
import CategoriesNavigation, { Category } from '@/components/DetailNavbar';
import { getProjectById } from '@/services/projects';
import type { Project } from '@/services/projects';
import type { Researcher } from '@/types/researcher-data';
import ApiErrorMessage from '@/components/ApiErrorMessage';
import { DetailPageSkeleton } from '@/components/skeletons/DetailPageSkeleton';
import ResearchersCardsGrid from '../../researchers/components/ResearchersCardsGrid';

const PROFILES_PAGE_SIZE = 18;

interface ProjectsDetailPageProps {
  params: { id: string };
}

function getInitials(name: string): string {
  const parts = name
    .split(' ')
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) return 'P';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function getAvatarTone(seed: string): string {
  const tones = [
    'from-[#DDEBFF] to-[#BFD8FF] text-[#0A4A8A]',
    'from-[#E4F4FF] to-[#CDEBFF] text-[#0A4A8A]',
    'from-[#E9F7E7] to-[#CDEFC8] text-[#1F5C2D]',
    'from-[#F8ECFF] to-[#EAD8FF] text-[#5B2D80]',
  ];

  const hash = [...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return tones[hash % tones.length];
}

function formatDate(date?: string): string | null {
  if (!date) return null;

  const normalizedDate = `${date}T00:00:00`;
  const parsedDate = new Date(normalizedDate);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat('es-CR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(parsedDate);
}

function formatParticipationPeriod(startDate?: string, endDate?: string): string | null {
  const formattedStartDate = formatDate(startDate);
  const formattedEndDate = formatDate(endDate);

  if (formattedStartDate && formattedEndDate) {
    return `${formattedStartDate} - ${formattedEndDate}`;
  }

  if (formattedStartDate) {
    return `Desde ${formattedStartDate}`;
  }

  if (formattedEndDate) {
    return `Hasta ${formattedEndDate}`;
  }

  return null;
}

function mapAssociatedProfileToResearcher(
  profile: Project['associatedProfiles'][number],
): Researcher {
  return {
    id: profile.id,
    idUcrProfile: null,
    baseUnit: '',
    name: profile.name,
    firstSurname: '',
    secondSurname: '',
    ceaCategory: null,
    institution: null,
    country: null,
    institutions: [],
    orcidId: null,
    linkedin: null,
    researchGate: null,
    scopus: null,
    photoUrl: null,
    profileType: 'UCR',
    linkedUnits: [],
    workUnits: [],
    participationStartDate: profile.participationStartDate,
    participationEndDate: profile.participationEndDate,
  };
}

export default function ProjectsDetailPage({ params }: ProjectsDetailPageProps) {
  const [activeTab, setActiveTab] = useState('general');
  const [profilesPage, setProfilesPage] = useState(1);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      setIsLoading(true);
      try {
        const data = await getProjectById(params.id);
        setProject(data);
        setLoadError(null);
      } catch (error) {
        console.error('Error loading project detail:', error);
        setProject(null);
        setLoadError('No se pudo cargar el proyecto. Intenta nuevamente más tarde.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [params.id]);

  useEffect(() => {
    setProfilesPage(1);
  }, [params.id]);

  const categories: Category[] = [
    {
      id: 'general',
      name: 'Información general',
      sectionTitle: 'Detalles del proyecto',
    },
    {
      id: 'profiles',
      name: 'Perfiles asociados',
      sectionTitle: 'Perfiles',
    },
    {
      id: 'keywords',
      name: 'Palabras claves',
      sectionTitle: 'Palabras claves',
    },
  ];

  if (isLoading) return <DetailPageSkeleton />;

  if (loadError) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <ApiErrorMessage message={loadError} />
      </main>
    );
  }

  if (!project) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-[18px] text-(--color-text-neutral-secondary)">
          Proyecto no encontrado.
        </p>
      </main>
    );
  }

  const managerHref = project.managerId
    ? `/researchers/${project.managerId}`
    : `/researchers?q=${encodeURIComponent(project.manager)}`;
  const managerParticipationPeriod = formatParticipationPeriod(
    project.managerParticipationStartDate,
    project.managerParticipationEndDate,
  );

  const disciplinesText =
    project.disciplines.length > 0
      ? project.disciplines.join(', ')
      : 'Sin disciplinas registradas';

  const associatedResearchers: Researcher[] = project.associatedProfiles.map(
    mapAssociatedProfileToResearcher,
  );
  const totalProfilePages = Math.max(
    1,
    Math.ceil(associatedResearchers.length / PROFILES_PAGE_SIZE),
  );
  const safeProfilesPage = Math.min(Math.max(1, profilesPage), totalProfilePages);
  const paginatedAssociatedResearchers = associatedResearchers.slice(
    (safeProfilesPage - 1) * PROFILES_PAGE_SIZE,
    safeProfilesPage * PROFILES_PAGE_SIZE,
  );

  return (
    <main className="bg-base-100 min-h-screen flex flex-col">
      <section className="px-6 lg:px-10 pt-6 pb-8">
        <div className="max-w-6xl mx-auto space-y-5">
          <Breadcrumb
            items={[
              { label: 'Proyectos', href: '/projects' },
              { label: `${project.code}` },
            ]}
          />

          <div className="w-full px-0 py-1">
            <div className="space-y-5">
              <h1 className="text-h3">
                {project.code} | {project.title}
              </h1>

              <div className="space-y-3 text-body-lg text-[var(--color-text-neutral-secondary)]">
                <p>
                  <a
                    href={managerHref}
                    className="text-[var(--color-text-brand-primary)] hover:underline"
                  >
                    {project.manager}
                  </a>{' '}
                  <span>(Investigador principal).</span>
                </p>

                {managerParticipationPeriod && (
                  <p>
                    <span className="font-medium text-[var(--color-text-neutral-primary)]">
                      Colaboraci&oacute;n:
                    </span>{' '}
                    {managerParticipationPeriod}
                  </p>
                )}

                <p className="text-[var(--color-text-brand-primary)]">
                  {project.institute}
                </p>

                <p>
                  <span className="font-medium text-[var(--color-text-neutral-primary)]">
                    Disciplinas:
                  </span>{' '}
                  {disciplinesText}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--color-bg-neutral-tertiary)]">
        <CategoriesNavigation
          categories={categories}
          defaultActive="general"
          onCategoryChange={setActiveTab}
          hideSectionTitle
        />
      </section>

      <section className="bg-[var(--color-bg-neutral-secondary)] px-6 lg:px-10 py-12 flex-1">
        <div className="max-w-6xl mx-auto h-full">
          {activeTab === 'general' && (
            <div className="space-y-10">
              <div className="space-y-6">
                <h3 className="text-h4 font-semibold text-[var(--color-text-neutral-primary)]">
                  Descripción
                </h3>

                <p className="text-body-lg text-[var(--color-text-neutral-secondary)] max-w-none">
                  {project.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-16 pt-2">
                <DetailRow label="Tipo de Investigación" value={project.researchType} />
                <DetailRow label="Tipo de Proyecto" value={project.projectType} />
                <DetailRow label="Tipo de Financiamiento" value={project.fundingType} />
                <DetailRow label="Estado" value={project.status} />
                <DetailRow
                  label="Vigencia"
                  value={`${project.startDate} → ${project.endDate}`}
                />
              </div>
            </div>
          )}

          {activeTab === 'profiles' && (
            <>
              {associatedResearchers.length > 0 ? (
                <ResearchersCardsGrid
                  researchers={paginatedAssociatedResearchers}
                  currentPage={safeProfilesPage}
                  totalPages={totalProfilePages}
                  onPageChange={setProfilesPage}
                />
              ) : (
                <div className="flex items-center justify-center py-16">
                  <p className="text-[16px] text-[var(--color-text-neutral-secondary)]">
                    No hay perfiles asociados.
                  </p>
                </div>
              )}
            </>
          )}

          {activeTab === 'keywords' && (
            <div className="space-y-10">
              {project.keywords.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {project.keywords.map((keyword) => (
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
                  <p className="text-[16px] text-[var(--color-text-neutral-secondary)]">
                    No hay palabras clave asociadas.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[260px_1fr] gap-2">
      <p className="text-body-lg font-medium text-[var(--color-text-neutral-primary)]">
        {label}
      </p>
      <p className="text-body-lg text-[var(--color-text-neutral-secondary)]">{value}</p>
    </div>
  );
}
