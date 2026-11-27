// ---------- Edición Claude Code · Nivel, personajes y sellos (fórmula y umbrales provisionales) ----------
const SPIN = { dur: 1, turns: 1 };
const d = D.detail, g = D.git, h = D.history;
const cap = (v, max) => clamp(v / max);
const share = (a) => (g.reposWithCommits ? a / g.reposWithCommits : 0);
const AXES = [
  { k: tl('ax.d'), v: 40 * cap(d.toolsPerPrompt, 12) + 35 * cap(d.maxParallel - 1, 3) + 25 * cap(d.agentCalls + d.messagesToOtherAgents, 50) },
  { k: tl('ax.t'), v: 40 * share(g.reposAgentFile) + 25 * cap(d.skillsUsed, 10) + 20 * cap(d.mcpServersUsed, 5) + 15 * share(g.reposTests) },
  { k: tl('ax.p'), v: 40 * cap(g.commits, 300) + 30 * cap(h.activeDays, 100) + 30 * cap(g.reposWithCommits, 5) },
].map((a) => ({ ...a, v: Math.round(a.v) }));
const LEVELS = tl('lvl');
const score = AXES.reduce((a, x) => a + x.v, 0) / AXES.length;
const level = score >= 75 ? 3 : score >= 50 ? 2 : score >= 25 ? 1 : 0;
const peak = d.promptHours && Math.max(...d.promptHours) > 0 ? d.promptHours.indexOf(Math.max(...d.promptHours)) : h.peakHour;
const pct = g.commits ? Math.round((g.aiCommits / g.commits) * 100) : 0;
// Personajes: el primero que se cumple es el titular de la tarjeta final; los demás que se cumplan son sellos.
// Nombres sin género: quien lo ejecuta puede ser cualquiera («Realeza de Git», no «Rey de Git»). Textos en i18n.js.
const ARCH = [
  { id: 'torre', a: tl('arch.torre'), b: tl('c.torre', d.maxParallel), ok: d.maxParallel >= 4 && d.parallelDays >= 5 },
  { id: 'reparte', a: tl('arch.reparte'), b: tl('c.reparte', n0(d.agentCalls)), ok: d.agentCalls >= 50 },
  { id: 'skills', a: tl('arch.skills'), b: tl('c.skills', d.skillsUsed), ok: d.skillsUsed >= 10 && share(g.reposAgentFile) >= 0.6 },
  { id: 'git', a: tl('arch.git'), b: tl('c.git', n0(g.commits)), ok: g.commits >= 300 },
  { id: 'maraton', a: tl('arch.maraton'), b: tl('c.maraton', h.bestStreak), ok: h.bestStreak >= 21 },
  { id: 'frentes', a: tl('arch.frentes'), b: tl('c.frentes', g.reposWithCommits), ok: g.reposWithCommits >= 5 },
  { id: 'noche', a: tl('arch.noche'), b: tl('quiet'), ok: peak >= 22 || peak < 5 },
  { id: 'primera', a: tl('arch.primera'), b: tl('early'), ok: peak >= 5 && peak < 10 },
  { id: 'base', a: tl('arch.base'), b: tl('pieceByPiece'), ok: true },
];
function streakSet() {
  const ds = h.dates || []; let best = [], cur = [];
  for (const x of ds) { const prev = cur[cur.length - 1]; if (prev && Math.round((Date.parse(x + 'T12:00:00') - Date.parse(prev + 'T12:00:00')) / 86400000) === 1) cur.push(x); else cur = [x]; if (cur.length > best.length) best = cur.slice(); }
  return new Set(best);
}
const has = (id) => ARCH.find((x) => x.id === id).ok;
const nameOf = (id) => ARCH.find((x) => x.id === id).a;
const archNow = () => (S.arch !== 'auto' && ARCH.find((x) => x.id === S.arch)) || ARCH.find((x) => x.ok);
const tokOut = h.tokens.out;
const tokShort = tokOut >= 1e6 ? `${n0(tokOut / 1e6)} M` : n0(tokOut);
const mainModel = h.models[0];
const modelName = (k) => k.replace(/^claude-/, '').replace(/-\d{8}$/, '').replace(/^(\w)(\w+)-(\d+)-?(\d+)?/, (_, a, b, c, e) => `${a.toUpperCase()}${b} ${c}${e ? '.' + e : ''}`);
const who = () => (S.user ? S.user + ' · ' : '');
