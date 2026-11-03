// The draw: pick one valid assignment uniformly at random among all valid assignments,
// so results agree with the probabilities shown by matching.js.
//
// n ≤ EXACT_LIMIT: sequential sampling driven by the DP completion counts (exactly uniform).
// n > EXACT_LIMIT: rejection sampling of uniform random permutations (exactly uniform).
//   If the rules are so tight that rejection keeps failing, falls back to a Markov chain
//   with symmetric swap / 3-cycle moves started from a valid matching (approximately uniform).
// Never uses "if you draw yourself, draw again", which can dead-end and biases results.
import { cryptoRng } from './random.js';
import { EXACT_LIMIT, completionCounts } from './matching.js';
import { findValidAssignment } from './feasibility.js';
import { buildAllowed, configSignature } from './rules.js';

const bitIndex = (bit) => 31 - Math.clz32(bit);

function sampleExact(allowed, rng) {
  const n = allowed.length;
  const { g, masks } = completionCounts(allowed);
  if (!(g[0] > 0)) return null;
  const receiverOf = new Int32Array(n);
  let mask = 0;
  for (let k = 0; k < n; k++) {
    let avail = masks[k] & ~mask;
    let r = rng.float() * g[mask];
    let chosen = 0;
    while (avail) {
      const bit = avail & -avail;
      avail ^= bit;
      const w = g[mask | bit];
      if (w <= 0) continue;
      chosen = bit;
      if (r < w) break;
      r -= w;
    }
    receiverOf[k] = bitIndex(chosen);
    mask |= chosen;
  }
  return receiverOf;
}

function sampleRejection(allowed, rng, maxAttempts) {
  const n = allowed.length;
  const perm = new Int32Array(n);
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    for (let i = 0; i < n; i++) perm[i] = i;
    let ok = true;
    // Forward Fisher–Yates: position i gets a uniform pick among the remaining receivers.
    for (let i = 0; i < n; i++) {
      const k = i + rng.int(n - i);
      const tmp = perm[i];
      perm[i] = perm[k];
      perm[k] = tmp;
      if (!allowed[i][perm[i]]) {
        ok = false;
        break;
      }
    }
    if (ok) return perm;
  }
  return null;
}

function sampleMarkovChain(allowed, start, rng, steps) {
  const n = allowed.length;
  const r = Int32Array.from(start);
  for (let s = 0; s < steps; s++) {
    const a = rng.int(n);
    const b = rng.int(n);
    if (a === b) continue;
    if (n >= 3 && rng.float() < 0.5) {
      const c = rng.int(n);
      if (c === a || c === b) continue;
      // a ← r[b], b ← r[c], c ← r[a]   (reverse move is the ordered triple a, c, b)
      if (allowed[a][r[b]] && allowed[b][r[c]] && allowed[c][r[a]]) {
        const ra = r[a];
        r[a] = r[b];
        r[b] = r[c];
        r[c] = ra;
      }
    } else if (allowed[a][r[b]] && allowed[b][r[a]]) {
      const ra = r[a];
      r[a] = r[b];
      r[b] = ra;
    }
  }
  return r;
}

/**
 * Returns { receiverOf: Int32Array, method: 'exact' | 'rejection' | 'markov' } or null
 * when no valid assignment exists.
 */
export function sampleAssignment(allowed, rng = cryptoRng) {
  const n = allowed.length;
  if (n === 0) return null;
  if (n <= EXACT_LIMIT) {
    const receiverOf = sampleExact(allowed, rng);
    return receiverOf && { receiverOf, method: 'exact' };
  }
  const start = findValidAssignment(allowed);
  if (!start) return null;
  const viaRejection = sampleRejection(allowed, rng, Math.max(20000, Math.floor(3e7 / n)));
  if (viaRejection) return { receiverOf: viaRejection, method: 'rejection' };
  return { receiverOf: sampleMarkovChain(allowed, start, rng, Math.max(200000, 200 * n * n)), method: 'markov' };
}

/**
 * Performs the draw for the given participants and rules.
 * Throws Error('NO_VALID_ASSIGNMENT') when the rules make it impossible.
 */
export function performDraw(participants, rules, rng = cryptoRng) {
  const result = sampleAssignment(buildAllowed(participants, rules), rng);
  if (!result) throw new Error('NO_VALID_ASSIGNMENT');
  return {
    createdAt: new Date().toISOString(),
    method: result.method,
    signature: configSignature(participants, rules),
    assignments: participants.map((giver, i) => {
      const receiver = participants[result.receiverOf[i]];
      return { giverId: giver.id, giverName: giver.name, receiverId: receiver.id, receiverName: receiver.name };
    }),
  };
}
