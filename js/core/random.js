// Cryptographically secure random helpers (crypto.getRandomValues, never Math.random).
// Every function that needs randomness accepts an `rng` object with the shape
// { float(): number in [0, 1), int(n): integer in [0, n) } so tests can inject their own.

const BUFFER_SIZE = 1024;
const buffer = new Uint32Array(BUFFER_SIZE);
let index = BUFFER_SIZE;

export function randomUint32() {
  if (index >= BUFFER_SIZE) {
    globalThis.crypto.getRandomValues(buffer);
    index = 0;
  }
  return buffer[index++];
}

/** Uniform float in [0, 1) with 53 bits of precision. */
export function randomFloat() {
  const hi = randomUint32() >>> 5; // 27 bits
  const lo = randomUint32() >>> 6; // 26 bits
  return (hi * 67108864 + lo) / 9007199254740992;
}

/** Unbiased integer in [0, n) using rejection to avoid modulo bias. */
export function randomInt(n) {
  if (!(n >= 1) || n > 4294967296) throw new RangeError(`randomInt: invalid bound ${n}`);
  const limit = Math.floor(4294967296 / n) * n;
  let x;
  do {
    x = randomUint32();
  } while (x >= limit);
  return x % n;
}

export const cryptoRng = Object.freeze({ float: randomFloat, int: randomInt });

export function randomHex(bytes = 8) {
  const arr = globalThis.crypto.getRandomValues(new Uint8Array(bytes));
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
}
