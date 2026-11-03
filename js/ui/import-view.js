// Import dialog: file or pasted text → preview with warnings → confirm.
import { $, h, setChildren, debounce } from './dom.js';
import { t } from '../i18n/index.js';
import { parseImport, previewImport } from '../core/importer.js';
import { toast } from './feedback.js';

export function createImportView({ store }) {
  const dialog = $('#import-dialog');
  const fileInput = $('#import-file');
  const textArea = $('#import-text');
  const previewEl = $('#import-preview');
  const confirmBtn = $('#import-confirm');
  let filename = '';
  let preview = null;

  const mode = () => $('input[name="import-mode"]:checked').value;

  function update() {
    const text = textArea.value;
    if (!text.trim()) {
      preview = null;
      setChildren(previewEl);
      confirmBtn.disabled = true;
      confirmBtn.textContent = t('import.confirm', { count: 0 });
      return;
    }
    preview = previewImport(parseImport(text, filename), store.getState().participants, mode());
    renderPreview();
  }

  function rowIssue(row) {
    switch (row.status) {
      case 'empty': return t('import.issueEmpty', { line: row.line });
      case 'duplicate': return t('import.issueDuplicate', { line: row.line, name: row.name });
      case 'exists': return t('import.issueExists', { line: row.line, name: row.name });
      case 'tooLong': return t('import.issueTooLong', { line: row.line });
      default: return t('import.issueInvalid', { line: row.line });
    }
  }

  function renderPreview() {
    confirmBtn.textContent = t('import.confirm', { count: preview.summary.ok });
    if (preview.fatal) {
      confirmBtn.disabled = true;
      setChildren(previewEl, h('p', { class: 'status status-error' }, t(`import.${preview.fatal.code}`, preview.fatal.params)));
      return;
    }
    const ok = preview.rows.filter((r) => r.status === 'ok');
    const issues = preview.rows.filter((r) => r.status !== 'ok');
    const extras = [];
    if (preview.exclusions.length) extras.push(t('import.extraExclusions', { count: preview.exclusions.length }));
    if (preview.settings && preview.mode === 'replace' && preview.settings.excludeFamily) extras.push(t('import.extraFamily'));
    if (preview.settings && preview.mode === 'add') extras.push(t('import.settingsIgnored'));
    confirmBtn.disabled = ok.length === 0;

    setChildren(
      previewEl,
      h('p', { class: `status ${ok.length ? 'status-ok' : 'status-warn'}` }, t('import.summary', { ok: ok.length, skipped: issues.length })),
      issues.length ? h('ul', { class: 'issue-list' }, issues.map((r) => h('li', {}, rowIssue(r)))) : null,
      extras.map((text) => h('p', { class: 'hint' }, text)),
      ok.length
        ? h(
            'div',
            { class: 'preview-table-wrap' },
            h(
              'table',
              { class: 'preview-table' },
              h('caption', { class: 'visually-hidden' }, t('import.previewCaption')),
              h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, t('participants.name')), h('th', { scope: 'col' }, t('participants.group')))),
              h('tbody', {}, ok.map((r) => h('tr', {}, h('td', {}, r.name), h('td', {}, r.group || '—')))),
            ),
          )
        : null,
    );
  }

  const debouncedUpdate = debounce(update, 200);
  textArea.addEventListener('input', debouncedUpdate);
  dialog.querySelectorAll('input[name="import-mode"]').forEach((r) => r.addEventListener('change', update));

  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    if (!file) return;
    filename = file.name;
    $('#import-file-name').textContent = file.name;
    textArea.value = await file.text();
    update();
  });

  $('#import-cancel').addEventListener('click', () => dialog.close());
  confirmBtn.addEventListener('click', () => {
    if (!preview || preview.fatal || !preview.summary.ok) return;
    const { ok } = preview.summary;
    dialog.close(); // close first so the re-render does not recompute the preview
    store.actions.importPreview(preview);
    toast(t('import.done', { count: ok }));
  });

  function open() {
    filename = '';
    preview = null;
    fileInput.value = '';
    textArea.value = '';
    $('#import-file-name').textContent = '';
    dialog.querySelector('input[name="import-mode"][value="add"]').checked = true;
    update();
    dialog.showModal();
    textArea.focus();
  }

  return { open, render: () => dialog.open && update() };
}
