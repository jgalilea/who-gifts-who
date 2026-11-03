// Application state: a tiny observable store plus the actions that change it.
// State shape: { participants, rules, event, draw }. Participants, rules and event are
// persisted as the draft; the draw (with its secret link tokens) is persisted separately.
import { cleanText, createParticipant, validateName, validateGroup, validatePhone } from './core/participants.js';
import { createRules, addExclusion, removeExclusion, pruneExclusions, removePreviousDraw } from './core/rules.js';
import { sanitizeEntry, entryFromDraw, mergeHistory } from './core/history.js';
import { createEvent, sanitizeEvent } from './core/event.js';
import { applyImport } from './core/config.js';
import { STORAGE_KEYS, loadJSON, saveJSON } from './storage.js';

const validPair = (seen) => (e) => e && seen.has(e.from) && seen.has(e.to) && e.from !== e.to;

function sanitizeDraft(raw) {
  const participants = [];
  const seen = new Set();
  for (const p of Array.isArray(raw?.participants) ? raw.participants : []) {
    if (!p || typeof p.id !== 'string' || typeof p.name !== 'string' || seen.has(p.id)) continue;
    if (validateName(p.name, participants)) continue;
    seen.add(p.id);
    const phone = validatePhone(p.phone) ? '' : cleanText(p.phone);
    participants.push({ id: p.id, name: cleanText(p.name), group: cleanText(p.group), phone });
  }
  const rules = createRules();
  rules.excludeFamily = !!raw?.rules?.excludeFamily;
  rules.exclusions = (Array.isArray(raw?.rules?.exclusions) ? raw.rules.exclusions : [])
    .filter((e) => validPair(seen)(e) && typeof e.id === 'string')
    .map((e) => ({ id: e.id, from: e.from, to: e.to, mutual: !!e.mutual }));
  rules.previousDraws = (Array.isArray(raw?.rules?.previousDraws) ? raw.rules.previousDraws : []).map(sanitizeEntry).filter(Boolean);
  return { participants, rules, event: sanitizeEvent(raw?.event) };
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
    if (prev.participants !== state.participants || prev.rules !== state.rules || prev.event !== state.event) {
      saveJSON(STORAGE_KEYS.draft, { participants: state.participants, rules: state.rules, event: state.event });
    }
    if (prev.draw !== state.draw) saveJSON(STORAGE_KEYS.draw, state.draw);
    listeners.forEach((fn) => fn(state, prev));
  }

  const setParticipants = (participants, rules = state.rules) =>
    commit({ participants, rules: pruneExclusions(rules, participants) });

  const validateParticipant = (id, { name, group, phone }) =>
    validateName(name, state.participants, id) || validateGroup(group) || validatePhone(phone);

  // Each action returns an error code (string) or null.
  const actions = {
    addParticipant({ name, group = '', phone = '' }) {
      const error = validateParticipant(null, { name, group, phone });
      if (error) return error;
      setParticipants([...state.participants, createParticipant({ name, group, phone })]);
      return null;
    },
    updateParticipant(id, { name, group = '', phone = '' }) {
      const error = validateParticipant(id, { name, group, phone });
      if (error) return error;
      setParticipants(
        state.participants.map((p) => (p.id === id ? { ...p, name: cleanText(name), group: cleanText(group), phone: cleanText(phone) } : p)),
      );
      return null;
    },
    removeParticipant(id) {
      setParticipants(state.participants.filter((p) => p.id !== id));
      return null;
    },
    clearAll() {
      commit({ participants: [], rules: createRules(), event: createEvent(), draw: null });
      return null;
    },
    importPreview(preview) {
      const next = applyImport(state, preview);
      commit({ participants: next.participants, rules: pruneExclusions(next.rules, next.participants), event: next.event });
      return null;
    },
    setEvent(patch) {
      commit({ event: sanitizeEvent({ ...state.event, ...patch }) });
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
    /** Saves the current draw as a "do not repeat" rule and clears it, ready for a new draw. */
    startNextDrawAvoidingCurrent() {
      if (!state.draw) return 'noDraw';
      const { history } = mergeHistory(state.rules.previousDraws, [entryFromDraw(state.draw)].filter(Boolean));
      commit({ rules: { ...state.rules, previousDraws: history }, draw: null });
      return null;
    },
    /** Adds imported previous draws. Returns { added, duplicates }. */
    addPreviousDraws(entries) {
      const { history, added, duplicates } = mergeHistory(state.rules.previousDraws, entries);
      if (added) commit({ rules: { ...state.rules, previousDraws: history } });
      return { added, duplicates };
    },
    removePreviousDraw(id) {
      commit({ rules: removePreviousDraw(state.rules, id) });
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
