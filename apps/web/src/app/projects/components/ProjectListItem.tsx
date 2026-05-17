'use client';

import Link from 'next/link';

import { Card } from '@/components/Card';

export type ProjectListItemProps = {
  /** Project code shown before the title */
  code: string;

  /** Main project title */
  title: string;

  /** Optional URL for the card title */
  href?: string;

  /** Name of the project manager */
  manager: string;

  /** Optional URL for the manager profile */
  managerHref?: string;

  /** Project start date */
  startDate: string;

  /** Project end date */
  endDate: string;

  /** Research category shown in the metadata line */
  researchType: string;

  /** Action category shown in the metadata line */
  actionType: string;

  /** Optional keyword tags for the project */
  keywords?: string[];
};

/**
 * Compact project summary rendered inside the projects list.
 *
 * Delegates layout and title handling to the shared Card component while
 * adapting project-specific metadata such as the manager, research type,
 * action type, and keyword tags.
 *
 * @example
 * <ProjectListItem
 *   code="PI-2026-01"
 *   title="Smart Campus Energy Monitoring"
 *   href="/projects/PI-2026-01"
 *   manager="Jane Doe"
 *   managerHref="/researchers/jane-doe"
 *   startDate="2026-01-15"
 *   endDate="2026-12-15"
 *   researchType="Applied Research"
 *   actionType="Development"
 *   keywords={['Energy', 'IoT', 'Campus']}
 * />
 */
export default function ProjectListItem({
  code,
  title,
  href = '#',
  manager,
  managerHref,
  startDate,
  endDate,
  researchType,
  actionType,
  keywords = [],
}: ProjectListItemProps) {
  return (
    <Card
      title={`${code} | ${title}`}
      href={href}
      description={
        <>
          <p>
            <Link
              // Prefer the linked researcher profile when available.
              href={managerHref ?? `/researchers?q=${encodeURIComponent(manager)}`}
              className="hover:underline"
              style={{ color: 'var(--color-text-brand-primary)' }}
            >
              {manager}
            </Link>{' '}
            <span style={{ color: 'var(--color-text-neutral-secondary)' }}>
              (Investigador Principal).
            </span>
          </p>
          <p style={{ color: 'var(--color-text-neutral-secondary)' }}>
            {startDate}
            {' -> '}
            {endDate}
          </p>
        </>
      }
      excerpt={`Tipo de Investigación: ${researchType} - Tipo de Acción: ${actionType}`}
      tags={keywords}
      hideImage
      chromeless
    />
  );
}
