type TokenKind = 'word' | 'string' | 'number' | 'comment' | 'punct';

interface Token {
  kind: TokenKind;
  text: string;
}

const KEYWORDS = new Set([
  'SELECT', 'FROM', 'WHERE', 'GROUP', 'BY', 'ORDER', 'HAVING', 'LIMIT', 'OFFSET',
  'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER', 'CROSS', 'ON', 'USING',
  'UNION', 'ALL', 'EXCEPT', 'INTERSECT', 'INSERT', 'INTO', 'VALUES', 'UPDATE',
  'SET', 'DELETE', 'RETURNING', 'WITH', 'AS', 'AND', 'OR', 'NOT', 'NULL', 'IS',
  'IN', 'EXISTS', 'BETWEEN', 'LIKE', 'ILIKE', 'DISTINCT', 'CASE', 'WHEN', 'THEN',
  'ELSE', 'END', 'CREATE', 'TABLE', 'INDEX', 'VIEW', 'ALTER', 'DROP', 'TRUNCATE',
  'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'DEFAULT', 'CONSTRAINT', 'UNIQUE',
  'CHECK', 'DESC', 'ASC', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'COALESCE', 'CAST',
  'BEGIN', 'COMMIT', 'ROLLBACK', 'ADD', 'COLUMN', 'REPLACE', 'OVER', 'PARTITION',
  'TRUE', 'FALSE', 'NULLS', 'FIRST', 'LAST', 'IF', 'CASCADE', 'GRANT', 'REVOKE',
]);

/** Kata yang memulai klausa baru, jadi diberi baris sendiri. */
const CLAUSE = new Set([
  'SELECT', 'FROM', 'WHERE', 'GROUP', 'ORDER', 'HAVING', 'LIMIT', 'OFFSET', 'JOIN',
  'INNER', 'LEFT', 'RIGHT', 'FULL', 'CROSS', 'ON', 'USING', 'UNION', 'EXCEPT',
  'INTERSECT', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'RETURNING',
  'WITH', 'WINDOW', 'FETCH',
]);

const QUERY_START = new Set(['SELECT', 'WITH', 'INSERT', 'UPDATE', 'DELETE']);

const JOIN_MODIFIER = new Set(['LEFT', 'RIGHT', 'FULL', 'INNER', 'CROSS', 'OUTER', 'NATURAL']);

/** Kata kunci yang biasanya langsung diikuti tanda kurung, seperti COUNT(...). */
const FN_KEYWORDS = new Set([
  'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'COALESCE', 'CAST', 'ROUND', 'NOW',
  'UPPER', 'LOWER', 'LENGTH', 'SUBSTRING', 'CONCAT', 'IFNULL', 'NULLIF', 'EXTRACT',
  'ROW_NUMBER', 'RANK', 'DENSE_RANK', 'ARRAY_AGG', 'STRING_AGG', 'GREATEST', 'LEAST',
  'ABS', 'CEIL', 'FLOOR', 'TRIM', 'REPLACE', 'SPLIT_PART', 'TO_CHAR', 'TO_DATE',
]);

function readQuoted(sql: string, start: number, quote: string): number {
  let i = start + 1;
  while (i < sql.length) {
    if (sql[i] === '\\' && quote !== '`') {
      i += 2;
      continue;
    }
    if (sql[i] === quote) {
      if (sql[i + 1] === quote) {
        i += 2;
        continue;
      }
      return i + 1;
    }
    i += 1;
  }
  return sql.length;
}

function tokenize(sql: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < sql.length) {
    const ch = sql[i];

    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }

    if (ch === '-' && sql[i + 1] === '-') {
      const end = sql.indexOf('\n', i);
      const stop = end === -1 ? sql.length : end;
      tokens.push({ kind: 'comment', text: sql.slice(i, stop).trimEnd() });
      i = stop;
      continue;
    }

    if (ch === '/' && sql[i + 1] === '*') {
      const end = sql.indexOf('*/', i + 2);
      const stop = end === -1 ? sql.length : end + 2;
      tokens.push({ kind: 'comment', text: sql.slice(i, stop) });
      i = stop;
      continue;
    }

    if (ch === "'" || ch === '"' || ch === '`' || ch === '[') {
      const quote = ch === '[' ? ']' : ch;
      const stop = ch === '[' ? (sql.indexOf(']', i) === -1 ? sql.length : sql.indexOf(']', i) + 1) : readQuoted(sql, i, quote);
      tokens.push({ kind: 'string', text: sql.slice(i, stop) });
      i = stop;
      continue;
    }

    if (/[0-9]/.test(ch)) {
      let j = i;
      while (j < sql.length && /[0-9._]/.test(sql[j])) j += 1;
      tokens.push({ kind: 'number', text: sql.slice(i, j) });
      i = j;
      continue;
    }

    if (/[A-Za-z_$]/.test(ch)) {
      let j = i;
      while (j < sql.length && /[A-Za-z0-9_$]/.test(sql[j])) j += 1;
      tokens.push({ kind: 'word', text: sql.slice(i, j) });
      i = j;
      continue;
    }

    const two = sql.slice(i, i + 2);
    if (two === '<=' || two === '>=' || two === '<>' || two === '!=' || two === '||' || two === '::') {
      tokens.push({ kind: 'punct', text: two });
      i += 2;
      continue;
    }

    tokens.push({ kind: 'punct', text: ch });
    i += 1;
  }

  return tokens;
}

