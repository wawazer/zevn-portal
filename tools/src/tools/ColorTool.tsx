import { Palette } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  cn,
  CopyButton,
  inputCls,
  labelCls,
  muted,
  panelCls,
  strong,
  ToolHeader,
} from '../components/ui';
import { contrastRatio, mix, parseColor, rgbToHex, rgbToHsl } from '../lib/color';

const WHITE = { r: 255, g: 255, b: 255 };
const BLACK = { r: 0, g: 0, b: 0 };

function Readout({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-hairline-light py-2 last:border-0 dark:border-hairline">
      <span className={cn('w-14 shrink-0 text-[11px]', muted)}>{label}</span>
      <span className={cn('flex-1 break-all font-mono text-xs', strong)}>{value}</span>
      <CopyButton text={value} label="" className="h-6 px-1.5 text-[10px]" />
    </div>
  );
}

function grade(ratio: number): string {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA besar';
  return 'gagal';
}

export function ColorTool() {
  const [input, setInput] = useState('#38BDF8');

  const rgb = useMemo(() => parseColor(input), [input]);
  const hsl = rgb ? rgbToHsl(rgb) : null;

  const hex = rgb ? rgbToHex(rgb) : '';
  const rgbText = rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : '';
  const hslText = hsl ? `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` : '';

  const onWhite = rgb ? contrastRatio(rgb, WHITE) : 0;
  const onBlack = rgb ? contrastRatio(rgb, BLACK) : 0;

  const tints = rgb
    ? [0.15, 0.3, 0.45, 0.6, 0.75].map((amount) => ({ amount, color: mix(rgb, WHITE, amount) }))
    : [];
  const shades = rgb
    ? [0.15, 0.3, 0.45, 0.6, 0.75].map((amount) => ({ amount, color: mix(rgb, BLACK, amount) }))
    : [];

  return (
    <div className="space-y-4">
      <ToolHeader
        title="Color Converter"
        description="Konversi HEX, RGB, dan HSL, lalu cek rasio kontras terhadap putih dan hitam."
      />

      <div className={panelCls}>
        <label className={labelCls} htmlFor="color-input">
          Nilai warna
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <input
            id="color-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className={cn(inputCls, 'min-w-[200px] flex-1 font-mono')}
            placeholder="#38BDF8, rgb(56 189 248), hsl(199 93% 60%)"
            spellCheck={false}
          />
          <input
            type="color"
            aria-label="Pilih warna"
            value={hex || '#000000'}
            onChange={(e) => setInput(e.target.value.toUpperCase())}
            className="h-9 w-12 cursor-pointer rounded-md border border-hairline-light bg-transparent dark:border-hairline"
          />
        </div>
        {!rgb && input.trim() && (
          <p className="mt-2 text-xs text-rose-500">
            Format tidak dikenali. Pakai hex, rgb(), atau hsl().
          </p>
        )}
      </div>

      {rgb && hsl && (
        <>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div className={panelCls}>
              <Readout label="HEX" value={hex} />
              <Readout label="RGB" value={rgbText} />
              <Readout label="HSL" value={hslText} />
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-md border border-hairline-light p-2.5 dark:border-hairline">
                  <p className={cn('text-[11px]', muted)}>Teks putih</p>
                  <p className={cn('font-mono text-sm font-semibold', strong)}>
                    {onWhite.toFixed(2)}:1
                  </p>
                  <p className={cn('text-[10px]', muted)}>{grade(onWhite)}</p>
                </div>
                <div className="rounded-md border border-hairline-light p-2.5 dark:border-hairline">
                  <p className={cn('text-[11px]', muted)}>Teks hitam</p>
                  <p className={cn('font-mono text-sm font-semibold', strong)}>
                    {onBlack.toFixed(2)}:1
                  </p>
                  <p className={cn('text-[10px]', muted)}>{grade(onBlack)}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-hairline-light p-4 dark:border-hairline">
              <Palette size={14} className="text-accent" />
              <div
                className="flex h-28 w-full items-center justify-center rounded-md border border-black/5"
                style={{ backgroundColor: hex }}
              >
                <span
                  className="text-sm font-semibold"
                  style={{ color: onWhite >= onBlack ? '#FFFFFF' : '#0F172A' }}
                >
                  Contoh teks
                </span>
              </div>
              <p className={cn('font-mono text-[11px]', strong)}>{hex}</p>
            </div>
          </div>

          <div className={panelCls}>
            <p className={cn('mb-2 text-xs font-medium', strong)}>Tint & shade</p>
            <div className="space-y-1.5">
              {[tints, shades].map((row, rowIndex) => (
                <div key={rowIndex} className="flex gap-1.5">
                  {row.map(({ amount, color }) => {
                    const value = rgbToHex(color);
                    return (
                      <button
                        key={`${rowIndex}-${amount}`}
                        onClick={() => setInput(value)}
                        title={`Klik untuk memakai ${value}`}
                        className="group flex-1 rounded-md border border-hairline-light px-1 py-3 text-[10px] transition-transform hover:scale-[1.02] dark:border-hairline"
                        style={{ backgroundColor: value, color: rowIndex === 0 ? '#0F172A' : '#F8FAFC' }}
                      >
                        <span className="font-mono">{value}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <p className={cn('text-[11px] leading-relaxed', muted)}>
        Rasio kontras dihitung dengan rumus WCAG 2.1. Untuk teks biasa, minimal AA
        adalah 4.5:1 dan AAA 7:1.
      </p>
    </div>
  );
}
