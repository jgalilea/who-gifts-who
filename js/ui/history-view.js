// Previous draws: export the current draw (or all draws) and import past draws, so their
// pairings are not repeated. Imports accept a draws/config JSON file, pasted secret links
// (decrypted locally) or pairs typed by hand ("Ana > Luis").
import { $, h, setChildren, debounce } from './dom.js';
import { t } from '../i18n/index.js';
import { decryptPayload } from '../core/crypto.js';
import { nameKey } from '../core/participants.js';
import {
  entriesFromJson,
  entriesFromPayloads,
  entryFromDraw,
  exportDraws,
  extractTokens,
  isSameDraw,
  mergeHistory,
  parsePairsText,
  sanitizeEntry,
} from '../core/history.js';
import { downloadFile } from './share.js';
import { toast } from './feedback.js';

/** Human name for a draw: «Navidad 2025» (#DCQ6), #DCQ6, or a generic label. */
export function drawName(entry) {
  if (entry.label && entry.code) return `«${entry.label}» · #${entry.code}`;
  if (entry.label) return `«${entry.label}»`;
  if (entry.code) return `#${entry.code}`;
  return t('history.unnamed');
}

async function buildImport(text, filename, label) {
  const trimmed = text.trim();
  if (!trimmed) return null;
  if (/\.json$/i.test(filename) || /^[[{]/.test(trimmed)) {
    let data;
    try {
      data = JSON.parse(trimmed.replace(/^﻿/, ''));
    } catch (error) {
      return { fatal: t('import.invalidJson', { detail: error.message }) };
    }
    const entries = entriesFromJson(data);
    return entries.length ? { entries, invalidLines: [], badLinks: 0 } : { fatal: t('history.noDrawsInFile') };
  }
  const payloads = [];
  let badLinks = 0;
  for (const token of extractTokens(text)) {
    try {
      const p = await decryptPayload(token);
      if (typeof p?.g === 'string' && typeof p?.r === 'string') payloads.push(p);
      else badLinks++;
    } catch {
      badLinks++;
    }
  }
  const { pairs, invalidLines } = parsePairsText(text);
  const manual = pairs.length ? sanitizeEntry({ label, pairs }) : null;
  const entries = [...entriesFromPayloads(payloads), manual].filter(Boolean);
  return { entries, invalidLines, badLinks };
}

export function createHistoryView({ store }) {
  const importDialog = $('#history-import-dialog');
  const textArea = $('#history-text');
  const labelInput = $('#history-label');
  const fileInput = $('#history-file');
  const previewEl = $('#history-preview');
  const confirmBtn = $('#history-import-confirm');
  let filename = '';
  let result = null;
  let seq = 0;

  const isNew = (entry) => !store.getState().rules.previousDraws.some((e) => isSameDraw(e, entry));

  async function update() {
    const current = ++seq;
    const built = await buildImport(textArea.value, filename, labelInput.value);
    if (current !== seq) return; // a newer edit arrived while decrypting
    result = built;
    renderPreview();
  }
  const debouncedUpdate = debounce(update, 250);

  function renderPreview() {
    const fresh = result?.entries?.filter(isNew) || [];
    confirmBtn.disabled = fresh.length === 0;
    $('#history-import-label').textContent = t('history.importConfirm', { count: fresh.length });
    if (!result) return setChildren(previewEl);
    if (result.fatal) return setChildren(previewEl, h('p', { class: 'status status-error' }, result.fatal));

    const names = new Set(store.getState().participants.map((p) => nameKey(p.name)));
    const issues = [
      ...result.invalidLines.map((line) => t('history.invalidLine', { line })),
      result.badLinks ? t('history.badLinks', { count: result.badLinks }) : null,
    ].filter(Boolean);
    setChildren(
      previewEl,
      h('p', { class: `status ${fresh.length ? 'status-ok' : 'status-warn'}` },
        result.entries.length ? t('history.found', { count: result.entries.length }) : t('history.nothingFound')),
      result.entries.length
        ? h('ul', { class: 'history-preview-list' }, result.entries.map((entry) => {
            const unknown = entry.pairs.filter((p) => !names.has(nameKey(p.from)) || !names.has(nameKey(p.to))).length;
            return h('li', {},
              h('strong', {}, drawName(entry)), ' · ', t('history.pairs', { count: entry.pairs.length }),
              !isNew(entry) ? h('span', { class: 'chip chip-muted' }, t('history.alreadyImported')) : null,
              unknown ? h('span', { class: 'hint history-unknown' }, t('history.unknownNames', { count: unknown })) : null);
          }))
        : null,
      issues.length ? h('ul', { class: 'issue-list' }, issues.map((text) => h('li', {}, text))) : null,
    );
  }

  textArea.addEventListener('input', debouncedUpdate);
  labelInput.addEventListener('input', debouncedUpdate);
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    if (!file) return;
    filename = file.name;
    $('#history-file-name').textContent = file.name;
    textArea.value = await file.text();
    update();
  });
  $('#history-import-cancel').addEventListener('click', () => importDialog.close());
  confirmBtn.addEventListener('click', () => {
    const fresh = result?.entries?.filter(isNew) || [];
    if (!fresh.length) return;
    importDialog.close();
    const { added } = store.actions.addPreviousDraws(fresh);
    toast(t('history.imported', { count: added }));
  });

  function openImport() {
    filename = '';
    result = null;
    fileInput.value = '';
    textArea.value = '';
    labelInput.value = '';
    $('#history-file-name').textContent = '';
    renderPreview();
    importDialog.showModal();
    textArea.focus();
  }

  // ----- Export -----
  const exportDialog = $('#history-export-dialog');
  const optCurrent = $('#history-export-current');
  const optAll = $('#history-export-all');

  function openExport(prefer = 'current') {
    const { draw, rules } = store.getState();
    const previous = rules.previousDraws.length;
    optCurrent.disabled = !draw;
    optAll.disabled = !draw && !previous;
    $('#history-export-current-label').textContent = draw ? t('history.exportCurrent', { code: draw.code ? `#${draw.code}` : '' }) : t('history.exportCurrentNone');
    $('#history-export-all-label').textContent = draw
      ? t('history.exportAll', { count: previous + 1 })
      : t('history.exportAllPrevious', { count: previous });
    (prefer === 'current' && draw ? optCurrent : optAll).checked = true;
    $('#history-export-confirm').disabled = optAll.disabled;
    exportDialog.showModal();
  }

  $('#history-export-cancel').addEventListener('click', () => exportDialog.close());
  $('#history-export-confirm').addEventListener('click', () => {
    const { draw, rules } = store.getState();
    const current = draw ? entryFromDraw(draw) : null;
    const onlyCurrent = optCurrent.checked && current;
    const entries = onlyCurrent ? [current] : mergeHistory(current ? [current] : [], rules.previousDraws).history;
    const date = new Date().toISOString().slice(0, 10);
    const name = onlyCurrent ? `who-gifts-who-draw-${current.code || date}.json` : `who-gifts-who-draws-${date}.json`;
    downloadFile(name, JSON.stringify(exportDraws(entries), null, 2));
    exportDialog.close();
    toast(t('history.exported', { count: entries.length }));
  });

  $('#import-history').addEventListener('click', openImport);
  $('#export-history').addEventListener('click', () => openExport('all'));
  $('#export-draw').addEventListener('click', () => openExport('current'));

  function render(state) {
    $('#export-history').disabled = !state.draw && !state.rules.previousDraws.length;
    if (importDialog.open) renderPreview();
  }

  return { render };
}
