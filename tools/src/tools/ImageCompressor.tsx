import {
  Download,
  Image as ImageIcon,
  Loader2,
  Trash2,
  Upload,
} from 'lucide-react';
import { useEffect, useState, type DragEvent } from 'react';
import {
  Button,
  cn,
  inputCls,
  labelCls,
  muted,
  panelCls,
  strong,
  ToolHeader,
} from '../components/ui';
import { formatBytes, savedPercent } from '../lib/format';

type OutputFormat = 'webp' | 'jpeg' | 'png';

interface Result {
  id: string;
  name: string;
  outputName: string;
  url: string;
  size: number;
  originalSize: number;
  width: number;
  height: number;
  origWidth: number;
  origHeight: number;
}

async function compressImage(
  file: File,
  quality: number,
  format: OutputFormat,
  maxWidth: number,
): Promise<Result> {
  const bitmap = await createImageBitmap(file);
  const origWidth = bitmap.width;
  const origHeight = bitmap.height;
  const scale = maxWidth > 0 && origWidth > maxWidth ? maxWidth / origWidth : 1;
  const width = Math.max(1, Math.round(origWidth * scale));
  const height = Math.max(1, Math.round(origHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas tidak didukung');
  if (format === 'jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const mime = `image/${format}`;
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, mime, format === 'png' ? undefined : quality),
  );
  if (!blob) throw new Error('gagal encode');

  const baseName = file.name.replace(/\.[^.]+$/, '');
  return {
    id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 8)}`,
    name: file.name,
    outputName: `${baseName}.${format === 'jpeg' ? 'jpg' : format}`,
    url: URL.createObjectURL(blob),
    size: blob.size,
    originalSize: file.size,
    width,
    height,
    origWidth,
    origHeight,
  };
}

export function ImageCompressor() {
  const [sources, setSources] = useState<File[]>([]);
  const [quality, setQuality] = useState(0.8);
  const [format, setFormat] = useState<OutputFormat>('webp');
  const [maxWidth, setMaxWidth] = useState(1600);
  const [results, setResults] = useState<Result[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (sources.length === 0) {
      setResults((prev) => {
        prev.forEach((r) => URL.revokeObjectURL(r.url));
        return [];
      });
      setBusy(false);
      setError('');
      return;
    }

    let cancelled = false;
    setBusy(true);
    setError('');

    (async () => {
      const out: Result[] = [];
      const failures: string[] = [];
      for (const file of sources) {
        try {
          out.push(await compressImage(file, quality, format, maxWidth));
        } catch (err) {
          const reason = err instanceof Error ? err.message : 'gagal diproses';
          failures.push(`${file.name} (${reason})`);
        }
      }

      if (cancelled) {
        out.forEach((r) => URL.revokeObjectURL(r.url));
        return;
      }

      setResults((prev) => {
        prev.forEach((r) => URL.revokeObjectURL(r.url));
        return out;
      });
      setError(failures.length > 0 ? `Gagal: ${failures.join(', ')}` : '');
      setBusy(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [sources, quality, format, maxWidth]);

  const addFiles = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    const images = Array.from(list).filter((f) => f.type.startsWith('image/'));
    if (images.length === 0) {
      setError('File yang dipilih bukan gambar.');
      return;
    }
    setSources(images);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0);
  const totalOutput = results.reduce((sum, r) => sum + r.size, 0);
  const totalSaved = savedPercent(totalOriginal, totalOutput);

  return (
    <div className="space-y-4">
      <ToolHeader
        title="Image Compressor"
        description="Kompres dan resize JPG/PNG ke WebP langsung di browser. File tidak diunggah ke mana pun."
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'rounded-lg border border-dashed p-8 text-center transition-colors',
          dragging
            ? 'border-accent bg-accent/5'
            : 'border-hairline-light dark:border-hairline',
        )}
      >
        <ImageIcon size={22} className={cn('mx-auto', muted)} />
        <p className={cn('mt-3 text-sm', strong)}>Taruh gambar di sini</p>
        <p className={cn('mt-1 text-xs', muted)}>
          Bisa pilih beberapa file sekaligus · maksimal 50 MB per file
        </p>
        <label className="mt-4 inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md bg-accent px-3 text-sm font-medium text-[#06121F] transition-colors hover:bg-sky-300">
          <Upload size={14} />
          Pilih gambar
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              addFiles(e.target.files);
              e.currentTarget.value = '';
            }}
          />
        </label>
      </div>

      <div className={cn(panelCls, 'grid gap-4 sm:grid-cols-3')}>
        <div>
          <label className={labelCls} htmlFor="quality">
            Kualitas — {Math.round(quality * 100)}%
          </label>
          <input
            id="quality"
            type="range"
            min={10}
            max={100}
            step={5}
            value={Math.round(quality * 100)}
            onChange={(e) => setQuality(Number(e.target.value) / 100)}
            className="w-full accent-sky-400"
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="format">
            Format output
          </label>
          <select
            id="format"
            value={format}
            onChange={(e) => setFormat(e.target.value as OutputFormat)}
            className={inputCls}
          >
            <option value="webp">WebP (paling hemat)</option>
            <option value="jpeg">JPEG</option>
            <option value="png">PNG (lossless)</option>
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="max-width">
            Lebar maksimal (px, 0 = asli)
          </label>
          <input
            id="max-width"
            type="number"
            min={0}
            step={100}
            value={maxWidth}
            onChange={(e) => setMaxWidth(Math.max(0, Number(e.target.value) || 0))}
            className={inputCls}
          />
        </div>
      </div>

      {busy && (
        <p className={cn('flex items-center gap-2 text-xs', muted)}>
          <Loader2 size={13} className="animate-spin" />
          Memproses {sources.length} gambar…
        </p>
      )}

      {error && <p className="text-xs text-rose-500">{error}</p>}

      {results.length > 0 && (
        <div className={panelCls}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className={cn('text-sm font-medium', strong)}>
                {results.length} gambar siap
              </p>
              <p className={cn('text-xs', muted)}>
                {formatBytes(totalOriginal)} → {formatBytes(totalOutput)}
                {totalSaved !== null && (
                  <span
                    className={cn(
                      'ml-2 font-semibold',
                      totalSaved >= 0 ? 'text-status-live' : 'text-status-beta',
                    )}
                  >
                    {totalSaved >= 0 ? `−${totalSaved}%` : `+${Math.abs(totalSaved)}%`}
                  </span>
                )}
              </p>
            </div>
            <Button onClick={() => setSources([])}>
              <Trash2 size={13} />
              Bersihkan
            </Button>
          </div>

          <ul className="space-y-2">
            {results.map((r) => {
              const saved = savedPercent(r.originalSize, r.size);
              return (
                <li
                  key={r.id}
                  className="flex flex-wrap items-center gap-3 rounded-md border border-hairline-light p-3 dark:border-hairline"
                >
                  <img
                    src={r.url}
                    alt=""
                    className="h-10 w-10 rounded border border-hairline-light object-cover dark:border-hairline"
                  />
                  <div className="min-w-0 flex-1">
                    <p className={cn('truncate text-xs font-medium', strong)}>
                      {r.name}
                    </p>
                    <p className={cn('text-[11px]', muted)}>
                      {r.origWidth}×{r.origHeight} → {r.width}×{r.height} ·{' '}
                      {formatBytes(r.originalSize)} → {formatBytes(r.size)}
                    </p>
                  </div>
                  {saved !== null && (
                    <span
                      className={cn(
                        'rounded px-1.5 py-0.5 text-[11px] font-semibold',
                        saved >= 0
                          ? 'bg-status-live/10 text-status-live'
                          : 'bg-status-beta/10 text-status-beta',
                      )}
                    >
                      {saved >= 0 ? `−${saved}%` : `+${Math.abs(saved)}%`}
                    </span>
                  )}
                  <a
                    href={r.url}
                    download={r.outputName}
                    className="inline-flex h-8 items-center gap-1.5 rounded-md border border-hairline-light px-2.5 text-xs font-medium text-text-secondary-light transition-colors hover:bg-hairline-light hover:text-text-primary-light dark:border-hairline dark:text-text-secondary dark:hover:bg-hairline dark:hover:text-text-primary"
                  >
                    <Download size={12} />
                    Unduh
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
