// Event section: optional name, date and budget shown in messages and on reveal pages.
import { $, fillSelect } from './dom.js';
import { t, formatEventDate } from '../i18n/index.js';
import { isEventEmpty, CURRENCIES, cleanAmount, formatBudget, parseBudget } from '../core/event.js';

export function createEventView({ store }) {
  const nameInput = $('#event-name');
  const dateInput = $('#event-date');
  const amountInput = $('#event-budget');
  const currencySelect = $('#event-currency');
  fillSelect(currencySelect, CURRENCIES.map((c) => ({ value: c, label: c })));

  nameInput.addEventListener('input', () => store.actions.setEvent({ name: nameInput.value }));
  dateInput.addEventListener('change', () => store.actions.setEvent({ date: dateInput.value }));

  const saveBudget = () => store.actions.setEvent({ budget: formatBudget(amountInput.value, currencySelect.value) });
  amountInput.addEventListener('input', () => {
    // Only digits and decimal separators: anything else is dropped as you type or paste.
    const clean = cleanAmount(amountInput.value);
    if (clean !== amountInput.value) {
      const caret = Math.max(0, (amountInput.selectionStart ?? clean.length) - (amountInput.value.length - clean.length));
      amountInput.value = clean;
      amountInput.setSelectionRange(caret, caret);
    }
    saveBudget();
  });
  currencySelect.addEventListener('change', saveBudget);

  function render(state) {
    const { event } = state;
    // Never overwrite the field being typed in (sanitising trims trailing spaces).
    if (document.activeElement !== nameInput && nameInput.value !== event.name) nameInput.value = event.name;
    if (document.activeElement !== dateInput && dateInput.value !== event.date) dateInput.value = event.date;
    if (document.activeElement !== amountInput) {
      const { amount, currency } = parseBudget(event.budget);
      amountInput.value = amount;
      if (event.budget) currencySelect.value = currency;
    }
    const summary = [event.name, event.date && formatEventDate(event.date), event.budget].filter(Boolean).join(' · ');
    $('#event-badge').textContent = isEventEmpty(event) ? t('event.badgeEmpty') : summary;
  }

  return { render };
}
