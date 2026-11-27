import { SearchCode } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  cn,
  CopyButton,
  inputCls,
  labelCls,
  muted,
  panelCls,
  strong,
  textareaCls,
  ToolHeader,
} from '../components/ui';

const FLAGS = ['i', 'm', 's', 'u'] as const;
type Flag = (typeof FLAGS)[number];

const MAX_MATCHES = 500;

interface MatchInfo {
  index: number;
  value: string;
  groups: string[];
}

interface RunResult {
  error: string;
  matches: MatchInfo[];
}

function runRegex(pattern: string, flags: string, text: string): RunResult {
  if (!pattern) return { error: '', matches: [] };
  try {
    const regex = new RegExp(pattern, flags.includes('g') ? flags : `${flags}g`);
    const matches: MatchInfo[] = [];
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null && matches.length < MAX_MATCHES) {
      matches.push({ index: match.index, value: match[0], groups: match.slice(1).map((g) => g ?? '') });
      if (match[0] === '') regex.lastIndex += 1;
    }
    return { error: '', matches };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Pola tidak valid.', matches: [] };
  }
}

export function RegexTester() {
  const [pattern, setPattern] = useState('\\b(\\w+)@(\\w+\\.\\w+)\\b');
  const [activeFlags, setActiveFlags] = useState<Flag[]>(['i']);
  const [text, setText] = useState('Hubungi admin@zevn.web.id atau halo@example.com untuk bantuan.');

  const flags = activeFlags.join('');
  const result = useMemo(() => runRegex(pattern, flags, text), [pattern, flags, text]);

  const highlighted = useMemo(() => {
    if (result.error || result.matches.length === 0) return null;
    const nodes: Array<string | { hit: string; key: number }> = [];
    let cursor = 0;
    result.matches.forEach((match, index) => {
      if (match.index < cursor) return;
      if (match.index > cursor) nodes.push(text.slice(cursor, match.index));
      nodes.push({ hit: match.value, key: index });
      cursor = match.index + match.value.length;
    });
    if (cursor < text.length) nodes.push(text.slice(cursor));
    return nodes;
  }, [result, text]);

  return (
    <div className="space-y-4">
      <ToolHeader
        title="Regex Tester"
        description="Uji pola JavaScript dengan flag, lihat semua kecocokan dan grup tangkapannya."
      />

      <div className={panelCls}>
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[220px] flex-1">
            <label className={labelCls} htmlFor="regex-pattern">
              Pola
            </label>
            <div className="flex items-center gap-1">
              <span className={cn('font-mono text-sm', muted)}>/</span>
              <input
                id="regex-pattern"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                spellCheck={false}
                className={cn(inputCls, 'font-mono')}
                placeholder="\\d+"
              />
              <span className={cn('font-mono text-sm', muted)}>/{flags || 'g'}</span>
            </div>
          </div>
          <div>
            <span className={labelCls}>Flag</span>
            <div className="flex gap-1">
              {FLAGS.map((flag) => {
                const active = activeFlags.includes(flag);
                return (
                  <button
                    key={flag}
                    onClick={() =>
                      setActiveFlags((prev) =>
                        prev.includes(flag) ? prev.filter((item) => item !== flag) : [...prev, flag],
                      )
                    }
                    aria-pressed={active}
                    className={cn(
                      'h-9 w-9 rounded-md border font-mono text-xs transition-colors',
                      active
                        ? 'border-accent/40 bg-accent/15 text-sky-700 dark:text-accent'
                        : 'border-hairline-light text-text-secondary-light hover:bg-hairline-light dark:border-hairline dark:text-text-secondary dark:hover:bg-hairline',
                    )}
                    title={flag}
                  >
                    {flag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <p className={cn('mt-2 text-[11px]', muted)}>
          Pencarian selalu global, jadi semua kecocokan ikut ditampilkan.
        </p>

        <label className={cn(labelCls, 'mt-4')} htmlFor="regex-text">
          Teks uji
        </label>
        <textarea
          id="regex-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
          className={cn(textareaCls, 'h-40')}
        />
      </div>

      {result.error && (
        <p className="rounded-md border border-rose-500/30 bg-rose-500/5 p-3 text-xs text-rose-500">
          {result.error}
        </p>
      )}

      <div className={cn(panelCls, 'space-y-3')}>
        <div className="flex items-center justify-between gap-2">
          <p className={cn('text-xs font-medium', strong)}>
            {result.matches.length} kecocokan
            {result.matches.length >= MAX_MATCHES ? ` (dibatasi ${MAX_MATCHES})` : ''}
          </p>
          <span className={cn('inline-flex items-center gap-1 text-[11px]', muted)}>
            <SearchCode size={11} /> {text.length} karakter
          </span>
        </div>

        {highlighted ? (
          <p className="whitespace-pre-wrap break-words rounded-md border border-hairline-light bg-hairline-light/40 p-3 font-mono text-xs leading-relaxed dark:border-hairline dark:bg-[#0F172A]">
            {highlighted.map((node, index) =>
              typeof node === 'string' ? (
                <span key={index}>{node}</span>
              ) : (
                <mark
                  key={node.key}
                  className="rounded bg-accent/25 px-0.5 text-text-primary-light dark:text-text-primary"
                >
                  {node.hit}
                </mark>
              ),
            )}
          </p>
        ) : (
          !result.error && <p className={cn('text-xs', muted)}>Belum ada kecocokan.</p>
        )}

        {result.matches.length > 0 && (
          <div className="divide-y divide-hairline-light dark:divide-hairline">
            {result.matches.slice(0, 50).map((match, index) => (
              <div key={`${match.index}-${index}`} className="flex flex-wrap items-start gap-x-3 gap-y-1 py-2">
                <span className={cn('w-16 shrink-0 font-mono text-[11px]', muted)}>#{index + 1}</span>
                <span className={cn('flex-1 break-all font-mono text-[11px]', strong)}>
                  {match.value || '(kosong)'}
                </span>
                <span className={cn('font-mono text-[10px]', muted)}>pos {match.index}</span>
                <CopyButton text={match.value} label="" className="h-6 px-1.5 text-[10px]" />
                {match.groups.length > 0 && (
                  <p className={cn('w-full pl-16 font-mono text-[10px]', muted)}>
                    {match.groups.map((group, groupIndex) => `$${groupIndex + 1}=${group || '∅'}`).join('  ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
