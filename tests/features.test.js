import { test } from 'node:test';
import assert from 'node:assert/strict';
import { phoneForWhatsApp, validatePhone } from '../js/core/participants.js';
import { buildAllowed, applicablePairs } from '../js/core/rules.js';
import { entryFromDraw, mergeHistory, parsePairsText, extractTokens, entriesFromPayloads, entriesFromJson, exportDraws } from '../js/core/history.js';
import { encryptPayload, decryptPayload } from '../js/core/crypto.js';
import { performDraw, createDrawCode, CODE_LENGTH } from '../js/core/draw.js';
import { countAssignments, exactAnalysis } from '../js/core/matching.js';
import { eventToPayload, eventFromPayload, sanitizeEvent, isEventEmpty } from '../js/core/event.js';
import { parseImport, previewImport } from '../js/core/importer.js';
import { exportConfig, applyImport } from '../js/core/config.js';
import { createRules } from '../js/core/rules.js';
import { runComputeTask } from '../js/compute-tasks.js';
import { people, rulesWith } from './helpers.js';

test('phones need a country code and are normalised for wa.me', () => {
  assert.equal(phoneForWhatsApp('+34 600 123 456'), '34600123456');
  assert.equal(phoneForWhatsApp('0034-600-123-456'), '34600123456');
  assert.equal(phoneForWhatsApp('(+44) 7700 900123'), '447700900123');
  assert.equal(phoneForWhatsApp('600123456'), null);
  assert.equal(validatePhone(''), null);
  assert.equal(validatePhone('+34 600 123 456'), null);
  assert.equal(validatePhone('600 123 456'), 'phoneNoPrefix');
  assert.equal(validatePhone('+34 abc'), 'phoneInvalid');
  assert.equal(validatePhone('+1 23'), 'phoneInvalid');
});

test('draw codes are short, readable and vary between draws', () => {
  const codes = new Set(Array.from({ length: 50 }, () => createDrawCode()));
  for (const code of codes) assert.match(code, new RegExp(`^[A-HJ-NP-Z2-9]{${CODE_LENGTH}}$`));
  assert.ok(codes.size > 45);
  const ps = people(['Ana', 'Luis', 'Eva']);
  assert.match(performDraw(ps, rulesWith(ps)).code, /^[A-Z2-9]{4}$/);
});

test('previous draws forbid repeating their pairings (stored by name)', () => {
  const ps = people(['Ana', 'Luis', 'Eva', 'Marta', 'Juan', 'Sara']);
  const rules = rulesWith(ps);
  const first = performDraw(ps, rules);
  const entry = entryFromDraw(first);
  assert.equal(entry.pairs.length, ps.length);
  assert.equal(entry.code, first.code);
  const next = { ...rules, previousDraws: [entry] };
  const previous = new Set(first.assignments.map((a) => `${a.giverName}>${a.receiverName}`));
  for (let i = 0; i < 300; i++) {
    for (const a of performDraw(ps, next).assignments) assert.ok(!previous.has(`${a.giverName}>${a.receiverName}`));
  }
  // Pairs with people who are not participants simply do not apply.
  assert.equal(applicablePairs({ pairs: [{ from: 'Ana', to: 'Zoe' }, { from: 'ana', to: 'LUIS' }] }, ps), 1);
});

test('history merges without duplicates (same code, or same pairs without code)', () => {
  const a = { id: '1', code: 'AAAA', label: '', date: '', pairs: [{ from: 'Ana', to: 'Luis' }] };
  const b = { id: '2', code: '', label: 'Manual', date: '', pairs: [{ from: 'Eva', to: 'Ana' }] };
  const { history, added, duplicates } = mergeHistory([a], [a, b, { ...b, id: '3' }]);
  assert.equal(history.length, 2);
  assert.equal(added, 1);
  assert.equal(duplicates, 2);
});

test('pairs typed by hand accept several separators and report bad lines', () => {
  const { pairs, invalidLines } = parsePairsText('regala;recibe\nAna > Luis\nLuis -> Eva\nEva → Marta\nMarta;Ana\nsolo un nombre\nAna > Ana\n# comentario');
  assert.deepEqual(pairs.map((p) => `${p.from}>${p.to}`), ['Ana>Luis', 'Luis>Eva', 'Eva>Marta', 'Marta>Ana']);
  assert.deepEqual(invalidLines, [6, 7]);
});

