import { useEffect, useMemo, useState } from 'react';
import { CommandSearch } from './components/CommandSearch';
import { LicenseManager } from './components/LicenseManager';
import { Navbar } from './components/Navbar';
import { ToolCard } from './components/ToolCard';
import { tools } from './data/tools';
import { useTheme } from './hooks/useTheme';
import type { CategoryFilter } from './types';

function useRoute() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = (to: string) => {
    window.history.pushState(null, '', to);
    setPath(to);
  };

  return { path, navigate };
}

function HomePage({ theme }: { theme: 'dark' | 'light' }) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All');

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return tools.filter((t) => {
      const matchesCategory =
        activeCategory === 'All' || t.category === activeCategory;
      const matchesQuery =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.subdomain.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, activeCategory]);

  return (
    <>
      <CommandSearch
        query={query}
        onQueryChange={setQuery}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        theme={theme}
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((tool) => (
          <ToolCard key={tool.id} tool={tool} theme={theme} />
        ))}
      </div>
      {filtered.length === 0 && (
        <p
          className={`mt-12 text-center text-sm ${
            theme === 'dark'
              ? 'text-text-secondary'
              : 'text-text-secondary-light'
          }`}
        >
          Tidak ada tools yang cocok.
        </p>
      )}
    </>
  );
}

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { path } = useRoute();

  return (
    <div className="mx-auto max-w-4xl px-6 pb-16">
      <Navbar theme={theme} onToggleTheme={toggleTheme} />
      <main className="mt-4">
        {path === '/licenses' ? (
          <LicenseManager theme={theme} />
        ) : (
          <HomePage theme={theme} />
        )}
      </main>
    </div>
  );
}
