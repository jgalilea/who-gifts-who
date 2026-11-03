// Rules section: family toggle, individual exclusions, active rules and feasibility status
// (including how many valid combinations exist, computed in the background).
import { $, h, icon, setChildren, fillSelect } from './dom.js';
import { t, formatList, formatCount } from '../i18n/index.js';
import { groupMembers } from '../core/participants.js';
import { applicablePairs } from '../core/rules.js';
import { drawName } from './history-view.js';
import { runTask, CancelledError } from '../compute.js';

// With this few combinations, knowing your own result lets you deduce others'.
const FEW_COMBINATIONS = 2;

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

  // Latest combination count: { signature, result } (result is null above 20 people).
  let count = { signature: null, result: null };
  function requestCount(derived) {
    if (!derived.feasibility.ok || count.signature === derived.signature) return;
    count = { signature: derived.signature, result: null };
    runTask('count', 'count', { allowed: derived.allowed })
      .then((result) => {
        if (count.signature !== derived.signature) return;
        count.result = result;
        renderStatus(derived);
      })
      .catch((error) => {
        if (!(error instanceof CancelledError)) console.error(error);
      });
  }

  function renderStatus(derived) {
    const status = $('#feasibility');
    const { feasibility } = derived;
    if (!feasibility.ok) {
      status.className = 'status status-error';
      setChildren(status, h('strong', {}, t('feasibility.notPossible')), ' ', h('span', {}, reasonText(feasibility.reason)));
      return;
    }
    const result = count.signature === derived.signature ? count.result : null;
    const few = result && result.total <= FEW_COMBINATIONS;
    status.className = `status ${few ? 'status-warn' : 'status-ok'}`;
    setChildren(
      status,
      h('span', {}, '✓ ', t('feasibility.ok')),
      result
        ? h('span', { class: 'status-detail' }, few
            ? t('feasibility.fewCombinations', { count: result.total })
            : t('feasibility.combinations', { count: formatCount(result.total, result.log10Total, result.countIsExact) }))
        : null,
    );
  }

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
    for (const entry of rules.previousDraws) {
      const applies = applicablePairs(entry, participants);
      const text = t('rules.previousRule', { draw: drawName(entry), applies, total: entry.pairs.length });
      items.push(ruleItem(text, () => actions.removePreviousDraw(entry.id), t('rules.removeLabel', { rule: text })));
    }
    setChildren($('#rules-list'), items);
    const badge = $('#rules-badge');
    badge.textContent = feasibilityBadge(derived.feasibility, items.length);
    badge.className = `badge ${derived.feasibility.ok ? 'badge-ok' : 'badge-error'}`;

    renderStatus(derived);
    requestCount(derived);
  }

  return { render, reasonText };
}
