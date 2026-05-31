'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export interface Category {
  id: string;
  name: string;
  /** Inline icon node (e.g. a lucide-react icon). Takes precedence over iconSrc. */
  icon?: React.ReactNode;
  iconSrc?: string;
  sectionTitle?: string;
}

interface CategoriesNavigationProps {
  categories: Category[];
  defaultActive?: string;
  onCategoryChange: (categoryId: string) => void;
  hideSectionTitle?: boolean;
  /**
   * When provided, the component renders a custom horizontal layout instead of
   * the default grey boxed tabs (used by units, projects and productions).
   */
  containerClassName?: string;
  itemClassName?: string;
  activeItemClassName?: string;
}

export default function CategoriesNavigation({
  categories,
  defaultActive,
  onCategoryChange,
  hideSectionTitle = false,
  containerClassName,
  itemClassName,
  activeItemClassName,
}: CategoriesNavigationProps) {
  const [activeCategory, setActiveCategory] = useState(
    defaultActive || categories[0]?.id,
  );

  useEffect(() => {
    const initialCategory = defaultActive || categories[0]?.id;
    setActiveCategory(initialCategory);
    if (initialCategory) {
      onCategoryChange(initialCategory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    onCategoryChange(categoryId);
  };

  const activeCategoryName =
    categories.find((cat) => cat.id === activeCategory)?.sectionTitle ??
    categories.find((cat) => cat.id === activeCategory)?.name;

  const renderIcon = (category: Category, isActive: boolean) => {
    if (category.icon) return category.icon;
    if (category.iconSrc) {
      return (
        <Image
          src={category.iconSrc}
          alt=""
          width={22}
          height={22}
          style={{ opacity: isActive ? 1 : 0.4 }}
        />
      );
    }
    return null;
  };

  // ── Custom horizontal layout (caller-provided classes) ──────────────────
  const isCustomLayout = Boolean(containerClassName || itemClassName);
  if (isCustomLayout) {
    return (
      <nav className={containerClassName}>
        {categories.map((category) => {
          const isActive = category.id === activeCategory;
          return (
            <button
              key={category.id}
              id={`navbar-tab-${category.id}`}
              onClick={() => handleCategoryClick(category.id)}
              className={[itemClassName, isActive ? activeItemClassName : '']
                .filter(Boolean)
                .join(' ')}
            >
              {renderIcon(category, isActive)}
              <span>{category.name}</span>
            </button>
          );
        })}
      </nav>
    );
  }

  // ── Default grey boxed tabs ──────────────────────────────────────────────
  return (
    <div className="w-full">
      {/* Desktop tabs */}
      <nav className="hidden sm:flex w-full h-14 bg-[var(--color-gray-200)] border-y-2 border-[var(--color-gray-300)]">
        {categories.map((category) => {
          const isActive = category.id === activeCategory;
          return (
            <button
              key={category.id}
              id={`navbar-tab-${category.id}`}
              onClick={() => handleCategoryClick(category.id)}
              className={[
                'flex-1 h-full relative flex items-center justify-center gap-2',
                'text-[18px] font-normal transition-all duration-150 ease-in-out cursor-pointer transform-gpu',
                isActive
                  ? 'bg-[var(--color-gray-300)] text-[var(--color-text-neutral-primary)]'
                  : 'bg-transparent text-[var(--color-text-neutral-primary)] hover:bg-[var(--color-gray-300)] hover:shadow-sm hover:scale-[1.01]',
              ].join(' ')}
            >
              {renderIcon(category, isActive)}
              <span>{category.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Mobile dropdown */}
      <div className="sm:hidden flex items-center w-full h-14 px-4 border-y-2 border-[var(--color-gray-300)]">
        <select
          className="w-full bg-transparent text-[18px] font-normal outline-none cursor-pointer"
          value={activeCategory}
          onChange={(e) => handleCategoryClick(e.target.value)}
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
