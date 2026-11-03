// Section 2: family toggle, individual exclusions, active rules and feasibility status.
import { $, h, icon, setChildren, fillSelect } from './dom.js';
import { t, formatList } from '../i18n/index.js';
import { groupMembers } from '../core/participants.js';

export function createRulesView({ store }) {
  const { actions } = store;
  const familyToggle = $('#exclude-family');
  const form = $('#exclusion-form');
  const fromSelect = $('#exclusion-from');
  const toSelect = $('#exclusion-to');
  const directionSelect = $('#exclusion-direction');
  const errorEl = $('#exclusion-error');

  familyToggle.addEventListener('change', () => actions.setExcludeFamily(familyToggle.checked));

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const error = actions.addExclusion({ from: fromSelect.value, to: toSelect.value, mutual: directionSelect.value === 'both' });
    errorEl.textContent = error ? t(`errors.${error}`) : '';
    if (!error) {
      toSelect.value = '';
      fromSelect.focus();
    }
  });
  [fromSelect, toSelect].forEach((s) => s.addEventListener('change', () => (errorEl.textContent = '')));

  function ruleItem(text, onRemove, removeLabel) {
    return h(
      'li',
      { class: 'rule' },
      h('span', {}, text),
      onRemove
        ? h('button', { type: 'button', class: 'btn btn-icon btn-ghost-danger', 'aria-label': removeLabel, title: t('common.remove'), onclick: onRemove }, icon('🗑️'))
        : h('span', { class: 'chip chip-muted' }, t('rules.always')),
    );
  }

  /** Human-readable explanation of why no valid assignment exists. */
  function reasonText(reason) {
    const p = reason.params;
    if (reason.code === 'hall') {
      return t('feasibility.hall', { givers: formatList(p.givers), receivers: formatList(p.receivers), giverCount: p.givers.length, receiverCount: p.receivers.length });
    }
    return t(`feasibility.${reason.code}`, p);
  }

  const feasibilityBadge = (feasibility, count) =>
    feasibility.ok ? t('rules.badge', { count }) : t('rules.badgeBlocked');

  function render(state, derived) {
    const { participants, rules } = state;
    const byId = new Map(participants.map((p) => [p.id, p.name]));
    familyToggle.checked = rules.excludeFamily;

    const options = participants.map((p) => ({ value: p.id, label: p.name }));
    fillSelect(fromSelect, options, t('rules.choose'));
    fillSelect(toSelect, options, t('rules.choose'));
    const canAdd = participants.length >= 2;
    form.querySelectorAll('select, button').forEach((el) => (el.disabled = !canAdd));

    const items = [ruleItem(t('rules.noSelf'))];
    if (rules.excludeFamily) {
      const groups = groupMembers(participants);
      const detail = groups.length
        ? t('rules.familyActive', { groups: formatList(groups.map((g) => `${g.name} (${g.members.length})`)) })
        : t('rules.familyNoGroups');
      items.push(ruleItem(detail, () => actions.setExcludeFamily(false), t('rules.removeFamily')));
    }
    for (const e of rules.exclusions) {
      const params = { from: byId.get(e.from), to: byId.get(e.to) };
      const text = e.mutual ? t('rules.mutual', params) : t('rules.oneWayRule', params);
      items.push(ruleItem(text, () => actions.removeExclusion(e.id), t('rules.removeLabel', { rule: text })));
    }
    setChildren($('#rules-list'), items);
    const badge = $('#rules-badge');
    badge.textContent = feasibilityBadge(derived.feasibility, items.length);
    badge.className = `badge ${derived.feasibility.ok ? 'badge-ok' : 'badge-error'}`;

    const status = $('#feasibility');
    const { feasibility } = derived;
    status.className = `status ${feasibility.ok ? 'status-ok' : 'status-error'}`;
    setChildren(
      status,
      feasibility.ok
        ? h('span', {}, '✓ ', t('feasibility.ok'))
        : [h('strong', {}, t('feasibility.notPossible')), ' ', h('span', {}, reasonText(feasibility.reason))],
    );
  }

  return { render, reasonText };
}
