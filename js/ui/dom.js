// Small DOM helpers shared by the views.

export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

/**
 * h('button', { class: 'btn', onclick: fn, 'aria-label': 'x' }, 'text', childNode)
 * Strings become text nodes (never parsed as HTML). null/false children are skipped.
 */
export function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(props || {})) {
    if (value === null || value === undefined || value === false) continue;
    if (key.startsWith('on') && typeof value === 'function') el.addEventListener(key.slice(2), value);
    else if (key === 'class') el.className = value;
    else if (key === 'style' && typeof value === 'object') {
      for (const [prop, v] of Object.entries(value)) {
        if (prop.startsWith('--')) el.style.setProperty(prop, v);
        else el.style[prop] = v;
      }
    }
    else if (key in el && typeof value !== 'string') el[key] = value;
    else el.setAttribute(key, value === true ? '' : value);
  }
  if (tag === 'input' || tag === 'textarea' || tag === 'form') {
    for (const [key, value] of Object.entries(NO_AUTOFILL)) if (!el.hasAttribute(key)) el.setAttribute(key, value);
  }
  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false) continue;
    el.append(child instanceof Node ? child : String(child));
  }
  return el;
}

// Attributes that stop browser autofill, autocomplete history, password-manager
// overlays and keyboard suggestions on free-text fields.
const NO_AUTOFILL = {
  autocomplete: 'off',
  autocorrect: 'off',
  spellcheck: 'false',
  'data-lpignore': 'true', // LastPass
  'data-1p-ignore': 'true', // 1Password
  'data-bwignore': 'true', // Bitwarden
  'data-form-type': 'other', // Dashlane
};

/** Applies NO_AUTOFILL to every text field (and form) inside `root`. */
export function disableAutofill(root = document) {
  const fields = root.querySelectorAll('form, input:not([type="checkbox"]):not([type="radio"]):not([type="file"]), textarea');
  for (const el of fields) {
    for (const [key, value] of Object.entries(NO_AUTOFILL)) el.setAttribute(key, value);
  }
}

/** Decorative emoji, hidden from screen readers (the text label carries the meaning). */
export const icon = (emoji) => h('span', { class: 'icon', 'aria-hidden': 'true' }, emoji);

/**
 * Shrinks the font of a single-line element until its text fits (down to minPx).
 * The element keeps a fixed line box, so this never changes the layout height.
 */
export function fitText(el, minPx = 16) {
  el.style.fontSize = '';
  let size = parseFloat(getComputedStyle(el).fontSize);
  while (el.scrollWidth > el.clientWidth + 1 && size > minPx) {
    size -= 1;
    el.style.fontSize = `${size}px`;
  }
}

/** Replaces all children of `el`. */
export function setChildren(el, ...children) {
  el.replaceChildren(...children.flat().filter((c) => c !== null && c !== undefined && c !== false));
}

/** Fills a <select> keeping the current value when it still exists. */
export function fillSelect(select, options, placeholder) {
  const previous = select.value;
  setChildren(
    select,
    placeholder !== undefined ? h('option', { value: '' }, placeholder) : null,
    options.map((o) => h('option', { value: o.value }, o.label)),
  );
  if (options.some((o) => o.value === previous)) select.value = previous;
}

export function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
