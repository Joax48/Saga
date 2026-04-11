'use client';

import Image from 'next/image';
import Link from 'next/link';

/* ─── Types ──────────────────────────────────────────────────────────── */

export type CardLayout = 'horizontal' | 'vertical';
export type CardImageShape = 'square' | 'circle';

export interface CardProps {
  /** Main heading shown in brand colour */
  title: string;
  /**
   * Primary body content. Accepts a plain string or any React node for
   * richer layouts (e.g. mixed-colour inline content, links inside the body).
   * When omitted the body area is not rendered.
   */
  description?: React.ReactNode;
  /** Optional italic secondary text (e.g. citation, author note) */
  excerpt?: string;
  /** Keyword/topic badges rendered below the body */
  tags?: string[];
  /** URL of the cover image; falls back to a placeholder when omitted */
  imageSrc?: string;
  /** Accessible alt text for the image (defaults to the title) */
  imageAlt?: string;
  /**
   * When provided the title renders as a Next.js `<Link>` to this URL.
   * The card itself is NOT made fully clickable — only the title navigates.
   */
  href?: string;
  /**
   * When `true` the image / placeholder area is not rendered at all,
   * regardless of `imageSrc`. Useful for text-only list items.
   */
  hideImage?: boolean;
  /**
   * Controls the shape of the image area.
   * `square` → rectangular crop (default)
   * `circle` → circular crop, fixed 56 × 56 px
   */
  imageShape?: CardImageShape;
  /**
   * `horizontal` → image on the left, content on the right (default)
   * `vertical`   → image on top, content below
   */
  layout?: CardLayout;
  /** Additional Tailwind / DaisyUI classes for the card root */
  className?: string;
  /**
   * When `true` the card chrome (background, shadow, border-radius) is
   * removed. Useful for list items that need the Card structure but not
   * the visual box treatment.
   */
  chromeless?: boolean;
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
 * @example Circular image (e.g. researcher portrait)
 * <Card imageShape="circle" imageSrc="/photos/jane.jpg" title="..." description="..." />
 *
 * @example Chromeless list item (no card box chrome)
 * <Card chromeless hideImage title="..." description={<AuthorsLine />} className="py-5" />
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
  href,
  hideImage = false,
  imageShape = 'square',
  layout = 'horizontal',
  className = '',
  chromeless = false,
  onClick,
}: CardProps) {
  const isInteractive = Boolean(onClick);
  const isHorizontal = layout === 'horizontal';
  const isCircle = imageShape === 'circle';
  const showImage = !hideImage;

  /* ── Figure styles by shape ── */
  const figureClass = isCircle
    ? 'relative shrink-0 overflow-hidden rounded-full'
    : isHorizontal
      ? 'relative w-28 shrink-0 overflow-hidden'
      : 'relative overflow-hidden';

  const figureStyle: React.CSSProperties = isCircle
    ? { width: '3.5rem', height: '3.5rem' }
    : isHorizontal
      ? { borderRadius: 'var(--radius-300) 0 0 var(--radius-300)' }
      : { borderRadius: 'var(--radius-300) var(--radius-300) 0 0', aspectRatio: '16/9' };

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
        !chromeless && 'card bg-base-100 shadow-sm',
        !chromeless && isHorizontal && showImage && 'card-side',
        isInteractive &&
          'cursor-pointer transition-shadow hover:shadow-md focus-visible:outline-2',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* ── Image ── */}
      {showImage && (
        <figure className={figureClass} style={figureStyle}>
          {imageSrc ? (
            <Image src={imageSrc} alt={imageAlt ?? title} fill className="object-cover" />
          ) : (
            <ImagePlaceholder />
          )}
        </figure>
      )}

      {/* ── Content ── */}
      <div className={chromeless ? 'flex flex-col gap-1' : 'card-body gap-2 p-4'}>
        <h4
          className={[!chromeless && 'card-title', 'text-base font-bold leading-snug']
            .filter(Boolean)
            .join(' ')}
          style={{ color: 'var(--color-text-brand-primary)' }}
        >
          {href ? (
            <Link href={href} className="hover:underline">
              {title}
            </Link>
          ) : (
            title
          )}
        </h4>

        {description !== undefined && (
          <div
            className="text-sm leading-relaxed"
            style={{ color: 'var(--color-text-neutral-primary)' }}
          >
            {description}
          </div>
        )}

        {excerpt && (
          <p
            className="text-sm italic"
            style={{ color: 'var(--color-text-neutral-secondary)' }}
          >
            {excerpt}
          </p>
        )}

        {tags.length > 0 && (
          <div
            className={
              chromeless
                ? 'mt-1.5 flex flex-wrap gap-2'
                : 'card-actions mt-1 flex-wrap gap-2'
            }
            aria-label="Tags"
          >
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full px-4 py-1.5 text-xs font-medium text-white"
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
