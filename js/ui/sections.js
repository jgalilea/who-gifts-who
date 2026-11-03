// Collapsible sections. Each .section-toggle controls the element named in aria-controls.
// Which sections are collapsed is a per-device convenience stored in localStorage.
import { $, $$ } from './dom.js';
import { STORAGE_KEYS, loadJSON, saveJSON } from '../storage.js';

export function initSections() {
  const collapsed = new Set(loadJSON(STORAGE_KEYS.collapsed, []));
  const toggles = $$('.section-toggle');

  const apply = (toggle, isCollapsed) => {
    const body = $(`#${toggle.getAttribute('aria-controls')}`);
    toggle.setAttribute('aria-expanded', String(!isCollapsed));
    body.hidden = isCollapsed;
    toggle.closest('.card')?.classList.toggle('collapsed', isCollapsed);
  };

  for (const toggle of toggles) {
    const id = toggle.getAttribute('aria-controls');
    apply(toggle, collapsed.has(id));
    toggle.addEventListener('click', () => {
      const isCollapsed = toggle.getAttribute('aria-expanded') === 'true';
      apply(toggle, isCollapsed);
      if (isCollapsed) collapsed.add(id);
      else collapsed.delete(id);
      saveJSON(STORAGE_KEYS.collapsed, [...collapsed]);
    });
  }

  return {
    /** Expands a section (e.g. before scrolling to it). */
    expand(bodyId) {
      const toggle = toggles.find((el) => el.getAttribute('aria-controls') === bodyId);
      if (toggle && toggle.getAttribute('aria-expanded') === 'false') toggle.click();
    },
  };
}
