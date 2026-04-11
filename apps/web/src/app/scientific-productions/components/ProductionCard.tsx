import Link from 'next/link';
import { Card } from '@/components/Card';
import type { ScientificProduction } from '@/types';

interface ProductionCardProps {
  production: ScientificProduction;
}

/**
 * List item for a single scientific production.
 *
 * Delegates layout and tag rendering to the global Card component, using
 * `chromeless` mode (no card chrome) and a custom `description` node that
 * renders the mixed-colour authors + journal-metadata line.
 */
export function ProductionCard({ production }: ProductionCardProps) {
  const {
    id,
    title,
    authors,
    type,
    open_access,
    publication_year,
    journal,
    volume,
    issue,
    pages,
    keywords,
  } = production;

  const journalParts = [
    journal ? `En: ${journal}` : null,
    volume != null && issue != null
      ? `${volume}, ${issue}`
      : volume != null
        ? String(volume)
        : null,
    pages ?? null,
  ].filter(Boolean);

  const metaSuffix = [String(publication_year), ...journalParts]
    .filter(Boolean)
    .join(', ');

  const allTags = open_access ? ['Acceso abierto', ...keywords] : keywords;

  /* Authors (blue links) + year/journal meta (grey) on the same line */
  const authorsNode = (
    <p className="leading-relaxed">
      {authors.map((author, index) => (
        <span key={author}>
          {/* TODO: replace href with /researchers/[id] once author IDs are available */}
          <Link
            href={`/researchers?q=${encodeURIComponent(author)}`}
            className="hover:underline"
            style={{ color: 'var(--color-text-brand-primary)' }}
          >
            {author}
          </Link>
          {index < authors.length - 1 && (
            <span style={{ color: 'var(--color-text-brand-primary)' }}>{', '}</span>
          )}
        </span>
      ))}
      {metaSuffix && (
        <span style={{ color: 'var(--color-text-neutral-secondary)' }}>
          {'. '}
          {metaSuffix}
        </span>
      )}
    </p>
  );

  return (
    <Card
      title={title}
      href={`/scientific-productions/${id}`}
      description={authorsNode}
      excerpt={`Producción científica: ${type.category} › ${type.subcategory}`}
      tags={allTags}
      hideImage
      chromeless
      className="py-5"
    />
  );
}
