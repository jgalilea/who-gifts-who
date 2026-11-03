// Delivery helpers: secret link URLs, WhatsApp, Web Share API, clipboard and downloads.

/** Absolute URL of the reveal page with the encrypted token in the fragment. */
export function revealUrl(token) {
  const url = new URL('reveal.html', document.baseURI);
  url.hash = token;
  return url.href;
}

/** wa.me link; with a phone (international digits) it opens that chat directly. */
export function whatsappUrl(text, phone = null) {
  return `https://wa.me/${phone || ''}?text=${encodeURIComponent(text)}`;
}

export function canWebShare() {
  return typeof navigator.share === 'function';
}

/** Returns true when shared, false when the user cancelled. */
export async function webShare(data) {
  try {
    await navigator.share(data);
    return true;
  } catch (error) {
    if (error && error.name === 'AbortError') return false;
    throw error;
  }
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers / insecure contexts.
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.append(area);
    area.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    area.remove();
    return ok;
  }
}

export function downloadFile(filename, content, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
