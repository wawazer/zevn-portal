import { Link2 } from 'lucide-react';
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
import { slugify } from '../lib/text';

const SEPARATORS = ['-', '_', '.'] as const;

export function SlugTool() {
  const [input, setInput] = useState('');
  const [separator, setSeparator] = useState<string>('-');
  const [lowercase, setLowercase] = useState(true);
  const [maxLength, setMaxLength] = useState(0);

  const slug = useMemo(
    () => slugify(input, { separator, lowercase, maxLength }),
    [input, separator, lowercase, maxLength],
  );

  return (
    <div className="space-y-4">
      <ToolHeader
        title="Slug Generator"
        description="Ubah judul atau kalimat menjadi slug URL yang bersih, tanpa aksen dan spasi."
      />

      <div className={panelCls}>
        <label className={labelCls} htmlFor="slug-input">
          Teks
        </label>
        <textarea
          id="slug-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className={cn(textareaCls, 'h-28')}
          placeholder="Cara Membuat Website Portfolio di 2026"
          spellCheck={false}
        />

        <div className="mt-4 flex flex-wrap items-end gap-4">
          <div>
            <label className={labelCls} htmlFor="slug-separator">
              Pemisah
            </label>
            <select
              id="slug-separator"
              value={separator}
              onChange={(e) => setSeparator(e.target.value)}
              className={cn(inputCls, 'w-28')}
            >
              {SEPARATORS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="slug-max">
              Maks. karakter (0 = bebas)
            </label>
            <input
              id="slug-max"
              type="number"
              min={0}
              max={200}
              value={maxLength}
              onChange={(e) => setMaxLength(Math.min(200, Math.max(0, Number(e.target.value) || 0)))}
              className={cn(inputCls, 'w-36')}
            />
          </div>
          <label className="flex h-9 items-center gap-2 text-xs text-text-secondary-light dark:text-text-secondary">
            <input
              type="checkbox"
              checked={lowercase}
              onChange={(e) => setLowercase(e.target.checked)}
              className="accent-sky-400"
            />
            Huruf kecil semua
          </label>
        </div>
      </div>

      <div className={panelCls}>
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className={cn('text-xs font-medium', muted)}>Hasil slug</span>
          <span className={cn('text-[11px]', muted)}>{slug.length} karakter</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <p
            className={cn(
              'min-h-9 flex-1 break-all rounded-md border border-hairline-light px-3 py-2 font-mono text-sm dark:border-hairline',
              strong,
            )}
          >
            {slug || <span className={muted}>slug-muncul-di-sini</span>}
          </p>
          <CopyButton text={slug} label="Copy slug" />
        </div>
        {slug && (
          <p className={cn('mt-2 inline-flex items-center gap-1 break-all font-mono text-[11px]', muted)}>
            <Link2 size={11} />
            https://zevn.web.id/{slug}
          </p>
        )}
      </div>

      <p className={cn('text-[11px] leading-relaxed', muted)}>
        Huruf beraksen dinormalisasi ke ASCII. Karakter non-Latin akan dibuang, jadi
        untuk judul non-Latin tambahkan transliterasi manual.
      </p>
    </div>
  );
}
