// localStorage wrapper. Every access is guarded: private mode or blocked storage must not break the app.

export const STORAGE_KEYS = Object.freeze({
  draft: 'wgw:draft:v1',
  draw: 'wgw:draw:v1',
  lang: 'wgw:lang',
  collapsed: 'wgw:collapsed',
});

export function loadJSON(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveJSON(key, value) {
  try {
    if (value === null || value === undefined) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function loadString(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function saveString(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}
