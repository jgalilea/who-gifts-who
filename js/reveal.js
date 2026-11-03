// Reveal page: decrypts the token in the URL fragment and shows the result on demand.
import { decryptPayload } from './core/crypto.js';
import { eventFromPayload } from './core/event.js';
import { applyTranslations, detectLanguage, setLanguage, getLanguage, isSupported, t, formatEventDate } from './i18n/index.js';
import { STORAGE_KEYS, loadString } from './storage.js';
import { $, $$, h, setChildren } from './ui/dom.js';

const reducedMotion = () => globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
let payload = null;

/** Event name, date, budget and draw code, below the result. */
function renderDetails() {
  const el = $('#reveal-details');
  if (!payload) return;
  const event = eventFromPayload(payload.e);
  const rows = [];
  if (event.name) rows.push([t('reveal.event'), event.name]);
  if (event.date) rows.push([t('reveal.date'), formatEventDate(event.date)]);
  if (event.budget) rows.push([t('reveal.budget'), event.budget]);
  if (payload.c) rows.push([t('reveal.code'), `#${payload.c}`]);
  setChildren(el, rows.map(([term, value]) => h('div', { class: 'detail' }, h('dt', {}, term), h('dd', {}, value))));
  el.hidden = rows.length === 0;
}

function syncLanguage() {
  applyTranslations();
  $$('.lang-btn').forEach((btn) => btn.setAttribute('aria-pressed', String(btn.dataset.lang === getLanguage())));
  renderDetails();
}

async function init() {
  setLanguage(detectLanguage(loadString(STORAGE_KEYS.lang)));
  syncLanguage();
  $$('.lang-btn').forEach((btn) =>
    btn.addEventListener('click', () => {
      setLanguage(btn.dataset.lang);
      syncLanguage();
    }),
  );

  try {
    const token = location.hash.slice(1);
    if (!token) throw new Error('INVALID_TOKEN');
    payload = await decryptPayload(token);
    if (typeof payload?.g !== 'string' || typeof payload?.r !== 'string') throw new Error('INVALID_TOKEN');
  } catch {
    payload = null;
    $('#reveal-ready').hidden = true;
    $('#reveal-error').hidden = false;
    return;
  }

  // The link carries the organizer's language unless the visitor chose one before.
  if (!isSupported(loadString(STORAGE_KEYS.lang)) && isSupported(payload.l)) setLanguage(payload.l);
  syncLanguage();

  $('#giver-name').textContent = payload.g;
  const button = $('#reveal-btn');
  button.disabled = false;
  button.addEventListener('click', () => {
    button.disabled = true;
    const gift = $('#gift');
    gift.classList.add('opening');
    setTimeout(
      () => {
        gift.classList.add('opened');
        $('#receiver-name').textContent = payload.r;
        $('#reveal-before').classList.add('is-hidden');
        $('#reveal-before').setAttribute('aria-hidden', 'true');
        $('#reveal-result').classList.remove('is-hidden');
        $('#receiver-name').focus();
      },
      reducedMotion() ? 0 : 1500,
    );
  });
}

init();
