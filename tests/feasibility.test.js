import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkFeasibility } from '../js/core/feasibility.js';
import { buildAllowed } from '../js/core/rules.js';
import { exactAnalysis } from '../js/core/matching.js';
import { people, rulesWith } from './helpers.js';

test('needs at least two participants', () => {
  const ps = people(['Ana']);
  const result = checkFeasibility(ps, rulesWith(ps));
  assert.equal(result.ok, false);
  assert.equal(result.reason.code, 'tooFew');
});

test('two people can gift each other', () => {
  const ps = people(['Ana', 'Luis']);
  assert.equal(checkFeasibility(ps, rulesWith(ps)).ok, true);
});

test('detects a family group larger than half the participants', () => {
  const ps = people(['A1;Familia García', 'A2;Familia García', 'A3;Familia García', 'A4;Familia García', 'A5;Familia García', 'B1', 'B2', 'B3']);
  const result = checkFeasibility(ps, rulesWith(ps, { excludeFamily: true }));
  assert.equal(result.ok, false);
  assert.equal(result.reason.code, 'familyTooLarge');
  assert.deepEqual(result.reason.params, { group: 'Familia García', size: 5, total: 8, others: 3 });
  assert.equal(exactAnalysis(buildAllowed(ps, rulesWith(ps, { excludeFamily: true }))).total, 0);
});

test('a family of exactly half is still possible', () => {
  const ps = people(['A1;F', 'A2;F', 'B1;G', 'B2;G']);
  assert.equal(checkFeasibility(ps, rulesWith(ps, { excludeFamily: true })).ok, true);
});

test('detects someone who cannot gift anybody', () => {
  const ps = people(['Ana', 'Luis', 'Eva']);
  const result = checkFeasibility(ps, rulesWith(ps, { exclusions: [['Ana', 'Luis'], ['Ana', 'Eva']] }));
  assert.equal(result.ok, false);
  assert.equal(result.reason.code, 'noReceivers');
  assert.equal(result.reason.params.name, 'Ana');
});

test('detects someone nobody can gift', () => {
  const ps = people(['Ana', 'Luis', 'Eva']);
  const result = checkFeasibility(ps, rulesWith(ps, { exclusions: [['Luis', 'Ana'], ['Eva', 'Ana']] }));
  assert.equal(result.ok, false);
  assert.equal(result.reason.code, 'noGivers');
  assert.equal(result.reason.params.name, 'Ana');
});

test('explains subtler impossibilities with a Hall violation', () => {
  // Ana, Bea and Carlos can only gift Dani or Eva: three people, two possible receivers.
  const ps = people(['Ana', 'Bea', 'Carlos', 'Dani', 'Eva']);
  const exclusions = [];
  for (const g of ['Ana', 'Bea', 'Carlos']) for (const r of ['Ana', 'Bea', 'Carlos']) if (g !== r) exclusions.push([g, r]);
  const rules = rulesWith(ps, { exclusions });
  const result = checkFeasibility(ps, rules);
  assert.equal(result.ok, false);
  assert.equal(result.reason.code, 'hall');
  assert.ok(result.reason.params.givers.length > result.reason.params.receivers.length);
  assert.equal(exactAnalysis(buildAllowed(ps, rules)).total, 0);
});

test('feasibility agrees with the exact count on random rule sets', () => {
  for (let seed = 0; seed < 200; seed++) {
    const n = 3 + (seed % 6);
    const ps = people(Array.from({ length: n }, (_, i) => `P${i}`));
    const exclusions = [];
    for (let k = 0; k < (seed * 7) % (n * 2); k++) {
      const a = (seed * 13 + k * 5) % n;
      const b = (seed * 3 + k * 11 + 1) % n;
      if (a !== b) exclusions.push([`P${a}`, `P${b}`, k % 3 === 0]);
    }
    const rules = rulesWith(ps, { exclusions });
    const feasible = checkFeasibility(ps, rules).ok;
    assert.equal(feasible, exactAnalysis(buildAllowed(ps, rules)).total > 0, `seed ${seed}`);
  }
});
