// Encrypted secret links. The result is AES-GCM encrypted with a random per-link key and
// stored in the URL fragment (#…), which browsers never send to the server.
// Token layout (base64url): [version:1][key:16][iv:12][ciphertext+tag]
// Note: the key travels inside the link, so the link itself is the secret. This hides the
// result from anyone looking at the URL, but anyone who opens the link can read it.

const TOKEN_VERSION = 1;
const KEY_BYTES = 16;
const IV_BYTES = 12;
const PAD_BLOCK = 64; // pads plaintext so the link length does not leak name lengths

export function base64UrlEncode(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function base64UrlDecode(text) {
  const normalized = String(text).replace(/-/g, '+').replace(/_/g, '/');
  if (!/^[A-Za-z0-9+/]*$/.test(normalized)) throw new Error('INVALID_TOKEN');
  const binary = atob(normalized + '='.repeat((4 - (normalized.length % 4)) % 4));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** Encrypts a JSON-serialisable object into a URL-safe token. */
export async function encryptPayload(data) {
  const { subtle } = globalThis.crypto;
  const keyBytes = globalThis.crypto.getRandomValues(new Uint8Array(KEY_BYTES));
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const key = await subtle.importKey('raw', keyBytes, 'AES-GCM', false, ['encrypt']);

  const json = JSON.stringify(data);
  const raw = new TextEncoder().encode(json);
  const padded = new Uint8Array(Math.ceil((raw.length + 1) / PAD_BLOCK) * PAD_BLOCK).fill(0x20); // spaces
  padded.set(raw);

  const cipher = new Uint8Array(await subtle.encrypt({ name: 'AES-GCM', iv }, key, padded));
  const token = new Uint8Array(1 + KEY_BYTES + IV_BYTES + cipher.length);
  token[0] = TOKEN_VERSION;
  token.set(keyBytes, 1);
  token.set(iv, 1 + KEY_BYTES);
  token.set(cipher, 1 + KEY_BYTES + IV_BYTES);
  return base64UrlEncode(token);
}

/** Decrypts a token produced by encryptPayload. Throws Error('INVALID_TOKEN') on failure. */
export async function decryptPayload(token) {
  try {
    const bytes = base64UrlDecode(token);
    if (bytes[0] !== TOKEN_VERSION || bytes.length < 1 + KEY_BYTES + IV_BYTES + 16) throw new Error();
    const { subtle } = globalThis.crypto;
    const key = await subtle.importKey('raw', bytes.slice(1, 1 + KEY_BYTES), 'AES-GCM', false, ['decrypt']);
    const iv = bytes.slice(1 + KEY_BYTES, 1 + KEY_BYTES + IV_BYTES);
    const plain = await subtle.decrypt({ name: 'AES-GCM', iv }, key, bytes.slice(1 + KEY_BYTES + IV_BYTES));
    return JSON.parse(new TextDecoder().decode(plain));
  } catch {
    throw new Error('INVALID_TOKEN');
  }
}
