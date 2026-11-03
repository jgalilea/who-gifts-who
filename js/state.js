// Application state: a tiny observable store plus the actions that change it.
// State shape: { participants, rules, draw }. Participants and rules are persisted as the
// draft; the draw (with its secret link tokens) is persisted separately.
import { cleanText, createParticipant, validateName, validateGroup } from './core/participants.js';
import { createRules, addExclusion, removeExclusion, pruneExclusions } from './core/rules.js';
import { applyImport } from './core/config.js';
import { STORAGE_KEYS, loadJSON, saveJSON } from './storage.js';

function sanitizeDraft(raw) {
  const participants = [];
  const seen = new Set();
  for (const p of Array.isArray(raw?.participants) ? raw.participants : []) {
    if (!p || typeof p.id !== 'string' || typeof p.name !== 'string' || seen.has(p.id)) continue;
    if (validateName(p.name, participants)) continue;
    seen.add(p.id);
    participants.push({ id: p.id, name: cleanText(p.name), group: cleanText(p.group) });
  }
  const rules = createRules();
  rules.excludeFamily = !!raw?.rules?.excludeFamily;
  rules.exclusions = (Array.isArray(raw?.rules?.exclusions) ? raw.rules.exclusions : [])
    .filter((e) => e && typeof e.id === 'string' && seen.has(e.from) && seen.has(e.to) && e.from !== e.to)
    .map((e) => ({ id: e.id, from: e.from, to: e.to, mutual: !!e.mutual }));
  return { participants, rules };
}

function sanitizeDraw(raw) {
  if (!raw || !Array.isArray(raw.assignments) || typeof raw.tokens !== 'object') return null;
  return raw;
}

export function createAppState() {
  const draft = sanitizeDraft(loadJSON(STORAGE_KEYS.draft));
  let state = { ...draft, draw: sanitizeDraw(loadJSON(STORAGE_KEYS.draw)) };
  const listeners = new Set();

  function commit(patch) {
    const prev = state;
    state = { ...state, ...patch };
    if (prev.participants !== state.participants || prev.rules !== state.rules) {
      saveJSON(STORAGE_KEYS.draft, { participants: state.participants, rules: state.rules });
    }
    if (prev.draw !== state.draw) saveJSON(STORAGE_KEYS.draw, state.draw);
    listeners.forEach((fn) => fn(state, prev));
  }

  const setParticipants = (participants, rules = state.rules) =>
    commit({ participants, rules: pruneExclusions(rules, participants) });

  // Each action returns an error code (string) or null.
  const actions = {
    addParticipant(name, group) {
      const error = validateName(name, state.participants) || validateGroup(group);
      if (error) return error;
      setParticipants([...state.participants, createParticipant({ name, group })]);
      return null;
    },
    updateParticipant(id, { name, group }) {
      const error = validateName(name, state.participants, id) || validateGroup(group);
      if (error) return error;
      setParticipants(state.participants.map((p) => (p.id === id ? { ...p, name: cleanText(name), group: cleanText(group) } : p)));
      return null;
    },
    removeParticipant(id) {
      setParticipants(state.participants.filter((p) => p.id !== id));
      return null;
    },
    clearAll() {
      commit({ participants: [], rules: createRules(), draw: null });
      return null;
    },
    importPreview(preview) {
      const next = applyImport(state, preview);
      setParticipants(next.participants, next.rules);
      return null;
    },
    setExcludeFamily(value) {
      commit({ rules: { ...state.rules, excludeFamily: !!value } });
      return null;
    },
    addExclusion(exclusion) {
      const { rules, error } = addExclusion(state.rules, state.participants, exclusion);
      if (!error) commit({ rules });
      return error;
    },
    removeExclusion(id) {
      commit({ rules: removeExclusion(state.rules, id) });
      return null;
    },
    setDraw(draw) {
      commit({ draw });
      return null;
    },
  };

  return {
    getState: () => state,
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    actions,
  };
}
