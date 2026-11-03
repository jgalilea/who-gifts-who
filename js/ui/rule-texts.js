// Human-readable descriptions of the active rules, shared by the rules list and the
// pre-draw summary. Each item: { text, remove? } where remove is an action to undo it.
import { t, formatList } from '../i18n/index.js';
import { groupMembers } from '../core/participants.js';
import { applicablePairs } from '../core/rules.js';
import { drawName } from './history-view.js';

export function describeRules({ participants, rules }, actions = null) {
  const byId = new Map(participants.map((p) => [p.id, p.name]));
  const items = [{ text: t('rules.noSelf') }];
  if (rules.excludeFamily) {
    const groups = groupMembers(participants);
    items.push({
      text: groups.length
        ? t('rules.familyActive', { groups: formatList(groups.map((g) => `${g.name} (${g.members.length})`)) })
        : t('rules.familyNoGroups'),
      remove: actions && (() => actions.setExcludeFamily(false)),
      removeLabel: t('rules.removeFamily'),
    });
  }
  for (const e of rules.exclusions) {
    const params = { from: byId.get(e.from), to: byId.get(e.to) };
    const text = e.mutual ? t('rules.mutual', params) : t('rules.oneWayRule', params);
    items.push({ text, remove: actions && (() => actions.removeExclusion(e.id)) });
  }
  for (const entry of rules.previousDraws) {
    const applies = applicablePairs(entry, participants);
    const text = t('rules.previousRule', { draw: drawName(entry), applies, total: entry.pairs.length });
    items.push({ text, remove: actions && (() => actions.removePreviousDraw(entry.id)) });
  }
  return items;
}
