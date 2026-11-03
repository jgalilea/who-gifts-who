// Rules: {
//   excludeFamily: boolean,
//   exclusions: [{ id, from, to, mutual }],          individual exclusions
//   previousDraws: [history entry],                  past draws whose pairings must not repeat
// }
// Exclusion "from"/"to" are participant ids; previous-draw pairs use names (see history.js).
// Nobody can ever gift themselves (implicit, always on).
import { createId, sameGroup, nameKey } from './participants.js';

export function createRules() {
  return { excludeFamily: false, exclusions: [], previousDraws: [] };
}

/**
 * Adds an exclusion, merging it with an existing one for the same pair when possible.
 * Returns { rules, error } where error is null or
 * 'exclusionSame' | 'exclusionMissing' | 'exclusionDuplicate'.
 */
export function addExclusion(rules, participants, { from, to, mutual = false }) {
  if (!from || !to || !participants.some((p) => p.id === from) || !participants.some((p) => p.id === to)) {
    return { rules, error: 'exclusionMissing' };
  }
  if (from === to) return { rules, error: 'exclusionSame' };

  const same = rules.exclusions.find((e) => e.from === from && e.to === to);
  const reverse = rules.exclusions.find((e) => e.from === to && e.to === from);
  const existing = same || reverse;

  if (existing) {
    const alreadyCovered = existing.mutual || (same && !mutual);
    if (alreadyCovered) return { rules, error: 'exclusionDuplicate' };
    // Either upgrading to mutual or adding the opposite direction: both mean "mutual".
    const exclusions = rules.exclusions.map((e) => (e === existing ? { ...e, mutual: true } : e));
    return { rules: { ...rules, exclusions }, error: null };
  }

  const exclusion = { id: createId(), from, to, mutual: !!mutual };
  return { rules: { ...rules, exclusions: [...rules.exclusions, exclusion] }, error: null };
}

export function removeExclusion(rules, exclusionId) {
  return { ...rules, exclusions: rules.exclusions.filter((e) => e.id !== exclusionId) };
}

/** Drops exclusions that reference participants that no longer exist. */
export function pruneExclusions(rules, participants) {
  const ids = new Set(participants.map((p) => p.id));
  const exclusions = rules.exclusions.filter((e) => ids.has(e.from) && ids.has(e.to));
  return exclusions.length === rules.exclusions.length ? rules : { ...rules, exclusions };
}

export function removePreviousDraw(rules, entryId) {
  return { ...rules, previousDraws: rules.previousDraws.filter((e) => e.id !== entryId) };
}

/** How many pairs of a previous draw involve two current participants (the ones that apply). */
export function applicablePairs(entry, participants) {
  const names = new Set(participants.map((p) => nameKey(p.name)));
  return entry.pairs.filter((pair) => names.has(nameKey(pair.from)) && names.has(nameKey(pair.to))).length;
}

/**
 * Builds the "allowed" matrix: allowed[i][j] === 1 when participant i may gift participant j.
 * Order follows the participants array.
 */
export function buildAllowed(participants, rules) {
  const n = participants.length;
  const index = new Map(participants.map((p, i) => [p.id, i]));
  const allowed = participants.map((giver, i) => {
    const row = new Uint8Array(n);
    for (let j = 0; j < n; j++) {
      row[j] = i !== j && !(rules.excludeFamily && sameGroup(giver, participants[j])) ? 1 : 0;
    }
    return row;
  });
  for (const e of rules.exclusions) {
    const a = index.get(e.from);
    const b = index.get(e.to);
    if (a === undefined || b === undefined) continue;
    allowed[a][b] = 0;
    if (e.mutual) allowed[b][a] = 0;
  }
  const byName = new Map(participants.map((p, i) => [nameKey(p.name), i]));
  for (const entry of rules.previousDraws || []) {
    for (const pair of entry.pairs) {
      const a = byName.get(nameKey(pair.from));
      const b = byName.get(nameKey(pair.to));
      if (a !== undefined && b !== undefined) allowed[a][b] = 0;
    }
  }
  return allowed;
}

/** Stable string that changes whenever participants or rules change (used to detect stale draws). */
export function configSignature(participants, rules) {
  return JSON.stringify({
    p: participants.map((p) => [p.id, p.name, p.group.toLocaleLowerCase()]),
    f: !!rules.excludeFamily,
    e: rules.exclusions.map((e) => [e.from, e.to, !!e.mutual]),
    h: (rules.previousDraws || []).map((entry) => entry.id),
  });
}
