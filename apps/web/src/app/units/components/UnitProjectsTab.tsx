'use client';

import { useState, useMemo, useCallback } from 'react';

import Pagination from '@/components/Pagination';
import ProjectListItem from '@/app/projects/components/ProjectListItem';
import type { UnitProject } from '@/services/units';

const PAGE_SIZE = 10;

interface UnitProjectsTabProps {
  projects: UnitProject[];
}

export function UnitProjectsTab({ projects }: UnitProjectsTabProps) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(projects.length / PAGE_SIZE));

  const paginated = useMemo(
    () => projects.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [projects, page],
  );

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (projects.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-[16px] text-[var(--color-text-neutral-secondary)]">
          No hay proyectos asociados.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <p
        className="mb-4 text-sm"
        style={{ color: 'var(--color-text-neutral-secondary)' }}
      >
        {projects.length} resultado{projects.length !== 1 ? 's' : ''}
      </p>

      <ul className="flex flex-col gap-4">
        {paginated.map((project) => (
          <li key={project.id}>
            <ProjectListItem
              code={project.code}
              title={project.name}
              href={`/projects/${project.id}`}
              manager={project.managerName}
              managerHref={`/researchers/${project.managerId}`}
              startDate={project.startDate}
              endDate={project.endDate}
              researchType={project.researchType}
              actionType={project.projectType}
              keywords={project.keywords ? project.keywords.split(',') : []}
            />
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
