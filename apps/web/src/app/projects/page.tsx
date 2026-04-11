'use client';

import { useEffect, useState } from 'react';

import PageHeroSearch from '@/components/PageHeroSearch';
import Pagination from '@/components/Pagination';
import ProjectListItem from '@/app/projects/components/ProjectListItem';

import { getProjects } from '@/services/projects';

import type { Project } from '@/mocks/projects-data';

/**
 * Projects listing page.
 *
 * This client component owns the page state for search and pagination,
 * and fetches the matching project records from the API on demand.
 */
export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Reset pagination whenever the search term changes.
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Keep the page aligned with the current query and page selection.
        const projectsResponse = await getProjects(currentPage, 10, searchQuery, {});

        setProjects(projectsResponse.data);
        setTotalPages(
          Math.max(1, Math.ceil(projectsResponse.total / projectsResponse.limit)),
        );
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [currentPage, searchQuery]);

  return (
    <main className="bg-[var(--color-bg-neutral-secondary)] min-h-screen">
      <PageHeroSearch
        items={[{ label: 'Proyectos' }]}
        title="Proyectos"
        searchPlaceholder="Buscar por proyecto"
        onSearch={handleSearch}
      />

      {/* Main content */}
      <section className="bg-[var(--color-bg-neutral-primary)] px-6 lg:px-10 py-14">
        <div className="max-w-5xl mx-auto">
          {/* Filters are temporarily disabled on this page. */}

          {/* Results list */}
          <div className="space-y-12">
            {projects.map((project) => {
              // Link the manager to the matching researcher profile when possible.
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

            <div className="pt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
