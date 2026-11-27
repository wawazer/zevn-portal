import { Download, QrCode } from 'lucide-react';
import { toCanvas } from 'qrcode';
import { useEffect, useRef, useState } from 'react';
import {
  Button,
  cn,
  inputCls,
  labelCls,
  muted,
  panelCls,
  textareaCls,
  ToolHeader,
} from '../components/ui';
import { downloadDataUrl } from '../lib/format';

type Ecc = 'low' | 'medium' | 'quartile' | 'high';

const ECC_LABEL: Record<Ecc, string> = {
  low: 'L — 7% rusak',
  medium: 'M — 15% rusak',
  quartile: 'Q — 25% rusak',
  high: 'H — 30% rusak',
};

export function QrTool() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [text, setText] = useState('https://zevn.web.id');
  const [size, setSize] = useState(320);
  const [ecc, setEcc] = useState<Ecc>('medium');
  const [error, setError] = useState('');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!text.trim()) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      setError('Isi teks atau URL dulu.');
      return;
    }

    let cancelled = false;
    toCanvas(canvas, text, {
      width: size,
      margin: 2,
      errorCorrectionLevel: ecc,
      color: { dark: '#0B1120', light: '#FFFFFF' },
    })
      .then(() => {
        if (!cancelled) setError('');
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Gagal membuat QR.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [text, size, ecc]);

  return (
    <div className="space-y-4">
      <ToolHeader
        title="QR Generator"
        description="Buat QR dari teks atau URL dan unduh sebagai PNG. Tidak ada data yang dikirim keluar."
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className={panelCls}>
          <label className={labelCls} htmlFor="qr-text">
            Teks atau URL
          </label>
          <textarea
            id="qr-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="https://zevn.web.id"
            spellCheck={false}
            className={cn(textareaCls, 'h-24')}
          />

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls} htmlFor="qr-size">
                Ukuran — {size}px
              </label>
              <input
                id="qr-size"
                type="range"
                min={128}
                max={1024}
                step={32}
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full accent-sky-400"
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="qr-ecc">
                Koreksi error
              </label>
              <select
                id="qr-ecc"
                value={ecc}
                onChange={(e) => setEcc(e.target.value as Ecc)}
                className={inputCls}
              >
                {(Object.keys(ECC_LABEL) as Ecc[]).map((level) => (
                  <option key={level} value={level}>
                    {ECC_LABEL[level]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button
              variant="primary"
              disabled={!!error || !text.trim()}
              onClick={() => {
                const canvas = canvasRef.current;
                if (!canvas) return;
                downloadDataUrl(canvas.toDataURL('image/png'), 'zevn-qr.png');
              }}
            >
              <Download size={13} />
              Unduh PNG
            </Button>
            <span className={cn('text-[11px]', muted)}>
              QR dicetak hitam-putih agar tetap terbaca.
            </span>
          </div>

          {error && <p className="mt-2 text-xs text-rose-500">{error}</p>}
        </div>

        <div className={cn(panelCls, 'flex flex-col items-center justify-center gap-2')}>
          <QrCode size={16} className="text-accent" />
          <canvas
            ref={canvasRef}
            className="h-64 w-64 max-w-full rounded-md bg-white p-1"
          />
          <span className={cn('text-[11px]', muted)}>
            {text.trim() ? `${text.trim().length} karakter` : 'Menunggu input'}
          </span>
        </div>
      </div>
    </div>
  );
}
