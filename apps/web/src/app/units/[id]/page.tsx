'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Breadcrumb from '@/components/Breadcrumb';
import DetailNavbar from '@/components/DetailNavbar';
import { Category } from '@/components/DetailNavbar';
import Pagination from '@/components/Pagination';
import { getUnitById } from '@/services/units';
import type { UnitDetail } from '@/services/units';
import { getScientificProductions } from '@/services/scientific-productions';
import { getProjects, type Project, type ProjectQueryFilters } from '@/services/projects';
import ResearchersList from '@/app/researchers/components/ResearchersList';
import CollaborationMapPreview from '@/components/CollaborationMapPreview';
import { ProductionCard } from '@/app/scientific-productions/components';
import ProjectListItem from '@/app/projects/components/ProjectListItem';
import type { ScientificProduction } from '@/types';
import { Globe, Phone, Mail, User, Users, BookOpen, Briefcase } from 'lucide-react';

type UnitData = UnitDetail;

interface UnitsDetailPageProps {
  params: { id: string };
}

const PAGE_SIZE = 5;

const DEFAULT_PROJECT_QUERY_FILTERS: ProjectQueryFilters = {
  researchType: [],
  projectType: [],
  startYear: [],
  status: [],
  participants: [],
  keywords: [],
};

export default function UnitsDetailPage({ params }: UnitsDetailPageProps) {
  const [unit, setUnit] = useState<UnitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('profiles');
  const [productions, setProductions] = useState<ScientificProduction[]>([]);
  const [productionsPage, setProductionsPage] = useState(1);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectPage, setProjectPage] = useState(1);
  const [projectTotalPages, setProjectTotalPages] = useState(1);

  const categories: Category[] = [
    {
      id: 'profiles',
      name: 'Perfiles asociados',
      icon: <User size={18} />,
    },
    {
      id: 'networks',
      name: 'Redes de colaboración',
      icon: <Users size={18} />,
    },
    {
      id: 'scientific_production',
      name: 'Producción científica',
      icon: <BookOpen size={18} />,
    },
    {
      id: 'projects',
      name: 'Proyectos',
      icon: <Briefcase size={18} />,
    },
  ];

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
        const response = await getScientificProductions(1, 100);
        setProductions(response.items);
      } catch (error) {
        console.error('Error fetching scientific productions:', error);
      }
    };

    fetchProductions();
  }, []);

  /*Fetch projects for unit detail provisional list*/
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsResponse = await getProjects(
          projectPage,
          PAGE_SIZE,
          '',
          DEFAULT_PROJECT_QUERY_FILTERS,
        );
        setProjects(projectsResponse.data);
        setProjectTotalPages(
          Math.max(1, Math.ceil(projectsResponse.total / projectsResponse.limit)),
        );
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, [projectPage]);

  const totalProductionPages = useMemo(
    () => Math.max(1, Math.ceil(productions.length / PAGE_SIZE)),
    [productions.length],
  );

  const paginatedProductions = useMemo(
    () =>
      productions.slice((productionsPage - 1) * PAGE_SIZE, productionsPage * PAGE_SIZE),
    [productions, productionsPage],
  );

  const handleProductionsPageChange = useCallback((page: number) => {
    setProductionsPage(page);
  }, []);

  const handleProjectPageChange = useCallback((page: number) => {
    setProjectPage(page);
  }, []);

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
    <main className="min-h-screen bg-base-100 py-8">
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
                  href={unit.pageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-neutral-600 hover:text-blue-800 break-all"
                >
                  <Globe size={18} style={{ color: 'var(--color-azul-700)' }} />
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
                    <Phone size={18} style={{ color: 'var(--color-azul-800)' }} />
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
                      <Mail size={18} style={{ color: 'var(--color-azul-700)' }} />
                      {unit.email}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Detail Navigation */}
      <DetailNavbar
        categories={categories}
        defaultActive={activeTab}
        onCategoryChange={(id) => setActiveTab(id)}
        backgroundColor="#F2F2F2"
      />

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-6 py-4 pt-0">
        {activeTab === 'profiles' && (
          <div className="max-w-8xl px-2 mt-6 mx-2">
            <ResearchersList
              searchQuery={''}
              filters={{
                baseUnit: [],
                ceaCategory: [],
              }}
            />
          </div>
        )}

        {activeTab === 'networks' && (
          <div className="max-w-8xl px-2 mx-2">
            <CollaborationMapPreview />
          </div>
        )}

        {activeTab === 'scientific_production' && (
          <div className="max-w-8xl px-2 mx-2">
            {paginatedProductions.length > 0 ? (
              <>
                <div>
                  {paginatedProductions.map((production) => (
                    <ProductionCard key={production.id} production={production} />
                  ))}
                </div>

                {totalProductionPages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={productionsPage}
                      totalPages={totalProductionPages}
                      onPageChange={handleProductionsPageChange}
                    />
                  </div>
                )}
              </>
            ) : (
              <div
                className="flex flex-col items-center justify-center py-16 text-center"
                role="status"
                aria-live="polite"
              >
                <p
                  className="text-base font-medium"
                  style={{ color: 'var(--color-text-neutral-secondary)' }}
                >
                  No se encontraron resultados.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="max-w-8xl px-2 mx-2 mt-6">
            {projects.length > 0 ? (
              <>
                <div className="space-y-8">
                  {projects.map((project) => {
                    const managerProfile = project.associatedProfiles.find(
                      (profile) => profile.name === project.manager,
                    );

                    return (
                      <ProjectListItem
                        key={project.id}
                        code={project.code}
                        title={project.title}
                        href={`/projects/${project.id}`}
                        manager={project.manager}
                        managerHref={
                          managerProfile
                            ? `/researchers/${managerProfile.id}`
                            : `/researchers?q=${encodeURIComponent(project.manager)}`
                        }
                        startDate={project.startDate}
                        endDate={project.endDate}
                        researchType={project.researchType}
                        actionType={project.projectType}
                        keywords={project.keywords}
                      />
                    );
                  })}
                </div>

                {projectTotalPages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={projectPage}
                      totalPages={projectTotalPages}
                      onPageChange={handleProjectPageChange}
                    />
                  </div>
                )}
              </>
            ) : (
              <div
                className="flex flex-col items-center justify-center py-16 text-center"
                role="status"
                aria-live="polite"
              >
                <p
                  className="text-base font-medium"
                  style={{ color: 'var(--color-text-neutral-secondary)' }}
                >
                  No se encontraron resultados.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
