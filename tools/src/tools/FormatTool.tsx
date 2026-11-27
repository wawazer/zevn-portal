import { Braces, Database, KeyRound, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { cn, ToolHeader } from '../components/ui';
import { JsonFormatter } from './JsonFormatter';
import { JwtDecoder } from './JwtDecoder';
import { SqlFormatter } from './SqlFormatter';

type Tab = 'json' | 'sql' | 'jwt';

const TABS: Array<{ id: Tab; label: string; Icon: LucideIcon }> = [
  { id: 'json', label: 'JSON', Icon: Braces },
  { id: 'sql', label: 'SQL', Icon: Database },
  { id: 'jwt', label: 'JWT', Icon: KeyRound },
];

export function FormatTool() {
  const [tab, setTab] = useState<Tab>('json');

  return (
    <div className="space-y-4">
      <ToolHeader
        title="JSON, SQL & JWT"
        description="Validasi payload JSON, rapikan query SQL, dan baca isi JWT — semuanya diproses lokal."
      />

      <div
        role="tablist"
        aria-label="Jenis formatter"
        className="inline-flex rounded-md border border-hairline-light p-0.5 dark:border-hairline"
      >
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn(
              'inline-flex h-7 items-center gap-1.5 rounded px-3 text-xs font-medium transition-colors',
              tab === id
                ? 'bg-accent/15 text-sky-700 dark:text-accent'
                : 'text-text-secondary-light hover:bg-hairline-light dark:text-text-secondary dark:hover:bg-hairline',
            )}
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>

      {tab === 'json' && <JsonFormatter embedded />}
      {tab === 'sql' && <SqlFormatter embedded />}
      {tab === 'jwt' && <JwtDecoder embedded />}
    </div>
  );
}
