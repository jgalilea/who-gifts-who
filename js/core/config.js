// Export / import of the full configuration (participants, family groups and rules).
// Exported files reference participants by name so they stay human-readable and editable.
import { createParticipant, nameKey } from './participants.js';
import { addExclusion, createRules } from './rules.js';

export const CONFIG_APP = 'who-gifts-who';
export const CONFIG_VERSION = 1;

export function exportConfig(participants, rules) {
  const byId = new Map(participants.map((p) => [p.id, p.name]));
  return {
    app: CONFIG_APP,
    version: CONFIG_VERSION,
    exportedAt: new Date().toISOString(),
    participants: participants.map((p) => (p.group ? { name: p.name, group: p.group } : { name: p.name })),
    settings: { excludeFamily: !!rules.excludeFamily },
    exclusions: rules.exclusions.map((e) => ({ from: byId.get(e.from), to: byId.get(e.to), mutual: !!e.mutual })),
  };
}

/**
 * Applies an import preview (see importer.previewImport) to the current state.
 * mode 'add' keeps existing participants; 'replace' starts from scratch.
 * Settings from a full JSON config are only applied in 'replace' mode.
 */
export function applyImport({ participants, rules }, preview) {
  const replace = preview.mode === 'replace';
  const nextParticipants = replace ? [] : [...participants];
  let nextRules = replace ? createRules() : rules;

  for (const row of preview.rows) {
    if (row.status === 'ok') nextParticipants.push(createParticipant(row));
  }
  if (replace && preview.settings) nextRules = { ...nextRules, ...preview.settings };

  const byName = new Map(nextParticipants.map((p) => [nameKey(p.name), p.id]));
  for (const e of preview.exclusions || []) {
    const from = byName.get(nameKey(e.from));
    const to = byName.get(nameKey(e.to));
    if (!from || !to) continue;
    nextRules = addExclusion(nextRules, nextParticipants, { from, to, mutual: e.mutual }).rules;
  }
  return { participants: nextParticipants, rules: nextRules };
}
