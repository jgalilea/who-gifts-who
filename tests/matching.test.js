import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildAllowed } from '../js/core/rules.js';
import { exactAnalysis, estimateAnalysis, analyze, EXACT_LIMIT } from '../js/core/matching.js';
import { people, rulesWith, seededRng } from './helpers.js';

// Derangements D(n): permutations without fixed points.
const DERANGEMENTS = [1, 0, 1, 2, 9, 44, 265, 1854, 14833, 133496, 1334961];

const names = (n) => Array.from({ length: n }, (_, i) => `P${i + 1}`);

test('counts derangements exactly when nobody may gift themselves', () => {
  for (let n = 2; n <= 10; n++) {
    const ps = people(names(n));
    const result = exactAnalysis(buildAllowed(ps, rulesWith(ps)));
    assert.equal(result.total, DERANGEMENTS[n], `n=${n}`);
    assert.ok(result.exact && result.countIsExact);
  }
});

test('derangement probabilities are uniform and rows/columns sum to 1', () => {
  const n = 7;
  const ps = people(names(n));
  const { matrix } = exactAnalysis(buildAllowed(ps, rulesWith(ps)));
  for (let i = 0; i < n; i++) {
    assert.equal(matrix[i][i], 0);
    let rowSum = 0;
    let colSum = 0;
    for (let j = 0; j < n; j++) {
      rowSum += matrix[i][j];
      colSum += matrix[j][i];
      if (i !== j) assert.ok(Math.abs(matrix[i][j] - 1 / (n - 1)) < 1e-12);
    }
    assert.ok(Math.abs(rowSum - 1) < 1e-12);
    assert.ok(Math.abs(colSum - 1) < 1e-12);
  }
});

test('excluded pairs get probability 0 and the count matches brute force', () => {
  const ps = people(['Ana;A', 'Bea;A', 'Carlos;B', 'Dani;B', 'Eva', 'Fran']);
  const rules = rulesWith(ps, { excludeFamily: true, exclusions: [['Eva', 'Fran', true], ['Ana', 'Carlos']] });
  const allowed = buildAllowed(ps, rules);
  const { total, matrix } = exactAnalysis(allowed);

  // Brute force over all permutations.
  let count = 0;
  const hits = ps.map(() => new Array(ps.length).fill(0));
  const permute = (arr, k) => {
    if (k === arr.length) {
      if (arr.every((r, g) => allowed[g][r])) {
        count++;
        arr.forEach((r, g) => hits[g][r]++);
      }
      return;
    }
    for (let i = k; i < arr.length; i++) {
      [arr[k], arr[i]] = [arr[i], arr[k]];
      permute(arr, k + 1);
      [arr[k], arr[i]] = [arr[i], arr[k]];
    }
  };
  permute(ps.map((_, i) => i), 0);

  assert.equal(total, count);
  for (let g = 0; g < ps.length; g++) {
    for (let r = 0; r < ps.length; r++) {
      assert.ok(Math.abs(matrix[g][r] - hits[g][r] / count) < 1e-12);
      if (!allowed[g][r]) assert.equal(matrix[g][r], 0);
    }
  }
});

test('the exact method handles the 20-participant limit', () => {
  const ps = people(names(EXACT_LIMIT));
  const result = analyze(buildAllowed(ps, rulesWith(ps)));
  assert.ok(result.exact);
  // D(20) = 895014631192902121 ≈ 8.95e17 (beyond 2^53, so only approximately representable)
  assert.ok(Math.abs(result.total / 895014631192902121 - 1) < 1e-9);
  assert.equal(result.countIsExact, false);
});

test('above the limit, probabilities and count are estimated by sampling', () => {
  const n = 24;
  const ps = people(names(n));
  const result = analyze(buildAllowed(ps, rulesWith(ps)), { rng: seededRng(7), samples: 20000 });
  assert.equal(result.exact, false);
  // D(n) ≈ n!/e
  let log10Fact = 0;
  for (let k = 2; k <= n; k++) log10Fact += Math.log10(k);
  const expectedLog10 = log10Fact - Math.LOG10E;
  assert.ok(Math.abs(result.log10Total - expectedLog10) < 0.05, `log10 total ${result.log10Total} vs ${expectedLog10}`);
  for (let i = 0; i < n; i++) {
    assert.equal(result.matrix[i][i], 0);
    for (let j = 0; j < n; j++) {
      if (i !== j) assert.ok(Math.abs(result.matrix[i][j] - 1 / (n - 1)) < 0.02);
    }
  }
});

test('estimate respects exclusions', () => {
  const ps = people(names(25).map((name, i) => `${name};F${i % 5}`));
  const allowed = buildAllowed(ps, rulesWith(ps, { excludeFamily: true }));
  const result = estimateAnalysis(allowed, { rng: seededRng(3), samples: 3000 });
  for (let i = 0; i < ps.length; i++) for (let j = 0; j < ps.length; j++) if (!allowed[i][j]) assert.equal(result.matrix[i][j], 0);
});
