// La promesa de privacidad, como tests: qué viaja dentro de la página y que la página no pide nada a internet.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { publicData } from '../src/sanitize.mjs';
import { buildPage, promptText, REPO, SITE, OG_IMAGE, LICENSE_URL, faq } from '../src/build.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const sample = () => ({
  year: 2026, user: 'ana', generatedAt: 'x', setup: { ownSkills: 3 }, sources: { repos: 2 },
  history: { activeDays: 10, bestStreak: 4, dates: ['2026-01-02'], daysByMonth: [1], hours: [], models: [{ k: 'claude-opus-5-5', out: 5 }], tokens: { out: 5 }, cost: { band: 'aboveAvg', perActiveDay: 20, ref: { avg: 13, p90: 30 } }, claudeDays: 9 },
  git: { commits: 7, aiCommits: 6, reposWithCommits: 2, top: [{ name: 'cliente-secreto-web', commits: 5, ai: 5, days: 3 }, { name: 'otro-repo', commits: 2, ai: 1, days: 1 }] },
  detail: {
    from: '2026-01-01', to: '2026-01-31', sessions: 4, userPrompts: 20, toolCalls: 200, toolsPerPrompt: 10, subagentRuns: 1, agentCalls: 1, messagesToOtherAgents: 0,
    skillsUsed: 2, mcpServersUsed: 1, maxParallel: 2, parallelDays: 1, activeHours: 5, longestActiveHours: 2, promptHours: Array(24).fill(0),
    topSkills: [{ k: 'empresa:skill-interna', v: 9 }], topMcp: [{ k: 'crm-del-cliente', v: 4 }], agentTypes: [{ k: 'agente-propio', v: 1 }], topTools: [{ k: 'Bash', v: 9 }], ext: [{ k: '.ts', v: 3 }], bash: { git: 1 },
  },
});

test('por defecto no viajan nombres de repos, skills, conectores ni agentes', () => {
  const json = JSON.stringify(publicData(sample()));
  for (const secret of ['cliente-secreto-web', 'otro-repo', 'empresa:skill-interna', 'crm-del-cliente', 'agente-propio']) assert.ok(!json.includes(secret), `no debería viajar: ${secret}`);
});

test('las tarjetas conservan los recuentos que pintan', () => {
  const p = publicData(sample());
  assert.equal(p.git.commits, 7); assert.equal(p.git.top.length, 2); assert.equal(p.git.top[0].commits, 5);
  assert.equal(p.detail.skillsUsed, 2); assert.equal(p.detail.mcpServersUsed, 1); assert.equal(p.detail.maxParallel, 2);
  assert.deepEqual(p.history.dates, ['2026-01-02']);
});

test('con --names viajan los nombres de repos, y solo eso', () => {
  const json = JSON.stringify(publicData(sample(), { names: true }));
  assert.ok(json.includes('cliente-secreto-web'));
  assert.ok(!json.includes('empresa:skill-interna') && !json.includes('crm-del-cliente'));
});

// Los únicos enlaces que puede llevar una página: los que la persona pulsa. Nada que se cargue solo.
// La web, schema.org, la imagen para redes y la licencia solo salen en los metadatos de la edición chat (buscadores y
// redes): tampoco se cargan.
// Única dirección a la que se envía algo: la subida de la carta al compartir (y su borrado), solo al pulsar.
// Va en dos direcciones de la misma web (ver SHARE_APIS en engine-run.js): la segunda, la directa, existe porque
// cardanschool.com redirige sin permiso CORS. Se quita cuando cardanschool.com sirva la web directamente.
const OLD_API = 'https://www.foundingproductengineer.com/api/recap/share';
const LINKS = new Set(['https://www.cardanschool.com/api/recap/share', OLD_API, 'https://www.cardanschool.com/es/recap/publicar/', 'https://www.cardanschool.com/en/recap/publicar/', 'https://www.linkedin.com/feed/update/', 'https://www.cardanschool.com', 'https://cardanschool.com/radar', 'https://www.linkedin.com/feed/?shareActive=true', 'https://www.linkedin.com/feed/?shareActive=true&text=',
  'https://twitter.com/intent/tweet?text=', 'https://wa.me/?text=', 'https://www.facebook.com/sharer/sharer.php?u=',
  'https://' + REPO, SITE, SITE + '#d=', 'https://schema.org', OG_IMAGE, LICENSE_URL]);
