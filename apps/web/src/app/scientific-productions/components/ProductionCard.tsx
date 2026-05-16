import Link from 'next/link';
import { Card } from '@/components/Card';
import type { SummaryScientificProduction } from '@/types';

interface ProductionCardProps {
  production: SummaryScientificProduction;
}

/**
 * Converts "Firstname Lastname" or "Firstname Compound Lastname" → "Lastname, F."
 * For compound last names (e.g. "Graziella Chini Zitelli"), uses the last two
 * words as the last name when the name has 3+ words.
 * Falls back to the original string if it can't parse.
 */
function abbreviateAuthor(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length < 2) return fullName;
  const firstInitial = parts[0][0].toUpperCase();
  // Use last two words as compound last name if 3+ parts, otherwise just the last word
  const lastName =
    parts.length >= 3
      ? `${parts[parts.length - 2]} ${parts[parts.length - 1]}`
      : parts[parts.length - 1];
  return `${lastName}, ${firstInitial}.`;
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

  // keywords ahora son KeywordReference[] — usar .value para el tag label
  const keywordTags = Array.from(keywords).map((kw) => kw.value);
  const allTags = open_access ? ['Acceso abierto', ...keywordTags] : keywordTags;

  /* Authors (blue links) + year/journal meta (grey) on the same line */
  const authorsNode = (
    <p className="leading-relaxed">
      {Array.from(authors).map((author, index) => (
        <span key={author.id}>
          {/* TODO: replace href with /researchers/[id] once author IDs are available */}
          <Link
            href={`/researchers/${author.id}`}
            className="hover:underline"
            style={{ color: 'var(--color-text-brand-primary)' }}
          >
            {author.name}
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
      excerpt={type ? `Producción científica: ${type}` : 'Producción científica'}
      tags={allTags}
      hideImage
      chromeless
    />
  );
}
