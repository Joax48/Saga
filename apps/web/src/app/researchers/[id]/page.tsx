'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Breadcrumb from '../../../components/Breadcrumb';
import BackButton from '../../../components/BackButton';
import DetailNavbar from '../../../components/DetailNavbar';
import Image from 'next/image';
import Link from 'next/link';

import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  getResearcherProfile,
  getResearcherCollaborationCountries,
} from '../../../services/researchers';
import CollaborationMapPreview, {
  buildCollaborationPoints,
} from '@/components/CollaborationMapPreview';
import ApiErrorMessage from '@/components/ApiErrorMessage';
import { ResearcherDetailSkeleton } from '@/components/skeletons/DetailPageSkeleton';
import ProfileTypeBadge from '@/components/ProfileTypeBadge';
import { ProductionCard } from '../../scientific-productions/components/ProductionCard';
import ProjectListItem from '../../projects/components/ProjectListItem';
import MetricsPanel from '../components/MetricsPanel';
import Button from '@/components/Button';
import Pagination from '@/components/Pagination';
import { formatCeaCategory } from '@/utils/text';
import type { SummaryScientificProduction } from '../../../types';
import type {
  ResearcherProfile,
  ResearcherScientificOutput,
} from '../../../types/researcher-detail';

const DownloadInfoButton = dynamic(() => import('./components/DownloadInfoButton'), {
  ssr: false,
  loading: () => null,
});

interface ResearchersDetailPageProps {
  params: { id: string };
}

// External profile views are temporarily disabled — flip to true to re-enable
// the EXTERNAL rendering branches in this page.
const EXTERNAL_PROFILES_ENABLED = false;

const DETAIL_PAGE_SIZE = 10;

// Order of project statuses in the researcher profile's projects tab.
// Statuses not present in this list fall to the end (still sorted alphabetically
// among themselves). Matched case-insensitively against the backend label.
const PROJECT_STATUS_ORDER = ['terminado', 'en desarrollo', 'suspendido'];

function getProjectStatusPriority(status: string | null | undefined): number {
  if (!status) return PROJECT_STATUS_ORDER.length + 1;
  const idx = PROJECT_STATUS_ORDER.indexOf(status.trim().toLowerCase());
  return idx === -1 ? PROJECT_STATUS_ORDER.length : idx;
}

// Capitalizes the first letter of the project status label for display.
// Used for the group subheading in the researcher's projects tab.
function formatProjectStatusLabel(status: string | null | undefined): string {
  if (!status || !status.trim()) return 'Sin estado';
  const trimmed = status.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
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
    id: 'collaboration',
    name: 'Redes de colaboración',
  },
  {
    id: 'production',
    name: 'Producción científica',
  },
  {
    id: 'projects',
    name: 'Proyectos',
  },
];

// Official brand glyphs for the external profile links. Paths come from
// Simple Icons (CC0) and are rendered with `fill="currentColor"` so they pick
// up the white text color of the surrounding pill-shaped link button.
function OrcidIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 4.378c.525 0 .947.431.947.947 0 .525-.422.947-.947.947-.525 0-.946-.422-.946-.947 0-.516.421-.947.946-.947zm-.722 3.038h1.444v10.041H6.647V7.416zm3.562 0h3.9c3.712 0 5.344 2.653 5.344 5.025 0 2.578-2.016 5.025-5.325 5.025h-3.919V7.416zm1.444 1.303v7.444h2.297c3.272 0 4.022-2.484 4.022-3.722 0-2.016-1.284-3.722-4.097-3.722h-2.222z" />
    </svg>
  );
}

function LinkedInIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function ResearchGateIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19.586 0c-.818 0-1.508.19-2.073.565-.563.377-.97.936-1.213 1.68a3.193 3.193 0 0 0-.112.437 6.503 6.503 0 0 0-.078.53 31.99 31.99 0 0 0-.05.727c-.013.292-.022.737-.022 1.335 0 .595.009 1.041.022 1.333.013.292.03.535.05.727a4.94 4.94 0 0 0 .19.967c.241.742.65 1.303 1.214 1.679.563.377 1.255.567 2.073.567.818 0 1.51-.19 2.074-.567.564-.376.97-.937 1.214-1.679.04-.117.075-.236.107-.355.034-.117.067-.262.094-.43.026-.17.046-.376.06-.617a31.99 31.99 0 0 0 .051-.728c.011-.293.022-.738.022-1.336 0-.595-.011-1.04-.022-1.333a31.99 31.99 0 0 0-.05-.727 4.94 4.94 0 0 0-.19-.967c-.244-.744-.65-1.303-1.215-1.68C21.097.19 20.404 0 19.586 0zm0 1.553c.421 0 .77.106 1.046.32.275.213.485.515.628.904.027.075.05.156.07.243.02.087.038.196.054.323.017.13.029.288.038.476.01.187.018.43.024.724.007.295.01.66.01 1.094 0 .435-.003.8-.01 1.095-.006.295-.014.535-.024.722a4.95 4.95 0 0 1-.038.476 2.13 2.13 0 0 1-.124.567c-.143.388-.353.69-.628.904-.276.214-.625.32-1.046.32-.422 0-.77-.106-1.045-.32-.275-.213-.485-.516-.628-.904a3.234 3.234 0 0 1-.054-.243 4.85 4.85 0 0 1-.07-.323 8.7 8.7 0 0 1-.038-.476 19.476 19.476 0 0 1-.024-.722c-.007-.295-.01-.66-.01-1.095s.003-.799.01-1.094c.006-.294.014-.537.024-.724.01-.188.022-.346.038-.476.017-.127.035-.235.054-.323.02-.087.043-.168.07-.243.143-.388.353-.69.628-.904.275-.213.624-.32 1.045-.32zm-7.96 5.838c-1.04 0-1.974.137-2.802.412-.827.276-1.529.66-2.105 1.156-.576.494-1.017 1.083-1.323 1.766-.306.683-.46 1.43-.46 2.243 0 .849.144 1.62.435 2.314.291.694.706 1.286 1.244 1.776.539.49 1.187.866 1.946 1.13.759.262 1.604.394 2.535.394.689 0 1.353-.063 1.992-.187.638-.124 1.243-.31 1.815-.557v-5.355h-3.844v-1.99h6.235v8.737a9.92 9.92 0 0 1-2.71 1.32 9.927 9.927 0 0 1-3.05.47c-1.232 0-2.354-.177-3.367-.532-1.014-.355-1.879-.86-2.595-1.516a6.835 6.835 0 0 1-1.667-2.349c-.395-.91-.592-1.916-.592-3.018 0-1.085.205-2.085.615-3 .41-.916.989-1.706 1.736-2.37.748-.665 1.643-1.18 2.685-1.547 1.042-.367 2.198-.55 3.468-.55.74 0 1.434.062 2.083.187.65.124 1.252.296 1.806.516v2.094a8.07 8.07 0 0 0-1.806-.602 9.43 9.43 0 0 0-2.083-.224z" />
    </svg>
  );
}

function ScopusIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-1.247 17.514c-1.748 0-3.318-.34-4.71-1.025a6.717 6.717 0 0 1-3.21-3.014l1.262-.635c.628 1.196 1.523 2.075 2.685 2.617 1.162.543 2.547.815 4.155.815.93 0 1.642-.16 2.137-.479.494-.32.741-.762.741-1.305 0-.495-.197-.886-.59-1.18-.394-.293-1.005-.531-1.83-.74L7.964 11.7c-1.215-.31-2.094-.704-2.643-1.18-.55-.476-.825-1.131-.825-1.967 0-1.043.443-1.873 1.328-2.494.886-.62 2.064-.93 3.534-.93 1.494 0 2.823.288 3.99.864 1.167.575 2.121 1.36 2.862 2.352l-1.262.635c-.679-.869-1.498-1.53-2.46-1.984-.96-.455-2.07-.682-3.328-.682-.86 0-1.523.156-1.985.469-.464.312-.695.737-.695 1.275 0 .494.183.881.55 1.16.366.279.974.51 1.821.692l3.245.842c1.218.312 2.107.728 2.668 1.247.562.519.842 1.193.842 2.021 0 .985-.434 1.781-1.3 2.39-.866.61-1.998.914-3.394.914zm10.18-2.493c-.91 0-1.65-.74-1.65-1.65 0-.91.74-1.65 1.65-1.65.91 0 1.65.74 1.65 1.65 0 .91-.74 1.65-1.65 1.65z" />
    </svg>
  );
}

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
      icon: <OrcidIcon size={16} />,
    });
  }

  if (researcher.linkedin) {
    links.push({
      label: 'LinkedIn',
      href: researcher.linkedin,
      icon: <LinkedInIcon size={16} />,
    });
  }

  if (researcher.researchGate) {
    links.push({
      label: 'ResearchGate',
      href: researcher.researchGate,
      icon: <ResearchGateIcon size={16} />,
    });
  }

  if (researcher.scopus) {
    links.push({
      label: 'Scopus',
      href: researcher.scopus,
      icon: <ScopusIcon size={16} />,
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
    // The researcher output exposes author names only (no IDs), so the index is
    // used as a stable key; the displayed names are correct.
    authors: output.authors.map((name, index) => ({ id: index, name })),
    type: output.type.category,
    openAccess: output.openAccess,
    publicationYear: output.publicationYear,
    doi: output.doi ?? '',
    journal: output.journal ?? undefined,
    volume: output.volume != null ? Number(output.volume) : undefined,
    issue: output.issue != null ? Number(output.issue) : undefined,
    pages: output.pages ?? undefined,
    keywords: output.keywords.map((value, index) => ({ id: index, value })),
  };
}

function formatDateOnly(value: string | null): string {
  if (!value) return '';
  // Strip the time portion; the backend returns ISO timestamps from Oracle.
  return value.slice(0, 10);
}

interface UnitsListProps {
  units: { id: string; name: string }[];
  emptyText: string;
  ulClassName: string;
  emptyAs?: 'p' | 'span';
  emptyClassName?: string;
  collapsibleAfter?: number;
}

function UnitsList({
  units,
  emptyText,
  ulClassName,
  emptyAs = 'p',
  emptyClassName,
  collapsibleAfter,
}: UnitsListProps) {
  const [expanded, setExpanded] = useState(false);

  if (units.length === 0) {
    const EmptyTag = emptyAs;
    return (
      <EmptyTag
        className={emptyClassName}
        style={{ color: 'var(--color-text-neutral-secondary)' }}
      >
        {emptyText}
      </EmptyTag>
    );
  }

  const shouldCollapse = collapsibleAfter != null && units.length > collapsibleAfter;
  const visible = shouldCollapse && !expanded ? units.slice(0, collapsibleAfter) : units;

  return (
    <>
      <ul className={ulClassName}>
        {visible.map((unit) => (
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
      {shouldCollapse && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="text-sm hover:underline cursor-pointer mt-1"
          style={{ color: 'var(--color-text-brand-primary)' }}
        >
          {expanded ? 'Ver menos' : `Ver todas (+${units.length - collapsibleAfter!})`}
        </button>
      )}
    </>
  );
}

export default function ResearchersDetailPage({ params }: ResearchersDetailPageProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [profile, setProfile] = useState<ResearcherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showAlternativeNames, setShowAlternativeNames] = useState(false);
  const [selectedYearFilter, setSelectedYearFilter] = useState<number | null>(null);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string[]>([]);
  const [productionPage, setProductionPage] = useState(1);
  const [projectsPage, setProjectsPage] = useState(1);
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);
  const [collaborationCountries, setCollaborationCountries] = useState<
    { country: string; count: number }[]
  >([]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoadError(null);
        const data = await getResearcherProfile(params.id);
        setProfile(data);
      } catch (error) {
        console.error(error);
        setLoadError('No se pudo cargar el perfil. Intenta nuevamente más tarde.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [params.id]);

  // Collaboration network for the profile map. Loaded separately so a slow or
  // failing call never blocks the main profile render.
  useEffect(() => {
    let cancelled = false;
    getResearcherCollaborationCountries(params.id)
      .then((countries) => {
        if (!cancelled) setCollaborationCountries(countries);
      })
      .catch((error) => console.error('Error loading collaboration countries:', error));
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  useEffect(() => {
    const handleScroll = () => setShowScrollTopButton(window.scrollY > 400);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setProductionPage(1);
  }, [selectedYearFilter]);

  useEffect(() => {
    setProjectsPage(1);
  }, [selectedStatusFilter]);

  if (loading) return <ResearcherDetailSkeleton />;

  if (loadError) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-body-lg text-(--color-text-neutral-secondary)">{loadError}</p>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-body-lg text-(--color-text-neutral-secondary)">
          Perfil no encontrado.
        </p>
      </main>
    );
  }

  const fullName = [profile.name, profile.firstSurname, profile.secondSurname]
    .filter(Boolean)
    .join(' ');

  const profileLinks = buildProfileLinks(profile);

  const photo =
    profile.photo ||
    getAvatarUrl(profile.name, profile.firstSurname, profile.secondSurname);

  const allProductions = profile.scientificOutputs.map(toSummaryScientificProduction);
  const productions = selectedYearFilter
    ? allProductions.filter((p) => p.publicationYear === selectedYearFilter)
    : allProductions;
  // Counts the projects per status key (lowercased) so the filter chips can
  // show "Terminado (12)" / "En desarrollo (3)" etc. Built from the full
  // project list — the counts don't change when a filter is selected.
  const statusGroups = (() => {
    const map = new Map<string, { key: string; label: string; count: number }>();
    for (const project of profile.projects) {
      const key = (project.status ?? '').trim().toLowerCase();
      const label = formatProjectStatusLabel(project.status);
      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(key, { key, label, count: 1 });
      }
    }
    return Array.from(map.values()).sort((a, b) => {
      const priorityDiff =
        getProjectStatusPriority(a.key || null) - getProjectStatusPriority(b.key || null);
      if (priorityDiff !== 0) return priorityDiff;
      return a.label.localeCompare(b.label, 'es');
    });
  })();

  const filteredProjects =
    selectedStatusFilter.length > 0
      ? profile.projects.filter((p) =>
          selectedStatusFilter.includes((p.status ?? '').trim().toLowerCase()),
        )
      : profile.projects;

  // Sort projects by status priority (terminado → en desarrollo → suspendido →
  // others alphabetically) and then alphabetically by project name within each
  // status group.
  const projects = [...filteredProjects].sort((a, b) => {
    const priorityDiff =
      getProjectStatusPriority(a.status) - getProjectStatusPriority(b.status);
    if (priorityDiff !== 0) return priorityDiff;

    const statusA = (a.status ?? '').toLowerCase();
    const statusB = (b.status ?? '').toLowerCase();
    if (statusA !== statusB) return statusA.localeCompare(statusB, 'es');

    return a.name.localeCompare(b.name, 'es');
  });

  const productionTotalPages = Math.max(
    1,
    Math.ceil(productions.length / DETAIL_PAGE_SIZE),
  );
  const safeProductionPage = Math.min(productionPage, productionTotalPages);
  const paginatedProductions = productions.slice(
    (safeProductionPage - 1) * DETAIL_PAGE_SIZE,
    safeProductionPage * DETAIL_PAGE_SIZE,
  );

  const projectsTotalPages = Math.max(1, Math.ceil(projects.length / DETAIL_PAGE_SIZE));
  const safeProjectsPage = Math.min(projectsPage, projectsTotalPages);
  const paginatedProjects = projects.slice(
    (safeProjectsPage - 1) * DETAIL_PAGE_SIZE,
    safeProjectsPage * DETAIL_PAGE_SIZE,
  );

  const scrollNavbarIntoView = () => {
    const navbarEl = document.getElementById('profile-detail-navbar');
    if (navbarEl) {
      const navbar = document.querySelector('header') ?? document.querySelector('nav');
      const navbarHeight = navbar ? navbar.getBoundingClientRect().height : 0;
      const top = navbarEl.getBoundingClientRect().top + window.scrollY - navbarHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

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

          <BackButton
            fallbackHref="/researchers"
            ariaLabel="Volver al listado de perfiles"
            className="mt-4"
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
                <div className="border-b border-gray-200 pb-3 mb-4">
                  <div className="mb-2">
                    <ProfileTypeBadge type={profile.profileType} />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      profile.alternativeNames.length > 0 &&
                      setShowAlternativeNames((prev) => !prev)
                    }
                    disabled={profile.alternativeNames.length === 0}
                    aria-expanded={showAlternativeNames}
                    className="flex w-full items-center justify-between gap-3 text-left disabled:cursor-default"
                  >
                    <h1 className="text-h3 font-bold text-[var(--color-text-neutral-primary)] break-words">
                      {fullName}
                    </h1>
                    {profile.alternativeNames.length > 0 && (
                      <ChevronDown
                        size={24}
                        className={`shrink-0 transition-transform duration-300 text-[var(--color-text-neutral-secondary)] ${showAlternativeNames ? 'rotate-180' : ''}`}
                      />
                    )}
                  </button>

                  {profile.alternativeNames.length > 0 && (
                    <div
                      className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${showAlternativeNames ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                    >
                      <div className="overflow-hidden">
                        <div className="mt-3 space-y-1">
                          {profile.alternativeNames.map((altName, index) => (
                            <p
                              key={index}
                              className="text-body-md text-[var(--color-text-neutral-secondary)] break-words"
                            >
                              {formatAlternativeName(altName)}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {(!EXTERNAL_PROFILES_ENABLED || profile.profileType !== 'EXTERNAL') &&
                  profile.ceaCategory && (
                    <p className="text-body-lg text-[var(--color-text-neutral-secondary)]">
                      {formatCeaCategory(profile.ceaCategory)}
                    </p>
                  )}

                {EXTERNAL_PROFILES_ENABLED && profile.profileType === 'EXTERNAL' ? (
                  <div className="space-y-1">
                    <p
                      className="text-body-lg font-bold"
                      style={{ color: 'var(--color-text-neutral-secondary)' }}
                    >
                      {profile.institutions.length > 1 ? 'Instituciones' : 'Institución'}
                    </p>
                    {profile.institutions.length > 0 ? (
                      <ul className="list-disc pl-5 text-body-lg space-y-2">
                        {profile.institutions.map((inst, idx) => (
                          <li
                            key={idx}
                            className="break-words"
                            style={{ color: 'var(--color-text-neutral-primary)' }}
                          >
                            {inst.name}
                            {inst.country ? (
                              <span
                                className="block text-body-lg mt-0.5"
                                style={{ color: 'var(--color-text-neutral-secondary)' }}
                              >
                                {inst.country}
                              </span>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p
                        className="text-body-lg"
                        style={{ color: 'var(--color-text-neutral-secondary)' }}
                      >
                        Sin institución registrada
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="space-y-1">
                      <p
                        className="text-body-lg font-bold tracking-wide"
                        style={{ color: 'var(--color-text-neutral-secondary)' }}
                      >
                        {profile.workUnits.length === 1
                          ? 'Unidad de Trabajo'
                          : 'Unidades de Trabajo'}
                      </p>
                      <UnitsList
                        units={profile.workUnits}
                        emptyText="Sin unidad de trabajo registrada"
                        ulClassName="list-disc pl-5 text-body-lg space-y-1"
                        emptyClassName="text-body-lg"
                      />
                    </div>

                    <div className="space-y-1 pt-4">
                      <p
                        className="text-body-lg font-bold tracking-wide"
                        style={{ color: 'var(--color-text-neutral-secondary)' }}
                      >
                        Unidades de Colaboración
                      </p>
                      <UnitsList
                        units={profile.linkedUnits}
                        emptyText="Sin unidades de colaboración registradas"
                        ulClassName="list-disc pl-5 text-body-lg space-y-1"
                        emptyClassName="text-body-lg"
                        collapsibleAfter={3}
                      />
                    </div>
                  </>
                )}

                <div className="space-y-1 pt-4">
                  <p
                    className="text-body-lg font-bold tracking-wide"
                    style={{ color: 'var(--color-text-neutral-secondary)' }}
                  >
                    Enlaces de Interés
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
                      className="text-body-lg"
                      style={{ color: 'var(--color-text-neutral-secondary)' }}
                    >
                      Sin enlaces de interés asociados
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 lg:self-stretch lg:justify-between">
              <MetricsPanel
                scientificOutputs={profile.scientificOutputs}
                onYearSelected={handleYearSelected}
                hIndex={profile.hIndex}
              />
              <div className="flex justify-end">
                <DownloadInfoButton profile={profile} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="profile-detail-navbar" className="bg-[var(--color-bg-neutral-secondary)]">
        <DetailNavbar
          categories={
            EXTERNAL_PROFILES_ENABLED && profile.profileType === 'EXTERNAL'
              ? profileSections.filter((s) => s.id !== 'projects' && s.id !== 'personal')
              : profileSections
          }
          defaultActive={
            EXTERNAL_PROFILES_ENABLED && profile.profileType === 'EXTERNAL'
              ? 'production'
              : 'personal'
          }
          onCategoryChange={setActiveSection}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 min-h-[20vh]">
          {activeSection === 'personal' && (
            <section className="space-y-6 sm:space-y-8">
              {EXTERNAL_PROFILES_ENABLED && profile.profileType === 'EXTERNAL' ? (
                // ── External profile ──────────────────────────────────────────
                <>
                  <div>
                    <h3 className="text-xl sm:text-[22px] font-normal text-[var(--color-text-neutral-primary)] mb-4">
                      Instituciones
                    </h3>
                    {profile.institutions.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-3 text-body-lg">
                        {profile.institutions.map((inst, idx) => (
                          <li
                            key={idx}
                            className="break-words"
                            style={{ color: 'var(--color-text-neutral-primary)' }}
                          >
                            {inst.name}
                            {inst.country && (
                              <span
                                className="block text-body-lg mt-0.5"
                                style={{ color: 'var(--color-text-neutral-secondary)' }}
                              >
                                {inst.country}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p
                        className="text-body-lg"
                        style={{ color: 'var(--color-text-neutral-secondary)' }}
                      >
                        Sin instituciones registradas.
                      </p>
                    )}
                  </div>

                  <div>
                    <h3 className="text-body text-[var(--color-text-neutral-primary)] mb-4">
                      Formación académica
                    </h3>
                    {profile.education.length > 0 ? (
                      <ul className="space-y-3 text-body-lg text-[var(--color-text-neutral-primary)]">
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
                      <p
                        className="text-body-lg"
                        style={{ color: 'var(--color-text-neutral-secondary)' }}
                      >
                        No hay formación académica registrada para este perfil.
                      </p>
                    )}
                  </div>
                </>
              ) : (
                // ── UCR profile ───────────────────────────────────────────────
                <>
                  <div>
                    <h3 className="text-h4 font-bold text-[var(--color-text-neutral-primary)] mb-4">
                      Información
                    </h3>
                    <div className="space-y-4 text-body-lg sm:text-[16px]">
                      <div>
                        <p
                          className="text-body-lg font-bold tracking-wide mb-1"
                          style={{ color: 'var(--color-text-neutral-primary)' }}
                        >
                          Categoría
                        </p>
                        <p className="text-body-lg text-[var(--color-text-neutral-primary)] break-words">
                          {formatCeaCategory(profile.ceaCategory) ?? (
                            <span
                              style={{ color: 'var(--color-text-neutral-secondary)' }}
                            >
                              No disponible
                            </span>
                          )}
                        </p>
                      </div>

                      <div>
                        <p
                          className="text-body-lg font-bold uppercase tracking-wide mb-1"
                          style={{ color: 'var(--color-text-neutral-primary)' }}
                        >
                          ORCID
                        </p>
                        <p className="text-body-lg text-[var(--color-text-neutral-primary)] break-all">
                          {profile.orcidId ?? (
                            <span
                              style={{ color: 'var(--color-text-neutral-secondary)' }}
                            >
                              No disponible
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-h4 font-bold text-[var(--color-text-neutral-primary)] mb-4">
                      Formación académica
                    </h3>
                    {profile.education.length > 0 ? (
                      <ul className="space-y-3 text-body-lg text-[var(--color-text-neutral-primary)]">
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
                      <p className="text-body-lg text-[var(--color-text-neutral-secondary)]">
                        No hay formación académica registrada para este perfil.
                      </p>
                    )}
                  </div>

                  <div>
                    <h3 className="text-h4 font-bold text-[var(--color-text-neutral-primary)] mb-4">
                      Experiencia laboral relevante
                    </h3>
                    {profile.experience.length > 0 ? (
                      <ul className="space-y-3 text-body-lg text-[var(--color-text-neutral-primary)]">
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
                      <p className="text-body-lg text-[var(--color-text-neutral-secondary)]">
                        No hay experiencia laboral registrada para este perfil.
                      </p>
                    )}
                  </div>
                </>
              )}
            </section>
          )}

          {activeSection === 'collaboration' && (
            <section className="space-y-4">
              <CollaborationMapPreview
                title="Redes de colaboración"
                scopeLabel="Perfil"
                subtitle={
                  collaborationCountries.length > 0
                    ? 'Países con los que este investigador mantiene colaboraciones internacionales, según coautorías con perfiles externos.'
                    : 'Este investigador no tiene colaboraciones internacionales registradas.'
                }
                points={buildCollaborationPoints(collaborationCountries)}
              />
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
                <div className="flex items-center justify-center py-16">
                  <p className="text-body-lg text-[var(--color-text-neutral-secondary)]">
                    No hay palabras clave asociadas.
                  </p>
                </div>
              )}
            </section>
          )}

          {activeSection === 'production' && (
            <section className="space-y-4">
              {selectedYearFilter && (
                <div className="flex items-center gap-2 py-2">
                  <p className="text-body-lg text-[var(--color-text-neutral-secondary)]">
                    Filtrado por año:{' '}
                    <span className="font-bold text-[var(--color-text-neutral-primary)]">
                      {selectedYearFilter}
                    </span>{' '}
                    ({productions.length}{' '}
                    {productions.length === 1 ? 'publicación' : 'publicaciones'})
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedYearFilter(null)}
                    className="text-body-lg hover:underline ml-2"
                    style={{ color: 'var(--color-text-brand-primary)' }}
                  >
                    ✕
                  </button>
                </div>
              )}
              {productions.length > 0 ? (
                <div className="space-y-8">
                  {paginatedProductions.map((production) => (
                    <ProductionCard key={production.id} production={production} />
                  ))}
                  <Pagination
                    currentPage={safeProductionPage}
                    totalPages={productionTotalPages}
                    onPageChange={(page) => {
                      setProductionPage(page);
                      scrollNavbarIntoView();
                    }}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center py-16">
                  <p className="text-body-lg text-[var(--color-text-neutral-secondary)]">
                    {selectedYearFilter
                      ? `No hay publicaciones registradas para ${selectedYearFilter}.`
                      : 'No hay producción científica asociada.'}
                  </p>
                </div>
              )}
            </section>
          )}

          {activeSection === 'projects' &&
            (!EXTERNAL_PROFILES_ENABLED || profile.profileType !== 'EXTERNAL') && (
              <section className="space-y-4">
                {statusGroups.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {statusGroups.map((group) => {
                        const isActive = selectedStatusFilter.includes(group.key);
                        return (
                          <button
                            key={group.key || 'sin-estado'}
                            type="button"
                            onClick={() =>
                              setSelectedStatusFilter((prev) =>
                                isActive
                                  ? prev.filter((k) => k !== group.key)
                                  : [...prev, group.key],
                              )
                            }
                            aria-pressed={isActive}
                            className={`flex-1 min-w-[110px] px-3 py-2 rounded-sm text-center cursor-pointer transition-all duration-200 ease-out hover:scale-[1.03] ${
                              isActive
                                ? 'bg-[var(--color-text-brand-primary)]/10 ring-1 ring-[var(--color-text-brand-primary)]/30 shadow-sm'
                                : 'bg-white ring-1 ring-gray-200 hover:ring-gray-300'
                            }`}
                          >
                            <div className="text-4xl font-bold leading-none text-[var(--color-text-brand-primary)]">
                              {group.count}
                            </div>
                            <div
                              className={
                                isActive
                                  ? 'mt-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-brand-primary)] leading-tight'
                                  : 'mt-1 text-[10px] font-medium uppercase tracking-wide text-[var(--color-text-neutral-secondary)] leading-tight'
                              }
                            >
                              {group.label}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {selectedStatusFilter.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedStatusFilter([])}
                        className="text-body-lg text-[var(--color-text-neutral-secondary)] hover:underline cursor-pointer"
                      >
                        Limpiar filtro
                      </button>
                    )}
                  </div>
                )}
                {projects.length > 0 ? (
                  <div className="space-y-12">
                    {paginatedProjects.map((project, index) => {
                      const prev = index > 0 ? paginatedProjects[index - 1] : null;
                      const isNewGroup =
                        !prev ||
                        (prev.status ?? '').trim().toLowerCase() !==
                          (project.status ?? '').trim().toLowerCase();

                      return (
                        <div key={project.id} className="space-y-4">
                          {isNewGroup && (
                            <h3
                              className={`text-h4 font-bold text-[var(--color-text-neutral-primary)] border-b border-[var(--color-border-neutral)] pb-2 ${
                                index === 0 ? '' : 'pt-4'
                              }`}
                            >
                              {formatProjectStatusLabel(project.status)}
                            </h3>
                          )}
                          <ProjectListItem
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
                        </div>
                      );
                    })}
                    <Pagination
                      currentPage={safeProjectsPage}
                      totalPages={projectsTotalPages}
                      onPageChange={(page) => {
                        setProjectsPage(page);
                        scrollNavbarIntoView();
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-16">
                    <p className="text-body-lg text-[var(--color-text-neutral-secondary)]">
                      {selectedStatusFilter.length > 0
                        ? 'No hay proyectos asociados con el estado seleccionado.'
                        : 'No hay proyectos asociados.'}
                    </p>
                  </div>
                )}
              </section>
            )}
        </div>
      </div>

      {showScrollTopButton && (
        <Button
          variant="primary"
          size="md"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          iconLeft={<ChevronUp size={32} strokeWidth={3.2} />}
          aria-label="Volver arriba"
          className="fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full px-0 shadow-lg"
        />
      )}
    </main>
  );
}
