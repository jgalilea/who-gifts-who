import { createParticipant } from '../js/core/participants.js';
import { createRules, addExclusion } from '../js/core/rules.js';

/** people(['Ana', 'Luis;García']) → participants with optional groups. */
export function people(list) {
  return list.map((entry) => {
    const [name, group = ''] = entry.split(';');
    return createParticipant({ name, group });
  });
}

export function rulesWith(participants, { excludeFamily = false, exclusions = [] } = {}) {
  let rules = { ...createRules(), excludeFamily };
  const id = (name) => participants.find((p) => p.name === name).id;
  for (const [from, to, mutual] of exclusions) {
    rules = addExclusion(rules, participants, { from: id(from), to: id(to), mutual: !!mutual }).rules;
  }
  return rules;
}

/** Small deterministic PRNG (mulberry32) for reproducible estimate tests. */
export function seededRng(seed = 12345) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return { float: next, int: (n) => Math.floor(next() * n) };
}
