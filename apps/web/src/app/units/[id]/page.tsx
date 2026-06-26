'use client';

import { useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import BackButton from '@/components/BackButton';
import DetailNavbar from '@/components/DetailNavbar';
import { Category } from '@/components/DetailNavbar';
import {
  getUnitById,
  getUnitProfiles,
  getUnitScientificProductions,
  getUnitProjects,
} from '@/services/units';
import type {
  UnitDetail,
  UnitProfile,
  UnitScientificProduction,
  UnitProject,
} from '@/services/units';
import CollaborationMapPreview from '@/components/CollaborationMapPreview';
import { UnitScientificProductionsTab } from '@/app/units/components/UnitScientificProductionsTab';
import { UnitProjectsTab } from '@/app/units/components/UnitProjectsTab';
import { UnitProfilesTab } from '@/app/units/components/UnitProfilesTab';
import {
  CardSkeleton,
  ResearcherCardSkeleton,
} from '@/components/skeletons/CardSkeleton';
import ApiErrorMessage from '@/components/ApiErrorMessage';
import Image from 'next/image';

type UnitData = UnitDetail;

interface UnitsDetailPageProps {
  params: { id: string };
}

export default function UnitsDetailPage({ params }: UnitsDetailPageProps) {
  const [unit, setUnit] = useState<UnitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('profiles');
  const [profiles, setProfiles] = useState<UnitProfile[]>([]);
  const [productions, setProductions] = useState<UnitScientificProduction[]>([]);
  const [projects, setProjects] = useState<UnitProject[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [loadingProductions, setLoadingProductions] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [profilesError, setProfilesError] = useState<string | null>(null);
  const [productionsError, setProductionsError] = useState<string | null>(null);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);

  const categories: Category[] = [
    {
      id: 'profiles',
      name: 'Perfiles asociados',
    },
    {
      id: 'networks',
      name: 'Redes de colaboración',
    },
    {
      id: 'scientific_production',
      name: 'Producción científica',
    },
    {
      id: 'projects',
      name: 'Proyectos',
    },
  ];

  /*Fetch associated profiles*/
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoadingProfiles(true);
        setProfilesError(null);
        const data = await getUnitProfiles(Number(params.id));
        setProfiles(data);
      } catch (err) {
        console.error('Error fetching unit profiles:', err);
        setProfiles([]);
        setProfilesError(
          'No se pudieron cargar los perfiles asociados. Intenta nuevamente más tarde.',
        );
      } finally {
        setLoadingProfiles(false);
      }
    };
    fetchProfiles();
  }, [params.id]);

  /*Fetch default data*/
  useEffect(() => {
    const fetchUnitData = async () => {
      try {
        setLoading(true);
        const data = await getUnitById(Number(params.id));
        setUnit(data);
        setError(null);
      } catch (err) {
        setError('No se pudo cargar la unidad. Intenta nuevamente más tarde.');
        console.error('Error fetching unit:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUnitData();
  }, [params.id]);

  /*Fetch scientific productions*/
  useEffect(() => {
    const fetchProductions = async () => {
      try {
        setLoadingProductions(true);
        setProductionsError(null);
        const data = await getUnitScientificProductions(Number(params.id));
        setProductions(data);
      } catch (error) {
        console.error('Error fetching unit scientific productions:', error);
        setProductions([]);
        setProductionsError(
          'No se pudo cargar la producción científica. Intenta nuevamente más tarde.',
        );
      } finally {
        setLoadingProductions(false);
      }
    };

    fetchProductions();
  }, [params.id]);

  /*Fetch projects for unit*/
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoadingProjects(true);
        setProjectsError(null);
        const data = await getUnitProjects(Number(params.id));
        setProjects(data);
      } catch (error) {
        console.error('Error fetching unit projects:', error);
        setProjects([]);
        setProjectsError(
          'No se pudieron cargar los proyectos. Intenta nuevamente más tarde.',
        );
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjects();
  }, [params.id]);

  useEffect(() => {
    const handleScroll = () => setShowScrollTopButton(window.scrollY > 400);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function TabLoadingSkeleton(
    tabType: 'profiles' | 'scientific_production' | 'projects',
  ) {
    const count = tabType === 'profiles' ? 9 : 10;

    if (tabType === 'profiles') {
      return (
        <div className="mt-6">
          <div className="skeleton h-4 w-24 rounded mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
            {Array.from({ length: count }).map((_, i) => (
              <ResearcherCardSkeleton key={i} />
            ))}
          </div>
        </div>
      );
    }

    if (tabType === 'scientific_production') {
      return (
        <div className="mt-6">
          <div className="skeleton h-4 w-24 rounded mb-4" />
          <div className="space-y-8">
            {Array.from({ length: count }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="mt-6">
        <div className="skeleton h-4 w-24 rounded mb-4" />
        <ul className="flex flex-col gap-4">
          {Array.from({ length: count }).map((_, i) => (
            <li key={i}>
              <CardSkeleton />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  /*Show error page */
  if (!loading && (error || !unit)) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        {error ? (
          <ApiErrorMessage message={error} />
        ) : (
          <p className="text-body-lg text-[var(--color-text-neutral-secondary)]">
            Unidad no encontrada.
          </p>
        )}
      </main>
    );
  }

  return (
    <main className="bg-base-100 py-8 pb-0">
      <div className="max-w-7xl mx-auto w-full">
        {loading ? (
          /* Skeleton while loading */
          <>
            <div className="skeleton h-4 w-32 rounded mb-6" />
            <section className="grid grid-cols-1 lg:grid-cols-4 gap-16 mb-12">
              <div className="lg:col-span-3 space-y-4">
                <div className="skeleton h-9 w-3/5 rounded mt-9" />
                <div className="space-y-3 mt-4">
                  <div className="skeleton h-4 w-full rounded" />
                  <div className="skeleton h-4 w-5/6 rounded" />
                  <div className="skeleton h-4 w-4/5 rounded" />
                  <div className="skeleton h-4 w-2/3 rounded" />
                </div>
              </div>
              <div className="lg:col-span-1 space-y-8">
                <div className="space-y-3 mt-9">
                  <div className="skeleton h-5 w-20 rounded" />
                  <div className="skeleton h-4 w-3/4 rounded" />
                </div>
                <div className="space-y-3">
                  <div className="skeleton h-5 w-20 rounded" />
                  <div className="skeleton h-4 w-1/2 rounded" />
                  <div className="skeleton h-4 w-3/5 rounded" />
                </div>
              </div>
            </section>
          </>
        ) : (
          unit && (
            <>
              {/* Breadcrumb Navigation */}
              <Breadcrumb
                items={[{ label: 'Unidades', href: '/units' }, { label: unit.name }]}
              />

              <BackButton
                fallbackHref="/units"
                ariaLabel="Volver al listado de unidades"
                className="mt-4"
              />

              {/* Header and information section */}
              <section className="grid grid-cols-1 lg:grid-cols-4 gap-16 mb-12 mt-6">
                {/* Unit Header */}
                <header className="lg:col-span-3">
                  <h1
                    className="text-h3 font-bold mb-6"
                    style={{ color: 'var(--color-text-neutral-primary)' }}
                  >
                    {unit.name}
                  </h1>
                  <p className="text-body-lg leading-relaxed text-[var(--color-text-neutral-secondary)]">
                    {unit.description || (
                      <span className="text-[var(--color-text-neutral-secondary)]">
                        No hay descripción disponible.
                      </span>
                    )}
                  </p>
                </header>

                {/* Unit information */}
                <div className="space-y-8 lg:col-span-1">
                  {/* Links section */}
                  <div>
                    <h3
                      className="text-h4 font-bold mb-2"
                      style={{
                        color: 'var(--color-text-neutral-primary)',
                      }}
                    >
                      Enlaces
                    </h3>
                    {unit.pageUrl ? (
                      <a
                        href={
                          unit.pageUrl.startsWith('http')
                            ? unit.pageUrl
                            : `https://${unit.pageUrl}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-neutral-600 hover:text-blue-800 break-all"
                      >
                        <Image
                          src="/colaboration_networks_icon_light_blue.png"
                          alt=""
                          width={20}
                          height={20}
                        />
                        {unit.pageUrl}
                      </a>
                    ) : (
                      <div className="text-body-lg inline-flex items-center gap-2 text-[var(--color-text-neutral-tertiary)]">
                        <Image
                          src="/colaboration_networks_icon_light_blue.png"
                          alt=""
                          width={20}
                          height={20}
                          className="opacity-50"
                        />
                        No hay enlace disponible.
                      </div>
                    )}
                  </div>

                  {/* Contact section */}
                  <div>
                    <h3
                      className="text-h4 font-bold mb-2"
                      style={{
                        color: 'var(--color-text-neutral-primary)',
                      }}
                    >
                      Contacto
                    </h3>
                    {unit.phoneNumber ? (
                      <div className="mb-4">
                        <a
                          href={`tel:${unit.phoneNumber}`}
                          className="inline-flex items-center gap-2 text-neutral-600"
                        >
                          <Image
                            src="/phone_icon_light_blue.png"
                            alt=""
                            width={20}
                            height={20}
                          />
                          {unit.phoneNumber}
                        </a>
                      </div>
                    ) : (
                      <div className="text-body-lg mb-4 inline-flex items-center gap-2 text-[var(--color-text-neutral-tertiary)]">
                        <Image
                          src="/phone_icon_light_blue.png"
                          alt=""
                          width={20}
                          height={20}
                          className="opacity-50"
                        />
                        No hay teléfono disponible.
                      </div>
                    )}

                    <div className="space-y-3">
                      {unit.email ? (
                        <div>
                          <a
                            href={`mailto:${unit.email}`}
                            className="inline-flex items-center gap-2 text-neutral-600 hover:text-blue-800 break-all"
                          >
                            <Image
                              src="/email_icon_light_blue.png"
                              alt=""
                              width={20}
                              height={20}
                            />
                            {unit.email}
                          </a>
                        </div>
                      ) : (
                        <div className="text-body-lg inline-flex items-center gap-2 text-[var(--color-text-neutral-tertiary)]">
                          <Image
                            src="/email_icon_light_blue.png"
                            alt=""
                            width={20}
                            height={20}
                            className="opacity-50"
                          />
                          No hay correo electrónico disponible.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </>
          )
        )}
      </div>

      <div className="bg-[var(--color-bg-neutral-secondary)] pb-15">
        {/* Detail Navigation */}
        {loading ? (
          <div className="w-full h-14 bg-[var(--color-gray-200)] border-y-2 border-[var(--color-gray-300)] hidden sm:flex items-center px-8 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-5 flex-1 rounded" />
            ))}
          </div>
        ) : (
          <DetailNavbar
            categories={categories}
            defaultActive={activeTab}
            onCategoryChange={(id) => setActiveTab(id)}
          />
        )}

        {/* Content Section */}
        <div className="max-w-6xl mx-auto px-6 py-4 pt-0 bg-[var(--color-bg-neutral-secondary)]">
          {activeTab === 'profiles' &&
            (loadingProfiles ? (
              TabLoadingSkeleton('profiles')
            ) : profilesError ? (
              <ApiErrorMessage className="mt-6" message={profilesError} />
            ) : (
              <UnitProfilesTab profiles={profiles} />
            ))}

          {activeTab === 'networks' && (
            <div className="max-w-8xl px-2 mx-2">
              <CollaborationMapPreview />
            </div>
          )}

          {activeTab === 'scientific_production' &&
            (loadingProductions ? (
              TabLoadingSkeleton('scientific_production')
            ) : productionsError ? (
              <ApiErrorMessage className="mt-6" message={productionsError} />
            ) : (
              <UnitScientificProductionsTab productions={productions} />
            ))}

          {activeTab === 'projects' &&
            (loadingProjects ? (
              TabLoadingSkeleton('projects')
            ) : projectsError ? (
              <ApiErrorMessage className="mt-6" message={projectsError} />
            ) : (
              <UnitProjectsTab projects={projects} />
            ))}
        </div>
      </div>

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
