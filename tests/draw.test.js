import { test } from 'node:test';
import assert from 'node:assert/strict';
import { performDraw, sampleAssignment } from '../js/core/draw.js';
import { buildAllowed } from '../js/core/rules.js';
import { exactAnalysis } from '../js/core/matching.js';
import { people, rulesWith } from './helpers.js';

function assertValid(draw, ps, rules) {
  const allowed = buildAllowed(ps, rules);
  const index = new Map(ps.map((p, i) => [p.id, i]));
  const receivers = new Set();
  for (const a of draw.assignments) {
    assert.notEqual(a.giverId, a.receiverId, 'nobody gifts themselves');
    assert.equal(allowed[index.get(a.giverId)][index.get(a.receiverId)], 1, `${a.giverName} → ${a.receiverName} is excluded`);
    receivers.add(a.receiverId);
  }
  assert.equal(receivers.size, ps.length, 'everybody receives exactly one gift');
}

test('nobody ever gifts themselves', () => {
  const ps = people(['Ana', 'Luis', 'Eva', 'Marta', 'Juan']);
  const rules = rulesWith(ps);
  for (let i = 0; i < 2000; i++) assertValid(performDraw(ps, rules), ps, rules);
});

test('family groups and individual exclusions are respected', () => {
  const ps = people(['Ana;García', 'Luis;García', 'Eva;López', 'Marta;López', 'Juan', 'Sara', 'Pablo']);
  const rules = rulesWith(ps, { excludeFamily: true, exclusions: [['Juan', 'Sara', true], ['Pablo', 'Ana']] });
  for (let i = 0; i < 2000; i++) assertValid(performDraw(ps, rules), ps, rules);
});

test('large groups (sampling path) respect the rules', () => {
  const ps = people(Array.from({ length: 30 }, (_, i) => `P${i};F${i % 6}`));
  const rules = rulesWith(ps, { excludeFamily: true, exclusions: [['P0', 'P1', true], ['P2', 'P3']] });
  for (let i = 0; i < 50; i++) {
    const draw = performDraw(ps, rules);
    assert.equal(draw.method, 'rejection');
    assertValid(draw, ps, rules);
  }
});

test('very tight large groups fall back to the Markov chain and stay valid', () => {
  // Two families of 15: everyone must gift into the other family (acceptance ≈ 15!²/30! ≈ 6e-9).
  const ps = people(Array.from({ length: 30 }, (_, i) => `P${i};F${i % 2}`));
  const rules = rulesWith(ps, { excludeFamily: true });
  const draw = performDraw(ps, rules);
  assert.equal(draw.method, 'markov');
  assertValid(draw, ps, rules);
});

test('impossible configurations throw instead of hanging', () => {
  const ps = people(['A;F', 'B;F', 'C;F', 'D']);
  assert.throws(() => performDraw(ps, rulesWith(ps, { excludeFamily: true })), /NO_VALID_ASSIGNMENT/);
  const ps2 = people(Array.from({ length: 25 }, (_, i) => `P${i};${i < 13 ? 'F' : 'G'}`));
  assert.equal(sampleAssignment(buildAllowed(ps2, rulesWith(ps2, { excludeFamily: true }))), null);
});

test('draw frequencies match the computed probabilities', () => {
  const ps = people(['Ana;García', 'Luis;García', 'Eva', 'Marta', 'Juan', 'Sara']);
  const rules = rulesWith(ps, { excludeFamily: true, exclusions: [['Eva', 'Marta'], ['Juan', 'Ana', true]] });
  const { matrix, total } = exactAnalysis(buildAllowed(ps, rules));
  assert.ok(total > 0);

  const runs = 40000;
  const index = new Map(ps.map((p, i) => [p.id, i]));
  const counts = ps.map(() => new Array(ps.length).fill(0));
  for (let k = 0; k < runs; k++) {
    for (const a of performDraw(ps, rules).assignments) counts[index.get(a.giverId)][index.get(a.receiverId)]++;
  }

  for (let i = 0; i < ps.length; i++) {
    for (let j = 0; j < ps.length; j++) {
      const p = matrix[i][j];
      const observed = counts[i][j] / runs;
      // 5 standard deviations of a binomial proportion (+ tiny slack)
      const tolerance = 5 * Math.sqrt((p * (1 - p)) / runs) + 1e-9;
      assert.ok(Math.abs(observed - p) <= tolerance, `${ps[i].name}→${ps[j].name}: observed ${observed.toFixed(4)}, expected ${p.toFixed(4)}`);
    }
  }
});

test('every valid assignment is equally likely (uniformity over full assignments)', () => {
  const ps = people(['A', 'B', 'C', 'D', 'E']);
  const rules = rulesWith(ps, { exclusions: [['A', 'B']] });
  const { total } = exactAnalysis(buildAllowed(ps, rules));
  const runs = 30000;
  const freq = new Map();
  for (let k = 0; k < runs; k++) {
    const key = performDraw(ps, rules).assignments.map((a) => a.receiverName).join('');
    freq.set(key, (freq.get(key) || 0) + 1);
  }
  assert.equal(freq.size, total, 'all valid assignments appear');
  const expected = runs / total;
  // Chi-square goodness of fit; critical value for df ≤ 43 at p = 0.001 is < 80.
  let chi2 = 0;
  for (const c of freq.values()) chi2 += (c - expected) ** 2 / expected;
  assert.ok(chi2 < 80, `chi-square ${chi2.toFixed(1)} with ${total - 1} degrees of freedom`);
});
