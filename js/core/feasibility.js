// Feasibility: does at least one valid assignment exist? If not, why?
// Uses maximum bipartite matching (Kuhn's algorithm), which works for any size,
// and Hall's theorem to explain failures in plain language.
import { buildAllowed } from './rules.js';
import { groupMembers } from './participants.js';

// With 2 people the result is obvious (each gifts the other), so 3 is the minimum.
export const MIN_PARTICIPANTS = 3;

/** Maximum bipartite matching. Returns { size, receiverOf, giverOf } (-1 = unmatched). */
export function maximumMatching(allowed) {
  const n = allowed.length;
  const receiverOf = new Int32Array(n).fill(-1);
  const giverOf = new Int32Array(n).fill(-1);
  let size = 0;

  for (let start = 0; start < n; start++) {
    const visited = new Uint8Array(n);
    const tryAssign = (giver) => {
      const row = allowed[giver];
      for (let r = 0; r < n; r++) {
        if (!row[r] || visited[r]) continue;
        visited[r] = 1;
        if (giverOf[r] === -1 || tryAssign(giverOf[r])) {
          giverOf[r] = giver;
          receiverOf[giver] = r;
          return true;
        }
      }
      return false;
    };
    if (tryAssign(start)) size++;
  }
  return { size, receiverOf, giverOf };
}

/** One valid assignment (receiver index per giver) or null if none exists. */
export function findValidAssignment(allowed) {
  const { size, receiverOf } = maximumMatching(allowed);
  return size === allowed.length ? receiverOf : null;
}

/**
 * Hall violator from a maximum matching: a set of givers whose combined allowed
 * receivers are fewer than the givers themselves.
 */
function hallViolation(allowed, matching) {
  const n = allowed.length;
  const start = matching.receiverOf.findIndex((r) => r === -1);
  if (start === -1) return null;
  const givers = new Set([start]);
  const receivers = new Set();
  const queue = [start];
  while (queue.length) {
    const g = queue.shift();
    for (let r = 0; r < n; r++) {
      if (!allowed[g][r] || receivers.has(r)) continue;
      receivers.add(r);
      const next = matching.giverOf[r];
      if (next !== -1 && !givers.has(next)) {
        givers.add(next);
        queue.push(next);
      }
    }
  }
  return { givers: [...givers].sort((a, b) => a - b), receivers: [...receivers].sort((a, b) => a - b) };
}

/**
 * Returns { ok: true, assignment } or { ok: false, reason: { code, params } }.
 * Reason codes: tooFew, noReceivers, noGivers, familyTooLarge, hall.
 */
export function checkFeasibility(participants, rules, allowed = buildAllowed(participants, rules)) {
  const n = participants.length;
  if (n < MIN_PARTICIPANTS) {
    return { ok: false, reason: { code: 'tooFew', params: { min: MIN_PARTICIPANTS, count: n } } };
  }

  for (let i = 0; i < n; i++) {
    if (!allowed[i].some(Boolean)) {
      return { ok: false, reason: { code: 'noReceivers', params: { name: participants[i].name } } };
    }
  }
  for (let j = 0; j < n; j++) {
    if (!allowed.some((row) => row[j])) {
      return { ok: false, reason: { code: 'noGivers', params: { name: participants[j].name } } };
    }
  }

  if (rules.excludeFamily) {
    const largest = groupMembers(participants).sort((a, b) => b.members.length - a.members.length)[0];
    if (largest && largest.members.length * 2 > n) {
      return {
        ok: false,
        reason: {
          code: 'familyTooLarge',
          params: { group: largest.name, size: largest.members.length, total: n, others: n - largest.members.length },
        },
      };
    }
  }

  const matching = maximumMatching(allowed);
  if (matching.size === n) return { ok: true, assignment: matching.receiverOf };

  const violation = hallViolation(allowed, matching);
  return {
    ok: false,
    reason: {
      code: 'hall',
      params: {
        givers: violation.givers.map((i) => participants[i].name),
        receivers: violation.receivers.map((i) => participants[i].name),
      },
    },
  };
}
