// La página montada tiene que poder ejecutarse: un error de sintaxis en una pieza de src/app la deja en blanco y los
// demás tests (que leen el HTML como texto) no lo ven. Aquí se compila cada <script> de las dos ediciones, sin ejecutarlo.
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPage } from '../src/build.mjs';
import { publicData } from '../src/sanitize.mjs';

const sample = {
  year: 2026, user: 'ana', generatedAt: 'x', setup: { ownSkills: 3 }, sources: { repos: 2 },
  history: { activeDays: 10, bestStreak: 4, dates: ['2026-01-02'], daysByMonth: [1], hours: [], models: [{ k: 'claude-opus-5-5', out: 5 }], tokens: { out: 5 }, cost: { band: 'aboveAvg', perActiveDay: 20, ref: { avg: 13, p90: 30 } }, claudeDays: 9 },
  git: { commits: 7, aiCommits: 6, reposWithCommits: 2, top: [{ name: 'a', commits: 5, ai: 5, days: 3 }] },
  detail: { from: '2026-01-01', to: '2026-01-31', sessions: 4, userPrompts: 20, toolCalls: 200, toolsPerPrompt: 10, subagentRuns: 1, agentCalls: 1, messagesToOtherAgents: 0, skillsUsed: 2, mcpServersUsed: 1, maxParallel: 2, parallelDays: 1, activeHours: 5, longestActiveHours: 2, promptHours: Array(24).fill(0), topSkills: [], topMcp: [], agentTypes: [], topTools: [], ext: [], bash: {} },
};

test('cada script de las dos páginas se puede compilar', () => {
  for (const [name, html] of [['chat', buildPage('chat')], ['code', buildPage('code', publicData(sample))], ['web', buildPage('web')]]) {
    const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
    assert.ok(scripts.length >= 2, `${name}: faltan scripts`);
    scripts.forEach((code, i) => assert.doesNotThrow(() => new Function(code), `${name}: el script ${i + 1} tiene un error de sintaxis`));
  }
});

test('la página web lee las cifras comprimidas del enlace (las mismas que empaqueta la orden)', async () => {
  const { packData } = await import('../src/build.mjs');
  const zlib = await import('node:zlib');
  const d = publicData(sample), packed = packData(d);
  assert.match(packed, /^[A-Za-z0-9_-]+$/, 'base64url, sin caracteres que haya que escapar en una dirección');
  assert.deepEqual(JSON.parse(zlib.inflateRawSync(Buffer.from(packed, 'base64url')).toString()), d);
  assert.ok(packed.length < 4000, 'tiene que caber holgado en una dirección');
});

test('la música va incrustada en las tres páginas, sin URL y con un peso razonable', async () => {
  const fs = await import('node:fs');
  const src = fs.readFileSync(new URL('../src/app/music.js', import.meta.url), 'utf8');
  const b64 = (src.match(/window\.MUSIC = '([A-Za-z0-9+/=]+)';/) || [])[1];
  assert.ok(b64, 'src/app/music.js tiene que llevar window.MUSIC en base64: node src/music.mjs <tema.mp3>');
  assert.ok(Buffer.from(b64.slice(0, 8), 'base64').toString('latin1').startsWith('ID3') || Buffer.from(b64.slice(0, 4), 'base64')[0] === 0xff, 'tiene que ser un MP3');
  assert.ok(b64.length < 1.2e6, 'la música no debe pasar de ~1,2 MB en base64: bájale el bitrate en src/music.mjs');
  for (const html of [buildPage('chat'), buildPage('code', publicData(sample)), buildPage('web')]) assert.ok(html.includes(b64.slice(0, 200)), 'falta la música en una página');
});
