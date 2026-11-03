// Probabilities section: exact (or estimated) probabilities, hidden by default.
// Recomputes in a background worker (debounced) whenever participants or rules change while
// the panel is visible; a newer request cancels the one in progress.
import { $, h, setChildren, fillSelect, debounce } from './dom.js';
import { t, formatPercent, formatCount, formatNumber, getLanguage } from '../i18n/index.js';
import { EXACT_LIMIT } from '../core/matching.js';
import { runTask, CancelledError } from '../compute.js';
import { MIN_PARTICIPANTS } from '../core/feasibility.js';

export function createProbabilitiesView({ store }) {
  const toggle = $('#show-probabilities');
  const content = $('#prob-content');
  const personSelect = $('#prob-person');
  let analysis = null; // { signature, result }
  let requested = null; // signature being computed
  let renderedKey = null; // what the DOM currently shows, to skip identical re-renders
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
    runTask('analysis', 'analyze', { allowed: derived.allowed })
      .then((result) => {
        if (requested !== derived.signature) return;
        analysis = { signature: derived.signature, result };
        requested = null;
        renderAll();
      })
      .catch((error) => {
        if (!(error instanceof CancelledError)) console.error(error);
      });
  }, 80);

  function refresh() {
    if (!toggle.checked || !lastDerived) return;
    if (!lastDerived.feasibility.ok) {
      analysis = null;
      renderAll();
    } else if (!analysis || analysis.signature !== lastDerived.signature) {
      $('#prob-summary').textContent = t('prob.calculating');
      if (requested !== lastDerived.signature) {
        requested = lastDerived.signature;
        compute();
      }
    } else if (renderedKey !== `${analysis.signature}|${getLanguage()}`) {
      // Unrelated changes (e.g. typing the event name) must not rebuild the matrix.
      renderAll();
    }
  }

  function renderAll() {
    const { participants } = store.getState();
    const body = $('#prob-body');
    const summary = $('#prob-summary');
    if (!lastDerived.feasibility.ok || !analysis) {
      renderedKey = null;
      body.hidden = true;
      summary.textContent = participants.length < MIN_PARTICIPANTS ? t('prob.needMore') : t('prob.none');
      return;
    }
    if (analysis.signature !== lastDerived.signature) return; // a new computation is pending
    renderedKey = `${analysis.signature}|${getLanguage()}`;
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
              class: 'cell',
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
