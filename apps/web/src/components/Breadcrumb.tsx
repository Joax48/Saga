'use client';

import Link from 'next/link';
import { House } from 'lucide-react';

/**
 * Represents a single breadcrumb item.
 */
type BreadcrumbItem = {
  /** Display text for the breadcrumb */
  label: string;

  /** Optional URL. If provided, the item will be rendered as a link */
  href?: string;
};

/**
 * Props for the Breadcrumb component.
 */
type BreadcrumbProps = {
  /** Array of breadcrumb items to render */
  items: BreadcrumbItem[];
};

/**
 * Breadcrumb navigation component.
 *
 * Renders a hierarchical navigation trail with a home icon as the starting point.
 * Each item can be either a link or plain text depending on whether `href` is provided.
 * The last item is always rendered as non-clickable text to indicate the current page.
 *
 * @example
 * <Breadcrumb
 *   items={[
 *     { label: "Products", href: "/products" },
 *     { label: "Electronics", href: "/products/electronics" },
 *     { label: "Laptops" }
 *   ]}
 * />
 */
export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-3 text-[18px]">
        {/* Home link */}
        <li>
          <Link
            href="/"
            className="flex items-center justify-center 
              text-white 
              transition-colors duration-200 
              hover:text-[var(--color-text-brand-primary)]"
            aria-label="Inicio"
          >
            <House size={22} strokeWidth={1.8} />
          </Link>
        </li>

        {/* Render breadcrumb items */}
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-3">
              {/* Separator */}
              <span className="text-[var(--color-text-neutral-primary)]">/</span>

              {/* Render as link if not last item and href exists */}
              {!isLast && item.href ? (
                <Link
                  href={item.href}
                  className="text-[var(--color-text-neutral-primary)] 
                    transition-colors duration-200 
                    hover:text-[var(--color-text-brand-primary)]"
                >
                  {item.label}
                </Link>
              ) : (
                /* Render as plain text if last item */
                <span className="text-[var(--color-text-neutral-secondary)]">
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
