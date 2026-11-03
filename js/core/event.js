// Event details shown in messages and on each participant's reveal page.
// { name: string, date: 'YYYY-MM-DD' | '', budget: string } – all optional.
import { cleanText } from './participants.js';

export const MAX_EVENT_NAME = 60;
export const MAX_BUDGET = 30;

export function createEvent() {
  return { name: '', date: '', budget: '' };
}

export function sanitizeEvent(raw) {
  const date = typeof raw?.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.date) ? raw.date : '';
  return {
    name: cleanText(raw?.name).slice(0, MAX_EVENT_NAME),
    date,
    budget: cleanText(raw?.budget).slice(0, MAX_BUDGET),
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
