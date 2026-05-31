'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

type BackButtonProps = {
  /** Path used when there is no browser history to fall back to. */
  fallbackHref: string;
  /** Visible label. Defaults to "Volver". */
  label?: string;
  /** Accessible label. Defaults to the visible label. */
  ariaLabel?: string;
  /** Extra classes appended to the default styling. */
  className?: string;
};

/**
 * Navigates back using browser history when available, otherwise routes to
 * `fallbackHref`. Use on detail pages to return to the originating list while
 * preserving filters and scroll position.
 */
export default function BackButton({
  fallbackHref,
  label = 'Volver',
  ariaLabel,
  className = '',
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel ?? label}
      className={`group inline-flex items-center gap-1.5 text-sm text-[var(--color-text-neutral-secondary)] hover:text-[var(--color-text-brand-primary)] transition-colors cursor-pointer ${className}`.trim()}
    >
      <ArrowLeft
        size={16}
        strokeWidth={2}
        className="transition-transform duration-200 ease-out group-hover:-translate-x-1"
      />
      <span>{label}</span>
    </button>
  );
}
