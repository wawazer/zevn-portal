import { ArrowUpRight } from 'lucide-react';
import type { Theme, Tool } from '../types';

interface ToolCardProps {
  tool: Tool;
  theme: Theme;
}

const statusStyles = {
  live: {
    dark: 'bg-status-live/10 text-status-live',
    light: 'bg-status-live/15 text-emerald-700',
    label: 'Live',
  },
  beta: {
    dark: 'bg-status-beta/10 text-status-beta',
    light: 'bg-status-beta/15 text-amber-700',
    label: 'Beta',
  },
  soon: {
    dark: 'bg-status-soon/10 text-status-soon',
    light: 'bg-status-soon/15 text-slate-600',
    label: 'Soon',
  },
} as const;

export function ToolCard({ tool, theme }: ToolCardProps) {
  const isDark = theme === 'dark';
  const isSoon = tool.status === 'soon';
  const status = statusStyles[tool.status];

  const cardClasses = [
    'group relative flex flex-col rounded-lg border p-4 transition-colors duration-150',
    isDark ? 'border-hairline bg-surface' : 'border-hairline-light bg-surface-light',
    isSoon
      ? 'cursor-not-allowed opacity-50'
      : isDark
        ? 'hover:border-hairline-hover hover:bg-surface-hover'
        : 'hover:border-hairline-hover-light hover:bg-surface-hover-light',
  ].join(' ');

  const content = (
    <>
      {/* Top row */}
      <div className="mb-3 flex items-center gap-2">
        <span
          className={`rounded px-1.5 py-0.5 font-mono text-[11px] ${
            isDark
              ? 'bg-hairline text-accent'
              : 'bg-hairline-light text-sky-700'
          }`}
        >
          {tool.subdomain}
        </span>
        <span
          className={`ml-auto rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
            isDark ? status.dark : status.light
          }`}
        >
          {status.label}
        </span>
        {!isSoon && (
          <ArrowUpRight
            size={14}
            className={`${
              isDark ? 'text-text-secondary' : 'text-text-secondary-light'
            } transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5`}
          />
        )}
      </div>

      {/* Title + description */}
      <h3
        className={`text-sm font-semibold ${
          isDark ? 'text-text-primary' : 'text-text-primary-light'
        }`}
      >
        {tool.name}
      </h3>
      <p
        className={`mt-1 line-clamp-2 text-xs leading-relaxed ${
          isDark ? 'text-text-secondary' : 'text-text-secondary-light'
        }`}
      >
        {tool.description}
      </p>

      {/* Bottom row */}
      <div className="mt-auto flex items-center justify-between pt-3">
        <span
          className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
            isDark
              ? 'bg-hairline text-text-secondary'
              : 'bg-hairline-light text-text-secondary-light'
          }`}
        >
          {tool.category}
        </span>
        {tool.shortcutKey && (
          <kbd
            className={`rounded px-1.5 py-0.5 font-mono text-[10px] ${
              isDark
                ? 'border border-hairline bg-canvas text-text-secondary'
                : 'border border-hairline-light bg-hairline-light text-text-secondary-light'
            }`}
          >
            {tool.shortcutKey}
          </kbd>
        )}
      </div>
    </>
  );

  if (isSoon) {
    return (
      <div className={cardClasses} aria-disabled="true">
        {content}
      </div>
    );
  }

  return (
    <a
      href={tool.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cardClasses}
    >
      {content}
    </a>
  );
}
