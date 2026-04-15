'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from './Button';

/**
 * Props for the SearchBar component.
 */
interface SearchBarProps {
  /** Placeholder text for the input field */
  placeholder?: string;

  /** Callback triggered when a search is submitted */
  onSearch?: (query: string) => void;
}

/**
 * SearchBar component.
 *
 * Provides a search input with a submit button and an optional
 * "advanced search" action. It allows users to type a query
 * and trigger a search event.
 *
 * @example
 * <SearchBar onSearch={(query) => console.log(query)} />
 */
export default function SearchBar({
  placeholder = 'Buscar por nombre, unidad, palabras claves',
  onSearch,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  /**
   * Handles form submission.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(query);
  };

  const handleAdvancedSearch = () => {
    const trimmed = query.trim();

    if (trimmed.length > 0) {
      router.push(`/advanced-search?q=${encodeURIComponent(trimmed)}`);
      return;
    }

    router.push('/advanced-search');
  };

  return (
    <div className="w-full flex flex-col items-end gap-1 max-w-xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className="
          w-full flex items-center rounded-full px-5 py-2.5
          bg-[var(--color-bg-neutral-primary)]
          border border-[var(--color-gray-300)]
        "
      >
        <input
          type="text"
          className="
            flex-1 bg-transparent text-sm
            text-[var(--color-text-neutral-secondary)]
            placeholder-[var(--color-text-neutral-tertiary)]
            focus:outline-none
          "
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <button
          type="submit"
          className="
            ml-2 transition-colors
            text-[var(--color-icon-neutral-tertiary)]
            hover:text-[var(--color-icon-neutral-primary)]
          "
        >
          {/* Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z"
            />
          </svg>
        </button>
      </form>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleAdvancedSearch}
        className="
          rounded-none bg-transparent px-1 py-1
          text-[var(--color-text-brand-primary)]
          hover:bg-transparent hover:text-[var(--color-azul-700)] hover:underline
        "
      >
        Búsqueda avanzada
      </Button>
    </div>
  );
}
