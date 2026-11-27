import { KeyRound, RefreshCw } from 'lucide-react';
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
import {
  entropyBits,
  generatePassword,
  passwordAlphabet,
  type PasswordOptions,
} from '../lib/text';

const DEFAULT_OPTIONS: PasswordOptions = {
  length: 20,
  lowercase: true,
  uppercase: true,
  digits: true,
  symbols: true,
  avoidAmbiguous: false,
};

function strength(bits: number): { label: string; className: string } {
  if (bits >= 100) return { label: 'Sangat kuat', className: 'text-status-live' };
  if (bits >= 75) return { label: 'Kuat', className: 'text-emerald-500' };
  if (bits >= 50) return { label: 'Cukup', className: 'text-amber-500' };
  return { label: 'Lemah', className: 'text-rose-500' };
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-xs text-text-secondary-light dark:text-text-secondary">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-sky-400"
      />
      {label}
    </label>
  );
}

export function PasswordTool() {
  const [options, setOptions] = useState<PasswordOptions>(DEFAULT_OPTIONS);
  const [count, setCount] = useState(3);
  const [seed, setSeed] = useState(0);

  const alphabet = passwordAlphabet(options);

  const passwords = useMemo(
    () => Array.from({ length: count }, () => generatePassword(options)),
    [options, count, seed],
  );

  const bits = entropyBits(options.length, alphabet.length);
  const level = strength(bits);

  const update = (patch: Partial<PasswordOptions>) =>
    setOptions((prev) => ({ ...prev, ...patch }));

  return (
    <div className="space-y-4">
      <ToolHeader
        title="Password Generator"
        description="Kata sandi acak dari crypto.getRandomValues. Tidak ada yang disimpan atau dikirim."
      />

      <div className={panelCls}>
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_120px]">
          <div>
            <label className={labelCls} htmlFor="pw-length">
              Panjang — {options.length} karakter
            </label>
            <input
              id="pw-length"
              type="range"
              min={8}
              max={64}
              value={options.length}
              onChange={(e) => update({ length: Number(e.target.value) })}
              className="w-full accent-sky-400"
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="pw-count">
              Jumlah
            </label>
            <input
              id="pw-count"
              type="number"
              min={1}
              max={10}
              value={count}
              onChange={(e) => setCount(Math.min(10, Math.max(1, Number(e.target.value) || 1)))}
              className={inputCls}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <Toggle label="Huruf kecil (a-z)" checked={options.lowercase} onChange={(value) => update({ lowercase: value })} />
          <Toggle label="Huruf besar (A-Z)" checked={options.uppercase} onChange={(value) => update({ uppercase: value })} />
          <Toggle label="Angka (0-9)" checked={options.digits} onChange={(value) => update({ digits: value })} />
          <Toggle label="Simbol (!@#$…)" checked={options.symbols} onChange={(value) => update({ symbols: value })} />
          <Toggle
            label="Hindari karakter mirip (l, 1, O, 0)"
            checked={options.avoidAmbiguous}
            onChange={(value) => update({ avoidAmbiguous: value })}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button variant="primary" disabled={!alphabet} onClick={() => setSeed((prev) => prev + 1)}>
            <RefreshCw size={13} />
            Generate ulang
          </Button>
          <CopyButton text={passwords.join('\n')} label="Copy semua" />
          <span className={cn('text-[11px]', muted)}>
            {alphabet ? `${alphabet.length} karakter tersedia` : 'Pilih minimal satu jenis karakter'}
          </span>
          <span className={cn('ml-auto text-[11px] font-semibold', level.className)}>
            {level.label} · ±{bits} bit
          </span>
        </div>
      </div>

      {passwords.length > 0 && alphabet && (
        <div className={panelCls}>
          <div className="mb-2 flex items-center gap-2">
            <KeyRound size={14} className="text-accent" />
            <p className={cn('text-xs font-medium', strong)}>Hasil</p>
          </div>
          <ul className="space-y-1">
            {passwords.map((password, index) => (
              <li
                key={`${index}-${password}`}
                className="flex items-center justify-between gap-2 rounded-md border border-hairline-light px-2 py-1.5 dark:border-hairline"
              >
                <span className={cn('break-all font-mono text-xs', strong)}>{password}</span>
                <CopyButton text={password} label="" className="h-6 px-1.5 text-[10px]" />
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className={cn('text-[11px] leading-relaxed', muted)}>
        Entropi dihitung dari panjang × log₂(jumlah karakter). Simpan kata sandi di
        password manager, bukan di catatan biasa.
      </p>
    </div>
  );
}
