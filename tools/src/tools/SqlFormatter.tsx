import { Database, Download, Eraser, Minimize2, Wand2 } from 'lucide-react';
import { useState } from 'react';
import {
  Button,
  cn,
  CopyButton,
  muted,
  panelCls,
  strong,
  textareaCls,
  ToolHeader,
} from '../components/ui';
import { downloadBlob } from '../lib/format';
import { formatSql, minifySql } from '../lib/sql';

const SAMPLE =
  "select u.id, u.name, count(o.id) as total from users u left join orders o on o.user_id = u.id where u.active = true and o.created_at > '2026-01-01' group by u.id, u.name order by total desc limit 20;";

export function SqlFormatter({ embedded = false }: { embedded?: boolean }) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const run = (mode: 'format' | 'minify') => {
    if (!input.trim()) {
      setError('Query masih kosong.');
      setOutput('');
      return;
    }
    try {
      setOutput(mode === 'format' ? formatSql(input) : minifySql(input));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memproses query.');
      setOutput('');
    }
  };

  return (
    <div className="space-y-4">
      {!embedded && (
        <ToolHeader
          title="SQL Formatter"
          description="Rapikan query SQL dengan indentasi per klausa, atau padatkan jadi satu baris."
        />
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className={panelCls}>
          <div className="mb-2 flex items-center justify-between gap-2">
            <label className={cn('text-xs font-medium', muted)} htmlFor="sql-input">
              Query SQL
            </label>
            <button
              onClick={() => {
                setInput(SAMPLE);
                setOutput('');
                setError('');
              }}
              className={cn('text-[11px] underline-offset-2 hover:underline', muted)}
            >
              Pakai contoh
            </button>
          </div>
          <textarea
            id="sql-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="select * from users where active = true;"
            spellCheck={false}
            className={cn(textareaCls, 'h-72')}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="primary" onClick={() => run('format')}>
              <Wand2 size={13} />
              Format
            </Button>
            <Button onClick={() => run('minify')}>
              <Minimize2 size={13} />
              Minify
            </Button>
            <Button
              onClick={() => {
                setInput('');
                setOutput('');
                setError('');
              }}
            >
              <Eraser size={13} />
              Bersihkan
            </Button>
          </div>
        </div>

        <div className={panelCls}>
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className={cn('text-xs font-medium', muted)}>Hasil</span>
            <span className={cn('text-[11px]', muted)}>
              {output ? `${output.split('\n').length} baris` : '—'}
            </span>
          </div>
          <textarea
            readOnly
            value={output}
            placeholder="Hasil format muncul di sini."
            spellCheck={false}
            className={cn(textareaCls, 'h-72')}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <CopyButton text={output} label="Copy SQL" />
            <Button
              disabled={!output}
              onClick={() => downloadBlob(new Blob([output], { type: 'text/plain' }), 'zevn-query.sql')}
            >
              <Download size={13} />
              Unduh .sql
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-md border border-rose-500/30 bg-rose-500/5 p-3 text-xs text-rose-500">
          <Database size={14} className="mt-0.5 shrink-0" />
          <span className={strong}>{error}</span>
        </div>
      )}

      <p className={cn('text-[11px] leading-relaxed', muted)}>
        Formatter ini mengenali klausa umum (SELECT, JOIN, WHERE, GROUP BY, dan
        seterusnya) dan tidak mengubah string literal. Query dengan sintaks vendor
        khusus bisa perlu dirapikan manual.
      </p>
    </div>
  );
}
