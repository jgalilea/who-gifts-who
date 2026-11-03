// Previous draws ("history"), used to avoid repeating pairings.
// Entry: { id, code, label, date: 'YYYY-MM-DD' | '', pairs: [{ from: name, to: name }] }
// Pairs are stored by *name* (not id) so an imported draw keeps working even if those
// people are added to the list later.
import { cleanText, createId, nameKey } from './participants.js';
import { CONFIG_APP } from './config-constants.js';

export const DRAWS_KIND = 'draws';
export const DRAWS_VERSION = 1;

function sanitizePairs(pairs) {
  const seen = new Set();
  const out = [];
  for (const pair of Array.isArray(pairs) ? pairs : []) {
    const from = cleanText(pair?.from);
    const to = cleanText(pair?.to);
    const key = `${nameKey(from)}>${nameKey(to)}`;
    if (!from || !to || nameKey(from) === nameKey(to) || seen.has(key)) continue;
    seen.add(key);
    out.push({ from, to });
  }
  return out;
}

/** Validates an entry from storage or a file. Returns null when it has no usable pairs. */
export function sanitizeEntry(raw) {
  const pairs = sanitizePairs(raw?.pairs);
  if (!pairs.length) return null;
  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : createId(),
    code: cleanText(raw.code).replace(/^#/, '').slice(0, 12),
    label: cleanText(raw.label).slice(0, 60),
    date: typeof raw.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.date) ? raw.date : '',
    pairs,
  };
}

/** History entry from a draw made in the app. */
export function entryFromDraw(draw) {
  return sanitizeEntry({
    code: draw.code,
    label: draw.event?.name || '',
    date: (draw.createdAt || '').slice(0, 10),
    pairs: draw.assignments.map((a) => ({ from: a.giverName, to: a.receiverName })),
  });
}

const pairsSignature = (entry) => entry.pairs.map((p) => `${nameKey(p.from)}>${nameKey(p.to)}`).sort().join('|');

/** Same draw = same code, or (without codes) exactly the same pairs. */
export function isSameDraw(a, b) {
  if (a.code && b.code) return a.code === b.code;
  return pairsSignature(a) === pairsSignature(b);
}

/** Adds entries that are not already present. Returns { history, added, duplicates }. */
export function mergeHistory(history, entries) {
  const next = [...history];
  let added = 0;
  let duplicates = 0;
  for (const entry of entries) {
    if (next.some((e) => isSameDraw(e, entry))) duplicates++;
    else {
      next.push(entry);
      added++;
    }
  }
  return { history: next, added, duplicates };
}

/** File with draw results (contains who gifts whom). */
export function exportDraws(entries) {
  return {
    app: CONFIG_APP,
    kind: DRAWS_KIND,
    version: DRAWS_VERSION,
    exportedAt: new Date().toISOString(),
    draws: entries.map(({ code, label, date, pairs }) => ({ code, label, date, pairs })),
  };
}

/** Draw entries found in parsed JSON: a draws file, a full config, or a single draw. */
export function entriesFromJson(data) {
  let list = [];
  if (Array.isArray(data?.draws)) list = data.draws;
  else if (Array.isArray(data?.previousDraws)) list = data.previousDraws;
  else if (data?.previousDraw) list = [data.previousDraw]; // older exports
  else if (Array.isArray(data?.pairs)) list = [data];
  else if (Array.isArray(data)) list = data;
  return list.map(sanitizeEntry).filter(Boolean);
}

/** Secret-link tokens (the part after "#") found anywhere in the text. */
export function extractTokens(text) {
  return [...String(text).matchAll(/#([A-Za-z0-9_-]{40,})/g)].map((m) => m[1]);
}

const PAIR_SEPARATOR = /\s*(?:->|=>|→|>|;|\t|,)\s*/;

/**
 * Pairs typed by hand, one per line: "Ana > Luis", "Ana -> Luis", "Ana;Luis"…
 * Lines with links are ignored (they are handled by extractTokens).
 * Returns { pairs, invalidLines: [lineNumber] }.
 */
export function parsePairsText(text) {
  const pairs = [];
  const invalidLines = [];
  String(text)
    .replace(/^﻿/, '')
    .split(/\r\n|\n|\r/)
    .forEach((raw, i) => {
      const line = raw.trim();
      if (!line || line.startsWith('#') || /https?:\/\/|#[A-Za-z0-9_-]{40,}/.test(line)) return;
      const [from, to, ...rest] = line.split(PAIR_SEPARATOR);
      if (i === 0 && /^(giver|from|regala|quien|quién)$/i.test(cleanText(from))) return; // header
      if (!from || !to || rest.some((r) => r.trim()) || nameKey(from) === nameKey(to)) invalidLines.push(i + 1);
      else pairs.push({ from: cleanText(from), to: cleanText(to) });
    });
  return { pairs, invalidLines };
}

/**
 * Groups decrypted link payloads ({ g, r, c, e }) into draw entries, one per draw code.
 */
export function entriesFromPayloads(payloads) {
  const groups = new Map();
  for (const p of payloads) {
    const code = cleanText(p.c);
    if (!groups.has(code)) groups.set(code, { code, label: cleanText(p.e?.n), date: '', pairs: [] });
    groups.get(code).pairs.push({ from: p.g, to: p.r });
  }
  return [...groups.values()].map(sanitizeEntry).filter(Boolean);
}
