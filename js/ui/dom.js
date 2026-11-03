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
  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false) continue;
    el.append(child instanceof Node ? child : String(child));
  }
  return el;
}

/** Decorative emoji, hidden from screen readers (the text label carries the meaning). */
export const icon = (emoji) => h('span', { class: 'icon', 'aria-hidden': 'true' }, emoji);

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
