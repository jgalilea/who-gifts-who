// Section 3: exact (or estimated) probabilities, hidden by default.
// Recomputes (debounced) whenever participants or rules change while the panel is visible.
import { $, h, setChildren, fillSelect, debounce } from './dom.js';
import { t, formatPercent, formatCount, formatNumber } from '../i18n/index.js';
import { analyze, EXACT_LIMIT } from '../core/matching.js';

export function createProbabilitiesView({ store }) {
  const toggle = $('#show-probabilities');
  const content = $('#prob-content');
  const personSelect = $('#prob-person');
  let analysis = null; // { signature, result }
  let lastDerived = null;

  toggle.checked = false; // always hidden by default
  toggle.addEventListener('change', () => {
    content.hidden = !toggle.checked;
    if (toggle.checked) refresh();
  });
  personSelect.addEventListener('change', () => renderPerson());

  const compute = debounce(() => {
    const derived = lastDerived;
    if (!derived || !toggle.checked) return;
    analysis = { signature: derived.signature, result: analyze(derived.allowed) };
    renderAll();
  }, 120);

  function refresh() {
    if (!toggle.checked || !lastDerived) return;
    if (!lastDerived.feasibility.ok) {
      analysis = null;
      renderAll();
    } else if (!analysis || analysis.signature !== lastDerived.signature) {
      $('#prob-summary').textContent = t('prob.calculating');
      compute();
    } else {
      renderAll();
    }
  }

  function renderAll() {
    const { participants } = store.getState();
    const body = $('#prob-body');
    const summary = $('#prob-summary');
    if (!lastDerived.feasibility.ok || !analysis) {
      body.hidden = true;
      summary.textContent = participants.length < 2 ? t('prob.needMore') : t('prob.none');
      return;
    }
    if (analysis.signature !== lastDerived.signature) return; // a new computation is pending
    const r = analysis.result;
    body.hidden = false;
    const count = formatCount(r.total, r.log10Total, r.countIsExact);
    summary.replaceChildren(
      h('strong', {}, t('prob.total')), ' ', count, ' · ',
      r.exact
        ? t('prob.exactNote')
        : t('prob.estimateNote', { samples: formatNumber(r.samples), limit: EXACT_LIMIT }),
    );
    fillSelect(personSelect, participants.map((p) => ({ value: p.id, label: p.name })));
    renderPerson();
    renderHeatmap();
  }

  function rankedList(entries) {
    return entries
      .sort((a, b) => b.p - a.p || a.name.localeCompare(b.name))
      .map((e) =>
        h(
          'li',
          { class: e.p === 0 ? 'zero' : '' },
          h('span', { class: 'bar-label' }, h('span', {}, e.name), h('strong', {}, formatPercent(e.p))),
          h('span', { class: 'bar', 'aria-hidden': 'true' }, h('span', { class: 'bar-fill', style: { width: `${e.p * 100}%` } })),
        ),
      );
  }

  function renderPerson() {
    if (!analysis || !lastDerived?.feasibility.ok) return;
    const { participants } = store.getState();
    const i = participants.findIndex((p) => p.id === personSelect.value);
    if (i < 0) return;
    const { matrix } = analysis.result;
    const name = participants[i].name;
    const others = participants.map((p, j) => ({ j, name: p.name })).filter((e) => e.j !== i);
    $('#prob-gives-title').textContent = t('prob.gives', { name });
    $('#prob-receives-title').textContent = t('prob.receives', { name });
    setChildren($('#prob-gives'), rankedList(others.map((e) => ({ name: e.name, p: matrix[i][e.j] }))));
    setChildren($('#prob-receives'), rankedList(others.map((e) => ({ name: e.name, p: matrix[e.j][i] }))));
  }

  function renderHeatmap() {
    const { participants } = store.getState();
    const { matrix } = analysis.result;
    const { allowed } = lastDerived;
    let max = 0;
    for (const row of matrix) for (const p of row) if (p > max) max = p;

    const head = h(
      'tr',
      {},
      h('th', { scope: 'col', class: 'corner' }, h('span', {}, t('prob.giverAxis')), h('span', {}, t('prob.receiverAxis'))),
      participants.map((p) => h('th', { scope: 'col', class: 'col-head', title: p.name }, h('span', {}, p.name))),
    );
    const rows = participants.map((giver, i) =>
      h(
        'tr',
        {},
        h('th', { scope: 'row', class: 'row-head' },
          h('button', { type: 'button', class: 'link-btn', onclick: () => { personSelect.value = giver.id; renderPerson(); $('#prob-person').scrollIntoView({ behavior: 'smooth', block: 'center' }); } }, giver.name)),
        participants.map((receiver, j) => {
          if (!allowed[i][j]) return h('td', { class: 'cell blocked', title: `${giver.name} → ${receiver.name}: ${t('prob.notAllowed')}` }, '—');
          const p = matrix[i][j];
          const intensity = max > 0 ? p / max : 0;
          return h(
            'td',
            {
              class: `cell${intensity > 0.55 ? ' strong' : ''}`,
              style: { '--intensity': intensity.toFixed(3) },
              title: `${giver.name} → ${receiver.name}: ${formatPercent(p)}`,
            },
            formatPercent(p),
          );
        }),
      ),
    );
    setChildren($('#heatmap'), h('caption', { class: 'visually-hidden' }, t('prob.matrixCaption')), h('thead', {}, head), h('tbody', {}, rows));
  }

  function render(state, derived) {
    lastDerived = derived;
    content.hidden = !toggle.checked;
    refresh();
  }

  return { render };
}
