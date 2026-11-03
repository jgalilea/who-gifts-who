// "Review and draw": a last look at participants, rules, combinations and event details
// before drawing (or drawing again). Opened from the draw section and the action bar.
import { $, h, setChildren } from './dom.js';
import { t, formatCount, formatEventDate, formatList, formatNumber } from '../i18n/index.js';
import { isEventEmpty } from '../core/event.js';
import { EXACT_LIMIT } from '../core/matching.js';
import { describeRules } from './rule-texts.js';
import { FEW_COMBINATIONS } from './rules-view.js';

const MAX_NAMES = 12;

export function createSummaryView({ store, counts, getDerived, runDraw, openEventDetails }) {
  const dialog = $('#summary-dialog');

  function namesText(participants) {
    const names = participants.map((p) => p.name);
    if (names.length <= MAX_NAMES) return formatList(names);
    return t('summary.namesMore', { names: names.slice(0, MAX_NAMES).join(', '), count: names.length - MAX_NAMES });
  }

  function row(term, ...content) {
    return h('div', { class: 'summary-row' }, h('dt', {}, term), h('dd', {}, ...content));
  }

  function render() {
    const state = store.getState();
    const derived = getDerived();
    const redo = !!state.draw;
    const count = counts.get(derived.signature);
    const { event } = state;

    $('#summary-title').textContent = redo ? t('summary.redoTitle') : t('summary.title');
    $('#summary-confirm').textContent = redo ? t('summary.redoConfirm') : t('summary.confirm');
    $('#summary-confirm').disabled = !derived.feasibility.ok;

    const combos = count
      ? formatCount(count.total, count.log10Total, count.countIsExact)
      : state.participants.length > EXACT_LIMIT ? t('summary.countLarge', { limit: EXACT_LIMIT }) : t('summary.countPending');
    const eventText = isEventEmpty(event)
      ? t('summary.noEvent')
      : [event.name, event.date && formatEventDate(event.date), event.budget].filter(Boolean).join(' · ');

    setChildren(
      $('#summary-list'),
      row(t('summary.participants'), h('strong', {}, formatNumber(state.participants.length)), h('span', { class: 'hint summary-names' }, namesText(state.participants))),
      row(t('summary.rules'), h('ul', { class: 'summary-rules' }, describeRules(state).map((item) => h('li', {}, item.text)))),
      row(t('summary.combinations'), combos),
      row(
        t('summary.event'),
        h('span', { class: isEventEmpty(event) ? 'hint' : '' }, eventText),
        h('button', {
          type: 'button',
          class: 'link-btn summary-edit',
          onclick: () => {
            dialog.close();
            openEventDetails();
          },
        }, isEventEmpty(event) ? t('summary.addEvent') : t('summary.editEvent')),
      ),
    );

    const warnings = [];
    if (count && count.total <= FEW_COMBINATIONS) warnings.push(t('feasibility.fewCombinations', { count: count.total }));
    if (redo) warnings.push(t('summary.redoWarning', { code: state.draw.code || '' }));
    setChildren($('#summary-warnings'), warnings.map((text) => h('p', { class: 'status status-warn' }, text)));
  }

  counts.subscribe(() => dialog.open && render());
  $('#summary-cancel').addEventListener('click', () => dialog.close());
  $('#summary-confirm').addEventListener('click', () => {
    dialog.close();
    runDraw();
  });

  function open() {
    if (!getDerived().feasibility.ok) return;
    counts.request(getDerived());
    render();
    dialog.showModal();
    $('#summary-confirm').focus();
  }

  return { open, render: () => dialog.open && render() };
}
