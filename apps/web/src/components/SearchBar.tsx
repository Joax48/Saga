'use client';

import { useState } from 'react';
import Image from 'next/image';

/**
 * Props for the SearchBar component.
 */
interface SearchBarProps {
  /** Placeholder text for the input field */
  placeholder?: string;

  /** Callback triggered when a search is submitted */
  onSearch?: (query: string) => void;

  /** Pre-fills the input on mount (e.g. when restoring from URL params) */
  initialValue?: string;
}

/**
 * SearchBar component.
 *
 * Provides a search input with a submit button.
 * It allows users to type a query and trigger a search event.
 *
 * @example
 * <SearchBar onSearch={(query) => console.log(query)} />
 */
export default function SearchBar({
  placeholder = 'Buscar por nombre, unidad, palabras claves',
  onSearch,
  initialValue = '',
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);

  /**
   * Handles form submission.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(query);
  };

  return (
    <div className="w-full max-w-xl mx-auto">
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
          aria-label="Buscar"
          className="
            ml-2 transition-opacity hover:opacity-80
          "
        >
          <Image
            src="/search_blue.png"
            alt="Buscar"
            width={20}
            height={20}
            className="h-5 w-5"
          />
        </button>
      </form>
    </div>
  );
}
