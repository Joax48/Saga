'use client';

import { useEffect, useState } from 'react';
import Breadcrumb from '@/components/Breadcrumb';
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
import {
  UnitScientificProductionsTab,
  UnitProjectsTab,
  UnitProfilesTab,
} from '@/app/units/components';
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

  const categories: Category[] = [
    {
      id: 'profiles',
      name: 'Perfiles asociados',
      iconSrc: '/profile_icon_black.png',
    },
    {
      id: 'networks',
      name: 'Redes de colaboración',
      iconSrc: '/colaboration_networks_icon_black.png',
    },
    {
      id: 'scientific_production',
      name: 'Producción científica',
      iconSrc: '/scientific_production_icon_black.png',
    },
    {
      id: 'projects',
      name: 'Proyectos',
      iconSrc: '/projects_icon_black.png',
    },
  ];

  /*Fetch associated profiles*/
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoadingProfiles(true);
        const data = await getUnitProfiles(Number(params.id));
        setProfiles(data);
      } catch (err) {
        console.error('Error fetching unit profiles:', err);
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
        setError(
          'Error al cargar los detalles de la unidad. Por favor intente de nuevo.',
        );
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
        const data = await getUnitScientificProductions(Number(params.id));
        setProductions(data);
      } catch (error) {
        console.error('Error fetching unit scientific productions:', error);
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
        const data = await getUnitProjects(Number(params.id));
        setProjects(data);
      } catch (error) {
        console.error('Error fetching unit projects:', error);
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjects();
  }, [params.id]);

  function TabLoadingText() {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-base" style={{ color: 'var(--color-text-neutral-secondary)' }}>
          Cargando...
        </p>
      </div>
    );
  }

  /*Show loading page */
  if (loading) {
    return (
      <main className="min-h-screen bg-base-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="skeleton h-10 w-48 mb-6"></div>
          <div className="skeleton h-96 w-full mb-6"></div>
        </div>
      </main>
    );
  }

  /*Show error page */
  if (error || !unit) {
    return <main className="min-h-screen bg-base-100 p-6"></main>;
  }

  return (
    /*Show unit detailed information page */
    <main className="bg-base-100 py-8 pb-0">
      <div className="max-w-7xl mx-auto w-full">
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[{ label: 'Unidades', href: '/units' }, { label: unit.name }]}
        />

        {/* Header and information section */}
        <section className="grid grid-cols-1 lg:grid-cols-4 gap-16 mb-12">
          {/* Unit Header */}
          <header className="lg:col-span-3">
            <h1
              className="mb-6 mt-9"
              style={{ fontSize: 'var(--text-h3)', color: 'var(--color-neutral)' }}
            >
              {unit.name}
            </h1>
            <p className="text-md leading-relaxed text-neutral-700">{unit.description}</p>
          </header>

          {/* Unit information */}
          <div className="space-y-8 lg:col-span-1">
            {/* Links section */}
            {unit.pageUrl && (
              <div>
                <h3
                  className="mb-2 mt-9"
                  style={{ fontSize: 'var(--text-h3)', color: 'var(--color-neutral)' }}
                >
                  Enlaces
                </h3>
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
              </div>
            )}

            {/* Contact section */}
            <div>
              <h3
                className="mb-2"
                style={{ fontSize: 'var(--text-h3)', color: 'var(--color-neutral)' }}
              >
                Contacto
              </h3>
              {unit.phoneNumber && (
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
              )}

              <div className="space-y-3">
                {unit.email && (
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
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="bg-[var(--color-gray-100)] pb-15">
        {/* Detail Navigation */}
        <DetailNavbar
          categories={categories}
          defaultActive={activeTab}
          onCategoryChange={(id) => setActiveTab(id)}
        />

        {/* Content Section */}
        <div className="max-w-6xl mx-auto px-6 py-4 pt-0 bg-[var(--color-gray-100)]">
          {activeTab === 'profiles' &&
            (loadingProfiles ? (
              <TabLoadingText />
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
              <TabLoadingText />
            ) : (
              <UnitScientificProductionsTab productions={productions} />
            ))}

          {activeTab === 'projects' &&
            (loadingProjects ? (
              <TabLoadingText />
            ) : (
              <UnitProjectsTab projects={projects} />
            ))}
        </div>
      </div>
    </main>
  );
}
