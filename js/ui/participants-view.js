// Participants section: add, edit, remove participants; export; clear.
import { $, h, icon, setChildren } from './dom.js';
import { t } from '../i18n/index.js';
import { listGroups } from '../core/participants.js';
import { exportConfig } from '../core/config.js';
import { downloadFile } from './share.js';
import { confirmDialog, toast } from './feedback.js';

export function createParticipantsView({ store, openImport }) {
  const { actions } = store;
  const form = $('#add-participant-form');
  const nameInput = $('#new-name');
  const groupInput = $('#new-group');
  const phoneInput = $('#new-phone');
  const addError = $('#add-error');
  const list = $('#participant-list');
  let editingId = null;

  /** Shows an error code and flags the field it belongs to. */
  const showError = (el, code, fields) => {
    el.textContent = code ? t(`errors.${code}`) : '';
    const target = !code ? null : code.startsWith('phone') ? fields.phone : code.startsWith('group') ? fields.group : fields.name;
    for (const input of Object.values(fields)) input.setAttribute('aria-invalid', String(input === target));
    target?.focus();
  };
  const addFields = { name: nameInput, group: groupInput, phone: phoneInput };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const error = actions.addParticipant({ name: nameInput.value, group: groupInput.value, phone: phoneInput.value });
    showError(addError, error, addFields);
    if (!error) {
      nameInput.value = ''; // keep the group: handy when adding a whole family
      phoneInput.value = '';
      nameInput.focus();
    }
  });
  for (const input of Object.values(addFields)) {
    input.addEventListener('input', () => {
      addError.textContent = '';
      input.setAttribute('aria-invalid', 'false');
    });
  }

  $('#open-import').addEventListener('click', openImport);

  $('#export-config').addEventListener('click', () => {
    const { participants, rules, event } = store.getState();
    const date = new Date().toISOString().slice(0, 10);
    downloadFile(`who-gifts-who-${date}.json`, JSON.stringify(exportConfig(participants, rules, event), null, 2));
    toast(t('export.done'));
  });

  $('#clear-all').addEventListener('click', async () => {
    const ok = await confirmDialog({
      title: t('participants.clearTitle'),
      message: t('participants.clearMessage'),
      confirmLabel: t('participants.clear'),
      danger: true,
    });
    if (ok) actions.clearAll();
  });

  function viewRow(p) {
    return h(
      'li',
      { class: 'participant' },
      h(
        'div',
        { class: 'participant-info' },
        h('span', { class: 'participant-name' }, p.name),
        p.group ? h('span', { class: 'chip' }, p.group) : null,
        p.phone ? h('span', { class: 'participant-phone' }, h('span', { class: 'visually-hidden' }, `${t('participants.phone')}: `), p.phone) : null,
      ),
      h(
        'div',
        { class: 'row-actions' },
        h('button', {
          type: 'button',
          class: 'btn btn-icon',
          'aria-label': t('participants.editLabel', { name: p.name }),
          title: t('common.edit'),
          onclick: () => {
            editingId = p.id;
            render(store.getState());
            $(`#edit-name-${p.id}`)?.focus();
          },
        }, icon('✏️')),
        h('button', {
          type: 'button',
          class: 'btn btn-icon btn-ghost-danger',
          'aria-label': t('participants.removeLabel', { name: p.name }),
          title: t('common.remove'),
          onclick: () => {
            actions.removeParticipant(p.id);
            toast(t('participants.removed', { name: p.name }));
          },
        }, icon('🗑️')),
      ),
    );
  }

  function editRow(p) {
    const nameId = `edit-name-${p.id}`;
    const groupId = `edit-group-${p.id}`;
    const phoneId = `edit-phone-${p.id}`;
    const error = h('p', { class: 'field-error', role: 'alert' });
    const nameField = h('input', { id: nameId, type: 'text', value: p.name, maxlength: 60, required: true, autocomplete: 'off' });
    const groupField = h('input', { id: groupId, type: 'text', value: p.group, maxlength: 60, list: 'group-options', autocomplete: 'off' });
    const phoneField = h('input', { id: phoneId, type: 'tel', inputmode: 'tel', value: p.phone || '', maxlength: 25, autocomplete: 'off', placeholder: t('participants.phonePlaceholder') });
    const fields = { name: nameField, group: groupField, phone: phoneField };
    const cancel = () => {
      editingId = null;
      render(store.getState());
    };
    return h(
      'li',
      { class: 'participant editing' },
      h(
        'form',
        {
          class: 'participant-form',
          novalidate: true,
          onsubmit: (event) => {
            event.preventDefault();
            const code = actions.updateParticipant(p.id, { name: nameField.value, group: groupField.value, phone: phoneField.value });
            if (code) {
              showError(error, code, fields);
              return;
            }
            editingId = null;
            render(store.getState());
          },
          onkeydown: (event) => event.key === 'Escape' && cancel(),
        },
        h('div', { class: 'field' }, h('label', { for: nameId }, t('participants.name')), nameField),
        h('div', { class: 'field' }, h('label', { for: groupId }, t('participants.group')), groupField),
        h('div', { class: 'field' }, h('label', { for: phoneId }, t('participants.phone')), phoneField),
        h('div', { class: 'row-actions' }, h('button', { type: 'submit', class: 'btn btn-primary' }, t('common.save')), h('button', { type: 'button', class: 'btn', onclick: cancel }, t('common.cancel'))),
        error,
      ),
    );
  }

  function render(state) {
    const { participants } = state;
    if (editingId && !participants.some((p) => p.id === editingId)) editingId = null;
    $('#participant-count').textContent = t('participants.count', { count: participants.length });
    $('#participants-empty').hidden = participants.length > 0;
    $('#clear-all').hidden = participants.length === 0;
    $('#export-config').disabled = participants.length === 0;
    setChildren(list, participants.map((p) => (p.id === editingId ? editRow(p) : viewRow(p))));
    setChildren($('#group-options'), listGroups(participants).map((g) => h('option', { value: g })));
  }

  return { render };
}