function upper(tokens: Token[], index: number): string {
  const token = tokens[index];
  return token && token.kind === 'word' ? token.text.toUpperCase() : '';
}

export function formatSql(sql: string): string {
  const tokens = tokenize(sql);
  if (tokens.length === 0) return '';

  const lines: string[] = [];
  let current = '';
  let depth = 0;
  const blocks: boolean[] = [];

  const flush = () => {
    const line = current.replace(/\s+$/u, '');
    if (line.trim()) lines.push(line);
    current = '';
  };

  const startLine = (indent: number) => {
    flush();
    current = '  '.repeat(Math.max(0, indent));
  };

  const raw = (text: string, space = true) => {
    const prev = current.slice(-1);
    if (space && current && prev !== ' ' && prev !== '(' && prev !== '.' && !/^[,);.:]/.test(text)) {
      current += ' ';
    }
    current += text;
  };

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    const word = token.kind === 'word' ? token.text.toUpperCase() : '';

    if (token.kind === 'comment') {
      raw(token.text);
      if (token.text.startsWith('--')) startLine(depth);
      continue;
    }

    if (token.kind === 'punct' && token.text === ';') {
      current = `${current.replace(/\s+$/u, '')};`;
      flush();
      lines.push('');
      continue;
    }

    if (token.kind === 'punct' && token.text === '(') {
      const prevToken = tokens[index - 1];
      const prevWord = prevToken?.kind === 'word' ? prevToken.text.toUpperCase() : '';
      const fnCall = prevWord !== '' && (!KEYWORDS.has(prevWord) || FN_KEYWORDS.has(prevWord));
      raw('(', !fnCall);
      const subquery = QUERY_START.has(upper(tokens, index + 1));
      depth += 1;
      blocks.push(subquery);
      if (subquery) startLine(depth);
      continue;
    }

    if (token.kind === 'punct' && token.text === ')') {
      depth = Math.max(0, depth - 1);
      const subquery = blocks.pop() ?? false;
      if (subquery) startLine(depth);
      current = current.replace(/\s+$/u, '');
      current += ')';
      continue;
    }

    if (token.kind === 'punct' && token.text === ',') {
      current = `${current.replace(/\s+$/u, '')}, `;
      continue;
    }

    if (token.kind === 'word' && CLAUSE.has(word)) {
      const previousWord = current.trim().toUpperCase();
      if (word === 'INTO' && previousWord.endsWith('INSERT')) {
        raw('INTO');
        continue;
      }
      if (word === 'JOIN') {
        const prevToken = tokens[index - 1];
        if (prevToken?.kind === 'word' && JOIN_MODIFIER.has(prevToken.text.toUpperCase())) {
          current = `${current.replace(/\s+$/u, '')} JOIN`;
          continue;
        }
      }
      startLine(word === 'ON' || word === 'USING' ? depth + 1 : depth);
      current += word;
      continue;
    }

    if (token.kind === 'word' && (word === 'AND' || word === 'OR')) {
      startLine(Math.max(depth, 1) + 1);
      current += word;
      continue;
    }

    raw(token.kind === 'word' && KEYWORDS.has(word) ? word : token.text);
  }

  flush();
  return lines.join('\n').trim();
}

export function minifySql(sql: string): string {
  const tokens = tokenize(sql);
  if (tokens.length === 0) return '';

  let out = '';
  for (const token of tokens) {
    const word = token.kind === 'word' ? token.text.toUpperCase() : '';
    const text = token.kind === 'word' && KEYWORDS.has(word) ? word : token.text;
    const prev = out.slice(-1);
    if (out && prev !== '(' && prev !== '.' && !/^[,);.]/.test(text)) out += ' ';
    out += text;
  }
  return out;
}
