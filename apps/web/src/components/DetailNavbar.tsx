'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export interface Category {
  id: string;
  name: string;
  iconSrc?: string;
  sectionTitle?: string;
}

interface CategoriesNavigationProps {
  categories: Category[];
  defaultActive?: string;
  onCategoryChange: (categoryId: string) => void;
  hideSectionTitle?: boolean;
}

export default function CategoriesNavigation({
  categories,
  defaultActive,
  onCategoryChange,
  hideSectionTitle = false,
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

  return (
    <div className="w-full">
      {/* Desktop tabs */}
      <nav className="hidden sm:flex w-full h-14 bg-[var(--color-gray-50)] border-y-2 border-[var(--color-gray-300)]">
        {categories.map((category) => {
          const isActive = category.id === activeCategory;
          return (
            <button
              key={category.id}
              id={`navbar-tab-${category.id}`}
              onClick={() => handleCategoryClick(category.id)}
              className={[
                'flex-1 h-full relative flex items-center justify-center gap-2',
                'text-[18px] font-normal transition-colors cursor-pointer',
                'border-b-2',
                isActive
                  ? 'border-[var(--color-text-brand-primary)]'
                  : 'border-transparent hover:border-gray-300',
              ].join(' ')}
              style={{ color: '#0F0F0F' }}
            >
              {category.iconSrc && (
                <Image
                  src={category.iconSrc}
                  alt=""
                  width={22}
                  height={22}
                  style={{
                    opacity: isActive ? 1 : 0.4,
                  }}
                />
              )}
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
