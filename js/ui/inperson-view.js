// In-person mode: the phone is passed around. Each person sees only their own result,
// then hides it before handing the phone to the next one.
//
// Stages: intro → (turn → result) × n → done. "exit" is an in-view confirmation.
// Revealing requires press-and-hold so a double tap on "hide" can never reveal the next
// person's result to the wrong person.
import { $ } from './dom.js';
import { t } from '../i18n/index.js';

const HOLD_MS = 900;

export function createInPersonView() {
  const dialog = $('#inperson-dialog');
  const stages = {
    intro: $('#inperson-intro'),
    turn: $('#inperson-turn'),
    result: $('#inperson-result'),
    exit: $('#inperson-exit-confirm'),
    done: $('#inperson-done'),
  };
  const revealBtn = $('#inperson-reveal');
  const receiverEl = $('#inperson-receiver');
  let assignments = [];
  let index = 0;
  let phase = 'intro';
  let phaseBeforeExit = 'turn';

  const wipeResult = () => (receiverEl.textContent = '');

  function show() {
    for (const [name, el] of Object.entries(stages)) el.hidden = name !== phase;
    const total = assignments.length;
    const current = assignments[index];
    const next = assignments[index + 1];
    const doneCount = phase === 'done' ? total : index;
    $('#inperson-progress-text').textContent = phase === 'done' ? t('inperson.progressDone', { total }) : t('inperson.progress', { current: Math.min(index + 1, total), total });
    $('#inperson-progress-bar').style.width = `${(doneCount / total) * 100}%`;
    $('#inperson-exit').hidden = phase === 'exit' || phase === 'done';
    if (phase !== 'result') wipeResult();

    if (phase === 'intro') {
      $('#inperson-begin').focus();
    } else if (phase === 'turn') {
      $('#inperson-name').textContent = current.giverName;
      $('#inperson-instructions').textContent = t('inperson.instructions', { name: current.giverName });
      $('#inperson-reveal-label').textContent = t('inperson.holdToReveal', { name: current.giverName });
      revealBtn.setAttribute('aria-label', t('inperson.holdToRevealAria', { name: current.giverName }));
      cancelHold();
      revealBtn.focus();
    } else if (phase === 'result') {
      $('#inperson-secret-banner').textContent = t('inperson.onlyYou', { name: current.giverName });
      $('#inperson-result-label').textContent = t('inperson.youGift', { name: current.giverName });
      receiverEl.textContent = current.receiverName;
      $('#inperson-memorize').textContent = next ? t('inperson.memorizeNext', { next: next.giverName }) : t('inperson.memorizeLast');
      $('#inperson-hide-label').textContent = next ? t('inperson.hideNext', { next: next.giverName }) : t('inperson.hideLast');
      $('#inperson-hide').focus();
    } else if (phase === 'exit') {
      $('#inperson-exit-cancel').focus();
    } else {
      $('#inperson-close').focus();
    }
  }

  function go(next) {
    phase = next;
    show();
  }

  // ----- Press and hold to reveal -----
  let holdTimer = null;
  function startHold(event) {
    if (phase !== 'turn' || holdTimer) return;
    if (event.type === 'keydown') {
      if (event.key !== ' ' && event.key !== 'Enter') return;
      event.preventDefault();
      if (event.repeat) return;
    }
    revealBtn.classList.add('holding');
    holdTimer = setTimeout(() => {
      holdTimer = null;
      revealBtn.classList.remove('holding');
      go('result');
    }, HOLD_MS);
  }
  function cancelHold() {
    clearTimeout(holdTimer);
    holdTimer = null;
    revealBtn.classList.remove('holding');
  }
  revealBtn.addEventListener('pointerdown', (event) => {
    revealBtn.setPointerCapture?.(event.pointerId);
    startHold(event);
  });
  revealBtn.addEventListener('keydown', startHold);
  ['pointerup', 'pointercancel', 'lostpointercapture', 'keyup', 'blur'].forEach((type) => revealBtn.addEventListener(type, cancelHold));
  revealBtn.addEventListener('contextmenu', (event) => event.preventDefault()); // long-press menu on mobile
  revealBtn.addEventListener('click', (event) => event.preventDefault());

  // ----- Navigation -----
  $('#inperson-begin').addEventListener('click', () => go('turn'));
  $('#inperson-hide').addEventListener('click', () => {
    wipeResult();
    index++;
    go(index >= assignments.length ? 'done' : 'turn');
  });

  const close = () => {
    cancelHold();
    wipeResult();
    dialog.close();
  };
  $('#inperson-close').addEventListener('click', close);

  function requestExit() {
    if (phase === 'done' || phase === 'intro') return close();
    if (phase === 'exit') return;
    cancelHold();
    // Never return to a visible result: go back to that person's turn instead.
    phaseBeforeExit = 'turn';
    go('exit');
  }
  $('#inperson-exit').addEventListener('click', requestExit);
  $('#inperson-exit-cancel').addEventListener('click', () => go(phaseBeforeExit));
  $('#inperson-exit-ok').addEventListener('click', close);
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault(); // Escape key
    requestExit();
  });

  function open(draw) {
    assignments = draw.assignments;
    index = 0;
    phase = 'intro';
    dialog.showModal();
    show();
  }

  return { open };
}
