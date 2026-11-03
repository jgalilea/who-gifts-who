// Shared "how many valid combinations?" result, computed once per configuration in the
// background and read by the rules status, the action bar and the pre-draw summary.
import { runTask, CancelledError } from '../compute.js';

export function createCountService() {
  let current = { signature: null, result: null, done: false };
  const listeners = new Set();

  return {
    /** Starts counting for this configuration (no-op if already requested). */
    request(derived) {
      if (!derived.feasibility.ok || current.signature === derived.signature) return;
      current = { signature: derived.signature, result: null, done: false };
      runTask('count', 'count', { allowed: derived.allowed })
        .then((result) => {
          if (current.signature !== derived.signature) return;
          current = { ...current, result, done: true };
          listeners.forEach((fn) => fn());
        })
        .catch((error) => {
          if (!(error instanceof CancelledError)) console.error(error);
        });
    },
    /** { total, log10Total, countIsExact } for this configuration, or null (pending / above 20 people). */
    get(signature) {
      return current.signature === signature ? current.result : null;
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}
