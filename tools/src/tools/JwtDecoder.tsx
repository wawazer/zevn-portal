import { KeyRound, ShieldAlert } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  cn,
  CopyButton,
  muted,
  panelCls,
  strong,
  textareaCls,
  ToolHeader,
} from '../components/ui';
import { base64ToBytes } from '../lib/encoding';

interface ClaimRow {
  label: string;
  value: string;
}

interface Decoded {
  header: string;
  payload: string;
  signature: string;
  claims: ClaimRow[];
  error?: string;
}

const CLAIM_LABEL: Record<string, string> = {
  iss: 'Issuer (iss)',
  sub: 'Subject (sub)',
  aud: 'Audience (aud)',
  exp: 'Kedaluwarsa (exp)',
  nbf: 'Aktif sejak (nbf)',
  iat: 'Diterbitkan (iat)',
  jti: 'JWT ID (jti)',
};

function decodePart(part: string): string {
  const text = new TextDecoder().decode(base64ToBytes(part));
  return JSON.stringify(JSON.parse(text), null, 2);
}

function describeClaim(key: string, value: unknown): string {
  if (typeof value === 'number' && (key === 'exp' || key === 'iat' || key === 'nbf')) {
    const date = new Date(value * 1000);
    const formatted = date.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'medium' });
    if (key === 'exp') {
      const expired = date.getTime() <= Date.now();
      return `${formatted} (${expired ? 'sudah kedaluwarsa' : 'masih berlaku'})`;
    }
    return formatted;
  }
  return Array.isArray(value) ? value.join(', ') : String(value);
}

function decodeJwt(token: string): Decoded | null {
  const raw = token.trim().replace(/^Bearer\s+/i, '');
  if (!raw) return null;

  const parts = raw.split('.');
  if (parts.length < 2) {
    return { header: '', payload: '', signature: '', claims: [], error: 'JWT harus punya minimal 3 bagian dipisah titik.' };
  }

  try {
    const header = decodePart(parts[0]);
    const payload = decodePart(parts[1]);
    const parsedPayload = JSON.parse(payload) as Record<string, unknown>;
    const claims: ClaimRow[] = Object.entries(CLAIM_LABEL)
      .filter(([key]) => key in parsedPayload)
      .map(([key, label]) => ({ label, value: describeClaim(key, parsedPayload[key]) }));

    const rawClaims = Object.keys(parsedPayload).filter((key) => !(key in CLAIM_LABEL));
    for (const key of rawClaims) {
      claims.push({ label: key, value: describeClaim(key, parsedPayload[key]) });
    }

    return {
      header,
      payload,
      signature: parts.slice(2).join('.'),
      claims,
    };
  } catch (err) {
    return {
      header: '',
      payload: '',
      signature: '',
      claims: [],
      error: `Bagian JWT bukan Base64URL JSON yang valid: ${err instanceof Error ? err.message : 'tidak diketahui'}`,
    };
  }
}

function JsonBlock({ title, json }: { title: string; json: string }) {
  return (
    <div className="rounded-md border border-hairline-light dark:border-hairline">
      <div className="flex items-center justify-between gap-2 border-b border-hairline-light px-3 py-2 dark:border-hairline">
        <span className={cn('text-[11px] font-semibold uppercase tracking-wide', muted)}>{title}</span>
        <CopyButton text={json} label="Copy" className="h-6 px-1.5 text-[10px]" />
      </div>
      <pre className={cn('max-h-56 overflow-auto p-3 font-mono text-[11px] leading-relaxed', strong)}>
        {json}
      </pre>
    </div>
  );
}

export function JwtDecoder({ embedded = false }: { embedded?: boolean }) {
  const [token, setToken] = useState('');
  const decoded = useMemo(() => decodeJwt(token), [token]);

  return (
    <div className="space-y-4">
      {!embedded && (
        <ToolHeader
          title="JWT Decoder"
          description="Baca header, payload, dan klaim waktu dari JWT. Tanda tangan tidak diverifikasi di browser."
        />
      )}

      <div className={panelCls}>
        <label className={cn('mb-1 block text-xs font-medium', muted)} htmlFor="jwt-input">
          Token JWT
        </label>
        <textarea
          id="jwt-input"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMifQ.signature"
          spellCheck={false}
          className={cn(textareaCls, 'h-32')}
        />
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <span className={cn('text-[11px]', muted)}>
            {token.trim() ? `${token.trim().split('.').length} bagian` : 'Tempel token untuk mulai'}
          </span>
          <span className={cn('inline-flex items-center gap-1 text-[11px]', muted)}>
            <KeyRound size={11} /> Base64URL, tanpa kirim ke server
          </span>
        </div>
      </div>

      {decoded?.error && (
        <p className="rounded-md border border-rose-500/30 bg-rose-500/5 p-3 text-xs text-rose-500">
          {decoded.error}
        </p>
      )}

      {decoded && !decoded.error && (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <JsonBlock title="Header" json={decoded.header} />
            <JsonBlock title="Payload" json={decoded.payload} />
          </div>

          {decoded.claims.length > 0 && (
            <div className={panelCls}>
              <p className={cn('mb-2 text-xs font-medium', strong)}>Klaim</p>
              <div className="divide-y divide-hairline-light dark:divide-hairline">
                {decoded.claims.map((claim) => (
                  <div key={claim.label} className="flex flex-wrap gap-x-3 gap-y-1 py-1.5">
                    <span className={cn('w-44 shrink-0 text-[11px]', muted)}>{claim.label}</span>
                    <span className={cn('flex-1 break-all font-mono text-[11px]', strong)}>
                      {claim.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={panelCls}>
            <p className={cn('mb-1 text-xs font-medium', strong)}>Signature</p>
            <p className="break-all font-mono text-[11px] text-text-secondary-light dark:text-text-secondary">
              {decoded.signature || '(tidak ada)'}
            </p>
            <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed text-amber-600 dark:text-amber-400">
              <ShieldAlert size={12} className="mt-0.5 shrink-0" />
              Hanya isi token yang dibaca. Signature tidak dicek, jadi JWT ini belum
              bisa dianggap sah — verifikasi selalu di server.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
