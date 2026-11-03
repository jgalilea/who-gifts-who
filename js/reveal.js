// Reveal page: decrypts the token in the URL fragment and shows the result on demand.
import { decryptPayload } from './core/crypto.js';
import { applyTranslations, detectLanguage, setLanguage, getLanguage, isSupported } from './i18n/index.js';
import { STORAGE_KEYS, loadString } from './storage.js';
import { $, $$ } from './ui/dom.js';

const reducedMotion = () => globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function syncLanguageButtons() {
  applyTranslations();
  $$('.lang-btn').forEach((btn) => btn.setAttribute('aria-pressed', String(btn.dataset.lang === getLanguage())));
}

async function init() {
  setLanguage(detectLanguage(loadString(STORAGE_KEYS.lang)));
  syncLanguageButtons();
  $$('.lang-btn').forEach((btn) =>
    btn.addEventListener('click', () => {
      setLanguage(btn.dataset.lang);
      syncLanguageButtons();
    }),
  );

  const token = location.hash.slice(1);
  let payload;
  try {
    if (!token) throw new Error('INVALID_TOKEN');
    payload = await decryptPayload(token);
    if (typeof payload?.g !== 'string' || typeof payload?.r !== 'string') throw new Error('INVALID_TOKEN');
  } catch {
    $('#reveal-loading').hidden = true;
    $('#reveal-error').hidden = false;
    return;
  }

  // The link carries the organizer's language unless the visitor chose one before.
  if (!isSupported(loadString(STORAGE_KEYS.lang)) && isSupported(payload.l)) {
    setLanguage(payload.l);
    syncLanguageButtons();
  }

  $('#giver-name').textContent = payload.g;
  $('#reveal-loading').hidden = true;
  $('#reveal-ready').hidden = false;

  const button = $('#reveal-btn');
  button.addEventListener('click', () => {
    button.disabled = true;
    const gift = $('#gift');
    gift.classList.add('opening');
    setTimeout(
      () => {
        gift.classList.add('opened');
        button.hidden = true;
        $('#reveal-intro').hidden = true;
        $('#receiver-name').textContent = payload.r;
        $('#reveal-result').hidden = false;
        $('#receiver-name').focus?.();
      },
      reducedMotion() ? 0 : 1100,
    );
  });
}

init();
