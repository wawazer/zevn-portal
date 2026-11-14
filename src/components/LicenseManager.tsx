import {
  Check,
  ClipboardCopy,
  KeyRound,
  Loader2,
  Monitor,
  Plus,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { LicenseRecord, Theme } from '../types';

interface LicenseManagerProps {
  theme: Theme;
}

const API_BASE = '/api/license/admin';

function relativeTime(iso: string | null): string {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'baru saja';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}j lalu`;
  const days = Math.floor(hours / 24);
  return `${days}h lalu`;
}

function truncateId(id: string | null): string {
  if (!id) return '';
  return id.length > 12 ? id.slice(0, 12) + '…' : id;
}

export function LicenseManager({ theme }: LicenseManagerProps) {
  const isDark = theme === 'dark';

  // Auth state
  const [secret, setSecret] = useState(() => sessionStorage.getItem('zevn-admin-secret') || '');
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // License data
  const [licenses, setLicenses] = useState<LicenseRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // Create form
  const [newOwner, setNewOwner] = useState('');
  const [newApp, setNewApp] = useState('scrape-ticket');
  const [creating, setCreating] = useState(false);

  // Copy state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Delete confirmation
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const headers = useCallback(
    () => ({ 'Content-Type': 'application/json', 'x-admin-secret': secret }),
    [secret],
  );

  const fetchLicenses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API_BASE, { headers: headers() });
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      setLicenses(data);
    } catch {
      setLicenses([]);
    } finally {
      setLoading(false);
    }
  }, [headers]);

  // Authenticate
  const handleLogin = async () => {
    if (!secret.trim()) return;
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch(API_BASE, {
        headers: { 'x-admin-secret': secret.trim() },
      });
      if (res.status === 401) {
        setAuthError('Secret salah.');
        setAuthed(false);
      } else {
        sessionStorage.setItem('zevn-admin-secret', secret.trim());
        setAuthed(true);
        const data = await res.json();
        setLicenses(data);
      }
    } catch {
      setAuthError('Gagal terhubung ke server.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Auto-auth if secret in sessionStorage
  useEffect(() => {
    if (secret && !authed) {
      handleLogin();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Admin mutation
  const adminAction = async (
    action: string,
    key?: string,
    extra?: Record<string, string>,
  ) => {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ action, key, ...extra }),
    });
    if (!res.ok) throw new Error('Action failed');
    return res.json();
  };

  const handleCreate = async () => {
    if (!newOwner.trim()) return;
    setCreating(true);
    try {
      await adminAction('create', undefined, {
        owner: newOwner.trim(),
        app: newApp,
      });
      setNewOwner('');
      await fetchLicenses();
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (key: string) => {
    await adminAction('toggle_status', key);
    await fetchLicenses();
  };

  const handleReset = async (key: string) => {
    await adminAction('reset_device', key);
    await fetchLicenses();
  };

  const handleDelete = async (key: string) => {
    await adminAction('delete', key);
    setConfirmDelete(null);
    await fetchLicenses();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  // --- Shared style helpers ---
  const cardBg = isDark
    ? 'border-hairline bg-surface'
    : 'border-hairline-light bg-surface-light';
  const inputCls = isDark
    ? 'border-hairline bg-[#0F172A] text-text-primary placeholder:text-text-secondary/50 focus:border-accent'
    : 'border-hairline-light bg-white text-text-primary-light placeholder:text-text-secondary-light/50 focus:border-accent';
  const secondaryText = isDark ? 'text-text-secondary' : 'text-text-secondary-light';
  const primaryText = isDark ? 'text-text-primary' : 'text-text-primary-light';

  // --- Auth gate ---
  if (!authed) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className={`w-full max-w-sm rounded-lg border p-6 ${cardBg}`}>
          <div className="mb-4 flex items-center gap-2">
            <KeyRound size={18} className="text-accent" />
            <h2 className={`text-sm font-semibold ${primaryText}`}>
              Admin Authentication
            </h2>
          </div>
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Admin secret"
            className={`mb-3 h-10 w-full rounded-lg border px-3 text-sm outline-none transition-colors duration-150 ${inputCls}`}
            autoFocus
          />
          {authError && (
            <p className="mb-3 text-xs text-rose-400">{authError}</p>
          )}
          <button
            onClick={handleLogin}
            disabled={authLoading}
            className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-accent text-sm font-medium text-white transition-opacity duration-150 hover:opacity-90 disabled:opacity-50"
          >
            {authLoading && <Loader2 size={14} className="animate-spin" />}
            Authenticate
          </button>
        </div>
      </div>
    );
  }

  // --- Main license manager ---
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-lg font-semibold ${primaryText}`}>
          License Manager
        </h1>
        <p className={`mt-1 text-sm ${secondaryText}`}>
          Kelola lisensi, device binding, dan status aktivasi.
        </p>
      </div>

      {/* Create form */}
      <div className={`rounded-lg border p-4 ${cardBg}`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className={`mb-1 block text-xs font-medium ${secondaryText}`}>
              Owner
            </label>
            <input
              type="text"
              value={newOwner}
              onChange={(e) => setNewOwner(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="Nama pemilik lisensi"
              className={`h-9 w-full rounded-md border px-3 text-sm outline-none transition-colors duration-150 ${inputCls}`}
            />
          </div>
          <div className="w-full sm:w-40">
            <label className={`mb-1 block text-xs font-medium ${secondaryText}`}>
              App
            </label>
            <select
              value={newApp}
              onChange={(e) => setNewApp(e.target.value)}
              className={`h-9 w-full rounded-md border px-2 text-sm outline-none transition-colors duration-150 ${inputCls}`}
            >
              <option value="scrape-ticket">scrape-ticket</option>
              <option value="other">other</option>
            </select>
          </div>
          <button
            onClick={handleCreate}
            disabled={creating || !newOwner.trim()}
            className="flex h-9 items-center gap-1.5 rounded-md bg-accent px-4 text-sm font-medium text-white transition-opacity duration-150 hover:opacity-90 disabled:opacity-50"
          >
            {creating ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Plus size={14} />
            )}
            Generate Key
          </button>
        </div>
      </div>

      {/* License list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={20} className={`animate-spin ${secondaryText}`} />
        </div>
      ) : licenses.length === 0 ? (
        <p className={`py-12 text-center text-sm ${secondaryText}`}>
          Belum ada lisensi. Buat yang pertama di atas.
        </p>
      ) : (
        <div className="space-y-2">
          {licenses.map((lic) => (
            <div
              key={lic.key}
              className={`rounded-lg border p-4 transition-colors duration-150 ${cardBg}`}
            >
              {/* Row 1: key + status + actions */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Key */}
                <div className="flex items-center gap-1.5">
                  <code
                    className={`rounded px-2 py-0.5 font-mono text-xs ${
                      isDark
                        ? 'bg-hairline text-accent'
                        : 'bg-hairline-light text-sky-700'
                    }`}
                  >
                    {lic.key}
                  </code>
                  <button
                    onClick={() => copyToClipboard(lic.key)}
                    className={`rounded p-1 transition-colors duration-150 ${
                      isDark
                        ? 'text-text-secondary hover:bg-hairline hover:text-text-primary'
                        : 'text-text-secondary-light hover:bg-hairline-light hover:text-text-primary-light'
                    }`}
                    title="Copy key"
                  >
                    {copiedKey === lic.key ? (
                      <Check size={12} className="text-status-live" />
                    ) : (
                      <ClipboardCopy size={12} />
                    )}
                  </button>
                </div>

                {/* Status badge */}
                <span
                  className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                    lic.status === 'active'
                      ? isDark
                        ? 'bg-status-live/10 text-status-live'
                        : 'bg-status-live/15 text-emerald-700'
                      : isDark
                        ? 'bg-rose-500/10 text-rose-400'
                        : 'bg-rose-500/15 text-rose-700'
                  }`}
                >
                  {lic.status === 'active' ? (
                    <ShieldCheck size={10} />
                  ) : (
                    <ShieldAlert size={10} />
                  )}
                  {lic.status}
                </span>

                {/* App badge */}
                <span
                  className={`rounded px-1.5 py-0.5 font-mono text-[10px] ${
                    isDark
                      ? 'bg-hairline text-text-secondary'
                      : 'bg-hairline-light text-text-secondary-light'
                  }`}
                >
                  {lic.app}
                </span>

                {/* Actions — pushed right */}
                <div className="ml-auto flex items-center gap-1">
                  <button
                    onClick={() => handleToggle(lic.key)}
                    className={`rounded px-2 py-1 text-[11px] font-medium transition-colors duration-150 ${
                      lic.status === 'active'
                        ? isDark
                          ? 'text-rose-400 hover:bg-rose-500/10'
                          : 'text-rose-600 hover:bg-rose-500/10'
                        : isDark
                          ? 'text-status-live hover:bg-status-live/10'
                          : 'text-emerald-700 hover:bg-status-live/10'
                    }`}
                    title={lic.status === 'active' ? 'Revoke' : 'Activate'}
                  >
                    {lic.status === 'active' ? 'Revoke' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleReset(lic.key)}
                    disabled={!lic.deviceId}
                    className={`rounded p-1 transition-colors duration-150 disabled:opacity-30 ${
                      isDark
                        ? 'text-text-secondary hover:bg-hairline hover:text-text-primary'
                        : 'text-text-secondary-light hover:bg-hairline-light hover:text-text-primary-light'
                    }`}
                    title="Reset device binding"
                  >
                    <RotateCcw size={12} />
                  </button>
                  {confirmDelete === lic.key ? (
                    <button
                      onClick={() => handleDelete(lic.key)}
                      className="rounded bg-rose-500/15 px-2 py-1 text-[11px] font-medium text-rose-400 transition-colors duration-150 hover:bg-rose-500/25"
                    >
                      Confirm
                    </button>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(lic.key)}
                      className={`rounded p-1 transition-colors duration-150 ${
                        isDark
                          ? 'text-text-secondary hover:bg-hairline hover:text-rose-400'
                          : 'text-text-secondary-light hover:bg-hairline-light hover:text-rose-600'
                      }`}
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* Row 2: owner, device, last seen */}
              <div className={`mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs ${secondaryText}`}>
                <span>
                  <span className="font-medium">Owner:</span> {lic.owner}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Monitor size={11} />
                  {lic.deviceId ? (
                    <>
                      {lic.hostname}
                      <code
                        className={`rounded px-1 py-px font-mono text-[10px] ${
                          isDark ? 'bg-hairline' : 'bg-hairline-light'
                        }`}
                      >
                        {truncateId(lic.deviceId)}
                      </code>
                    </>
                  ) : (
                    <span className="italic opacity-60">Unbound</span>
                  )}
                </span>
                <span>
                  <span className="font-medium">Last seen:</span>{' '}
                  {relativeTime(lic.lastSeen)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
