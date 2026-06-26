'use client';

import Breadcrumb from '@/components/Breadcrumb';
import SearchBar from '@/components/SearchBar';

type HeroBreadcrumbItem = {
  /** Display text for each breadcrumb step */
  label: string;

  /** Optional URL. If provided, the item is rendered as a link */
  href?: string;
};

type PageHeroSearchProps = {
  /** Breadcrumb trail shown below the hero image on list pages */
  items: HeroBreadcrumbItem[];

  /** Main page heading displayed in the hero area */
  title: string;

  /** Placeholder text shown inside the search input */
  searchPlaceholder: string;

  /** Callback fired when the user submits a search query */
  onSearch: (query: string) => void;

  /** Pre-fills the search bar on mount (e.g. when restoring from URL params) */
  initialSearchValue?: string;

  /** Larger hero used only by the home page */
  variant?: 'compact' | 'home';
};

/**
 * Page-level hero section with breadcrumb navigation and a centered search bar.
 *
 * Renders a compact listing-page header with three responsibilities:
 * a centered title, a search entry point, and page context below the hero.
 *
 * Use this component at the top of list pages where users need context,
 * orientation, and a quick way to filter visible results.
 *
 * @example
 * <PageHeroSearch
 *   items={[
 *     { label: 'Home', href: '/' },
 *     { label: 'Projects' },
 *   ]}
 *   title="Projects"
 *   searchPlaceholder="Search by project name"
 *   onSearch={(query) => setSearchQuery(query)}
 * />
 */
export default function PageHeroSearch({
  items,
  title,
  searchPlaceholder,
  onSearch,
  initialSearchValue,
  variant = 'compact',
}: PageHeroSearchProps) {
  const isHome = variant === 'home';

  return (
    <>
      <section
        className={[
          "px-6 lg:px-10 pt-4 bg-[url('/ucr_hero_image.png')] bg-cover bg-top",
          isHome ? 'pb-20' : 'pb-12',
        ].join(' ')}
      >
        <div className={isHome ? 'flex justify-start h-14' : 'flex justify-start h-12'} />
        <div className="max-w-6xl mx-auto">
          <div
            className={isHome ? 'flex justify-start h-10' : 'flex justify-start h-18'}
          />
          <h1 className="mb-6 text-h2 sm:text-h1 text-center font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]">
            {title}
          </h1>

          <SearchBar
            placeholder={searchPlaceholder}
            onSearch={onSearch}
            initialValue={initialSearchValue}
          />
        </div>
        <div className={isHome ? 'flex justify-start h-30' : 'flex justify-start h-24'} />
      </section>

      {!isHome && items.length > 0 && (
        <div className="border-b border-[var(--color-border-neutral-secondary,var(--color-gray-200))] bg-[var(--color-bg-neutral-primary)] px-6 lg:px-10">
          <div className="mx-auto max-w-6xl pb-3 pt-6">
            <div className="-translate-x-1">
              <Breadcrumb items={items} spacing="none" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