test('las páginas solo envían algo al compartir (a SHARE_API); el resto son enlaces para pulsar, de una lista cerrada', () => {
  for (const html of [buildPage('chat'), buildPage('code', publicData(sample())), buildPage('web')]) {
    const urls = html.match(/https?:\/\/[^\s"'<>)`]+/g) || [];
    for (const u of urls) assert.ok(LINKS.has(u), `enlace fuera de la lista: ${u}`);
    const loads = html.replace(/<link rel="canonical" href="[^"]+">/, '');
    assert.ok(!/<link[^>]+href=|<script[^>]+src=|<img[^>]+src="http|@import|fetch\(|XMLHttpRequest|sendBeacon|WebSocket/.test(loads.split('fetch(SHARE_API').join('')), 'no debe cargar ni enviar nada, salvo la subida al compartir (fetch(SHARE_API…))');
    assert.equal((html.match(/fetch\(/g) || []).length, (html.match(/fetch\(SHARE_API/g) || []).length, 'todo fetch va a SHARE_API');
    assert.ok(!/<!--(TITLE|META|INTRO|AGAIN|SCRIPTS)-->|\/\*(FONTS|EXTRA-CSS)\*\/|__REPO__/.test(html), 'no deben quedar huecos sin rellenar');
  }
});

test('en las piezas no se nombra Cardan House ni el dominio antiguo', () => {
  for (const html of [buildPage('chat'), buildPage('code', publicData(sample())), promptText()]) {
    // Única excepción: la dirección directa de la subida (OLD_API), dentro del código y nunca a la vista
    const visible = html.split(`'${OLD_API}'`).join('');
    assert.ok(!/cardan ?house|foundingproductengineer/i.test(visible), 'las piezas son de Cardan School');
    assert.ok(html.split(OLD_API).length <= 2, 'el dominio antiguo solo puede salir una vez, en SHARE_APIS');
  }
});

test('README, AGENTS.md, package.json y llms.txt apuntan al mismo repo y a la misma web', () => {
  const rd = (f) => fs.readFileSync(path.join(root, f), 'utf8');
  for (const f of ['README.md', 'AGENTS.md', 'package.json', 'docs/llms.txt']) {
    const txt = rd(f);
    assert.ok(txt.includes(REPO), `${f} no menciona ${REPO}`);
    const other = (txt.match(/github\.com\/[\w.-]+\/builder-recap|[\w-]+\.github\.io\/builder-recap/g) || []).filter((u) => !REPO.endsWith(u) && !SITE.includes(u));
    assert.deepEqual(other, [], `${f} apunta a otro sitio: cambia la URL en src/build.mjs y en ${f} a la vez`);
  }
  assert.ok(rd('AGENTS.md').includes(SITE) && rd('README.md').includes(SITE));
});

test('las preguntas frecuentes de los metadatos salen todas del README', () => {
  const md = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
  const asked = (md.split(/^## Preguntas frecuentes\s*$/m)[1] || '').split(/^## /m)[0].match(/^\*\*¿/gm) || [];
  const qs = faq();
  assert.ok(qs.length >= 5 && qs.length === asked.length, 'alguna pregunta del README no se ha leído');
  assert.ok(buildPage('chat').includes('"FAQPage"') && qs.every(({ a }) => a && !/\]\(|`|\*\*/.test(a)), 'respuestas en texto plano');
  assert.ok(fs.existsSync(path.join(root, 'docs', 'og.png')), 'falta docs/og.png: node src/og-image.mjs');
});

test('unos datos con «</script>» no rompen la página', () => {
  const d = sample(); d.user = '</script><script>alert(1)</script>';
  const html = buildPage('code', publicData(d));
  assert.ok(!html.includes('</script><script>alert(1)'));
});

test('docs/index.html está al día con las piezas de src/app', () => {
  assert.equal(fs.readFileSync(path.join(root, 'docs', 'index.html'), 'utf8'), buildPage('chat'), 'ejecuta «npm run build» y vuelve a subirlo');
});

test('docs/prompt.txt está al día y no lleva año escrito', () => {
  const txt = fs.readFileSync(path.join(root, 'docs', 'prompt.txt'), 'utf8');
  assert.equal(txt, promptText(), 'ejecuta «npm run build» y vuelve a subirlo');
  assert.ok(!/20\d\d/.test(txt), 'el prompt no debe llevar el año escrito');
  assert.ok(txt.includes('"respuestas"') && txt.includes('p4:'));
  assert.ok(txt.includes('No me hagas preguntas') && !/hazme las preguntas/i.test(txt), 'el asistente no le hace preguntas a la persona');
  assert.ok(txt.includes(SITE + '#d=') && txt.includes(REPO) && !/__(REPO|SITE)__/.test(txt), 'pide el enlace con los datos y nombra el repo');
});

test('docs/prompt-en.txt está al día y pide lo mismo que el español', () => {
  const en = fs.readFileSync(path.join(root, 'docs', 'prompt-en.txt'), 'utf8'), es = promptText();
  assert.equal(en, promptText('en'), 'ejecuta «npm run build» y vuelve a subirlo');
  assert.ok(!/20dd/.test(en) && en.includes(SITE + '#d=') && en.includes(REPO) && !/__(REPO|SITE)__/.test(en));
  const keys = (t) => [...t.matchAll(/^s*"(w+)":/gm)].map((m) => m[1]).join(',');
  assert.equal(keys(en), keys(es), 'las claves del JSON son las mismas en los dos prompts');
  for (const q of ['d1', 'd2', 'd3', 'd4', 't1', 't2', 't3', 't4', 'p1', 'p2', 'p3', 'p4']) assert.ok(en.includes(q + ':'), q);
  assert.ok(es.includes('"idioma": "es"') && en.includes('"idioma": "en"'), 'cada prompt dice su idioma');
});
