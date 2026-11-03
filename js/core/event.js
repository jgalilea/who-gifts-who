// Event details shown in messages and on each participant's reveal page.
// { name: string, date: 'YYYY-MM-DD' | '', budget: string } – all optional.
import { cleanText } from './participants.js';

export const MAX_EVENT_NAME = 60;
const MAX_AMOUNT = 10;

// Budget = amount (digits and . , only) + currency symbol. Stored as display text ("30 €").
export const CURRENCIES = ['€', '$', '£', '¥', '₹', '₽', '₺', '₩', '₪', '₱'];
const SUFFIX_CURRENCIES = new Set(['€', '₽', '₺']); // written after the amount: "30 €"

export function cleanAmount(value) {
  return String(value ?? '').replace(/[^\d.,]/g, '').slice(0, MAX_AMOUNT);
}

export function formatBudget(amount, currency) {
  const clean = cleanAmount(amount);
  if (!/\d/.test(clean)) return '';
  const symbol = CURRENCIES.includes(currency) ? currency : CURRENCIES[0];
  return SUFFIX_CURRENCIES.has(symbol) ? `${clean} ${symbol}` : `${symbol}${clean}`;
}

/** "30 €", "£25", "máx. 30€" → { amount: '30', currency: '€' } */
export function parseBudget(text) {
  const value = cleanText(text);
  const currency = CURRENCIES.find((c) => value.includes(c)) || CURRENCIES[0];
  const amount = (value.match(/\d[\d.,]*/) || [''])[0];
  return { amount: cleanAmount(amount), currency };
}

export function createEvent() {
  return { name: '', date: '', budget: '' };
}

export function sanitizeEvent(raw) {
  const date = typeof raw?.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.date) ? raw.date : '';
  return {
    name: cleanText(raw?.name).slice(0, MAX_EVENT_NAME),
    date,
    budget: (({ amount, currency }) => formatBudget(amount, currency))(parseBudget(raw?.budget)),
  };
}

export function isEventEmpty(event) {
  return !event || (!event.name && !event.date && !event.budget);
}

/** Compact form stored inside secret links: { n, d, b } with empty fields omitted. */
export function eventToPayload(event) {
  if (isEventEmpty(event)) return undefined;
  const out = {};
  if (event.name) out.n = event.name;
  if (event.date) out.d = event.date;
  if (event.budget) out.b = event.budget;
  return out;
}

export function eventFromPayload(payload) {
  return sanitizeEvent({ name: payload?.n, date: payload?.d, budget: payload?.b });
}

/** 'YYYY-MM-DD' → Date at local midnight (avoids the UTC off-by-one of new Date(string)). */
export function parseEventDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
  return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
}
