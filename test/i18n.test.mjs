// Los dos idiomas: mismo diccionario, nada vacío y ningún texto visible fuera de él.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildPage } from '../src/build.mjs';
import { publicData } from '../src/sanitize.mjs';

const app = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'app');
const rd = (f) => fs.readFileSync(path.join(app, f), 'utf8');
const { I18N } = new Function(`${rd('i18n.js')}; return { I18N };`)();

test('español e inglés tienen las mismas claves, del mismo tipo, y ninguna vacía', () => {
  const es = I18N.es, en = I18N.en;
  assert.deepEqual(Object.keys(en).sort(), Object.keys(es).sort(), 'falta una clave en uno de los dos idiomas');
  for (const k of Object.keys(es)) {
    assert.equal(typeof en[k], typeof es[k], `${k}: tipo distinto`);
    if (Array.isArray(es[k])) assert.equal(en[k].length, es[k].length, `${k}: listas de largo distinto`);
    for (const v of [es[k], en[k]]) {
      const out = typeof v === 'function' ? v('x', 'y') : v;
      assert.ok(out && (Array.isArray(out) ? out.every(Boolean) : String(out).trim()), `${k}: vacío`);
    }
  }
});

test('el inglés no lleva texto en español ni palabras vetadas por la marca', () => {
  const all = Object.entries(I18N.en).map(([k, v]) => [k, String(typeof v === 'function' ? v('1', '2') : v)]);
  for (const [k, v] of all) {
    assert.ok(!/[ñáéíóú¿¡]/i.test(v.replace(/Español/, '')), `${k} parece español: ${v}`);
    assert.ok(!/\b(easy|easily|hack|secret|revolutionary|disruptive|democratiz)/i.test(v), `${k}: palabra vetada: ${v}`);
  }
  assert.ok(Object.keys(I18N.en).every((k) => k in I18N.es));
});

test('todas las claves que usan las piezas existen en el diccionario', () => {
  const files = fs.readdirSync(app).filter((f) => /\.(js|html)$/.test(f) && f !== 'i18n.js' && f !== 'assets.js');
  const used = new Set();
  for (const f of files) {
    const s = rd(f);
    for (const m of s.matchAll(/\btl\('([\w.]+)'/g)) used.add(m[1]);
    for (const m of s.matchAll(/data-i[ahp]?="([\w.]+)"/g)) used.add(m[1]);
    for (const m of s.matchAll(/tl\('([\w.]+)' \+ /g)) used.delete(m[1]);
  }
  for (const k of used) assert.ok(k in I18N.es, `falta la clave «${k}»`);
});

// Lo que se pinta pasa por tl(): fuera del diccionario no puede quedar una frase en español en las piezas que pintan.
test('no quedan frases en español fuera del diccionario', () => {
  const files = ['cards-code.js', 'level-code.js', 'cards-chat.js', 'level-chat.js', 'final-card.js', 'share.js', 'engine-run.js', 'engine-core.js', 'style-kit.js', 'pieces.js', 'chat-boot.js', 'chat-parse.js'];
  // Excepciones: el ejemplo de la edición chat (datos, uno por idioma) y el valor por defecto antiguo del asistente.
  const allowed = /EXAMPLE_ES|nombre:|tema:|frase:|que:|'tu asistente'/;
  for (const f of files) {
    rd(f).split('\n').forEach((line, i) => {
      const code = line.replace(/\/\/.*$/, '').replace(/^\s*\/\/.*$/, '');
      if (allowed.test(code)) return;
      const strs = [...code.matchAll(/'([^'\]*(?:\.[^'\]*)*)'|`([^`]*)`/g)].map((m) => m[1] ?? m[2]);
      for (const s of strs) assert.ok(!/[ñáéíóú¿¡]|\b(de|la|el|tu|tus|con|para|una|que|los|las|del|por|sin|año|aquí)\b [a-z]/i.test(s), `${f}:${i + 1} texto sin pasar por tl(): ${s}`);
    });
  }
});

test('las páginas cargan el diccionario antes que el motor y el arranque', () => {
  const sample = { year: 2026, user: 'ana', history: { activeDays: 1, bestStreak: 1, dates: [], daysByMonth: [], hours: [], models: [{ k: 'claude-opus-5-5', out: 1 }], tokens: { out: 1 }, cost: { band: 'belowAvg', perActiveDay: 1, ref: { avg: 13, p90: 30 } }, claudeDays: 1 }, git: { commits: 1, aiCommits: 1, reposWithCommits: 1, top: [] }, detail: { promptHours: [] }, setup: {}, sources: {} };
  for (const html of [buildPage('chat'), buildPage('web'), buildPage('code', publicData({ ...sample, detail: { ...sample.detail } }, { lang: 'en' }))]) {
    const i = html.indexOf('const I18N'), e = html.indexOf('window.startRecap = ');
    assert.ok(i > 0 && e > i, 'i18n.js va antes del motor');
    assert.ok(html.includes('id="vLang"'), 'el panel lleva el selector de idioma');
  }
});

test('con --lang los datos llevan el idioma; sin él, no', () => {
  const base = { year: 2026, user: '', history: {}, git: { top: [] }, detail: {}, setup: {}, sources: {} };
  assert.equal(publicData(base, { lang: 'en' }).lang, 'en');
  assert.equal(publicData(base).lang, undefined);
  assert.equal(publicData(base, { lang: 'fr' }).lang, undefined);
});

test('en la web manda la dirección: /es/ en español y /en/ en inglés, aunque el navegador diga otra cosa', () => {
  const lang = ({ path = '/', search = '', nav = 'es-ES', saved = null, data = null }) => new Function('location', 'navigator', 'localStorage',
    `${rd('i18n.js')}; if (${JSON.stringify(data)}) langFromData({ lang: ${JSON.stringify(data)} }); return LANG;`)(
    { pathname: path, search }, { language: nav }, { getItem: () => saved, setItem() {} });
  assert.equal(lang({ path: '/es/recap/ver', nav: 'en-US' }), 'es');
  assert.equal(lang({ path: '/en/recap/ver', nav: 'es-ES' }), 'en');
  assert.equal(lang({ path: '/en/recap/ver', nav: 'es-ES', data: 'es' }), 'en', 'la dirección manda sobre los datos');
  assert.equal(lang({ path: '/es/recap/ver', search: '?lang=en' }), 'en', '?lang= manda sobre la dirección');
  assert.equal(lang({ path: '/es/recap/ver', saved: 'en' }), 'en', 'lo elegido en los ajustes manda sobre todo');
  assert.equal(lang({ path: '/builder-recap/', nav: 'en-US' }), 'en', 'sin idioma en la dirección (GitHub Pages), el del navegador');
  assert.equal(lang({ path: '/C:/Users/x/builder-recap-2026.html', nav: 'en-US', data: 'es' }), 'es', 'en el archivo local, el de los datos');
  assert.equal(lang({ path: '/espanol/', nav: 'en-US' }), 'en', 'solo cuenta /es/ o /en/ al principio');
});
