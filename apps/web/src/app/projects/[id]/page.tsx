'use client';

import { useEffect, useState } from 'react';
import Breadcrumb from '@/components/Breadcrumb';
import CategoriesNavigation, { Category } from '@/components/DetailNavbar';
import { Box, User, Tag } from 'lucide-react';
import { getProjectById } from '@/services/projects';
import type { Project } from '@/services/projects';

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

export default function ProjectsDetailPage({ params }: ProjectsDetailPageProps) {
  const [activeTab, setActiveTab] = useState('general');
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await getProjectById(params.id);
        setProject(data);
      } catch (error) {
        console.error(error);
        setProject(null);
      }
    };

    fetchProject();
  }, [params.id]);

  const categories: Category[] = [
    {
      id: 'general',
      name: 'Información general',
      icon: <Box size={18} />,
      sectionTitle: 'Detalles del proyecto',
    },
    {
      id: 'profiles',
      name: 'Perfiles asociados',
      icon: <User size={18} />,
      sectionTitle: 'Perfiles',
    },
    {
      id: 'keywords',
      name: 'Palabras claves',
      icon: <Tag size={18} />,
      sectionTitle: 'Palabras claves',
    },
  ];

  if (!project) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-[18px] text-[var(--color-text-neutral-secondary)]">
          Proyecto no encontrado.
        </p>
      </main>
    );
  }

  const managerProfile = project.associatedProfiles.find(
    (profile) => profile.name === project.manager,
  );

  return (
    <main className="bg-[var(--color-bg-neutral-secondary)] min-h-screen">
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
              <h1 className="text-h3 md:text-h2 font-semibold text-[var(--color-text-neutral-primary)]">
                {project.code} | {project.title}
              </h1>

              <div className="space-y-3 text-body-lg text-[var(--color-text-neutral-secondary)]">
                <p>
                  <a
                    href={
                      managerProfile
                        ? `/researchers/${managerProfile.id}`
                        : `/researchers?q=${encodeURIComponent(project.manager)}`
                    }
                    className="text-[var(--color-text-brand-primary)] hover:underline"
                  >
                    {project.manager}
                  </a>{' '}
                  <span>(Persona encargada del proyecto).</span>
                </p>

                <p className="text-[var(--color-text-brand-primary)]">
                  {project.institute}
                </p>

                <p>
                  <span className="font-medium text-[var(--color-text-neutral-primary)]">
                    Disciplina:
                  </span>{' '}
                  {project.discipline}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-b border-[var(--color-gray-300)] bg-[var(--color-bg-neutral-tertiary)]">
        <CategoriesNavigation
          categories={categories}
          defaultActive="general"
          onCategoryChange={setActiveTab}
          containerClassName="max-w-6xl mx-auto w-full flex items-center px-0 py-0 h-16 bg-[var(--color-bg-neutral-tertiary)]"
          itemClassName="flex-1 h-full px-6 transition cursor-pointer text-center flex items-center justify-center border-b-[3px] border-transparent text-[var(--color-text-neutral-primary)]"
          activeItemClassName="border-b-[3px] border-[var(--color-text-brand-primary)]"
          backgroundColor="var(--color-bg-neutral-tertiary)"
          sectionContainerClassName="w-full px-0 py-4"
          sectionTitleClassName="max-w-6xl mx-auto font-medium text-[var(--color-text-neutral-primary)] text-h3"
        />
      </section>

      <section className="bg-[var(--color-bg-neutral-primary)] px-6 lg:px-10 py-12">
        <div className="max-w-6xl mx-auto">
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
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-10">
                {project.associatedProfiles.map((profile) => (
                  <div key={profile.id} className="flex items-start gap-4">
                    <div
                      className={`h-20 w-20 shrink-0 rounded-full bg-gradient-to-br ${getAvatarTone(
                        profile.id,
                      )} flex items-center justify-center text-lg font-semibold`}
                      aria-hidden="true"
                    >
                      {getInitials(profile.name)}
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-h5 leading-tight text-[var(--color-text-brand-primary)]">
                        {profile.name}
                      </p>

                      <p className="text-body-lg text-[var(--color-text-neutral-secondary)]">
                        {project.institute}
                      </p>

                      <p className="text-body-lg text-[var(--color-text-neutral-secondary)]">
                        {project.discipline}
                      </p>

                      {profile.role && (
                        <p className="text-body-md text-[var(--color-text-neutral-secondary)]">
                          {profile.role}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'keywords' && (
            <div className="space-y-10">
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
