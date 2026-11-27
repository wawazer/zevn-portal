export type DiffType = 'same' | 'del' | 'add';

export interface DiffLine {
  type: DiffType;
  text: string;
  a: number;
  b: number;
}

export const DIFF_MAX_LINES = 1200;

export function splitLines(text: string): string[] {
  if (text === '') return [];
  return text.split(/\r?\n/);
}

export function diffLines(before: string, after: string): DiffLine[] {
  const a = splitLines(before);
  const b = splitLines(after);
  const ops: DiffLine[] = [];

  let start = 0;
  while (start < a.length && start < b.length && a[start] === b[start]) start += 1;

  let endA = a.length;
  let endB = b.length;
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
    endA -= 1;
    endB -= 1;
  }

  for (let i = 0; i < start; i += 1) {
    ops.push({ type: 'same', text: a[i], a: i + 1, b: i + 1 });
  }

  const midA = a.slice(start, endA);
  const midB = b.slice(start, endB);
  const n = midA.length;
  const m = midB.length;

  if (n > 0 && m > 0) {
    const width = m + 1;
    const table = new Uint32Array((n + 1) * width);

    for (let i = n - 1; i >= 0; i -= 1) {
      for (let j = m - 1; j >= 0; j -= 1) {
        table[i * width + j] =
          midA[i] === midB[j]
            ? table[(i + 1) * width + j + 1] + 1
            : Math.max(table[(i + 1) * width + j], table[i * width + j + 1]);
      }
    }

    let i = 0;
    let j = 0;
    while (i < n && j < m) {
      if (midA[i] === midB[j]) {
        ops.push({ type: 'same', text: midA[i], a: start + i + 1, b: start + j + 1 });
        i += 1;
        j += 1;
      } else if (table[(i + 1) * width + j] >= table[i * width + j + 1]) {
        ops.push({ type: 'del', text: midA[i], a: start + i + 1, b: start + j + 1 });
        i += 1;
      } else {
        ops.push({ type: 'add', text: midB[j], a: start + i + 1, b: start + j + 1 });
        j += 1;
      }
    }

    while (i < n) {
      ops.push({ type: 'del', text: midA[i], a: start + i + 1, b: start + m + 1 });
      i += 1;
    }
    while (j < m) {
      ops.push({ type: 'add', text: midB[j], a: start + n + 1, b: start + j + 1 });
      j += 1;
    }
  } else {
    midA.forEach((text, index) => {
      ops.push({ type: 'del', text, a: start + index + 1, b: start + 1 });
    });
    midB.forEach((text, index) => {
      ops.push({ type: 'add', text, a: start + 1, b: start + index + 1 });
    });
  }

  for (let i = 0; i < a.length - endA; i += 1) {
    ops.push({ type: 'same', text: a[endA + i], a: endA + i + 1, b: endB + i + 1 });
  }

  return ops;
}
