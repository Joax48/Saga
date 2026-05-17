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
  /** Breadcrumb trail shown above the page title */
  items: HeroBreadcrumbItem[];

  /** Main page heading displayed in the hero area */
  title: string;

  /** Placeholder text shown inside the search input */
  searchPlaceholder: string;

  /** Callback fired when the user submits a search query */
  onSearch: (query: string) => void;

  /** Pre-fills the search bar on mount (e.g. when restoring from URL params) */
  initialSearchValue?: string;
};

/**
 * Page-level hero section with breadcrumb navigation and a centered search bar.
 *
 * Renders a compact listing-page header with three responsibilities:
 * breadcrumb navigation, a centered title, and a search entry point.
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
}: PageHeroSearchProps) {
  return (
    <section className="px-6 lg:px-10 pt-4 pb-20 bg-[url('/ucr_hero_image.png')] bg-cover bg-center">
      <div className="flex justify-start h-14"></div>
      <div className="max-w-6xl mx-auto">
        <div className="pt-2 pb-4">
          <Breadcrumb items={items} />
        </div>
        <div className="flex justify-start h-10"></div>
        <h1 className="mb-6 text-h1 text-center font-bold text-white">{title}</h1>

        <SearchBar placeholder={searchPlaceholder} onSearch={onSearch} initialValue={initialSearchValue} />
      </div>
      <div className="flex justify-start h-30"></div>
    </section>
  );
}
