// In-person mode: the phone is passed around. Each person sees only their own result,
// then hides it before handing the phone to the next one.
import { $ } from './dom.js';
import { t } from '../i18n/index.js';
import { confirmDialog } from './feedback.js';

export function createInPersonView() {
  const dialog = $('#inperson-dialog');
  const stages = { turn: $('#inperson-turn'), result: $('#inperson-result'), done: $('#inperson-done') };
  let assignments = [];
  let index = 0;
  let phase = 'turn';

  function show() {
    for (const [name, el] of Object.entries(stages)) el.hidden = name !== phase;
    const current = assignments[index];
    $('#inperson-progress').textContent = t('inperson.progress', { current: Math.min(index + 1, assignments.length), total: assignments.length });
    if (phase === 'turn') {
      $('#inperson-name').textContent = current.giverName;
      $('#inperson-instructions').textContent = t('inperson.instructions', { name: current.giverName });
      $('#inperson-reveal').textContent = t('inperson.iAm', { name: current.giverName });
      $('#inperson-reveal').focus();
    } else if (phase === 'result') {
      $('#inperson-result-label').textContent = t('inperson.youGift', { name: current.giverName });
      $('#inperson-receiver').textContent = current.receiverName;
      const last = index === assignments.length - 1;
      $('#inperson-hide').textContent = last ? t('inperson.hideLast') : t('inperson.hideNext');
      $('#inperson-hide').focus();
    } else {
      $('#inperson-receiver').textContent = '';
      $('#inperson-close').focus();
    }
  }

  $('#inperson-reveal').addEventListener('click', () => {
    phase = 'result';
    show();
  });
  $('#inperson-hide').addEventListener('click', () => {
    $('#inperson-receiver').textContent = ''; // wipe it from the DOM immediately
    index++;
    phase = index >= assignments.length ? 'done' : 'turn';
    show();
  });

  const close = () => {
    $('#inperson-receiver').textContent = '';
    dialog.close();
  };
  $('#inperson-close').addEventListener('click', close);

  async function requestExit() {
    if (phase === 'done') return close();
    // Hide any visible result before asking.
    $('#inperson-receiver').textContent = '';
    dialog.close();
    const ok = await confirmDialog({ title: t('inperson.exitTitle'), message: t('inperson.exitMessage'), confirmLabel: t('inperson.exit') });
    if (!ok) {
      phase = 'turn';
      dialog.showModal();
      show();
    }
  }
  $('#inperson-exit').addEventListener('click', requestExit);
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault(); // Escape key
    requestExit();
  });

  function open(draw) {
    assignments = draw.assignments;
    index = 0;
    phase = 'turn';
    dialog.showModal();
    show();
  }

  return { open };
}
