// Reveal page: decrypts the token in the URL fragment and shows the result on demand.
import { decryptPayload } from './core/crypto.js';
import { eventFromPayload } from './core/event.js';
import { applyTranslations, detectLanguage, setLanguage, getLanguage, isSupported, t, formatEventDate } from './i18n/index.js';
import { STORAGE_KEYS, loadString } from './storage.js';
import { $, $$, h, fitText } from './ui/dom.js';

const reducedMotion = () => globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
let payload = null;

/** Event name, date, budget and draw code, below the result. The four rows always exist
 *  (also in the skeleton), so the card keeps the same height; missing values show "—". */
function renderDetails() {
  if (!payload) return;
  const event = eventFromPayload(payload.e);
  const values = {
    event: event.name,
    date: event.date && formatEventDate(event.date, { short: true }),
    budget: event.budget,
    code: payload.c && `#${payload.c}`,
  };
  for (const [key, value] of Object.entries(values)) {
    const dd = $(`#detail-${key}`);
    dd.classList.toggle('is-empty', !value);
    dd.title = value || '';
    if (value) dd.textContent = value;
    else dd.replaceChildren(h('span', { 'aria-hidden': 'true' }, '—'), h('span', { class: 'visually-hidden' }, t('reveal.notSet')));
  }
}

function syncLanguage() {
  applyTranslations();
  $$('.lang-btn').forEach((btn) => btn.setAttribute('aria-pressed', String(btn.dataset.lang === getLanguage())));
  renderDetails();
  fitNames();
}

/** Names stay on one fixed-height line: long ones get a smaller font instead of wrapping. */
function fitNames() {
  fitText($('.hello'), 16);
  if ($('#receiver-name').textContent) fitText($('#receiver-name'), 20);
}
addEventListener('resize', fitNames);

async function init() {
  // Language: the visitor's saved choice, else the organizer's (inside the link), else the
  // browser's. Until the link is decrypted only a saved choice is applied, so the page
  // switches language at most once (no text jumping around).
  const saved = loadString(STORAGE_KEYS.lang);
  setLanguage(isSupported(saved) ? saved : document.documentElement.lang);
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
    setLanguage(detectLanguage(saved));
    syncLanguage();
    $('#reveal-ready').hidden = true;
    $('#reveal-error').hidden = false;
    return;
  }

  setLanguage(isSupported(saved) ? saved : isSupported(payload.l) ? payload.l : detectLanguage(null));
  syncLanguage();

  $('#giver-name').textContent = payload.g;
  fitNames();
  const card = $('#reveal-ready');
  card.classList.remove('is-pending');
  card.removeAttribute('aria-busy');
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
        fitNames();
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
