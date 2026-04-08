'use client';

/* ─── Types ──────────────────────────────────────────────────────────── */

export type CardLayout = 'horizontal' | 'vertical';

export interface CardProps {
  /** Main heading shown in brand colour */
  title: string;
  /** Primary body text (clipped to 3 lines) */
  description: string;
  /** Optional italic secondary text (e.g. citation, author note) */
  excerpt?: string;
  /** Keyword/topic badges rendered below the body */
  tags?: string[];
  /** URL of the cover image; falls back to a placeholder when omitted */
  imageSrc?: string;
  /** Accessible alt text for the image (defaults to the title) */
  imageAlt?: string;
  /**
   * `horizontal` → image on the left, content on the right (default)
   * `vertical`   → image on top, content below
   */
  layout?: CardLayout;
  /** Additional Tailwind / DaisyUI classes for the card root */
  className?: string;
  /** Makes the whole card interactive — adds hover/focus styles */
  onClick?: React.MouseEventHandler<HTMLElement>;
}

/* ─── Image placeholder ──────────────────────────────────────────────── */

function ImagePlaceholder() {
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{ backgroundColor: 'var(--color-bg-neutral-secondary)' }}
      aria-hidden="true"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ color: 'var(--color-icon-neutral-tertiary)' }}
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    </div>
  );
}

/* ─── Component ──────────────────────────────────────────────────────── */

/**
 * Reusable content card for researchers, projects, scientific productions,
 * and units.
 *
 * All content is driven by props — nothing is hardcoded.
 *
 * @example Horizontal (default)
 * <Card
 *   title="Quantum entanglement study"
 *   description="A deep dive into non-local correlations between particles."
 *   excerpt="Published in Nature, 2024"
 *   tags={['Physics', 'Quantum', 'UCR']}
 *   imageSrc="/covers/quantum.jpg"
 * />
 *
 * @example Vertical
 * <Card layout="vertical" title="..." description="..." tags={['UCR']} />
 *
 * @example Interactive
 * <Card title="..." description="..." onClick={() => router.push('/detail/1')} />
 */
export function Card({
  title,
  description,
  excerpt,
  tags = [],
  imageSrc,
  imageAlt,
  layout = 'horizontal',
  className = '',
  onClick,
}: CardProps) {
  const isInteractive = Boolean(onClick);
  const isHorizontal = layout === 'horizontal';

  return (
    <article
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        isInteractive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.currentTarget.click();
              }
            }
          : undefined
      }
      className={[
        'card bg-base-100 shadow-sm',
        isHorizontal && 'card-side',
        isInteractive && 'cursor-pointer transition-shadow hover:shadow-md focus-visible:outline-2',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* ── Image ── */}
      <figure
        className={isHorizontal ? 'w-28 shrink-0 overflow-hidden' : 'overflow-hidden'}
        style={
          isHorizontal
            ? { borderRadius: 'var(--radius-300) 0 0 var(--radius-300)' }
            : { borderRadius: 'var(--radius-300) var(--radius-300) 0 0', aspectRatio: '16/9' }
        }
      >
        {imageSrc ? (
          <img src={imageSrc} alt={imageAlt ?? title} className="h-full w-full object-cover" />
        ) : (
          <ImagePlaceholder />
        )}
      </figure>

      {/* ── Content ── */}
      <div className="card-body gap-2 p-4">
        <h4
          className="card-title text-base font-bold leading-snug"
          style={{ color: 'var(--color-text-brand-primary)' }}
        >
          {title}
        </h4>

        <p
          className="line-clamp-3 text-sm leading-relaxed"
          style={{ color: 'var(--color-text-neutral-primary)' }}
        >
          {description}
        </p>

        {excerpt && (
          <p className="text-sm italic" style={{ color: 'var(--color-text-neutral-secondary)' }}>
            {excerpt}
          </p>
        )}

        {tags.length > 0 && (
          <div className="card-actions mt-1 flex-wrap gap-1" aria-label="Tags">
            {tags.map((tag) => (
              <span
                key={tag}
                className="badge badge-sm rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: 'var(--color-bg-info-subtle)' }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

export default Card;
