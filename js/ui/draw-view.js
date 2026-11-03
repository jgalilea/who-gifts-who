// Section 4: the draw and the delivery of results (secret links or in-person).
// Results are never shown to the organizer unless they explicitly ask for it.
import { $, h, icon, setChildren } from './dom.js';
import { t, getLanguage } from '../i18n/index.js';
import { performDraw } from '../core/draw.js';
import { encryptPayload } from '../core/crypto.js';
import { revealUrl, whatsappUrl, canWebShare, webShare, copyText } from './share.js';
import { confirmDialog, toast } from './feedback.js';
import { brandIcon } from './icons.js';

export const PAYLOAD_VERSION = 1;

/** Runs the draw and creates one encrypted token per participant. */
export async function createDraw(participants, rules) {
  const draw = performDraw(participants, rules);
  const lang = getLanguage();
  const tokens = {};
  await Promise.all(
    draw.assignments.map(async (a) => {
      tokens[a.giverId] = await encryptPayload({ v: PAYLOAD_VERSION, g: a.giverName, r: a.receiverName, l: lang });
    }),
  );
  return { ...draw, tokens };
}

export function createDrawView({ store, openInPerson, reasonText, sections }) {
  const { actions } = store;
  const drawBtn = $('#do-draw');
  const allResults = $('#all-results');
  let lastDerived = null;

  async function runDraw() {
    const { participants, rules } = store.getState();
    if (!lastDerived?.feasibility.ok) return;
    drawBtn.disabled = true;
    try {
      actions.setDraw(await createDraw(participants, rules));
      allResults.hidden = true;
      toast(t('draw.doneToast'));
      sections.expand('draw-body');
      $('#draw-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
      console.error(error);
      toast(t('draw.error'));
    } finally {
      drawBtn.disabled = false;
    }
  }

  drawBtn.addEventListener('click', runDraw);

  $('#redo-draw').addEventListener('click', async () => {
    const ok = await confirmDialog({ title: t('draw.redoTitle'), message: t('draw.redoMessage'), confirmLabel: t('draw.redo'), danger: true });
    if (ok) runDraw();
  });

  $('#discard-draw').addEventListener('click', async () => {
    const ok = await confirmDialog({ title: t('draw.discardTitle'), message: t('draw.discardMessage'), confirmLabel: t('draw.discard'), danger: true });
    if (ok) {
      actions.setDraw(null);
      allResults.hidden = true;
    }
  });

  $('#reveal-all').addEventListener('click', async () => {
    const ok = await confirmDialog({
      title: t('draw.revealAllTitle'),
      message: t('draw.revealAllMessage'),
      confirmLabel: t('draw.revealAllConfirm'),
      requireCheck: t('draw.revealAllCheck'),
      danger: true,
    });
    if (!ok) return;
    renderAllResults(store.getState().draw);
    allResults.hidden = false;
    allResults.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  $('#hide-all').addEventListener('click', () => {
    allResults.hidden = true;
    setChildren($('#all-results-list'));
  });

  // Tabs (links / in person) with arrow-key support.
  const tabs = [$('#tab-links'), $('#tab-inperson')];
  const selectTab = (tab) => {
    for (const other of tabs) {
      const selected = other === tab;
      other.setAttribute('aria-selected', String(selected));
      other.tabIndex = selected ? 0 : -1;
      $(`#${other.getAttribute('aria-controls')}`).hidden = !selected;
    }
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      const next = tabs[(i + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      selectTab(next);
      next.focus();
    });
  });

  $('#start-inperson').addEventListener('click', () => openInPerson(store.getState().draw));

  function renderAllResults(draw) {
    setChildren(
      $('#all-results-list'),
      draw.assignments.map((a) => h('li', {}, h('span', {}, a.giverName), h('span', { class: 'arrow', 'aria-label': t('draw.gives') }, '→'), h('strong', {}, a.receiverName))),
    );
  }

  function linkRow(assignment, token) {
    const url = revealUrl(token);
    const name = assignment.giverName;
    const message = t('share.message', { name, url });
    return h(
      'li',
      { class: 'link-row' },
      h('span', { class: 'participant-name' }, name),
      h(
        'div',
        { class: 'row-actions' },
        h('a', { class: 'btn btn-whatsapp', href: whatsappUrl(message), target: '_blank', rel: 'noopener noreferrer', 'aria-label': t('share.whatsappLabel', { name }) }, brandIcon('whatsapp'), t('share.whatsapp')),
        canWebShare()
          ? h('button', {
              type: 'button',
              class: 'btn',
              'aria-label': t('share.shareLabel', { name }),
              onclick: async () => {
                try {
                  await webShare({ title: 'Who Gifts Who', text: t('share.shareText', { name }), url });
                } catch {
                  toast(t('share.shareError'));
                }
              },
            }, icon('📲'), t('share.share'))
          : null,
        h('button', {
          type: 'button',
          class: 'btn',
          'aria-label': t('share.copyLabel', { name }),
          onclick: async () => toast((await copyText(url)) ? t('share.copied', { name }) : t('share.copyError')),
        }, icon('📋'), t('share.copy')),
      ),
    );
  }

  function render(state, derived) {
    lastDerived = derived;
    const { draw } = state;
    $('#draw-idle').hidden = !!draw;
    $('#draw-done').hidden = !draw;
    $('#draw-badge').textContent = draw ? t('draw.badgeDone') : derived.feasibility.ok ? t('draw.badgeReady') : t('draw.badgeBlocked');
    $('#draw-badge').className = `badge ${draw ? 'badge-ok' : derived.feasibility.ok ? '' : 'badge-error'}`;

    drawBtn.disabled = !derived.feasibility.ok;
    $('#draw-blocked').textContent = derived.feasibility.ok ? '' : reasonText(derived.feasibility.reason);

    if (!draw) {
      allResults.hidden = true;
      return;
    }
    const date = new Date(draw.createdAt);
    $('#draw-done-text').textContent = t('draw.doneText', {
      date: date.toLocaleString(getLanguage() === 'es' ? 'es-ES' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' }),
      count: draw.assignments.length,
    });
    const stale = draw.signature !== derived.signature;
    $('#draw-stale').hidden = !stale;
    $('#draw-stale').textContent = stale ? t('draw.stale') : '';
    setChildren($('#link-list'), draw.assignments.map((a) => linkRow(a, draw.tokens[a.giverId])));
    if (!allResults.hidden) renderAllResults(draw);
  }

  return { render };
}
