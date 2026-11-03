// Participant model: { id, name, group }. Pure functions, no DOM.
import { randomHex } from './random.js';

export const MAX_NAME_LENGTH = 60;

/** Normalises user text: Unicode NFC, collapsed whitespace, trimmed. */
export function cleanText(value) {
  return String(value ?? '').normalize('NFC').replace(/\s+/g, ' ').trim();
}

/** Comparison key for names and groups (case-insensitive). */
export function nameKey(value) {
  return cleanText(value).toLocaleLowerCase();
}

export function createId() {
  return randomHex(8);
}

export function createParticipant({ name, group = '' }) {
  return { id: createId(), name: cleanText(name), group: cleanText(group) };
}

/**
 * Returns an error code or null.
 * Codes: 'nameRequired' | 'nameTooLong' | 'nameDuplicate'
 */
export function validateName(name, participants, ignoreId = null) {
  const clean = cleanText(name);
  if (!clean) return 'nameRequired';
  if (clean.length > MAX_NAME_LENGTH) return 'nameTooLong';
  const key = nameKey(clean);
  if (participants.some((p) => p.id !== ignoreId && nameKey(p.name) === key)) return 'nameDuplicate';
  return null;
}

export function validateGroup(group) {
  return cleanText(group).length > MAX_NAME_LENGTH ? 'groupTooLong' : null;
}

/** True when both participants belong to the same (non-empty) family group. */
export function sameGroup(a, b) {
  return !!a.group && !!b.group && nameKey(a.group) === nameKey(b.group);
}

/** Unique group names (first spelling wins), sorted alphabetically. */
export function listGroups(participants) {
  const seen = new Map();
  for (const p of participants) {
    if (p.group && !seen.has(nameKey(p.group))) seen.set(nameKey(p.group), p.group);
  }
  return [...seen.values()].sort((a, b) => a.localeCompare(b));
}

/** Groups with their members: [{ name, members: [participant] }]. */
export function groupMembers(participants) {
  const map = new Map();
  for (const p of participants) {
    if (!p.group) continue;
    const key = nameKey(p.group);
    if (!map.has(key)) map.set(key, { name: p.group, members: [] });
    map.get(key).members.push(p);
  }
  return [...map.values()];
}
