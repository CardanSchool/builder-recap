// El lector de sesiones: qué líneas se interpretan y cuáles se saltan sin leer.
// Nace de un fallo real: se descartaban los mensajes del agente porque su «type» va al final de la línea.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { relevantLines } from '../src/extract.mjs';

function withFile(lines, fn, { trailingNewline = true } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'recap-test-'));
  const file = path.join(dir, 's.jsonl');
  fs.writeFileSync(file, lines.join('\n') + (trailingNewline ? '\n' : ''));
  try { return fn(file); } finally { fs.rmSync(dir, { recursive: true, force: true }); }
}
const types = (file) => [...relevantLines(file)].map((l) => JSON.parse(l).type);

test('un mensaje del agente con el type al final y mucho contenido delante no se pierde', () => {
  const assistant = JSON.stringify({ parentUuid: 'a', message: { role: 'assistant', content: [{ type: 'text', text: 'x'.repeat(6000) }] }, type: 'assistant' });
  assert.ok(assistant.indexOf('"type":"assistant"') > 1500, 'el caso de prueba tiene que llevar el type lejos del principio');
  withFile([assistant], (f) => assert.deepEqual(types(f), ['assistant']));
});

test('se saltan las líneas que empiezan declarando un tipo que no interesa', () => {
  const lines = [
    JSON.stringify({ type: 'api-request-blob', data: 'y'.repeat(50000) }),
    JSON.stringify({ type: 'user', message: { role: 'user', content: 'hola' } }),
    JSON.stringify({ type: 'custom-title', customTitle: 'algo' }),
    JSON.stringify({ type: 'cost-state', totalLinesAdded: 3 }),
    JSON.stringify({ type: 'assistant', message: { content: [] } }),
  ];
  withFile(lines, (f) => assert.deepEqual(types(f), ['user', 'cost-state', 'assistant']));
});

test('una línea más grande que el bloque de lectura (4 MB) sale entera, y un volcado gigante se salta', () => {
  const bigAssistant = JSON.stringify({ message: { content: [{ type: 'text', text: 'z'.repeat(5 * 1024 * 1024) }] }, type: 'assistant' });
  const bigBlob = JSON.stringify({ type: 'api-request-blob', data: 'w'.repeat(9 * 1024 * 1024) });
  const user = JSON.stringify({ type: 'user', message: { content: 'después' } });
  withFile([bigBlob, bigAssistant, user], (f) => {
    const got = [...relevantLines(f)];
    assert.equal(got.length, 2);
    assert.equal(JSON.parse(got[0]).message.content[0].text.length, 5 * 1024 * 1024);
    assert.equal(JSON.parse(got[1]).type, 'user');
  });
});

test('la última línea cuenta aunque el archivo no acabe en salto de línea', () => {
  withFile([JSON.stringify({ type: 'user', n: 1 }), JSON.stringify({ type: 'user', n: 2 })], (f) => assert.equal([...relevantLines(f)].length, 2), { trailingNewline: false });
});

test('un archivo que no existe no rompe: no devuelve nada', () => {
  assert.deepEqual([...relevantLines(path.join(os.tmpdir(), 'no-existe-recap.jsonl'))], []);
});
