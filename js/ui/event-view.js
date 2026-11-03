// Event section: optional name, date and budget shown in messages and on reveal pages.
import { $ } from './dom.js';
import { t, formatEventDate } from '../i18n/index.js';
import { isEventEmpty } from '../core/event.js';

export function createEventView({ store }) {
  const fields = { name: $('#event-name'), date: $('#event-date'), budget: $('#event-budget') };

  for (const [key, input] of Object.entries(fields)) {
    // Text fields save while typing; the date picker fires "change".
    input.addEventListener(key === 'date' ? 'change' : 'input', () => store.actions.setEvent({ [key]: input.value }));
  }

  function render(state) {
    const { event } = state;
    for (const [key, input] of Object.entries(fields)) {
      // Never overwrite the field being typed in (sanitising trims trailing spaces).
      if (document.activeElement !== input && input.value !== event[key]) input.value = event[key];
    }
    const summary = [event.name, event.date && formatEventDate(event.date), event.budget].filter(Boolean).join(' · ');
    $('#event-badge').textContent = isEventEmpty(event) ? t('event.badgeEmpty') : summary;
  }

  return { render };
}
