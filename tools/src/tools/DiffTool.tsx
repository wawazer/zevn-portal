import { ArrowLeftRight, FileDiff } from 'lucide-react';
import { useState } from 'react';
import {
  Button,
  cn,
  muted,
  panelCls,
  strong,
  textareaCls,
  ToolHeader,
} from '../components/ui';
import { DIFF_MAX_LINES, diffLines, splitLines, type DiffLine } from '../lib/diff';

function lineCls(type: DiffLine['type']): string {
  if (type === 'add') return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';
  if (type === 'del') return 'bg-rose-500/10 text-rose-700 dark:text-rose-300';
  return 'text-text-secondary-light dark:text-text-secondary';
}

export function DiffTool() {
  const [before, setBefore] = useState('');
  const [after, setAfter] = useState('');
  const [lines, setLines] = useState<DiffLine[] | null>(null);
  const [error, setError] = useState('');

  const compare = () => {
    const sizeA = splitLines(before).length;
    const sizeB = splitLines(after).length;

    if (sizeA === 0 && sizeB === 0) {
      setError('Isi kedua kolom dulu.');
      setLines(null);
      return;
    }
    if (sizeA > DIFF_MAX_LINES || sizeB > DIFF_MAX_LINES) {
      setError(`Maksimal ${DIFF_MAX_LINES} baris per sisi agar tetap cepat.`);
      setLines(null);
      return;
    }

    setError('');
    setLines(diffLines(before, after));
  };

  const added = lines?.filter((line) => line.type === 'add').length ?? 0;
  const removed = lines?.filter((line) => line.type === 'del').length ?? 0;

  return (
    <div className="space-y-4">
      <ToolHeader
        title="Text Diff"
        description="Bandingkan dua versi teks baris per baris. Perbedaan ditandai tambah dan hapus."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className={panelCls}>
          <div className="mb-2 flex items-center justify-between gap-2">
            <label className={cn('text-xs font-medium', muted)} htmlFor="diff-before">
              Versi lama
            </label>
            <Button
              className="h-6 px-1.5 text-[10px]"
              onClick={() => {
                setBefore(after);
                setAfter(before);
                setLines(null);
              }}
              title="Tukar kedua sisi"
            >
              <ArrowLeftRight size={11} />
              Tukar
            </Button>
          </div>
          <textarea
            id="diff-before"
            value={before}
            onChange={(e) => {
              setBefore(e.target.value);
              setLines(null);
            }}
            spellCheck={false}
            className={cn(textareaCls, 'h-56')}
            placeholder={'baris satu\nbaris dua'}
          />
        </div>
        <div className={panelCls}>
          <div className="mb-2 flex items-center justify-between gap-2">
            <label className={cn('text-xs font-medium', muted)} htmlFor="diff-after">
              Versi baru
            </label>
            <Button
              className="h-6 px-1.5 text-[10px]"
              onClick={() => {
                setBefore('');
                setAfter('');
                setLines(null);
                setError('');
              }}
            >
              Bersihkan
            </Button>
          </div>
          <textarea
            id="diff-after"
            value={after}
            onChange={(e) => {
              setAfter(e.target.value);
              setLines(null);
            }}
            spellCheck={false}
            className={cn(textareaCls, 'h-56')}
            placeholder={'baris satu\nbaris dua (diubah)'}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="primary" onClick={compare}>
          <FileDiff size={13} />
          Bandingkan
        </Button>
        {lines && (
          <span className={cn('text-[11px]', muted)}>
            <span className="text-emerald-600 dark:text-emerald-400">+{added}</span> ·{' '}
            <span className="text-rose-500">−{removed}</span> ·{' '}
            {lines.length - added - removed} baris sama
          </span>
        )}
      </div>

      {error && <p className="text-xs text-rose-500">{error}</p>}

      {lines && (
        <div className="overflow-hidden rounded-lg border border-hairline-light dark:border-hairline">
          <div className="max-h-[30rem] overflow-auto">
            {lines.map((line, index) => (
              <div
                key={`${line.a}-${line.b}-${index}`}
                className={cn('flex gap-2 px-2 py-0.5 font-mono text-[11px] leading-relaxed', lineCls(line.type))}
              >
                <span className="w-8 shrink-0 select-none text-right opacity-60">{line.a || ''}</span>
                <span className="w-8 shrink-0 select-none text-right opacity-60">{line.b || ''}</span>
                <span className="w-3 shrink-0 select-none">
                  {line.type === 'add' ? '+' : line.type === 'del' ? '−' : ' '}
                </span>
                <span className="whitespace-pre-wrap break-all">{line.text || ' '}</span>
              </div>
            ))}
            {lines.length === 0 && (
              <p className={cn('p-3 text-xs', muted)}>Tidak ada baris untuk dibandingkan.</p>
            )}
          </div>
        </div>
      )}

      <p className={cn('text-[11px] leading-relaxed', strong)}>
        Diff berbasis baris, bukan karakter. Spasi di akhir baris tetap dianggap
        perbedaan.
      </p>
    </div>
  );
}
