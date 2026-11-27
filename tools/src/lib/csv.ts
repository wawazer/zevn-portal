export type Delimiter = ',' | ';' | '\t';

export function detectDelimiter(text: string): Delimiter {
  const sample = text.split(/\r?\n/).slice(0, 5).join('\n');
  const candidates: Delimiter[] = [',', ';', '\t'];
  let best: Delimiter = ',';
  let bestCount = 0;
  for (const candidate of candidates) {
    const count = sample.split(candidate).length - 1;
    if (count > bestCount) {
      best = candidate;
      bestCount = count;
    }
  }
  return best;
}

export function parseCsv(text: string, delimiter: string = ','): string[][] {
  const rows: string[][] = [];
  const source = text.replace(/^\uFEFF/, '');
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  const pushField = () => {
    row.push(field);
    field = '';
  };
  const pushRow = () => {
    pushField();
    rows.push(row);
    row = [];
  };

  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i];

    if (inQuotes) {
      if (ch === '"') {
        if (source[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"' && field === '') {
      inQuotes = true;
      continue;
    }
    if (ch === delimiter) {
      pushField();
      continue;
    }
    if (ch === '\r') {
      if (source[i + 1] === '\n') i += 1;
      pushRow();
      continue;
    }
    if (ch === '\n') {
      pushRow();
      continue;
    }
    field += ch;
  }

  if (field !== '' || row.length > 0) pushRow();

  while (rows.length > 0 && rows[rows.length - 1].every((cell) => cell === '')) {
    rows.pop();
  }

  return rows;
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function escapeCell(value: unknown, delimiter: string): string {
  const text = formatCell(value);
  const needsQuotes =
    text.includes('"') ||
    text.includes('\n') ||
    text.includes('\r') ||
    text.includes(delimiter) ||
    /^\s|\s$/.test(text);
  return needsQuotes ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(rows: unknown[][], delimiter: string = ','): string {
  return rows.map((row) => row.map((cell) => escapeCell(cell, delimiter)).join(delimiter)).join('\n');
}

export interface CsvToJsonOptions {
  delimiter: string;
  header: boolean;
}

export function csvToJson(text: string, options: CsvToJsonOptions): unknown {
  const rows = parseCsv(text, options.delimiter);
  if (rows.length === 0) return [];
  if (!options.header) return rows;

  const [head, ...body] = rows;
  const keys = head.map((key, index) => key.trim() || `kolom_${index + 1}`);
  return body.map((row) => {
    const record: Record<string, string> = {};
    keys.forEach((key, index) => {
      record[key] = row[index] ?? '';
    });
    return record;
  });
}

export function jsonToRows(value: unknown): unknown[][] {
  if (Array.isArray(value)) {
    if (value.length === 0) return [];
    if (value.every((item) => item !== null && typeof item === 'object' && !Array.isArray(item))) {
      const keys: string[] = [];
      for (const item of value as Record<string, unknown>[]) {
        for (const key of Object.keys(item)) {
          if (!keys.includes(key)) keys.push(key);
        }
      }
      return [keys, ...(value as Record<string, unknown>[]).map((item) => keys.map((key) => formatCell(item[key]))) ];
    }
    if (value.every((item) => Array.isArray(item))) return value as unknown[][];
    return [['nilai'], ...value.map((item) => [formatCell(item)])];
  }

  if (value !== null && typeof value === 'object') {
    return [['key', 'value'], ...Object.entries(value as Record<string, unknown>).map(([key, val]) => [key, formatCell(val)])];
  }

  return [['nilai'], [formatCell(value)]];
}
