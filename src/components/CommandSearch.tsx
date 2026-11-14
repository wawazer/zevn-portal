import { Search } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';
import { categories } from '../data/tools';
import type { CategoryFilter, Theme } from '../types';

interface CommandSearchProps {
  query: string;
  onQueryChange: (query: string) => void;
  activeCategory: CategoryFilter;
  onCategoryChange: (category: CategoryFilter) => void;
  theme: Theme;
}

export function CommandSearch({
  query,
  onQueryChange,
  activeCategory,
  onCategoryChange,
  theme,
}: CommandSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isDark = theme === 'dark';

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        onQueryChange('');
        inputRef.current?.blur();
      }
    },
    [onQueryChange],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="mb-6 space-y-4">
      {/* Header */}
      <div>
        <h1
          className={`text-lg font-semibold ${
            isDark ? 'text-text-primary' : 'text-text-primary-light'
          }`}
        >
          Micro-Tools & Utility Hub
        </h1>
        <p
          className={`mt-1 text-sm ${
            isDark ? 'text-text-secondary' : 'text-text-secondary-light'
          }`}
        >
          Serah gua
        </p>
      </div>

      {/* Search input */}
      <div className="relative">
        <Search
          size={16}
          className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${
            isDark ? 'text-text-secondary' : 'text-text-secondary-light'
          }`}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Cari tools..."
          className={`h-10 w-full rounded-lg border pl-9 pr-16 text-sm transition-colors duration-150 ${
            isDark
              ? 'border-hairline bg-[#0F172A] text-text-primary placeholder:text-text-secondary/50 focus:border-accent'
              : 'border-hairline-light bg-white text-text-primary-light placeholder:text-text-secondary-light/50 focus:border-accent'
          } outline-none`}
        />
        <kbd
          className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded px-1.5 py-0.5 font-mono text-[10px] ${
            isDark
              ? 'border border-hairline bg-surface text-text-secondary'
              : 'border border-hairline-light bg-hairline-light text-text-secondary-light'
          }`}
        >
          Ctrl K
        </kbd>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-1.5">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat as CategoryFilter)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors duration-150 ${
                isActive
                  ? isDark
                    ? 'bg-accent/15 text-accent'
                    : 'bg-accent/15 text-sky-700'
                  : isDark
                    ? 'text-text-secondary hover:bg-surface hover:text-text-primary'
                    : 'text-text-secondary-light hover:bg-hairline-light hover:text-text-primary-light'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
