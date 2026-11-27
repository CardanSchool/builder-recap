// La edición chat se fía de lo que pega la persona: la lectura tiene que aguantar respuestas sucias y acotarlo todo.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = (f) => fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'app', f), 'utf8');
// No son módulos: se incrustan tal cual en la página, con el diccionario delante. Los mensajes, en español.
const { parseAnswer, readLink } = new Function(`${app('i18n.js')}
LANG = 'es';
${app('chat-parse.js')}; return { parseAnswer, readLink };`)();
import { promptText } from '../src/build.mjs';
const base = () => ({
  v: 1, nombre: 'Ana', asistente: 'ChatGPT', frase: 'Un año de construir.',
  proyectos: [{ nombre: 'Tienda online', que: 'Vende libros', peso: 4 }], temas: [{ tema: 'Agentes', peso: 5 }], herramientas: ['Python'],
  respuestas: { d1: 'si', d2: 'no', d3: 'ns' },
});

test('lee una respuesta limpia', () => {
  const d = parseAnswer(JSON.stringify(base()));
  assert.equal(d.edition, 'chat'); assert.equal(d.asistente, 'ChatGPT'); assert.equal(d.proyectos[0].nombre, 'Tienda online');
  assert.equal(d.respuestas.d1, 'si'); assert.equal(d.respuestas.d2, 'no'); assert.equal(d.respuestas.p4, 'ns', 'lo que no viene es «no lo sé»');
});

test('aguanta texto alrededor, bloque de código y comillas tipográficas', () => {
  const txt = 'Claro, aquí lo tienes:\n```json\n' + JSON.stringify(base(), null, 2).replace(/"si"/g, '“si”') + '\n```\n¿Algo más?';
  assert.equal(parseAnswer(txt).respuestas.d1, 'si');
});

test('normaliza las respuestas: solo sí, no o no lo sé', () => {
  const o = base(); o.respuestas = { d1: 'Sí', d2: 'YES', d3: 'No', d4: 'quizá', t1: true, t2: null };
  const r = parseAnswer(JSON.stringify(o)).respuestas;
  assert.deepEqual([r.d1, r.d2, r.d3, r.d4, r.t1, r.t2], ['si', 'si', 'no', 'ns', 'si', 'ns']);
});

test('acota longitudes, cantidades y pesos', () => {
  const o = base();
  o.proyectos = Array.from({ length: 9 }, (_, i) => ({ nombre: `Proyecto con un nombre larguísimo número ${i}`, que: 'q'.repeat(200), peso: 99 }));
  o.temas = Array.from({ length: 12 }, (_, i) => ({ tema: `tema ${i}`, peso: -3 }));
  o.herramientas = Array.from({ length: 20 }, (_, i) => `herramienta larguísima ${i}`);
  o.frase = 'f'.repeat(500);
  const d = parseAnswer(JSON.stringify(o));
  assert.equal(d.proyectos.length, 5); assert.ok(d.proyectos.every((p) => p.nombre.length <= 28 && p.que.length <= 50 && p.peso === 5));
  assert.equal(d.temas.length, 6); assert.ok(d.temas.every((t) => t.peso === 1));
  assert.equal(d.herramientas.length, 8); assert.ok(d.herramientas.every((h) => h.length <= 18));
  assert.ok(d.frase.length <= 90);
});

test('ordena proyectos y temas por peso', () => {
  const o = base(); o.proyectos = [{ nombre: 'pequeño', peso: 1 }, { nombre: 'grande', peso: 5 }];
  assert.equal(parseAnswer(JSON.stringify(o)).proyectos[0].nombre, 'grande');
});

test('avisa con un mensaje claro si no hay bloque, está cortado o viene vacío', () => {
  assert.throws(() => parseAnswer('Hola, no tengo memoria.'), /No veo el bloque/);
  assert.throws(() => parseAnswer('{ "v": 1, "proyectos": [ { "nombre": "a" '), /No veo el bloque|incompleto/);
  assert.throws(() => parseAnswer('{ "v": 1, "proyectos": [ } ]'), /incompleto/);
  const o = base(); o.proyectos = [];
  assert.throws(() => parseAnswer(JSON.stringify(o)), /ningún proyecto/);
});

// Enlace con los datos dentro (#d=…), el que devuelve el asistente que conoce a la persona.
const b64url = (s) => Buffer.from(s, 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

test('el enlace #d= en base64url abre las tarjetas, con tildes y eñes', () => {
  const o = base(); o.frase = 'Año de diseño y ñoños'; o.proyectos[0].nombre = 'Campaña';
  const d = readLink('#d=' + b64url(JSON.stringify(o)));
  assert.equal(d.edition, 'chat'); assert.equal(d.frase, 'Año de diseño y ñoños'); assert.equal(d.proyectos[0].nombre, 'Campaña');
});

test('el enlace #d= también vale con el JSON codificado para URL', () => {
  assert.equal(readLink('#d=' + encodeURIComponent(JSON.stringify(base()))).nombre, 'Ana');
});

test('sin #d= no hay enlace; roto, vacío o demasiado largo da un error que se entiende', () => {
  assert.equal(readLink(''), null); assert.equal(readLink('#otra'), null);
  assert.throws(() => readLink('#d='), /vacío/);
  assert.throws(() => readLink('#d=' + b64url(JSON.stringify(base())).slice(0, 40)), /cortado/);
  assert.throws(() => readLink('#d=' + 'A'.repeat(20000)), /demasiado largo/);
});

test('si el enlace no abre, se puede pegar su dirección (o la respuesta que lo lleva) y salen las tarjetas', () => {
  const url = 'https://ejemplo.test/builder-recap/#d=' + b64url(JSON.stringify(base()));
  assert.equal(parseAnswer(url).nombre, 'Ana');
  assert.equal(parseAnswer('Tu Builder Recap está listo: [Ver mis tarjetas](' + url + ')').nombre, 'Ana');
  assert.equal(parseAnswer('#d=' + encodeURIComponent(JSON.stringify(base()))).nombre, 'Ana');
});

test('el prompt pide una sola línea con el enlace en Markdown y sin enseñar el JSON', () => {
  assert.match(promptText(), /\[Ver mis tarjetas\]\(la dirección\)/);
  assert.match(promptText(), /El JSON no me lo enseñes/);
  assert.doesNotMatch(promptText(), /bloque de código/);
});
