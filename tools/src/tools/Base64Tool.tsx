import { ArrowLeftRight, Download, Eraser, FileUp, Loader2 } from 'lucide-react';
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
import {
  base64ToBytes,
  byteLength,
  bytesToBase64,
  mimeFromDataUrl,
} from '../lib/encoding';
import { downloadBlob, formatBytes } from '../lib/format';

type Mode = 'text' | 'file';

function TextBase64() {
  const [text, setText] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const encode = () => {
    if (!text) {
      setError('Isi teks dulu.');
      setOutput('');
      return;
    }
    try {
      setOutput(bytesToBase64(new TextEncoder().encode(text)));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal encode.');
      setOutput('');
    }
  };

  const decode = () => {
    if (!text.trim()) {
      setError('Tempel Base64 dulu.');
      setOutput('');
      return;
    }
    try {
      setOutput(new TextDecoder('utf-8', { fatal: false }).decode(base64ToBytes(text)));
      setError('');
    } catch {
      setError('Base64 tidak valid.');
      setOutput('');
    }
  };

  return (
    <div className="space-y-4">
      <div className={panelCls}>
        <label className={labelCls} htmlFor="b64-text">
          Teks atau Base64
        </label>
        <textarea
          id="b64-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Halo zevn! atau SGVsbG8gemV2biE="
          spellCheck={false}
          className={cn(textareaCls, 'h-40')}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="primary" onClick={encode}>
            <ArrowLeftRight size={13} />
            Encode ke Base64
          </Button>
          <Button onClick={decode}>Decode ke teks</Button>
          <Button
            onClick={() => {
              setText('');
              setOutput('');
              setError('');
            }}
          >
            <Eraser size={13} />
            Bersihkan
          </Button>
        </div>
        {error && <p className="mt-2 text-xs text-rose-500">{error}</p>}
      </div>

      <div className={panelCls}>
        <div className="mb-2 flex items-center justify-between">
          <span className={cn('text-xs font-medium', muted)}>Hasil</span>
          <span className={cn('text-[11px]', muted)}>
            {output ? formatBytes(byteLength(output)) : '—'}
          </span>
        </div>
        <textarea
          readOnly
          value={output}
          placeholder="Hasil encode/decode muncul di sini."
          spellCheck={false}
          className={cn(textareaCls, 'h-40')}
        />
        <div className="mt-3">
          <CopyButton text={output} label="Copy hasil" />
        </div>
      </div>
    </div>
  );
}

