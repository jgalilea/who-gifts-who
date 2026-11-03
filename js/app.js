// Entry point of the organizer page: wires the store, derived data and views together.
// To add a feature, create a view in js/ui/ with a render(state, derived) method and
// register it in `views` below.
import { createAppState } from './state.js';
import { buildAllowed, configSignature } from './core/rules.js';
import { checkFeasibility } from './core/feasibility.js';
import { applyTranslations, detectLanguage, setLanguage, getLanguage } from './i18n/index.js';
import { STORAGE_KEYS, loadString, saveString } from './storage.js';
import { $$ } from './ui/dom.js';
import { createEventView } from './ui/event-view.js';
import { createParticipantsView } from './ui/participants-view.js';
import { createImportView } from './ui/import-view.js';
import { createRulesView } from './ui/rules-view.js';
import { createProbabilitiesView } from './ui/probabilities-view.js';
import { createDrawView } from './ui/draw-view.js';
import { createInPersonView } from './ui/inperson-view.js';
import { initSections } from './ui/sections.js';
import { createHistoryView } from './ui/history-view.js';
import { createHelpView } from './ui/help-view.js';

/** Data derived from participants + rules, shared by every view. */
function derive({ participants, rules }) {
  const allowed = buildAllowed(participants, rules);
  return { allowed, feasibility: checkFeasibility(participants, rules, allowed), signature: configSignature(participants, rules) };
}

function init() {
  setLanguage(detectLanguage(loadString(STORAGE_KEYS.lang)));
  const store = createAppState();
  const sections = initSections();

  const importView = createImportView({ store });
  const inPersonView = createInPersonView();
  const rulesView = createRulesView({ store });
  const views = [
    createEventView({ store }),
    createParticipantsView({ store, openImport: importView.open }),
    rulesView,
    createProbabilitiesView({ store }),
    createDrawView({ store, openInPerson: inPersonView.open, reasonText: rulesView.reasonText, sections }),
    importView,
    createHistoryView({ store }),
    createHelpView(),
  ];

  let derived = null;
  let derivedFor = null;
  function render(state) {
    if (!derived || derivedFor.participants !== state.participants || derivedFor.rules !== state.rules) {
      derived = derive(state);
      derivedFor = state;
    }
    for (const view of views) view.render(state, derived);
  }

  function renderLanguage() {
    applyTranslations();
    $$('.lang-btn').forEach((btn) => btn.setAttribute('aria-pressed', String(btn.dataset.lang === getLanguage())));
    render(store.getState());
  }

  $$('.lang-btn').forEach((btn) =>
    btn.addEventListener('click', () => {
      setLanguage(btn.dataset.lang);
      saveString(STORAGE_KEYS.lang, getLanguage());
      renderLanguage();
    }),
  );

  store.subscribe(render);
  renderLanguage();
}

init();
