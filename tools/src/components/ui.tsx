import { Check, Copy } from 'lucide-react';
import { useEffect, useRef, useState, type ComponentProps } from 'react';

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export const panelCls =
  'rounded-lg border border-hairline-light bg-white p-4 dark:border-hairline dark:bg-surface';

export const inputCls =
  'h-9 w-full rounded-md border border-hairline-light bg-white px-3 text-sm text-text-primary-light outline-none transition-colors placeholder:text-text-secondary-light/60 focus:border-accent dark:border-hairline dark:bg-[#0F172A] dark:text-text-primary dark:placeholder:text-text-secondary/50';

export const textareaCls =
  'w-full resize-y rounded-md border border-hairline-light bg-white p-3 font-mono text-xs leading-relaxed text-text-primary-light outline-none transition-colors placeholder:text-text-secondary-light/50 focus:border-accent dark:border-hairline dark:bg-[#0F172A] dark:text-text-primary dark:placeholder:text-text-secondary/40';

export const labelCls =
  'mb-1 block text-xs font-medium text-text-secondary-light dark:text-text-secondary';

export const muted = 'text-text-secondary-light dark:text-text-secondary';
export const strong = 'text-text-primary-light dark:text-text-primary';

export const badgeCls =
  'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide';

type ButtonProps = ComponentProps<'button'> & { variant?: 'primary' | 'secondary' };

export function Button({ variant = 'secondary', className, ...props }: ButtonProps) {
  const base =
    'inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50';
  const variants = {
    primary: 'bg-accent text-[#06121F] hover:bg-sky-300',
    secondary:
      'border border-hairline-light text-text-secondary-light hover:bg-hairline-light hover:text-text-primary-light dark:border-hairline dark:text-text-secondary dark:hover:bg-hairline dark:hover:text-text-primary',
  };
  return <button className={cn(base, variants[variant], className)} {...props} />;
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const area = document.createElement('textarea');
      area.value = text;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand('copy');
      area.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

export function CopyButton({
  text,
  label = 'Copy',
  className,
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <Button
      className={className}
      disabled={!text}
      onClick={async () => {
        if (!(await copyText(text))) return;
        setCopied(true);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? (
        <Check size={13} className="text-status-live" />
      ) : (
        <Copy size={13} />
      )}
      {copied ? 'Tersalin' : label}
    </Button>
  );
}

export function ToolHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h1 className={cn('text-base font-semibold', strong)}>{title}</h1>
      <p className={cn('mt-1 text-sm leading-relaxed', muted)}>{description}</p>
    </div>
  );
}
