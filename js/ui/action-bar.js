// Sticky bar at the bottom: says where you are and offers the next step, so the draw is
// always one tap away. It hides while the draw section is on screen (no duplicate button)
// and while typing on touch devices (it would float above the on-screen keyboard).
import { $ } from './dom.js';
import { t, formatCount } from '../i18n/index.js';
import { MIN_PARTICIPANTS } from '../core/feasibility.js';
import { isDrawStale } from './draw-view.js';

export function createActionBar({ store, counts, getDerived, openSummary, sections }) {
  const bar = $('#action-bar');
  const text = $('#action-bar-text');
  const button = $('#action-bar-btn');
  let drawInView = false;
  let typing = false;
  let action = null;

  const goTo = (bodyId, target, focus) => {
    sections.expand(bodyId);
    $(target).scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (focus) $(focus).focus({ preventScroll: true });
  };

  const ACTIONS = {
    addPeople: () => goTo('participants-body', '#add-participant-form', '#new-name'),
    seeWhy: () => goTo('rules-body', '#feasibility'),
    review: () => openSummary(),
    send: () => goTo('draw-body', '#draw-done'),
  };
  button.addEventListener('click', () => action && ACTIONS[action]());

  function updateVisibility() {
    const visible = !drawInView && !typing;
    bar.hidden = !visible;
    document.body.classList.toggle('has-action-bar', visible);
  }

  new IntersectionObserver(([entry]) => {
    drawInView = entry.isIntersecting;
    updateVisibility();
  }).observe($('#draw-body'));

  const touch = matchMedia('(pointer: coarse)');
  const isField = (el) => el?.matches?.('input:not([type="checkbox"]):not([type="radio"]), textarea, select');
  document.addEventListener('focusin', (event) => {
    typing = touch.matches && isField(event.target);
    updateVisibility();
  });
  document.addEventListener('focusout', () => {
    typing = false;
    // Wait a tick: focus may be moving to another field.
    setTimeout(() => {
      typing = touch.matches && isField(document.activeElement);
      updateVisibility();
    }, 50);
  });

  function render(state, derived = getDerived()) {
    const n = state.participants.length;
    const count = counts.get(derived.signature);
    if (n < MIN_PARTICIPANTS) {
      action = 'addPeople';
      text.textContent = t('bar.needPeople', { count: n, min: MIN_PARTICIPANTS });
      button.textContent = t('bar.addPeople');
    } else if (!derived.feasibility.ok) {
      action = 'seeWhy';
      text.textContent = t('bar.blocked');
      button.textContent = t('bar.seeWhy');
    } else if (state.draw && isDrawStale(state.draw, state, derived)) {
      action = 'review';
      text.textContent = t('bar.stale');
      button.textContent = t('bar.redo');
    } else if (state.draw) {
      action = 'send';
      text.textContent = t('bar.done', { code: state.draw.code ? `#${state.draw.code}` : '' });
      button.textContent = t('bar.send');
    } else {
      action = 'review';
      text.textContent = count
        ? t('bar.readyCount', { count: n, combos: formatCount(count.total, count.log10Total, count.countIsExact) })
        : t('bar.ready', { count: n });
      button.textContent = t('bar.draw');
    }
    bar.dataset.state = action;
    updateVisibility();
  }

  counts.subscribe(() => render(store.getState()));
  return { render };
}
