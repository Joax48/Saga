'use client';

import { useEffect, useState } from 'react';
import Breadcrumb from '@/components/Breadcrumb';
import CategoriesNavigation, { Category } from '@/components/DetailNavbar';
import { Box, User, Tag } from 'lucide-react';
import { getProjects } from '@/services/projects';
import type { Project } from '@/services/projects';

interface ProjectsDetailPageProps {
  params: { id: string };
}

export default function ProjectsDetailPage({ params }: ProjectsDetailPageProps) {
  const [activeTab, setActiveTab] = useState('general');
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await getProjects(1, 20, '');
        const found = response.data.find((p) => p.id === params.id);

        if (!found) {
          throw new Error('Project not found');
        }

        setProject(found);
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
    },
    {
      id: 'profiles',
      name: 'Perfiles asociados',
      icon: <User size={18} />,
    },
    {
      id: 'keywords',
      name: 'Palabras claves',
      icon: <Tag size={18} />,
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

  return (
    <main className="bg-[var(--color-bg-neutral-secondary)] min-h-screen">
      <section className="px-6 lg:px-10 pt-6 pb-10">
        <div className="max-w-[1280px] mx-auto space-y-8">
          <Breadcrumb
            items={[
              { label: 'Proyectos', href: '/projects' },
              { label: `${project.code}` },
            ]}
          />

          <div className="max-w-[1100px] space-y-6">
            <h1 className="text-[40px] leading-[1.15] font-normal text-[var(--color-text-neutral-primary)]">
              {project.code} | {project.title}
            </h1>

            <div className="space-y-4 text-[18px] leading-[1.6]">
              <p>
                <a
                  href="#"
                  className="text-[var(--color-text-brand-primary)] hover:underline"
                >
                  {project.manager}
                </a>{' '}
                <span className="text-[var(--color-text-neutral-secondary)]">
                  (Persona encargada del proyecto).
                </span>
              </p>

              <p>
                <a
                  href="#"
                  className="text-[var(--color-text-brand-primary)] hover:underline"
                >
                  {project.institute}
                </a>
              </p>

              <p className="text-[var(--color-text-neutral-secondary)]">
                Disciplina: {project.discipline}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Deberia ser así? */}
      <section className="border-t border-b border-[#D9D9D9] bg-[#F2F2F2]">
        <div className="max-w-[1280px] mx-auto">
          <CategoriesNavigation
            categories={categories}
            defaultActive="general"
            onCategoryChange={setActiveTab}
            containerClassName="w-full flex items-center px-0 py-0 h-16 bg-[#F2F2F2]"
            itemClassName="flex-1 h-full px-6 transition cursor-pointer text-center flex items-center justify-center border-b-[3px] border-transparent text-[var(--color-text-neutral-primary)]"
            activeItemClassName="border-b-[3px] border-[var(--color-text-brand-primary)]"
            backgroundColor="#F2F2F2"
          />
        </div>
      </section>

      <section className="bg-[var(--color-bg-neutral-primary)] px-6 lg:px-10 py-12">
        <div className="max-w-[1280px] mx-auto">
          {activeTab === 'general' && (
            <div className="space-y-10">
              <h2 className="text-[40px] leading-[1.2] font-normal text-[var(--color-text-neutral-primary)]">
                Detalles del proyecto
              </h2>

              <div className="space-y-6">
                <h3 className="text-[32px] leading-[1.25] font-normal text-[var(--color-text-neutral-primary)]">
                  Descripción
                </h3>

                <p className="max-w-[1150px] text-[18px] leading-[1.7] text-[var(--color-text-neutral-secondary)]">
                  {project.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-20 pt-4">
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
              <h2 className="text-[40px] leading-[1.2] font-normal text-[var(--color-text-neutral-primary)]">
                Perfiles asociados
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.associatedProfiles.map((profile) => (
                  <div
                    key={profile.id}
                    className="rounded-2xl border border-[#D9D9D9] bg-white p-5 text-[18px] text-[var(--color-text-neutral-primary)]"
                  >
                    <p>{profile.name}</p>
                    {profile.role && (
                      <p className="mt-1 text-[16px] text-[var(--color-text-neutral-secondary)]">
                        {profile.role}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'keywords' && (
            <div className="space-y-10">
              <h2 className="text-[40px] leading-[1.2] font-normal text-[var(--color-text-neutral-primary)]">
                Palabras claves
              </h2>

              <div className="flex flex-wrap gap-3">
                {project.keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="inline-flex items-center rounded-full border border-[#D9D9D9] bg-white px-4 py-2 text-[16px] text-[var(--color-text-neutral-primary)]"
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
    <div className="grid grid-cols-1 sm:grid-cols-[260px_1fr] gap-3">
      <p className="text-[18px] leading-[1.6] text-[var(--color-text-neutral-secondary)]">
        {label}
      </p>
      <p className="text-[18px] leading-[1.6] text-[var(--color-text-neutral-secondary)]">
        {value}
      </p>
    </div>
  );
}
