'use client';

import { useState, useEffect } from 'react';
import Breadcrumb from '../../../components/Breadcrumb';
import DetailNavbar from '../../../components/DetailNavbar';
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
import { getResearchers } from '../../../services/researchers';

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

const defaultProfileData = {
  position: 'Profesora asociada',
  departmentLink: 'https://www.ucr.ac.cr',
  altNames: ['Alejandra Arias-Salazar', 'Alejandra Arias'],
  profileLinks: [
    {
      label: 'ORCID',
      href: 'https://orcid.org/0000-0008-7598-5728',
      icon: <Globe size={16} />,
    },
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/example',
      icon: <Link2 size={16} />,
    },
    {
      label: 'ResearchGate',
      href: 'https://www.researchgate.net/profile/name-surname',
      icon: <ExternalLink size={16} />,
    },
  ],
  education: [
    {
      bold: 'Doctora en Estadística',
      rest: ' – Freie Universität Berlin, Alemania (2022)',
    },
    {
      bold: 'Máster en Estadística',
      rest: ' – Universidad de Costa Rica, Costa Rica (2017)',
    },
    {
      bold: 'Bachiller en Estadística',
      rest: ' – Universidad de Costa Rica, Costa Rica (2014)',
    },
  ],
  keywords: [
    'Modelos estadísticos',
    'Series temporales',
    'Aprendizaje automático',
    'Bioestadística',
  ],
  collaborations: [
    'Universidad Nacional de Costa Rica',
    'Centro de Investigación en Biología Celular',
    'Instituto de Estadística Aplicada',
  ],
  publications: [
    'Análisis estadístico de datos ambientales (2024)',
    'Modelos de regresión para series temporales (2023)',
    'Aplicaciones de bioestadística en salud pública (2022)',
  ],
  projects: [
    'Proyecto NEXUS: Sistemas de datos para biodiversidad',
    'Estudio RED-CO: Colaboraciones científicas nacionales',
  ],
  otherProductions: [
    'Informe técnico sobre métricas académicas (2024)',
    'Capítulo de libro: Estadística aplicada en planificación urbana',
  ],
};