function FileBase64() {
  const [file, setFile] = useState<File | null>(null);
  const [encoded, setEncoded] = useState('');
  const [withPrefix, setWithPrefix] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const [encodedInput, setEncodedInput] = useState('');
  const [decoded, setDecoded] = useState<{ bytes: Uint8Array; mime: string } | null>(null);
  const [decodeError, setDecodeError] = useState('');

  const encodeFile = async (next: File | null) => {
    setFile(next);
    setEncoded('');
    setError('');
    if (!next) return;
    setBusy(true);
    try {
      const buffer = new Uint8Array(await next.arrayBuffer());
      const base64 = bytesToBase64(buffer);
      setEncoded(withPrefix ? `data:${next.type || 'application/octet-stream'};base64,${base64}` : base64);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membaca file.');
    } finally {
      setBusy(false);
    }
  };

  const decodeFile = () => {
    if (!encodedInput.trim()) {
      setDecodeError('Tempel Base64 dulu.');
      setDecoded(null);
      return;
    }
    try {
      const bytes = base64ToBytes(encodedInput);
      const mime = mimeFromDataUrl(encodedInput) || 'application/octet-stream';
      setDecoded({ bytes, mime });
      setDecodeError('');
    } catch {
      setDecoded(null);
      setDecodeError('Base64 tidak valid.');
    }
  };

  return (
    <div className="space-y-4">
      <div className={panelCls}>
        <p className={cn('mb-3 text-xs font-medium', muted)}>File → Base64</p>
        <label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-hairline-light px-3 text-sm font-medium text-text-secondary-light transition-colors hover:bg-hairline-light hover:text-text-primary-light dark:border-hairline dark:text-text-secondary dark:hover:bg-hairline dark:hover:text-text-primary">
          <FileUp size={14} />
          Pilih file
          <input
            type="file"
            className="hidden"
            onChange={(e) => {
              void encodeFile(e.target.files?.[0] ?? null);
              e.currentTarget.value = '';
            }}
          />
        </label>

        <label className="mt-3 flex items-center gap-2 text-xs text-text-secondary-light dark:text-text-secondary">
          <input
            type="checkbox"
            checked={withPrefix}
            onChange={(e) => {
              setWithPrefix(e.target.checked);
              if (file) void encodeFile(file);
            }}
            className="accent-sky-400"
          />
          Sertakan prefix data URL (data:…;base64,)
        </label>

        {busy && (
          <p className={cn('mt-2 flex items-center gap-2 text-xs', muted)}>
            <Loader2 size={13} className="animate-spin" />
            Membaca file…
          </p>
        )}
        {file && !busy && (
          <p className={cn('mt-2 text-xs', muted)}>
            {file.name} · {formatBytes(file.size)}
          </p>
        )}
        {error && <p className="mt-2 text-xs text-rose-500">{error}</p>}

        <textarea
          readOnly
          value={encoded}
          placeholder="Base64 file muncul di sini."
          spellCheck={false}
          className={cn(textareaCls, 'mt-3 h-32')}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <CopyButton text={encoded} label="Copy Base64" />
          <Button
            disabled={!encoded}
            onClick={() => downloadBlob(new Blob([encoded], { type: 'text/plain' }), `${file?.name ?? 'file'}.base64.txt`)}
          >
            <Download size={13} />
            Unduh .txt
          </Button>
        </div>
      </div>

      <div className={panelCls}>
        <p className={cn('mb-3 text-xs font-medium', muted)}>Base64 → File</p>
        <textarea
          value={encodedInput}
          onChange={(e) => setEncodedInput(e.target.value)}
          placeholder="data:image/png;base64,iVBORw0KGgo…"
          spellCheck={false}
          className={cn(textareaCls, 'h-32')}
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button variant="primary" onClick={decodeFile}>
            Decode
          </Button>
          <Button
            disabled={!decoded}
            onClick={() => {
              if (!decoded) return;
              const ext = decoded.mime.split('/')[1]?.split('+')[0] || 'bin';
              downloadBlob(
                new Blob([decoded.bytes], { type: decoded.mime }),
                `zevn-decoded.${ext}`,
              );
            }}
          >
            <Download size={13} />
            Unduh file
          </Button>
          {decoded && (
            <span className={cn('text-xs', muted)}>
              {decoded.mime} · {formatBytes(decoded.bytes.length)}
            </span>
          )}
        </div>
        {decodeError && <p className="mt-2 text-xs text-rose-500">{decodeError}</p>}
        <label className="mt-4 block">
          <span className={labelCls}>MIME manual (opsional)</span>
          <input
            className={inputCls}
            placeholder="application/pdf"
            value={decoded?.mime ?? ''}
            onChange={(e) => {
              if (!decoded) return;
              setDecoded({ ...decoded, mime: e.target.value || 'application/octet-stream' });
            }}
            disabled={!decoded}
          />
        </label>
      </div>
    </div>
  );
}

export function Base64Tool() {
  const [mode, setMode] = useState<Mode>('text');

  return (
    <div className="space-y-4">
      <ToolHeader
        title="Base64 Encoder / Decoder"
        description="Konversi teks dan file ke Base64 — atau sebaliknya — tanpa upload ke server."
      />

      <div className="inline-flex rounded-md border border-hairline-light p-0.5 dark:border-hairline">
        {(
          [
            ['text', 'Teks'],
            ['file', 'File'],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setMode(value)}
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

      {mode === 'text' ? <TextBase64 /> : <FileBase64 />}

      <p className={cn('text-[11px] leading-relaxed', strong)}>
        Base64 bukan enkripsi — siapa pun bisa membaliknya. Jangan pakai untuk menyimpan
        rahasia.
      </p>
    </div>
  );
}
