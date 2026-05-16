'use client';

import { useState, useEffect } from 'react';
import Breadcrumb from '../../../components/Breadcrumb';
import DetailNavbar from '../../../components/DetailNavbar';
import Image from 'next/image';

import {
  ExternalLink,
  Link2,
  Globe,
  Users,
  Tag,
  BookOpen,
  Briefcase,
  Layers,
} from 'lucide-react';
import { getResearcherById } from '../../../services/researchers';
import { getScientificProductions } from '../../../services/scientific-productions';
import { getProjects } from '../../../services/projects';
import { ProductionCard } from '../../scientific-productions/components';
import ProjectListItem from '../../projects/components/ProjectListItem';
import CollaborationMapPreview from '../../../components/CollaborationMapPreview';
import type { SummaryScientificProduction } from '../../../types';
import type { ProjectSummaryItem } from '../../../types/projects.types';
import type { Researcher } from '../../../types/researcher-data';

interface ResearchersDetailPageProps {
  params: { id: string };
}

const profileSections = [
  { id: 'personal', name: 'Perfil Personal', icon: <Users size={18} /> },
  { id: 'keywords', name: 'Palabras clave', icon: <Tag size={18} /> },
  { id: 'collaboration', name: 'Redes de colaboración', icon: <Layers size={18} /> },
  { id: 'production', name: 'Producción científica', icon: <BookOpen size={18} /> },
  { id: 'projects', name: 'Proyectos', icon: <Briefcase size={18} /> },
  { id: 'other', name: 'Otras producciones', icon: <Globe size={18} /> },
];

// Builds the profile links array from the researcher's real data,
// only including links that are not null.
function buildProfileLinks(researcher: Researcher) {
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

export default function ResearchersDetailPage({ params }: ResearchersDetailPageProps) {
  const [activeSection, setActiveSection] = useState('personal');
  const [researcher, setResearcher] = useState<Researcher | null>(null);
  const [loading, setLoading] = useState(true);
  const [productions, setProductions] = useState<SummaryScientificProduction[]>([]);
  const [projects, setProjects] = useState<ProjectSummaryItem[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch the specific researcher by ID instead of loading a list and searching
        const found = await getResearcherById(params.id);
        setResearcher(found);

        const productionsResponse = await getScientificProductions({ page: 1, limit: 10 });
        setProductions(productionsResponse.items);

        const projectsResponse = await getProjects(1, 10);
        setProjects(projectsResponse.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [params.id]);

  if (loading) {
    return <div className="p-6">Cargando...</div>;
  }

  if (!researcher) {
    return <div className="p-6">Investigador no encontrado.</div>;
  }

  const fullName = [researcher.name, researcher.firstSurname, researcher.secondSurname]
    .filter(Boolean)
    .join(' ');

  const profileLinks = buildProfileLinks(researcher);

  const photo =
    researcher.photoUrl ||
    getAvatarUrl(researcher.name, researcher.firstSurname, researcher.secondSurname);

  return (
    <main className="min-h-screen bg-[var(--color-bg-neutral-primary)]">
      <div className="bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Breadcrumb
            items={[
              { label: 'Perfiles', href: '/researchers' },
              { label: fullName },
            ]}
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
                <h1 className="text-2xl font-semibold text-[var(--color-text-neutral-primary)] truncate">
                  {fullName}
                </h1>
              </div>

              {researcher.ceaCategory && (
                <p className="text-sm text-[var(--color-text-neutral-secondary)]">
                  {researcher.ceaCategory}
                </p>
              )}

              {researcher.baseUnit && (
                <p className="text-sm text-[var(--color-text-brand-primary)]">
                  {researcher.baseUnit}
                </p>
              )}

              {profileLinks.length > 0 && (
                <div className="pt-6 space-y-3">
                  <h2 className="text-base font-semibold text-[var(--color-text-neutral-primary)]">
                    Enlaces de interés
                  </h2>
                  <div className="flex items-center gap-3">
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
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[var(--color-bg-neutral-secondary)]">
        <DetailNavbar
          categories={profileSections}
          defaultActive="personal"
          onCategoryChange={setActiveSection}
          containerClassName="max-w-6xl mx-auto flex items-center px-6 h-16"
          itemClassName="flex items-center gap-2 px-4 h-full border-b-2 border-transparent text-sm text-[var(--color-text-neutral-secondary)] transition cursor-pointer hover:text-[var(--color-text-neutral-primary)]"
          activeItemClassName="border-b-2 border-[var(--color-text-brand-primary)] text-[var(--color-text-brand-primary)] font-medium"
        />

        <div className="max-w-6xl mx-auto px-6 py-8">
          {activeSection === 'personal' && (
            <section className="space-y-8">
              <div>
                <h3 className="text-base font-semibold text-[var(--color-text-neutral-primary)] mb-3">
                  Información
                </h3>
                <ul className="space-y-2 text-sm text-[var(--color-text-neutral-primary)]">
                  {researcher.baseUnit && (
                    <li><span className="font-medium">Unidad base:</span> {researcher.baseUnit}</li>
                  )}
                  {researcher.ceaCategory && (
                    <li><span className="font-medium">Categoría:</span> {researcher.ceaCategory}</li>
                  )}
                  {researcher.orcidId && (
                    <li><span className="font-medium">ORCID:</span> {researcher.orcidId}</li>
                  )}
                </ul>
                {!researcher.baseUnit && !researcher.ceaCategory && !researcher.orcidId && (
                  <p className="text-sm text-[var(--color-text-neutral-secondary)]">
                    No hay información adicional disponible.
                  </p>
                )}
              </div>
            </section>
          )}

          {activeSection === 'keywords' && (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-[var(--color-text-neutral-primary)]">
                Palabras clave
              </h2>
              <p className="text-sm text-[var(--color-text-neutral-secondary)]">
                No hay palabras clave registradas para este investigador.
              </p>
            </section>
          )}

          {activeSection === 'collaboration' && (
            <section className="space-y-4">
              <CollaborationMapPreview />
            </section>
          )}

          {activeSection === 'production' && (
            <section className="space-y-4">
              {productions.length > 0 ? (
                <div className="space-y-4">
                  {productions.slice(0, 5).map((production) => (
                    <ProductionCard key={production.id} production={production} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--color-text-neutral-secondary)]">
                  No hay producción científica registrada.
                </p>
              )}
            </section>
          )}

          {activeSection === 'projects' && (
            <section className="space-y-4">
              {projects.length > 0 ? (
                <div className="space-y-4">
                  {projects.slice(0, 5).map((project) => (
                    <ProjectListItem
                      key={project.id}
                      code={project.code}
                      title={project.title}
                      href={`/projects/${project.id}`}
                      manager={project.manager}
                      managerHref={`/researchers?q=${encodeURIComponent(project.manager)}`}
                      startDate={project.startDate}
                      endDate={project.endDate}
                      researchType={project.researchType}
                      actionType={project.projectType}
                      keywords={project.keywords}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--color-text-neutral-secondary)]">
                  No hay proyectos registrados.
                </p>
              )}
            </section>
          )}

          {activeSection === 'other' && (
            <section className="space-y-4">
              <p className="text-sm text-[var(--color-text-neutral-secondary)]">
                No hay otras producciones registradas.
              </p>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
