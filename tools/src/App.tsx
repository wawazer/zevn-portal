import {
  ArrowLeft,
  ArrowUpRight,
  Binary,
  Braces,
  Fingerprint,
  Image as ImageIcon,
  Moon,
  QrCode,
  ShieldCheck,
  Sun,
  type LucideIcon,
} from 'lucide-react';
import { useCallback, useEffect, useState, type ComponentType } from 'react';
import { Base64Tool } from './tools/Base64Tool';
import { ImageCompressor } from './tools/ImageCompressor';
import { JsonFormatter } from './tools/JsonFormatter';
import { QrTool } from './tools/QrTool';
import { UuidHashTool } from './tools/UuidHashTool';
import { cn, muted, strong } from './components/ui';
import { useTheme } from './hooks/useTheme';

interface ToolEntry {
  path: string;
  key: string;
  name: string;
  tagline: string;
  Icon: LucideIcon;
  Component: ComponentType;
}

const TOOLS: ToolEntry[] = [
  {
    path: '/image',
    key: '1',
    name: 'Image Compressor',
    tagline: 'Kompres dan resize JPG/PNG ke WebP, dengan pratinjau hemat ukuran.',
    Icon: ImageIcon,
    Component: ImageCompressor,
  },
  {
    path: '/json',
    key: '2',
    name: 'JSON Formatter',
    tagline: 'Validasi, rapikan, dan minify JSON lengkap dengan posisi error.',
    Icon: Braces,
    Component: JsonFormatter,
  },
  {
    path: '/base64',
    key: '3',
    name: 'Base64',
    tagline: 'Encode/decode teks dan file, plus konversi balik ke file.',
    Icon: Binary,
    Component: Base64Tool,
  },
  {
    path: '/hash',
    key: '4',
    name: 'UUID & Hash',
    tagline: 'UUID v4 massal dan hash SHA-1/256/384/512 dari teks.',
    Icon: Fingerprint,
    Component: UuidHashTool,
  },
  {
    path: '/qr',
    key: '5',
    name: 'QR Generator',
    tagline: 'Buat QR dari teks atau URL dan unduh sebagai PNG.',
    Icon: QrCode,
    Component: QrTool,
  },
];

function normalize(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
}

function useRoute() {
  const [path, setPath] = useState(() => normalize(window.location.pathname));

  useEffect(() => {
    const onPop = () => setPath(normalize(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((to: string) => {
    window.history.pushState(null, '', to);
    setPath(normalize(to));
  }, []);

  return { path, navigate } as const;
}

function Overview({ onOpen }: { onOpen: (path: string) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className={cn('text-base font-semibold', strong)}>
          5 alat, semuanya jalan di browser
        </h1>
        <p className={cn('mt-1 text-sm', muted)}>
          Tidak ada file yang diunggah. Pilih alatnya, atau tekan angka 1–5.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {TOOLS.map(({ path, name, tagline, Icon, key }) => (
          <button
            key={path}
            onClick={() => onOpen(path)}
            className="group rounded-lg border border-hairline-light bg-white p-4 text-left transition-colors hover:border-hairline-hover-light hover:bg-surface-hover-light dark:border-hairline dark:bg-surface dark:hover:border-hairline-hover dark:hover:bg-surface-hover"
          >
            <div className="mb-2 flex items-center gap-2">
              <Icon size={15} className="text-accent" />
              <span className={cn('text-sm font-semibold', strong)}>{name}</span>
              <kbd
                className={cn(
                  'ml-auto rounded border border-hairline-light px-1.5 py-0.5 font-mono text-[10px]',
                  muted,
                  'dark:border-hairline',
                )}
              >
                {key}
              </kbd>
            </div>
            <p className={cn('text-xs leading-relaxed', muted)}>{tagline}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { path, navigate } = useRoute();

  const active = TOOLS.find((tool) => tool.path === path);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }
      const tool = TOOLS.find((entry) => entry.key === e.key);
      if (tool) navigate(tool.path);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  const ActiveComponent = active?.Component;

  return (
    <div className="mx-auto max-w-5xl px-5 pb-16">
      <header className="flex flex-wrap items-center justify-between gap-3 py-5">
        <div className="flex items-center gap-3">
          <a
            href="https://zevn.web.id"
            className={cn(
              'group flex items-center gap-2 text-xs transition-colors',
              muted,
              'hover:text-text-primary-light dark:hover:text-text-primary',
            )}
            title="Kembali ke hub"
          >
            <ArrowLeft size={13} />
            <span
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-md border border-hairline-light bg-white font-mono text-sm font-bold text-sky-700 dark:border-hairline-hover dark:bg-hairline dark:text-accent',
              )}
            >
              Z
            </span>
          </a>
          <span className={cn('font-mono text-sm', muted)}>tools.zevn.web.id</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-status-live/10 px-2.5 py-0.5 text-xs font-medium text-status-live">
            <ShieldCheck size={11} />
            100% lokal
          </span>
        </div>

        <div className="flex items-center gap-1">
          <a
            href="https://zevn.web.id"
            className={cn(
              'inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors hover:bg-hairline-light dark:hover:bg-hairline',
              muted,
            )}
          >
            Hub
            <ArrowUpRight size={13} />
          </a>
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className={cn(
              'inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-hairline-light dark:hover:bg-hairline',
              muted,
            )}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside>
          <nav className="-mx-1 flex gap-1 overflow-x-auto pb-1 lg:sticky lg:top-6 lg:mx-0 lg:flex-col lg:overflow-visible lg:pb-0">
            <button
              onClick={() => navigate('/')}
              className={cn(
                'shrink-0 rounded-md px-3 py-1.5 text-left text-xs font-medium transition-colors',
                path === '/'
                  ? 'bg-accent/15 text-sky-700 dark:text-accent'
                  : cn(muted, 'hover:bg-hairline-light dark:hover:bg-hairline'),
              )}
            >
              Semua alat
            </button>
            {TOOLS.map(({ path: toolPath, name, Icon, key }) => (
              <button
                key={toolPath}
                onClick={() => navigate(toolPath)}
                className={cn(
                  'flex shrink-0 items-center gap-2 rounded-md px-3 py-1.5 text-left text-xs font-medium transition-colors',
                  path === toolPath
                    ? 'bg-accent/15 text-sky-700 dark:text-accent'
                    : cn(muted, 'hover:bg-hairline-light dark:hover:bg-hairline'),
                )}
              >
                <Icon size={13} />
                {name}
                <kbd className="ml-auto hidden font-mono text-[10px] opacity-60 lg:inline">
                  {key}
                </kbd>
              </button>
            ))}
          </nav>

          <div
            className={cn(
              'mt-4 hidden rounded-lg border border-hairline-light p-3 text-[11px] leading-relaxed lg:block dark:border-hairline',
              muted,
            )}
          >
            Semua pemrosesan terjadi di perangkat kamu. Tidak ada file, teks, atau
            lisensi yang dikirim ke server.
          </div>
        </aside>

        <main>{ActiveComponent ? <ActiveComponent /> : <Overview onOpen={navigate} />}</main>
      </div>

      <footer
        className={cn(
          'mt-10 flex flex-wrap items-center justify-between gap-2 border-t border-hairline-light pt-4 text-[11px] dark:border-hairline',
          muted,
        )}
      >
        <span>zevn.web.id · Client-Side Utility Suite</span>
      </footer>
    </div>
  );
}