test('secret links can be turned back into a previous draw', async () => {
  const tokens = await Promise.all([
    encryptPayload({ v: 1, g: 'Ana', r: 'Luis', c: 'K7PQ', e: { n: 'Navidad 2025' } }),
    encryptPayload({ v: 1, g: 'Luis', r: 'Ana', c: 'K7PQ', e: { n: 'Navidad 2025' } }),
  ]);
  const text = tokens.map((tk) => `https://x.github.io/who-gifts-who/reveal.html#${tk}`).join('\n¡Hola!\n');
  const found = extractTokens(text);
  assert.equal(found.length, 2);
  const [entry] = entriesFromPayloads(await Promise.all(found.map(decryptPayload)));
  assert.equal(entry.code, 'K7PQ');
  assert.equal(entry.label, 'Navidad 2025');
  assert.equal(entry.pairs.length, 2);
  assert.deepEqual(parsePairsText(text).pairs, [], 'link lines are not parsed as typed pairs');
});

test('draws files round-trip, and legacy single previousDraw is still read', () => {
  const entry = { id: 'x', code: 'AB12', label: 'Navidad', date: '2025-12-24', pairs: [{ from: 'Ana', to: 'Luis' }] };
  const back = entriesFromJson(JSON.parse(JSON.stringify(exportDraws([entry]))));
  assert.deepEqual(back.map(({ id, ...rest }) => rest), [{ code: 'AB12', label: 'Navidad', date: '2025-12-24', pairs: entry.pairs }]);
  assert.equal(entriesFromJson({ previousDraw: { code: 'OLD1', pairs: [{ from: 'A', to: 'B' }] } }).length, 1);
  assert.equal(entriesFromJson({ participants: [] }).length, 0);
});

test('countAssignments matches the full analysis and is null above the exact limit', () => {
  const ps = people(['A;F', 'B;F', 'C', 'D', 'E']);
  const allowed = buildAllowed(ps, rulesWith(ps, { excludeFamily: true }));
  assert.equal(countAssignments(allowed).total, exactAnalysis(allowed).total);
  const big = people(Array.from({ length: 21 }, (_, i) => `P${i}`));
  assert.equal(countAssignments(buildAllowed(big, rulesWith(big))), null);
});

test('event details are sanitised and survive the compact link payload', () => {
  const event = sanitizeEvent({ name: '  Navidad   2026 ', date: '2026-12-24', budget: ' 30 € ' });
  assert.deepEqual(event, { name: 'Navidad 2026', date: '2026-12-24', budget: '30 €' });
  assert.deepEqual(eventFromPayload(eventToPayload(event)), event);
  assert.equal(eventToPayload(sanitizeEvent({})), undefined);
  assert.equal(sanitizeEvent({ date: '24/12/2026' }).date, '');
  assert.ok(isEventEmpty(sanitizeEvent(null)));
});

test('imports phones from a third column and warns about unusable ones', () => {
  const { rows } = parseImport('Ana;García;+34 600 123 456\nLuis;;600123456\nEva');
  assert.deepEqual(rows.map((r) => [r.name, r.group, r.phone, r.status, r.warning]), [
    ['Ana', 'García', '+34 600 123 456', 'ok', null],
    ['Luis', '', '', 'ok', 'phoneNoPrefix'],
    ['Eva', '', '', 'ok', null],
  ]);
});

test('export → import keeps phones, event and previous draws', () => {
  const ps = people(['Ana;García', 'Luis', 'Eva', 'Marta']);
  ps[0].phone = '+34 600 123 456';
  const rules = rulesWith(ps, { excludeFamily: true });
  const withHistory = { ...rules, previousDraws: [entryFromDraw(performDraw(ps, rules))] };
  const event = { name: 'Navidad', date: '2026-12-24', budget: '30 €' };
  const json = JSON.stringify(exportConfig(ps, withHistory, event));

  const preview = previewImport(parseImport(json, 'c.json'), [], 'replace');
  const result = applyImport({ participants: [], rules: createRules() }, preview);
  assert.equal(result.participants[0].phone, '+34 600 123 456');
  assert.deepEqual(result.event, event);
  assert.equal(result.rules.previousDraws.length, 1);
  assert.deepEqual(exportConfig(result.participants, result.rules, result.event).previousDraws, JSON.parse(json).previousDraws);
});

test('compute tasks run the same logic used by the worker', () => {
  const ps = people(['Ana', 'Luis', 'Eva', 'Marta']);
  const allowed = buildAllowed(ps, rulesWith(ps));
  assert.equal(runComputeTask('count', { allowed }).total, 9);
  assert.equal(runComputeTask('analyze', { allowed }).total, 9);
  assert.equal(runComputeTask('draw', { participants: ps, rules: rulesWith(ps) }).assignments.length, 4);
  assert.throws(() => runComputeTask('nope', {}), /Unknown task/);
});
