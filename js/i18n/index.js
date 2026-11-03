// Minimal i18n: dictionaries map keys to strings ("Hola, {name}") or functions (for plurals).
// Add a language by creating a dictionary file and registering it in DICTIONARIES.
import es from './es.js';
import en from './en.js';
import { parseEventDate } from '../core/event.js';

const DICTIONARIES = { es, en };
export const LANGUAGES = Object.keys(DICTIONARIES);
const FALLBACK = 'es';

let current = FALLBACK;

export function isSupported(lang) {
  return LANGUAGES.includes(lang);
}

/** Saved preference → browser language → Spanish. */
export function detectLanguage(saved) {
  if (isSupported(saved)) return saved;
  for (const lang of globalThis.navigator?.languages || []) {
    const base = String(lang).slice(0, 2).toLowerCase();
    if (isSupported(base)) return base;
  }
  return FALLBACK;
}

export function setLanguage(lang) {
  current = isSupported(lang) ? lang : FALLBACK;
  if (globalThis.document) document.documentElement.lang = current;
}

export function getLanguage() {
  return current;
}

export function t(key, params = {}) {
  const entry = DICTIONARIES[current][key] ?? DICTIONARIES[FALLBACK][key];
  if (entry === undefined) {
    console.warn(`[i18n] missing key: ${key}`);
    return key;
  }
  if (typeof entry === 'function') return entry(params);
  return entry.replace(/\{(\w+)\}/g, (match, name) => (params[name] !== undefined ? params[name] : match));
}

/** Applies translations to elements with data-i18n, data-i18n-html, data-i18n-placeholder and data-i18n-aria. */
export function applyTranslations(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => (el.textContent = t(el.dataset.i18n)));
  // Only used for trusted strings from our own dictionaries.
  root.querySelectorAll('[data-i18n-html]').forEach((el) => (el.innerHTML = t(el.dataset.i18nHtml)));
  root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => (el.placeholder = t(el.dataset.i18nPlaceholder)));
  root.querySelectorAll('[data-i18n-aria]').forEach((el) => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
}

const locale = () => (current === 'es' ? 'es-ES' : 'en-GB');

export function formatPercent(p) {
  if (p <= 0) return '0%';
  if (p < 0.001) return '<0.1%';
  return new Intl.NumberFormat(locale(), { style: 'percent', maximumFractionDigits: p < 0.1 ? 1 : 0 }).format(p);
}

export function formatNumber(n) {
  return new Intl.NumberFormat(locale()).format(n);
}

/** 'YYYY-MM-DD' → "martes, 24 de diciembre de 2026" / "Thursday, 24 December 2026". */
export function formatEventDate(value) {
  const date = parseEventDate(value);
  if (!date) return '';
  return new Intl.DateTimeFormat(locale(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

/** Lists names naturally: "Ana, Luis y Eva" / "Ana, Luis and Eva". */
export function formatList(items) {
  return new Intl.ListFormat(locale(), { style: 'long', type: 'conjunction' }).format(items);
}

/** Formats a (possibly huge) count given its log10: exact digits when safe, otherwise "≈ 1.2 × 10^25". */
export function formatCount(value, log10Value, isExact) {
  if (isExact && Number.isFinite(value)) return formatNumber(value);
  if (Number.isFinite(value) && value < 1e15) return '≈ ' + formatNumber(Math.round(value));
  const exponent = Math.floor(log10Value);
  const mantissa = 10 ** (log10Value - exponent);
  const m = new Intl.NumberFormat(locale(), { maximumFractionDigits: 2 }).format(mantissa);
  return `≈ ${m} × 10${superscript(exponent)}`;
}

function superscript(n) {
  const map = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
  return String(n).split('').map((c) => map[c]).join('');
}
