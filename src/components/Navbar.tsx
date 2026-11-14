import { ExternalLink, Moon, Sun } from 'lucide-react';
import type { Theme } from '../types';

interface NavbarProps {
  theme: Theme;
  onToggleTheme: () => void;
}

export function Navbar({ theme, onToggleTheme }: NavbarProps) {
  const isDark = theme === 'dark';

  return (
    <nav className="flex items-center justify-between py-5">
      {/* Left */}
      <div className="flex items-center gap-3">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-md border font-mono text-sm font-bold ${
            isDark
              ? 'border-hairline-hover bg-hairline text-accent'
              : 'border-hairline-light bg-surface-light text-accent'
          }`}
        >
          Z
        </div>
        <span
          className={`font-mono text-sm ${
            isDark ? 'text-text-secondary' : 'text-text-secondary-light'
          }`}
        >
          zevn.web.id
        </span>
        <span
          className={`ml-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
            isDark
              ? 'bg-status-live/10 text-status-live'
              : 'bg-status-live/15 text-emerald-700'
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-status-live" />
          Operational
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        <a
          href="https://github.com/wawazer"
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${
            isDark
              ? 'text-text-secondary hover:bg-surface hover:text-text-primary'
              : 'text-text-secondary-light hover:bg-hairline-light hover:text-text-primary-light'
          }`}
        >
          <ExternalLink size={14} />
          @wawazer
        </a>
        <button
          onClick={onToggleTheme}
          className={`inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors duration-150 ${
            isDark
              ? 'text-text-secondary hover:bg-surface hover:text-text-primary'
              : 'text-text-secondary-light hover:bg-hairline-light hover:text-text-primary-light'
          }`}
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </nav>
  );
}
