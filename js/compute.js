// Runs heavy tasks in Web Workers, one worker per "channel".
// A new request on a channel cancels the previous one (the worker is terminated and
// replaced), so only the latest probabilities/count are ever computed.
// Browsers without module workers fall back to running the task on the main thread.
import { runComputeTask } from './compute-tasks.js';

// Carry this module's "?v=" (see scripts/update-version.mjs) so the worker is refreshed too.
const WORKER_URL = new URL(`./workers/compute-worker.js${new URL(import.meta.url).search}`, import.meta.url);
let workersSupported = typeof Worker === 'function';
const channels = new Map(); // name → { worker, pending: { id, resolve, reject } | null }
let nextId = 1;

export class CancelledError extends Error {
  constructor() {
    super('cancelled');
    this.name = 'CancelledError';
  }
}

const runLocally = (type, payload) =>
  new Promise((resolve, reject) => {
    // Yield first so the UI can paint "Calculating…" before blocking.
    setTimeout(() => {
      try {
        resolve(runComputeTask(type, payload));
      } catch (error) {
        reject(error);
      }
    }, 0);
  });

function createWorker(name) {
  const worker = new Worker(WORKER_URL, { type: 'module', name: `wgw-${name}` });
  const channel = { worker, pending: null };
  worker.addEventListener('message', ({ data }) => {
    const job = channel.pending;
    if (!job || job.id !== data.id) return;
    channel.pending = null;
    if ('error' in data) job.reject(new Error(data.error));
    else job.resolve(data.result);
  });
  worker.addEventListener('error', (event) => {
    // Module workers unsupported (or failed to load): switch to main-thread mode for good.
    event.preventDefault();
    workersSupported = false;
    worker.terminate();
    channels.delete(name);
    const job = channel.pending;
    channel.pending = null;
    if (job) runLocally(job.type, job.payload).then(job.resolve, job.reject);
  });
  channels.set(name, channel);
  return channel;
}

/**
 * Runs `type` with `payload` on channel `name`. Rejects with CancelledError when a newer
 * request on the same channel supersedes it.
 */
export function runTask(name, type, payload) {
  if (!workersSupported) return runLocally(type, payload);
  let channel = channels.get(name);
  if (channel?.pending) {
    channel.pending.reject(new CancelledError());
    channel.worker.terminate();
    channels.delete(name);
    channel = null;
  }
  try {
    channel = channel || createWorker(name);
  } catch {
    workersSupported = false;
    return runLocally(type, payload);
  }
  return new Promise((resolve, reject) => {
    const id = nextId++;
    channel.pending = { id, type, payload, resolve, reject };
    channel.worker.postMessage({ id, type, payload });
  });
}
