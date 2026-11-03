// Heavy tasks, runnable both in the worker and on the main thread (fallback).
import { analyze, countAssignments } from './core/matching.js';
import { performDraw } from './core/draw.js';

const TASKS = {
  /** Full probabilities: { allowed } → analysis */
  analyze: ({ allowed }) => analyze(allowed),
  /** Number of valid assignments (exact, n ≤ 20): { allowed } → count | null */
  count: ({ allowed }) => countAssignments(allowed),
  /** The draw itself: { participants, rules } → draw */
  draw: ({ participants, rules }) => performDraw(participants, rules),
};

export function runComputeTask(type, payload) {
  const task = TASKS[type];
  if (!task) throw new Error(`Unknown task: ${type}`);
  return task(payload);
}
