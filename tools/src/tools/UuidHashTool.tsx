import { Fingerprint, Hash, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
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
import { bytesToBase64, toHex } from '../lib/encoding';

const ALGORITHMS = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const;

type Algorithm = (typeof ALGORITHMS)[number];

interface HashRow {
  algorithm: Algorithm;
  hex: string;
  base64: string;
}

function makeUuids(count: number): string[] {
  return Array.from({ length: count }, () => crypto.randomUUID());
}

export function UuidHashTool() {
  const [count, setCount] = useState(5);
  const [uuids, setUuids] = useState<string[]>(() => makeUuids(5));

  const [text, setText] = useState('');
  const [hashes, setHashes] = useState<HashRow[]>([]);

  useEffect(() => {
    if (!text) {
      setHashes([]);
      return;
    }
    let cancelled = false;

    (async () => {
      const data = new TextEncoder().encode(text);
      const rows = await Promise.all(
        ALGORITHMS.map(async (algorithm) => {
          const digest = await crypto.subtle.digest(algorithm, data);
          const bytes = new Uint8Array(digest);
          return { algorithm, hex: toHex(bytes), base64: bytesToBase64(bytes) };
        }),
      );
      if (!cancelled) setHashes(rows);
    })();

    return () => {
      cancelled = true;
    };
  }, [text]);

  return (
    <div className="space-y-4">
      <ToolHeader
        title="UUID & Hash Generator"
        description="UUID v4 kriptografis dan hash SHA dari teks. Dihitung dengan Web Crypto di perangkat ini."
      />

      <div className={panelCls}>
        <div className="mb-3 flex items-center gap-2">
          <Fingerprint size={15} className="text-accent" />
          <p className={cn('text-sm font-medium', strong)}>UUID v4</p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="w-28">
            <label className={labelCls} htmlFor="uuid-count">
              Jumlah
            </label>
            <input
              id="uuid-count"
              type="number"
              min={1}
              max={50}
              value={count}
              onChange={(e) =>
                setCount(Math.min(50, Math.max(1, Number(e.target.value) || 1)))
              }
              className={inputCls}
            />
          </div>
          <Button variant="primary" onClick={() => setUuids(makeUuids(count))}>
            <RefreshCw size={13} />
            Generate
          </Button>
          <CopyButton text={uuids.join('\n')} label="Copy semua" />
        </div>

        <ul className="mt-3 space-y-1 rounded-md border border-hairline-light p-2 dark:border-hairline">
          {uuids.map((uuid) => (
            <li
              key={uuid}
              className={cn('flex items-center justify-between gap-2 px-1 font-mono text-xs', strong)}
            >
              <span className="truncate">{uuid}</span>
              <CopyButton text={uuid} label="" className="h-6 px-1.5 text-[10px]" />
            </li>
          ))}
        </ul>
      </div>

      <div className={panelCls}>
        <div className="mb-3 flex items-center gap-2">
          <Hash size={15} className="text-accent" />
          <p className={cn('text-sm font-medium', strong)}>Hash teks</p>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ketik teks yang mau di-hash…"
          spellCheck={false}
          className={cn(textareaCls, 'h-28')}
        />

        {!text && (
          <p className={cn('mt-3 text-xs', muted)}>
            Hasil SHA-1, SHA-256, SHA-384, dan SHA-512 muncul otomatis.
          </p>
        )}

        {hashes.length > 0 && (
          <div className="mt-3 space-y-2">
            {hashes.map((row) => (
              <div
                key={row.algorithm}
                className="rounded-md border border-hairline-light p-2.5 dark:border-hairline"
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className={cn('text-[11px] font-semibold', muted)}>
                    {row.algorithm}
                  </span>
                  <CopyButton text={row.hex} label="Copy" className="h-6 px-1.5 text-[10px]" />
                </div>
                <p className={cn('break-all font-mono text-[11px] leading-relaxed', strong)}>
                  {row.hex}
                </p>
                <p className={cn('mt-1 break-all font-mono text-[10px]', muted)}>
                  {row.base64}
                </p>
              </div>
            ))}
          </div>
        )}

        <p className={cn('mt-3 text-[11px] leading-relaxed', muted)}>
          MD5 tidak tersedia di Web Crypto karena dianggap tidak aman untuk keperluan
          keamanan.
        </p>
      </div>
    </div>
  );
}
