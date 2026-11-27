export interface SlugOptions {
  separator: string;
  lowercase: boolean;
  maxLength: number;
}

export function slugify(input: string, options: SlugOptions): string {
  const text = input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’]/g, '');

  const normalized = options.lowercase ? text.toLowerCase() : text;
  const slug = normalized
    .replace(/[^A-Za-z0-9]+/g, options.separator)
    .split(options.separator)
    .filter(Boolean)
    .join(options.separator);

  if (options.maxLength > 0 && slug.length > options.maxLength) {
    return slug.slice(0, options.maxLength).split(options.separator).filter(Boolean).join(options.separator);
  }
  return slug;
}

export function relativeTime(target: number, now = Date.now()): string {
  const diffSeconds = Math.round((target - now) / 1000);
  const abs = Math.abs(diffSeconds);
  const suffix = diffSeconds < 0 ? 'lalu' : 'lagi';

  if (abs < 45) return diffSeconds < 0 ? 'baru saja' : 'sebentar lagi';
  const units: Array<{ limit: number; div: number; name: string }> = [
    { limit: 90, div: 60, name: 'menit' },
    { limit: 3600 * 1.5, div: 3600, name: 'jam' },
    { limit: 3600 * 24 * 1.5, div: 3600 * 24, name: 'hari' },
    { limit: 3600 * 24 * 30, div: 3600 * 24 * 30, name: 'bulan' },
    { limit: 3600 * 24 * 365, div: 3600 * 24 * 365, name: 'tahun' },
  ];

  for (const unit of units) {
    if (abs < unit.limit) {
      const value = Math.round(abs / unit.div);
      return `${value} ${unit.name} ${suffix}`;
    }
  }

  const years = Math.round(abs / (3600 * 24 * 365));
  return `${years} tahun ${suffix}`;
}

export interface PasswordOptions {
  length: number;
  lowercase: boolean;
  uppercase: boolean;
  digits: boolean;
  symbols: boolean;
  avoidAmbiguous: boolean;
}

const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*()-_=+[]{};:,.?/';
const AMBIGUOUS = new Set('Il1O0o');

export function passwordAlphabet(options: PasswordOptions): string {
  let alphabet = '';
  if (options.lowercase) alphabet += LOWERCASE;
  if (options.uppercase) alphabet += UPPERCASE;
  if (options.digits) alphabet += DIGITS;
  if (options.symbols) alphabet += SYMBOLS;
  if (options.avoidAmbiguous) alphabet = alphabet.split('').filter((ch) => !AMBIGUOUS.has(ch)).join('');
  return alphabet;
}

export function generatePassword(options: PasswordOptions): string {
  const alphabet = passwordAlphabet(options);
  if (!alphabet) return '';

  const bytes = new Uint8Array(options.length);
  crypto.getRandomValues(bytes);

  let out = '';
  for (const byte of bytes) out += alphabet[byte % alphabet.length];
  return out;
}

export function entropyBits(length: number, alphabetSize: number): number {
  if (alphabetSize <= 1 || length <= 0) return 0;
  return Math.round(length * Math.log2(alphabetSize));
}
