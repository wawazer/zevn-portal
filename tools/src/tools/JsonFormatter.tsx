import { Braces, Download, Eraser, Minimize2, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
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
import { byteLength } from '../lib/encoding';
import { downloadBlob, formatBytes } from '../lib/format';

function describeJsonError(raw: string, err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  const lineColumn = message.match(/line (\d+) column (\d+)/i);
  if (lineColumn) {
    return `${message.replace(/\s*\(line.*\)$/i, '')} (baris ${lineColumn[1]}, kolom ${lineColumn[2]})`;
  }
  const position = message.match(/position (\d+)/i);
  if (position) {
    const index = Number(position[1]);
    const before = raw.slice(0, index);
    const line = before.split('\n').length;
    const column = index - before.lastIndexOf('\n');
    return `${message} (baris ${line}, kolom ${column})`;
  }
  return message;
}

export function JsonFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const inputStatus = useMemo(() => {
    const raw = input.trim();
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      const type = Array.isArray(parsed) ? 'array' : typeof parsed;
      return { ok: true, label: `JSON valid · ${type}` };
    } catch {
      return { ok: false, label: 'JSON tidak valid' };
    }
  }, [input]);

  const run = (mode: 'pretty' | 'min') => {
    const raw = input.trim();
    if (!raw) {
      setError('Input masih kosong.');
      setOutput('');
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      setOutput(JSON.stringify(parsed, null, mode === 'pretty' ? 2 : 0));
      setError('');
    } catch (err) {
      setError(describeJsonError(input, err));
      setOutput('');
    }
  };

  const inputBytes = byteLength(input);
  const outputBytes = byteLength(output);

  return (
    <div className="space-y-4">
      <ToolHeader
        title="JSON Formatter"
        description="Validasi, rapikan, dan minify payload JSON. Semua diproses lokal di tab ini."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className={panelCls}>
          <div className="mb-2 flex items-center justify-between gap-2">
            <label className={cn('text-xs font-medium', muted)} htmlFor="json-input">
              Input
            </label>
            <span className={cn('text-[11px]', muted)}>
              {formatBytes(inputBytes)}
              {inputStatus && (
                <span
                  className={cn(
                    'ml-2 font-semibold',
                    inputStatus.ok ? 'text-status-live' : 'text-rose-500',
                  )}
                >
                  {inputStatus.label}
                </span>
              )}
            </span>
          </div>
          <textarea
            id="json-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={'{"name": "zevn", "tools": 5}'}
            spellCheck={false}
            className={cn(textareaCls, 'h-72')}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="primary" onClick={() => run('pretty')}>
              <Sparkles size={13} />
              Format
            </Button>
            <Button onClick={() => run('min')}>
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
              {output ? formatBytes(outputBytes) : '—'}
            </span>
          </div>
          <textarea
            readOnly
            value={output}
            placeholder="Hasil akan muncul di sini."
            spellCheck={false}
            className={cn(textareaCls, 'h-72')}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <CopyButton text={output} label="Copy hasil" />
            <Button
              disabled={!output}
              onClick={() =>
                downloadBlob(
                  new Blob([output], { type: 'application/json' }),
                  'zevn-formatted.json',
                )
              }
            >
              <Download size={13} />
              Unduh .json
            </Button>
          </div>
          {output && inputBytes > 0 && (
            <p className={cn('mt-2 text-[11px]', muted)}>
              {outputBytes < inputBytes
                ? `Lebih kecil ${formatBytes(inputBytes - outputBytes)} dari input.`
                : 'Ukuran hasil lebih besar dari input (format lebih mudah dibaca).'}
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-md border border-rose-500/30 bg-rose-500/5 p-3 text-xs text-rose-500">
          <Braces size={14} className="mt-0.5 shrink-0" />
          <span className={strong}>{error}</span>
        </div>
      )}
    </div>
  );
}
