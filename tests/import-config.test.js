import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseImport, previewImport, splitLine } from '../js/core/importer.js';
import { exportConfig, applyImport } from '../js/core/config.js';
import { createRules, addExclusion, removeExclusion, pruneExclusions } from '../js/core/rules.js';
import { validateName } from '../js/core/participants.js';
import { encryptPayload, decryptPayload } from '../js/core/crypto.js';
import { people, rulesWith } from './helpers.js';

test('parses text lists with groups, blank lines, comments, headers and duplicates', () => {
  const text = 'nombre;grupo\n# comment\nAna;Familia García\n\nLuis ; Familia García\nana\n"García, Pepe";Otros\nEva\n\n';
  const { rows } = parseImport(text, 'list.txt');
  assert.deepEqual(
    rows.map((r) => [r.line, r.name, r.group, r.status]),
    [
      [3, 'Ana', 'Familia García', 'ok'],
      [4, '', '', 'empty'],
      [5, 'Luis', 'Familia García', 'ok'],
      [6, 'ana', '', 'duplicate'],
      [7, 'García, Pepe', 'Otros', 'ok'],
      [8, 'Eva', '', 'ok'],
    ],
  );
});

test('supports comma and tab separated values', () => {
  assert.deepEqual(parseImport('Ana,Fam\nLuis\tFam2').rows.map((r) => r.group), ['Fam', 'Fam2']);
  assert.deepEqual(splitLine('"a ""b""";c', ';'), ['a "b"', 'c']);
});

test('parses JSON arrays and full configs; reports invalid JSON', () => {
  assert.deepEqual(parseImport('["Ana","Luis"]').rows.map((r) => r.name), ['Ana', 'Luis']);
  const full = parseImport(JSON.stringify({ participants: [{ name: 'Ana', group: 'X' }, { name: 'Luis' }], settings: { excludeFamily: true }, exclusions: [{ from: 'Ana', to: 'Luis', mutual: true }] }), 'c.json');
  assert.equal(full.rows.length, 2);
  assert.deepEqual(full.settings, { excludeFamily: true });
  assert.equal(full.exclusions.length, 1);
  assert.equal(parseImport('{oops', 'x.json').fatal.code, 'invalidJson');
  assert.equal(parseImport('{"foo":1}', 'x.json').fatal.code, 'jsonShape');
});

test('preview flags names that already exist when adding', () => {
  const existing = people(['Ana']);
  const preview = previewImport(parseImport('Ana\nLuis'), existing, 'add');
  assert.deepEqual(preview.rows.map((r) => r.status), ['exists', 'ok']);
  assert.deepEqual(preview.summary, { ok: 1, skipped: 1 });
  assert.deepEqual(previewImport(parseImport('Ana\nLuis'), existing, 'replace').summary, { ok: 2, skipped: 0 });
});

test('export → import round trip keeps participants, groups and rules', () => {
  const ps = people(['Ana;García', 'Luis;García', 'Eva']);
  const rules = rulesWith(ps, { excludeFamily: true, exclusions: [['Eva', 'Ana', true], ['Luis', 'Eva']] });
  const json = JSON.stringify(exportConfig(ps, rules));
  const preview = previewImport(parseImport(json, 'config.json'), [], 'replace');
  const result = applyImport({ participants: [], rules: createRules() }, preview);
  assert.deepEqual(result.participants.map((p) => [p.name, p.group]), ps.map((p) => [p.name, p.group]));
  assert.equal(result.rules.excludeFamily, true);
  assert.deepEqual(exportConfig(result.participants, result.rules).exclusions, JSON.parse(json).exclusions);
});

test('example files import cleanly', async () => {
  for (const file of ['participants.txt', 'participants.csv', 'participants.json']) {
    const text = await readFile(new URL(`../examples/${file}`, import.meta.url), 'utf8');
    const { rows, fatal } = parseImport(text, file);
    assert.equal(fatal, null, file);
    assert.ok(rows.length >= 6, file);
    assert.ok(rows.every((r) => r.status === 'ok'), file);
  }
});

test('exclusions merge, deduplicate and get pruned', () => {
  const ps = people(['Ana', 'Luis', 'Eva']);
  const [a, l] = ps.map((p) => p.id);
  let rules = createRules();
  rules = addExclusion(rules, ps, { from: a, to: l }).rules;
  assert.equal(addExclusion(rules, ps, { from: a, to: l }).error, 'exclusionDuplicate');
  assert.equal(addExclusion(rules, ps, { from: a, to: a }).error, 'exclusionSame');
  rules = addExclusion(rules, ps, { from: l, to: a }).rules; // opposite direction → mutual
  assert.equal(rules.exclusions.length, 1);
  assert.equal(rules.exclusions[0].mutual, true);
  assert.equal(pruneExclusions(rules, ps.slice(1)).exclusions.length, 0);
  assert.equal(removeExclusion(rules, rules.exclusions[0].id).exclusions.length, 0);
});

test('names are required and unique (case-insensitive)', () => {
  const ps = people(['Ana']);
  assert.equal(validateName('  ', ps), 'nameRequired');
  assert.equal(validateName('ANA ', ps), 'nameDuplicate');
  assert.equal(validateName('Ana', ps, ps[0].id), null);
  assert.equal(validateName('Luis', ps), null);
});

test('secret links round-trip and do not contain the names in clear text', async () => {
  const token = await encryptPayload({ v: 1, g: 'Ana', r: 'Luis' });
  assert.match(token, /^[A-Za-z0-9_-]+$/);
  assert.ok(!token.includes('Luis'));
  assert.deepEqual(await decryptPayload(token), { v: 1, g: 'Ana', r: 'Luis' });
  const shortToken = await encryptPayload({ g: 'A', r: 'B' });
  const longToken = await encryptPayload({ g: 'Alejandra', r: 'Bartolomé' });
  assert.equal(shortToken.length, longToken.length, 'padding hides name length');
  await assert.rejects(decryptPayload(token.slice(0, -4) + 'AAAA'), /INVALID_TOKEN/);
  await assert.rejects(decryptPayload('not a token!'), /INVALID_TOKEN/);
});