export default function ResearchersDetailPage({ params }: ResearchersDetailPageProps) {
  const [activeSection, setActiveSection] = useState('personal');
  const [researcher, setResearcher] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getResearchers(1, 50);
        const found =
          response.data.find((item) => item.id === parseInt(params.id)) ??
          response.data[0];

        setResearcher(found);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [params.id]);

  if (loading || !researcher) {
    return <div className="p-6">Cargando...</div>;
  }

  const getAvatarUrl = (name: string, surname: string, secondSurname: string): string => {
    const fullName = `${name} ${surname} ${secondSurname}`;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0D8ABC&color=fff&size=200`;
  };

  const profile = {
    ...defaultProfileData,
    name: `${researcher.name} ${researcher.firstSurname} ${researcher.secondSurname}`,
    unit: researcher.baseUnit,
    image:
      researcher.photoUrl ||
      getAvatarUrl(researcher.name, researcher.firstSurname, researcher.secondSurname),
  };

  return (
    <main className="min-h-screen bg-[var(--color-bg-neutral-primary)]">
      <div className="bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Breadcrumb
            items={[
              {
                label: 'Perfiles',
                href: '/researchers',
              },
              { label: profile.name },
            ]}
          />

          <div className="mt-8 flex gap-8 items-start">
            <div className="shrink-0 w-44 h-44 overflow-hidden rounded-2xl bg-slate-100">
              <img
                src={profile.image}
                alt={profile.name}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
                <h1 className="text-2xl font-semibold text-[var(--color-text-neutral-primary)]">
                  {profile.name}
                </h1>
              </div>

              <div className="space-y-1 mb-4">
                {profile.altNames.map((name) => (
                  <p
                    key={name}
                    className="text-sm text-[var(--color-text-neutral-primary)]"
                  >
                    {name}
                  </p>
                ))}
              </div>

              <p className="text-sm text-[var(--color-text-neutral-secondary)]">
                {profile.position}
              </p>
              <a
                href={profile.departmentLink}
                className="inline-block text-sm text-[var(--color-text-brand-primary)] hover:underline"
              >
                {profile.unit}
              </a>

              <div className="pt-6 space-y-3">
                <h2 className="text-base font-semibold text-[var(--color-text-neutral-primary)]">
                  Enlaces de interés
                </h2>
                <div className="space-y-2">
                  {profile.profileLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 text-sm text-[var(--color-text-neutral-primary)] hover:text-[var(--color-text-brand-primary)] transition-colors"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--color-bg-brand-primary)] text-white shrink-0">
                        {link.icon}
                      </span>
                      <span className="truncate">{link.href}</span>
                    </a>
                  ))}
                </div>
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
          containerClassName="max-w-6xl mx-auto flex items-center px-6 h-16"
          itemClassName="flex items-center gap-2 px-4 h-full border-b-2 border-transparent text-sm text-[var(--color-text-neutral-secondary)] transition cursor-pointer hover:text-[var(--color-text-neutral-primary)]"
          activeItemClassName="border-b-2 border-[var(--color-text-brand-primary)] text-[var(--color-text-brand-primary)] font-medium"
        />

        <div className="max-w-6xl mx-auto px-6 py-8">
          {activeSection === 'personal' && (
            <section className="space-y-8">
              <h2 className="text-xl font-semibold text-[var(--color-text-neutral-primary)]">
                Perfil Personal
              </h2>

              <div>
                <h3 className="text-base font-semibold text-[var(--color-text-neutral-primary)] mb-3">
                  Educación
                </h3>
                <ul className="space-y-1 text-base text-[var(--color-text-neutral-primary)]">
                  {profile.education.map((item) => (
                    <li key={item.bold} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--color-text-neutral-primary)] shrink-0" />
                      <span>
                        <strong>{item.bold}</strong>
                        {item.rest}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-base font-semibold text-[var(--color-text-neutral-primary)] mb-3">
                  Biografía
                </h3>
                <p className="text-base leading-7 text-[var(--color-text-neutral-primary)]">
                  Investigadora con experiencia en modelos estadísticos aplicados a datos
                  ambientales y de salud pública. Su trabajo se centra en la integración
                  de métodos cuantitativos para apoyar la toma de decisiones en políticas
                  públicas.
                </p>
              </div>
            </section>
          )}

          {activeSection === 'keywords' && (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-[var(--color-text-neutral-primary)]">
                Palabras clave
              </h2>
              <div className="flex flex-wrap gap-3">
                {profile.keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-full border border-[var(--color-border-neutral-primary)] bg-white px-4 py-2 text-base text-[var(--color-text-neutral-primary)]"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </section>
          )}

          {activeSection === 'collaboration' && (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-[var(--color-text-neutral-primary)]">
                Redes de colaboración
              </h2>
              <ul className="space-y-2 text-base text-[var(--color-text-neutral-primary)]">
                {profile.collaborations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          )}

          {activeSection === 'production' && (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-[var(--color-text-neutral-primary)]">
                Producción científica
              </h2>
              <ol className="list-decimal space-y-2 pl-5 text-base text-[var(--color-text-neutral-primary)]">
                {profile.publications.map((item) => (
                  <li key={item}>
                    <a href="/scientific-productions" className="hover:underline">
                      {item}
                    </a>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {activeSection === 'projects' && (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-[var(--color-text-neutral-primary)]">
                Proyectos
              </h2>
              <ul className="space-y-2 text-base text-[var(--color-text-neutral-primary)]">
                {profile.projects.map((item) => (
                  <li key={item}>
                    <a href="/projects" className="hover:underline">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {activeSection === 'other' && (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-[var(--color-text-neutral-primary)]">
                Otras producciones
              </h2>
              <ul className="space-y-2 text-base text-[var(--color-text-neutral-primary)]">
                {profile.otherProductions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
