// Help dialog: explains every part of the app. Each topic is a collapsible block so the
// guide stays scannable on a phone. Texts live in the i18n dictionaries (help.<topic>.*).
import { $, h, setChildren } from './dom.js';
import { t } from '../i18n/index.js';

const TOPICS = ['start', 'participants', 'rules', 'previous', 'draw', 'event', 'links', 'inperson', 'code', 'organizer', 'probabilities', 'nextYear', 'privacy'];

export function createHelpView() {
  const dialog = $('#help-dialog');
  const body = $('#help-body');

  function renderTopics() {
    setChildren(
      body,
      TOPICS.map((topic, i) => {
        const content = h('div', { class: 'help-content' });
        content.innerHTML = t(`help.${topic}.body`); // trusted: our own dictionaries
        return h('details', { class: 'help-topic', open: i === 0 }, h('summary', {}, t(`help.${topic}.title`)), content);
      }),
    );
  }

  $('#open-help').addEventListener('click', () => {
    renderTopics();
    dialog.showModal();
    $('#help-close').focus();
  });
  $('#help-close').addEventListener('click', () => dialog.close());
  // Click on the backdrop closes it too.
  dialog.addEventListener('click', (event) => event.target === dialog && dialog.close());

  return { render: () => dialog.open && renderTopics() };
}
