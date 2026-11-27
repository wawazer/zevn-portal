import { Download, Eraser, Table2 } from 'lucide-react';
import { useState } from 'react';
import {
  Button,
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
import { csvToJson, detectDelimiter, jsonToRows, toCsv, type Delimiter } from '../lib/csv';
import { downloadBlob } from '../lib/format';

type Mode = 'toJson' | 'toCsv';

const DELIMITERS: Array<{ value: Delimiter; label: string }> = [
  { value: ',', label: 'Koma (,)' },
  { value: ';', label: 'Titik koma (;)' },
  { value: '\t', label: 'Tab' },
];

const SAMPLE_CSV = 'nama,kota,umur\nAyu,Bandung,24\nBudi,Jakarta,31';

export function CsvJsonTool() {
  const [mode, setMode] = useState<Mode>('toJson');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [delimiter, setDelimiter] = useState<Delimiter>(',');
  const [header, setHeader] = useState(true);

  const clear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  const run = () => {
    if (!input.trim()) {
      setError('Input masih kosong.');
      setOutput('');
      return;
    }

    if (mode === 'toJson') {
      try {
        const json = csvToJson(input, { delimiter, header });
        setOutput(JSON.stringify(json, null, 2));
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'CSV tidak bisa dibaca.');
        setOutput('');
      }
      return;
    }

    try {
      const parsed = JSON.parse(input) as unknown;
      const rows = jsonToRows(parsed);
      if (rows.length === 0) {
        setError('JSON tidak berisi data.');
        setOutput('');
        return;
      }
      setOutput(toCsv(rows, delimiter));
      setError('');
    } catch (err) {
      setError(
        `JSON tidak valid: ${err instanceof Error ? err.message : 'tidak diketahui'}`,
      );
      setOutput('');
    }
  };

  return (
    <div className="space-y-4">
      <ToolHeader
        title="CSV ↔ JSON"
        description="Konversi tabel CSV ke JSON dan sebaliknya, termasuk field ber-kutip dan multiline."
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-md border border-hairline-light p-0.5 dark:border-hairline">
          {(
            [
              ['toJson', 'CSV → JSON'],
              ['toCsv', 'JSON → CSV'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              onClick={() => {
                setMode(value);
                clear();
              }}
              className={cn(
                'h-7 rounded px-3 text-xs font-medium transition-colors',
                mode === value
                  ? 'bg-accent/15 text-sky-700 dark:text-accent'
                  : 'text-text-secondary-light hover:bg-hairline-light dark:text-text-secondary dark:hover:bg-hairline',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            setInput(mode === 'toJson' ? SAMPLE_CSV : '[{"nama":"Ayu","kota":"Bandung"}]');
            setOutput('');
            setError('');
            if (mode === 'toJson') setDelimiter(detectDelimiter(SAMPLE_CSV));
          }}
          className={cn('text-[11px] underline-offset-2 hover:underline', muted)}
        >
          Pakai contoh
        </button>
      </div>

      <div className={cn(panelCls, 'flex flex-wrap items-end gap-4')}>
        <div>
          <label className={labelCls} htmlFor="csv-delimiter">
            Delimiter
          </label>
          <select
            id="csv-delimiter"
            value={delimiter}
            onChange={(e) => setDelimiter(e.target.value as Delimiter)}
            className={cn(inputCls, 'w-40')}
          >
            {DELIMITERS.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {mode === 'toJson' ? (
          <label className="flex h-9 items-center gap-2 text-xs text-text-secondary-light dark:text-text-secondary">
            <input
              type="checkbox"
              checked={header}
              onChange={(e) => setHeader(e.target.checked)}
              className="accent-sky-400"
            />
            Baris pertama adalah nama kolom
          </label>
        ) : (
          <p className={cn('text-[11px]', muted)}>
            Array objek jadi kolom, array of array mempertahankan bentuk tabel.
          </p>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className={panelCls}>
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className={cn('text-xs font-medium', muted)}>
              {mode === 'toJson' ? 'CSV' : 'JSON'}
            </span>
            <span className={cn('text-[11px]', muted)}>
              {input ? `${input.length} karakter` : '—'}
            </span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            className={cn(textareaCls, 'h-64')}
            placeholder={mode === 'toJson' ? SAMPLE_CSV : '[{"nama":"Ayu","kota":"Bandung"}]'}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="primary" onClick={run}>
              <Table2 size={13} />
              Konversi
            </Button>
            <Button onClick={clear}>
              <Eraser size={13} />
              Bersihkan
            </Button>
          </div>
        </div>

        <div className={panelCls}>
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className={cn('text-xs font-medium', muted)}>
              {mode === 'toJson' ? 'JSON' : 'CSV'}
            </span>
            <span className={cn('text-[11px]', muted)}>
              {output ? `${output.split('\n').length} baris` : '—'}
            </span>
          </div>
          <textarea
            readOnly
            value={output}
            spellCheck={false}
            className={cn(textareaCls, 'h-64')}
            placeholder="Hasil konversi muncul di sini."
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <CopyButton text={output} label="Copy hasil" />
            <Button
              disabled={!output}
              onClick={() =>
                downloadBlob(
                  new Blob([output], { type: mode === 'toJson' ? 'application/json' : 'text/csv' }),
                  mode === 'toJson' ? 'zevn-data.json' : 'zevn-data.csv',
                )
              }
            >
              <Download size={13} />
              Unduh
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <p className="rounded-md border border-rose-500/30 bg-rose-500/5 p-3 text-xs text-rose-500">
          {error}
        </p>
      )}

      <p className={cn('text-[11px] leading-relaxed', strong)}>
        Semua nilai dikonversi sebagai teks agar tidak ada angka yang berubah
        formatnya. Ubah tipe data lanjutan setelah JSON-nya masuk ke kode kamu.
      </p>
    </div>
  );
}
