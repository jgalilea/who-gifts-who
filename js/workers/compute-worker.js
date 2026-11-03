// Background thread for the heavy maths, so typing and scrolling never stutter.
// Message in:  { id, type, payload }   Message out: { id, result } | { id, error }
import { runComputeTask } from '../compute-tasks.js';

self.addEventListener('message', ({ data }) => {
  const { id, type, payload } = data;
  try {
    self.postMessage({ id, result: runComputeTask(type, payload) });
  } catch (error) {
    self.postMessage({ id, error: error.message });
  }
});
