// User feedback: toast notifications and the generic confirmation dialog.
import { $ } from './dom.js';
import { t } from '../i18n/index.js';

let toastTimer;
export function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('visible'), 2600);
}

/**
 * Shows a modal confirmation. Resolves true when confirmed.
 * Options: { title, message, confirmLabel, danger, requireCheck } – requireCheck is a label for
 * a checkbox that must be ticked before the confirm button is enabled.
 */
export function confirmDialog({ title, message, confirmLabel = t('common.confirm'), danger = false, requireCheck = null }) {
  const dialog = $('#confirm-dialog');
  const ok = $('#confirm-ok');
  const cancel = $('#confirm-cancel');
  const checkRow = $('#confirm-check-row');
  const check = $('#confirm-check');

  $('#confirm-title').textContent = title;
  $('#confirm-message').textContent = message;
  ok.textContent = confirmLabel;
  ok.classList.toggle('btn-danger', danger);
  ok.classList.toggle('btn-primary', !danger);
  checkRow.hidden = !requireCheck;
  check.checked = false;
  $('#confirm-check-label').textContent = requireCheck || '';
  ok.disabled = !!requireCheck;

  return new Promise((resolve) => {
    const onCheck = () => (ok.disabled = !check.checked);
    const finish = (value) => {
      check.removeEventListener('change', onCheck);
      ok.removeEventListener('click', onOk);
      cancel.removeEventListener('click', onCancel);
      dialog.removeEventListener('close', onClose);
      if (dialog.open) dialog.close();
      resolve(value);
    };
    const onOk = () => finish(true);
    const onCancel = () => finish(false);
    const onClose = () => finish(false);
    check.addEventListener('change', onCheck);
    ok.addEventListener('click', onOk);
    cancel.addEventListener('click', onCancel);
    dialog.addEventListener('close', onClose);
    dialog.showModal();
    (requireCheck ? check : cancel).focus();
  });
}
