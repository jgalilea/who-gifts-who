// Parsing participant lists from .txt / .csv / .json files or pasted text.
//
// Text format: one participant per line, optional family group in a second column and
// optional phone (with country code, for WhatsApp) in a third one.
//   Ana
//   Luis;Familia García
//   Eva;;+34 600 123 456
// Separators: ";" (recommended), tab or ",". Quotes are supported ("García, Ana";Familia).
// Lines starting with "#" are comments. A header line such as "name;group" is skipped.
//
// JSON format: an array of names, an array of { name, group } objects, or a full
// configuration exported by the app (see config.js and the README).
import { cleanText, nameKey, validatePhone, MAX_NAME_LENGTH } from './participants.js';
import { sanitizeEvent } from './event.js';
import { entriesFromJson } from './history.js';

const HEADER_NAMES = new Set(['name', 'names', 'nombre', 'nombres', 'participant', 'participants', 'participante', 'participantes']);

export function detectFormat(text, filename = '') {
  if (/\.json$/i.test(filename)) return 'json';
  if (/\.(txt|csv|tsv)$/i.test(filename)) return 'text';
  return /^\s*[[{]/.test(text) ? 'json' : 'text';
}

/** Splits one CSV line honouring double quotes. */
export function splitLine(line, separator) {
  const cells = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        quoted = false;
      } else {
        cell += ch;
      }
    } else if (ch === '"' && !cell.trim()) {
      quoted = true;
      cell = '';
    } else if (ch === separator) {
      cells.push(cell);
      cell = '';
    } else {
      cell += ch;
    }
  }
  cells.push(cell);
  return cells;
}

function detectSeparator(line) {
  if (line.includes(';')) return ';';
  if (line.includes('\t')) return '\t';
  if (line.includes(',')) return ',';
  return null;
}

function makeRow(line, name, group, phone = '') {
  const row = { line, name: cleanText(name), group: cleanText(group), phone: cleanText(phone), status: 'ok', warning: null };
  if (!row.name) row.status = 'empty';
  else if (row.name.length > MAX_NAME_LENGTH || row.group.length > MAX_NAME_LENGTH) row.status = 'tooLong';
  else if (row.phone && validatePhone(row.phone)) {
    // Keep the person, drop the unusable phone and tell the user.
    row.warning = validatePhone(row.phone);
    row.phone = '';
  }
  return row;
}

const EMPTY_EXTRAS = { settings: null, exclusions: [], event: null, previousDraws: [] };

function markDuplicates(rows) {
  const seen = new Set();
  for (const row of rows) {
    if (row.status !== 'ok') continue;
    const key = nameKey(row.name);
    if (seen.has(key)) row.status = 'duplicate';
    else seen.add(key);
  }
  return rows;
}

export function parseTextList(text) {
  const lines = String(text).replace(/^﻿/, '').split(/\r\n|\n|\r/);
  while (lines.length && !lines[lines.length - 1].trim()) lines.pop(); // trailing blank lines are not errors
  const rows = [];
  let seenContent = false;
  lines.forEach((raw, i) => {
    const line = i + 1;
    const trimmed = raw.trim();
    if (trimmed.startsWith('#')) return;
    if (!trimmed) {
      if (seenContent) rows.push({ line, name: '', group: '', status: 'empty' });
      return;
    }
    const separator = detectSeparator(raw);
    const [name = '', group = '', phone = ''] = separator ? splitLine(raw, separator) : [raw];
    if (!seenContent && HEADER_NAMES.has(nameKey(name))) {
      seenContent = true;
      return;
    }
    seenContent = true;
    rows.push(makeRow(line, name, group, phone));
  });
  return { format: 'text', fatal: null, rows: markDuplicates(rows), ...EMPTY_EXTRAS };
}

export function parseJsonList(text) {
  let data;
  try {
    data = JSON.parse(String(text).replace(/^﻿/, ''));
  } catch (error) {
    return { format: 'json', fatal: { code: 'invalidJson', params: { detail: error.message } }, rows: [], ...EMPTY_EXTRAS };
  }
  const list = Array.isArray(data) ? data : data && Array.isArray(data.participants) ? data.participants : null;
  if (!list) {
    return { format: 'json', fatal: { code: 'jsonShape', params: {} }, rows: [], ...EMPTY_EXTRAS };
  }
  const rows = list.map((item, i) => {
    if (typeof item === 'string') return makeRow(i + 1, item, '');
    if (item && typeof item === 'object' && typeof item.name === 'string') {
      const text = (key) => (typeof item[key] === 'string' ? item[key] : '');
      return makeRow(i + 1, item.name, text('group'), text('phone'));
    }
    return { line: i + 1, name: '', group: '', status: 'invalid' };
  });

  const settings =
    !Array.isArray(data) && data.settings && typeof data.settings === 'object'
      ? { excludeFamily: !!data.settings.excludeFamily }
      : null;
  const exclusions =
    !Array.isArray(data) && Array.isArray(data.exclusions)
      ? data.exclusions
          .filter((e) => e && typeof e.from === 'string' && typeof e.to === 'string')
          .map((e) => ({ from: cleanText(e.from), to: cleanText(e.to), mutual: !!e.mutual }))
      : [];
  const full = !Array.isArray(data);
  const event = full && data.event && typeof data.event === 'object' ? sanitizeEvent(data.event) : null;
  const previousDraws = full ? entriesFromJson(data) : [];
  return { format: 'json', fatal: null, rows: markDuplicates(rows), settings, exclusions, event, previousDraws };
}

export function parseImport(text, filename = '') {
  return detectFormat(text, filename) === 'json' ? parseJsonList(text) : parseTextList(text);
}

/**
 * Marks rows that already exist in the current list (only relevant when adding).
 * Returns a new parsed object plus a summary: { ok, skipped }.
 */
export function previewImport(parsed, existing, mode = 'add') {
  const existingKeys = new Set(mode === 'add' ? existing.map((p) => nameKey(p.name)) : []);
  const rows = parsed.rows.map((row) =>
    row.status === 'ok' && existingKeys.has(nameKey(row.name)) ? { ...row, status: 'exists' } : row,
  );
  const ok = rows.filter((r) => r.status === 'ok').length;
  return { ...parsed, rows, mode, summary: { ok, skipped: rows.length - ok } };
}
