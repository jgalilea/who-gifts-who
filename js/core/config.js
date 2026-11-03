// Export / import of the full configuration (participants, family groups and rules).
// Exported files reference participants by name so they stay human-readable and editable.
import { createParticipant, nameKey } from './participants.js';
import { addExclusion, createRules } from './rules.js';
import { createEvent, isEventEmpty } from './event.js';
import { mergeHistory } from './history.js';
import { CONFIG_APP, CONFIG_VERSION } from './config-constants.js';

export { CONFIG_APP, CONFIG_VERSION };

export function exportConfig(participants, rules, event = createEvent()) {
  const byId = new Map(participants.map((p) => [p.id, p.name]));
  const config = {
    app: CONFIG_APP,
    version: CONFIG_VERSION,
    exportedAt: new Date().toISOString(),
    participants: participants.map((p) => {
      const out = { name: p.name };
      if (p.group) out.group = p.group;
      if (p.phone) out.phone = p.phone;
      return out;
    }),
    settings: { excludeFamily: !!rules.excludeFamily },
    exclusions: rules.exclusions.map((e) => ({ from: byId.get(e.from), to: byId.get(e.to), mutual: !!e.mutual })),
  };
  if (!isEventEmpty(event)) config.event = { ...event };
  if (rules.previousDraws.length) {
    config.previousDraws = rules.previousDraws.map(({ code, label, date, pairs }) => ({ code, label, date, pairs }));
  }
  return config;
}

/**
 * Applies an import preview (see importer.previewImport) to the current state.
 * mode 'add' keeps existing participants; 'replace' starts from scratch.
 * Settings, event and previous draws from a full JSON config are only applied in 'replace' mode.
 */
export function applyImport({ participants, rules, event = createEvent() }, preview) {
  const replace = preview.mode === 'replace';
  const nextParticipants = replace ? [] : [...participants];
  let nextRules = replace ? createRules() : rules;

  for (const row of preview.rows) {
    if (row.status === 'ok') nextParticipants.push(createParticipant(row));
  }
  if (replace && preview.settings) nextRules = { ...nextRules, ...preview.settings };
  const nextEvent = replace && preview.event ? preview.event : event;

  const byName = new Map(nextParticipants.map((p) => [nameKey(p.name), p.id]));
  for (const e of preview.exclusions || []) {
    const from = byName.get(nameKey(e.from));
    const to = byName.get(nameKey(e.to));
    if (!from || !to) continue;
    nextRules = addExclusion(nextRules, nextParticipants, { from, to, mutual: e.mutual }).rules;
  }
  if (replace && preview.previousDraws.length) {
    nextRules = { ...nextRules, previousDraws: mergeHistory(nextRules.previousDraws, preview.previousDraws).history };
  }
  return { participants: nextParticipants, rules: nextRules, event: nextEvent };
}
