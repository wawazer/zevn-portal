import { CalendarClock } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  Button,
  cn,
  CopyButton,
  inputCls,
  labelCls,
  muted,
  panelCls,
  strong,
  ToolHeader,
} from '../components/ui';
import { relativeTime } from '../lib/text';

interface ParsedTime {
  ms: number;
  source: string;
}

function parseInput(raw: string): ParsedTime | null {
  const text = raw.trim();
  if (!text) return null;

  if (/^-?\d+$/.test(text)) {
    const numeric = Number(text);
    const isSeconds = Math.abs(numeric) < 1e11;
    return {
      ms: isSeconds ? numeric * 1000 : numeric,
      source: isSeconds ? 'unix detik' : 'unix milidetik',
    };
  }

  const direct = Date.parse(text);
  if (!Number.isNaN(direct)) return { ms: direct, source: 'tanggal' };

  const withT = Date.parse(text.replace(' ', 'T'));
  if (!Number.isNaN(withT)) return { ms: withT, source: 'tanggal' };

  return null;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 border-b border-hairline-light py-2 last:border-0 dark:border-hairline">
      <span className={cn('w-32 shrink-0 text-[11px]', muted)}>{label}</span>
      <span className={cn('flex-1 break-all font-mono text-[11px]', strong)}>{value}</span>
      <CopyButton text={value} label="" className="h-6 px-1.5 text-[10px]" />
    </div>
  );
}

export function DateTimeTool() {
  const [input, setInput] = useState(() => String(Math.floor(Date.now() / 1000)));

  const parsed = useMemo(() => parseInput(input), [input]);

  const rows = useMemo(() => {
    if (!parsed) return [];
    const date = new Date(parsed.ms);
    if (Number.isNaN(date.getTime())) return [];

    const pad = (n: number) => String(n).padStart(2, '0');
    const offsetMinutes = -date.getTimezoneOffset();
    const sign = offsetMinutes >= 0 ? '+' : '-';
    const offset = `${sign}${pad(Math.floor(Math.abs(offsetMinutes) / 60))}:${pad(Math.abs(offsetMinutes) % 60)}`;
    const localIso = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
      date.getHours(),
    )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}${offset}`;

    return [
      { label: 'ISO 8601 (UTC)', value: date.toISOString() },
      { label: 'ISO lokal', value: localIso },
      {
        label: 'Waktu lokal',
        value: date.toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'medium' }),
      },
      { label: 'UTC', value: date.toUTCString() },
      { label: 'Unix detik', value: String(Math.floor(date.getTime() / 1000)) },
      { label: 'Unix milidetik', value: String(date.getTime()) },
      { label: 'Relatif', value: relativeTime(date.getTime()) },
    ];
  }, [parsed]);

  return (
    <div className="space-y-4">
      <ToolHeader
        title="Timestamp & Tanggal"
        description="Ubah unix timestamp atau tanggal menjadi ISO, waktu lokal, dan format lain."
      />

      <div className={panelCls}>
        <label className={labelCls} htmlFor="date-input">
          Timestamp atau tanggal
        </label>
        <div className="flex flex-wrap gap-2">
          <input
            id="date-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className={cn(inputCls, 'min-w-[220px] flex-1 font-mono')}
            placeholder="1764297600 atau 2026-11-27T08:00:00Z"
            spellCheck={false}
          />
          <Button onClick={() => setInput(String(Math.floor(Date.now() / 1000)))}>
            <CalendarClock size={13} />
            Sekarang
          </Button>
          <Button
            onClick={() => setInput(new Date().toISOString())}
            title="Isi dengan ISO 8601 saat ini"
          >
            ISO
          </Button>
        </div>
        <p className={cn('mt-2 text-[11px]', muted)}>
          {parsed
            ? `Terbaca sebagai ${parsed.source}.`
            : input.trim()
              ? 'Tidak bisa dibaca sebagai tanggal atau angka.'
              : 'Masukkan 10 digit unix detik, 13 digit milidetik, atau tanggal biasa.'}
        </p>
      </div>

      {rows.length > 0 && (
        <div className={panelCls}>
          {rows.map((row) => (
            <Row key={row.label} label={row.label} value={row.value} />
          ))}
        </div>
      )}
    </div>
  );
}
