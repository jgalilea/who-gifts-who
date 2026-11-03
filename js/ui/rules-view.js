// Rules section: family toggle, individual exclusions (form shown on demand), active rules
// and feasibility status (including how many valid combinations exist).
import { $, h, icon, setChildren, fillSelect } from './dom.js';
import { t, formatList, formatCount } from '../i18n/index.js';
import { describeRules } from './rule-texts.js';

// With this few combinations, knowing your own result lets you deduce others'.
export const FEW_COMBINATIONS = 2;

/** Human-readable explanation of why no valid assignment exists. */
export function reasonText(reason) {
  const p = reason.params;
  if (reason.code === 'hall') {
    return t('feasibility.hall', { givers: formatList(p.givers), receivers: formatList(p.receivers), giverCount: p.givers.length, receiverCount: p.receivers.length });
  }
  return t(`feasibility.${reason.code}`, p);
}

export function createRulesView({ store, counts }) {
  const { actions } = store;
  const familyToggle = $('#exclude-family');
  const form = $('#exclusion-form');
  const openBtn = $('#open-exclusion');
  const fromSelect = $('#exclusion-from');
  const toSelect = $('#exclusion-to');
  const directionSelect = $('#exclusion-direction');
  const errorEl = $('#exclusion-error');
  let lastDerived = null;

  familyToggle.addEventListener('change', () => actions.setExcludeFamily(familyToggle.checked));

  // The exclusion form is only shown when asked for.
  const showForm = (show, moveFocus = true) => {
    form.hidden = !show;
    openBtn.hidden = show;
    openBtn.setAttribute('aria-expanded', String(show));
    errorEl.textContent = '';
    if (moveFocus) (show ? fromSelect : openBtn).focus();
  };
  openBtn.addEventListener('click', () => showForm(true));
  $('#close-exclusion').addEventListener('click', () => showForm(false));

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

  function ruleItem({ text, remove, removeLabel }) {
    return h(
      'li',
      { class: 'rule' },
      h('span', {}, text),
      remove
        ? h('button', {
            type: 'button',
            class: 'btn btn-icon btn-ghost-danger',
            'aria-label': removeLabel || t('rules.removeLabel', { rule: text }),
            title: t('common.remove'),
            onclick: remove,
          }, icon('🗑️'))
        : h('span', { class: 'chip chip-muted' }, t('rules.always')),
    );
  }

  function renderStatus(derived) {
    const status = $('#feasibility');
    const { feasibility } = derived;
    if (!feasibility.ok) {
      status.className = 'status status-error';
      setChildren(status, h('strong', {}, t('feasibility.notPossible')), ' ', h('span', {}, reasonText(feasibility.reason)));
      return;
    }
    const result = counts.get(derived.signature);
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
  counts.subscribe(() => lastDerived && renderStatus(lastDerived));

  function render(state, derived) {
    lastDerived = derived;
    const { participants, rules } = state;
    familyToggle.checked = rules.excludeFamily;

    const options = participants.map((p) => ({ value: p.id, label: p.name }));
    fillSelect(fromSelect, options, t('rules.choose'));
    fillSelect(toSelect, options, t('rules.choose'));
    const canAdd = participants.length >= 2;
    openBtn.disabled = !canAdd;
    if (!canAdd && !form.hidden) showForm(false, false);

    const items = describeRules(state, actions);
    setChildren($('#rules-list'), items.map(ruleItem));
    const badge = $('#rules-badge');
    badge.textContent = derived.feasibility.ok ? t('rules.badge', { count: items.length }) : t('rules.badgeBlocked');
    badge.className = `badge ${derived.feasibility.ok ? 'badge-ok' : 'badge-error'}`;

    counts.request(derived);
    renderStatus(derived);
  }

  return { render };
}
