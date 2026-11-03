// Counting valid assignments and computing "who gifts whom" probabilities.
//
// A valid assignment is a perfect matching in the bipartite graph givers → receivers
// defined by the `allowed` matrix. All valid assignments are considered equally likely.
//
// Exact method (n ≤ EXACT_LIMIT): dynamic programming over bitmasks.
//   Givers are processed in order 0..n-1; a bitmask holds the receivers already taken,
//   so the number of set bits equals the index of the next giver.
//   f[mask] = ways to assign givers 0..k-1 to exactly the receivers in `mask`
//   g[mask] = ways to complete the assignment for givers k..n-1 from the free receivers
//   total = g[0]; ways(i → j) = Σ f[mask] · g[mask | j] over masks with popcount i.
//
// Estimate (n > EXACT_LIMIT): sequential importance sampling (Rasmussen's estimator).
//   Each sample assigns givers one by one, picking uniformly among the free allowed
//   receivers; the product of the number of choices is an unbiased estimate of the total
//   and serves as the importance weight for the probability estimates.
import { cryptoRng } from './random.js';

export const EXACT_LIMIT = 20;

let popcountCache = new Uint8Array(1);
function popcountTable(n) {
  const size = 1 << n;
  if (popcountCache.length >= size) return popcountCache;
  const pc = new Uint8Array(size);
  for (let m = 1; m < size; m++) pc[m] = pc[m >> 1] + (m & 1);
  popcountCache = pc;
  return pc;
}

const bitIndex = (bit) => 31 - Math.clz32(bit);

// Reused between calls: allocating 8 MB arrays on every keystroke is the main cost at n = 20.
const buffers = new Map();
function zeroedBuffer(name, size) {
  let buf = buffers.get(name);
  if (!buf || buf.length < size) {
    buf = new Float64Array(size);
    buffers.set(name, buf);
  } else {
    buf.fill(0, 0, size);
  }
  return buf;
}

/** Bitmask of allowed receivers per giver (only valid for n ≤ 30). */
export function allowedMasks(allowed) {
  return allowed.map((row) => {
    let mask = 0;
    for (let j = 0; j < row.length; j++) if (row[j]) mask |= 1 << j;
    return mask;
  });
}

/** g[mask]: number of ways to complete an assignment once `mask` receivers are taken. */
export function completionCounts(allowed) {
  const n = allowed.length;
  const masks = allowedMasks(allowed);
  const size = 1 << n;
  const full = size - 1;
  const pc = popcountTable(n);
  const g = zeroedBuffer('g', size);
  g[full] = 1;
  for (let mask = full - 1; mask >= 0; mask--) {
    let avail = masks[pc[mask]] & ~mask;
    let sum = 0;
    while (avail) {
      const bit = avail & -avail;
      avail ^= bit;
      sum += g[mask | bit];
    }
    g[mask] = sum;
  }
  return { g, masks };
}

/** Exact analysis. Returns { exact, total, log10Total, countIsExact, matrix }. */
export function exactAnalysis(allowed) {
  const n = allowed.length;
  if (n > EXACT_LIMIT) throw new RangeError(`exactAnalysis supports up to ${EXACT_LIMIT} participants`);
  if (n === 0) return { exact: true, total: 0, log10Total: -Infinity, countIsExact: true, matrix: [] };

  const { g, masks } = completionCounts(allowed);
  const total = g[0];
  const size = 1 << n;
  const pc = popcountTable(n);
  const f = zeroedBuffer('f', size);
  const ways = new Float64Array(n * n);
  f[0] = 1;

  for (let mask = 0; mask < size - 1; mask++) {
    const value = f[mask];
    if (!value) continue;
    const k = pc[mask];
    let avail = masks[k] & ~mask;
    while (avail) {
      const bit = avail & -avail;
      avail ^= bit;
      const next = mask | bit;
      f[next] += value;
      const rest = g[next];
      if (rest) ways[k * n + bitIndex(bit)] += value * rest;
    }
  }

  const matrix = [];
  for (let i = 0; i < n; i++) {
    const row = new Float64Array(n);
    if (total > 0) for (let j = 0; j < n; j++) row[j] = ways[i * n + j] / total;
    matrix.push(row);
  }
  return {
    exact: true,
    total,
    log10Total: total > 0 ? Math.log10(total) : -Infinity,
    countIsExact: total <= Number.MAX_SAFE_INTEGER,
    matrix,
  };
}

/** Number of samples used for estimates: fewer for big groups to keep it responsive. */
export function defaultSampleCount(n) {
  return Math.max(1000, Math.min(20000, Math.round(3e7 / (n * n))));
}

/** Monte Carlo estimate. Returns { exact: false, total, log10Total, matrix, samples, validSamples }. */
export function estimateAnalysis(allowed, { rng = cryptoRng, samples = defaultSampleCount(allowed.length) } = {}) {
  const n = allowed.length;
  const options = allowed.map((row) => {
    const list = [];
    for (let j = 0; j < n; j++) if (row[j]) list.push(j);
    return list;
  });
  // Most constrained givers first: fewer dead ends, lower variance.
  const order = options.map((_, i) => i).sort((a, b) => options[a].length - options[b].length);

  const picks = new Int32Array(samples * n);
  const logWeights = new Float64Array(samples);
  const used = new Uint8Array(n);
  const free = new Int32Array(n);
  let validSamples = 0;
  let maxLog = -Infinity;

  for (let s = 0; s < samples; s++) {
    used.fill(0);
    let logW = 0;
    let ok = true;
    for (const i of order) {
      let count = 0;
      for (const j of options[i]) if (!used[j]) free[count++] = j;
      if (count === 0) {
        ok = false;
        break;
      }
      const j = free[rng.int(count)];
      used[j] = 1;
      picks[s * n + i] = j;
      logW += Math.log(count);
    }
    logWeights[s] = ok ? logW : -Infinity;
    if (ok) {
      validSamples++;
      if (logW > maxLog) maxLog = logW;
    }
  }

  const matrix = Array.from({ length: n }, () => new Float64Array(n));
  if (validSamples === 0) {
    return { exact: false, total: 0, log10Total: -Infinity, countIsExact: false, matrix, samples, validSamples };
  }

  let weightSum = 0;
  for (let s = 0; s < samples; s++) {
    if (logWeights[s] === -Infinity) continue;
    const w = Math.exp(logWeights[s] - maxLog);
    weightSum += w;
    for (let i = 0; i < n; i++) matrix[i][picks[s * n + i]] += w;
  }
  for (const row of matrix) for (let j = 0; j < n; j++) row[j] /= weightSum;

  const logTotal = maxLog + Math.log(weightSum / samples);
  return {
    exact: false,
    total: Math.exp(logTotal),
    log10Total: logTotal / Math.LN10,
    countIsExact: false,
    matrix,
    samples,
    validSamples,
  };
}

/** Exact number of valid assignments (n ≤ EXACT_LIMIT), or null for larger groups. */
export function countAssignments(allowed) {
  const n = allowed.length;
  if (n === 0 || n > EXACT_LIMIT) return null;
  const total = completionCounts(allowed).g[0];
  return { total, log10Total: total > 0 ? Math.log10(total) : -Infinity, countIsExact: total <= Number.MAX_SAFE_INTEGER };
}

/** Picks the exact method when possible, otherwise the estimate. */
export function analyze(allowed, options = {}) {
  return allowed.length <= EXACT_LIMIT ? exactAnalysis(allowed) : estimateAnalysis(allowed, options);
}
