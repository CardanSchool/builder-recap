// Lee SOLO en local (Claude Code + git) y devuelve recuentos. Sin dependencias y sin red.
// No guarda prompts, código ni contenido de las sesiones.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';

// Una línea solo se descarta sin leer si EMPIEZA declarando un tipo que no interesa. En las de mensajes el tipo
// va al final, después del contenido: mirar solo el principio las perdía (fallo visto el 2026-11-25).
const STARTS_WITH_TYPE = /^\{"type":"([^"]+)"/;
const KEEP = new Set(['assistant', 'user', 'cost-state']);

// Recorre un archivo de sesión línea a línea sin cargarlo entero en memoria (los hay de cientos de MB).
// Las líneas largas que no son de mensajes ni de coste (volcados de peticiones, adjuntos) se descartan sin decodificar.
export function* relevantLines(file) {
  let fd; try { fd = fs.openSync(file, 'r'); } catch { return; }
  const buf = Buffer.allocUnsafe(1 << 22);
  let pending = [], pendingLen = 0, skipping = false, n;
  const relevantHead = (b) => { const m = STARTS_WITH_TYPE.exec(b.toString('utf8', 0, 80)); return !m || KEEP.has(m[1]); };
  try {
    while ((n = fs.readSync(fd, buf, 0, buf.length, null)) > 0) {
      const chunk = buf.subarray(0, n); let start = 0;
      for (;;) {
        const nl = chunk.indexOf(10, start);
        if (nl < 0) { // la línea sigue en el siguiente bloque
          if (!skipping) {
            const piece = Buffer.from(chunk.subarray(start)); pending.push(piece); pendingLen += piece.length;
            if (pendingLen > 4096 && !relevantHead(Buffer.concat(pending, pendingLen))) { skipping = true; pending = []; pendingLen = 0; }
          }
          break;
        }
        if (!skipping) {
          const piece = chunk.subarray(start, nl);
          const whole = pending.length ? Buffer.concat([...pending, piece]) : piece;
          if (whole.length && relevantHead(whole)) yield whole.toString('utf8');
        }
        pending = []; pendingLen = 0; skipping = false; start = nl + 1;
      }
    }
    if (!skipping && pendingLen) { const whole = Buffer.concat(pending, pendingLen); if (relevantHead(whole)) yield whole.toString('utf8'); }
  } catch { /* archivo ilegible o en uso: se cuenta lo leído hasta aquí */ } finally { try { fs.closeSync(fd); } catch {} }
}

export function collect({ year, extraDirs = [], onProgress = () => {} } = {}) {
const YEAR = year || new Date().getFullYear();
const HOME = os.homedir();
const configDirs = [...new Set([process.env.CLAUDE_CONFIG_DIR, path.join(HOME, '.claude'), ...extraDirs]
  .filter(Boolean).map((d) => path.resolve(d)))].filter((d) => fs.existsSync(d));

const readJson = (f) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } };
const inc = (o, k, n = 1) => { o[k] = (o[k] || 0) + n; };
const dayOf = (ts) => new Date(ts).toLocaleDateString('sv-SE'); // AAAA-MM-DD en hora local

// ---------- 1 · Resumen de todo el historial (stats-cache.json) ----------
const days = {}; // fecha -> { messages, sessions, tools }
const hours = {};
const models = {}; // modelo -> { in, out, cacheRead, cacheWrite }
let totalSessions = 0;
let firstSession = null;
for (const d of configDirs) {
  const s = readJson(path.join(d, 'stats-cache.json'));
  if (!s) continue;
  totalSessions += s.totalSessions || 0;
  if (s.firstSessionDate && (!firstSession || s.firstSessionDate < firstSession)) firstSession = s.firstSessionDate;
  for (const a of s.dailyActivity || []) {
    const x = (days[a.date] ||= { messages: 0, sessions: 0, tools: 0 });
    x.messages += a.messageCount || 0; x.sessions += a.sessionCount || 0; x.tools += a.toolCallCount || 0;
  }
  for (const [h, n] of Object.entries(s.hourCounts || {})) inc(hours, Number(h), n);
  for (const [m, u] of Object.entries(s.modelUsage || {})) {
    const x = (models[m] ||= { in: 0, out: 0, cacheRead: 0, cacheWrite: 0 });
    x.in += u.inputTokens || 0; x.out += u.outputTokens || 0;
    x.cacheRead += u.cacheReadInputTokens || 0; x.cacheWrite += u.cacheCreationInputTokens || 0;
  }
}

// ---------- 2 · Detalle de las sesiones que siguen en disco (≈ últimos 30 días) ----------
const det = {
  sessions: 0, subagentRuns: 0, sessionsWithSubagents: 0, agentCalls: 0, agentTypes: {},
  skillCalls: 0, skills: {}, mcpCalls: 0, mcpServers: {}, tools: {}, toolCalls: 0, userPrompts: 0,
  bash: { git: 0, commit: 0, push: 0, gh: 0, pr: 0, worktree: 0, test: 0 },
  ext: {}, planMode: 0, messagesToOtherAgents: 0, linesAdded: 0, linesRemoved: 0, promptHours: {},
  from: null, to: null, projects: {}, maxParallel: 0, parallelDays: 0, activeMs: 0, longestActiveMs: 0,
};
const intervals = [];
let scanned = 0;
const GAP = 5 * 60 * 1000; // más de 5 min sin actividad no cuenta como trabajo

function scanTranscript(file, isSub) {
  if (!isSub) onProgress(++scanned);
  const stamps = []; let usedAgent = false; let cwd = null; let added = 0; let removed = 0;
  for (const line of relevantLines(file)) {
    let o; try { o = JSON.parse(line); } catch { continue; }
    if (o.timestamp) stamps.push(Date.parse(o.timestamp));
    if (o.cwd && !cwd) cwd = o.cwd;
    // cost-state es un acumulado de la sesión: vale el mayor, no la suma
    if (o.type === 'cost-state') { added = Math.max(added, o.totalLinesAdded || 0); removed = Math.max(removed, o.totalLinesRemoved || 0); }
    if (o.type === 'user' && !o.isMeta && !o.toolUseResult && !isSub) {
      const c = o.message?.content;
      if (typeof c === 'string' || (Array.isArray(c) && c.some((p) => p.type === 'text'))) {
        det.userPrompts++;
        if (o.timestamp) inc(det.promptHours, new Date(o.timestamp).getHours());
      }
    }
    if (o.type !== 'assistant') continue;
    for (const c of o.message?.content || []) {
      if (c.type !== 'tool_use') continue;
      det.toolCalls++; inc(det.tools, c.name.startsWith('mcp__') ? 'MCP' : c.name);
      const inp = c.input || {};
      if (c.name === 'Agent' || c.name === 'Task') { det.agentCalls++; usedAgent = true; inc(det.agentTypes, inp.subagent_type || 'general-purpose'); }
      else if (c.name === 'Skill') { det.skillCalls++; inc(det.skills, String(inp.skill || '?')); }
      else if (c.name === 'SendMessage') det.messagesToOtherAgents++;
      else if (c.name === 'ExitPlanMode') det.planMode++;
      else if (c.name.startsWith('mcp__')) { det.mcpCalls++; inc(det.mcpServers, c.name.split('__')[1]); }
      else if (c.name === 'Bash' || c.name === 'PowerShell') {
        const cmd = String(inp.command || '');
        if (/\bgit\b/.test(cmd)) det.bash.git++;
        if (/\bgit\s+commit\b/.test(cmd)) det.bash.commit++;
        if (/\bgit\s+push\b/.test(cmd)) det.bash.push++;
        if (/\bgit\s+worktree\b/.test(cmd)) det.bash.worktree++;
        if (/\bgh\b/.test(cmd)) det.bash.gh++;
        if (/\bgh\s+pr\s+create\b/.test(cmd)) det.bash.pr++;
        if (/\b(vitest|jest|pytest|playwright test|npm (run )?test)\b/.test(cmd)) det.bash.test++;
      } else if (c.name === 'Edit' || c.name === 'Write') {
        const e = path.extname(String(inp.file_path || '')).toLowerCase();
        if (e) inc(det.ext, e);
      }
    }
  }
  det.linesAdded += added; det.linesRemoved += removed;
  if (!stamps.length) return;
  stamps.sort((a, b) => a - b);
  let active = 0;
  for (let i = 1; i < stamps.length; i++) { const g = stamps[i] - stamps[i - 1]; if (g < GAP) active += g; }
  if (isSub) { det.subagentRuns++; return; }
  det.sessions++; det.activeMs += active; det.longestActiveMs = Math.max(det.longestActiveMs, active);
  if (usedAgent) det.sessionsWithSubagents++;
  if (cwd) inc(det.projects, cwd);
  if (!det.from || stamps[0] < det.from) det.from = stamps[0];
  if (!det.to || stamps.at(-1) > det.to) det.to = stamps.at(-1);
  // tramos de actividad, para medir sesiones en paralelo
  let s = stamps[0];
  for (let i = 1; i <= stamps.length; i++) {
    if (i === stamps.length || stamps[i] - stamps[i - 1] >= GAP) { intervals.push([s, stamps[i - 1]]); s = stamps[i]; }
  }
}

for (const d of configDirs) {
  const root = path.join(d, 'projects');
  if (!fs.existsSync(root)) continue;
  for (const p of fs.readdirSync(root)) {
    const pd = path.join(root, p);
    let entries; try { entries = fs.readdirSync(pd, { withFileTypes: true }); } catch { continue; }
    for (const e of entries) {
      if (e.isFile() && e.name.endsWith('.jsonl')) scanTranscript(path.join(pd, e.name), false);
      if (e.isDirectory()) {
        const sub = path.join(pd, e.name, 'subagents');
        if (fs.existsSync(sub)) for (const f of fs.readdirSync(sub)) if (f.endsWith('.jsonl')) scanTranscript(path.join(sub, f), true);
      }
    }
  }
}
// máximo de sesiones trabajando a la vez
{
  const ev = [];
  for (const [a, b] of intervals) { if (b - a < 60000) continue; ev.push([a, 1], [b, -1]); }
  ev.sort((x, y) => x[0] - y[0] || x[1] - y[1]);
  let cur = 0; const dayMax = {};
  for (const [t, v] of ev) { cur += v; det.maxParallel = Math.max(det.maxParallel, cur); const k = dayOf(t); dayMax[k] = Math.max(dayMax[k] || 0, cur); }
  det.parallelDays = Object.values(dayMax).filter((n) => n >= 2).length;
}

// ---------- 3 · Proyectos: lista de Claude Code + git de cada uno ----------
const projectPaths = new Set();
for (const f of [...configDirs.map((d) => path.join(d, '.claude.json')), path.join(HOME, '.claude.json')]) {
  const j = readJson(f);
  for (const p of Object.keys(j?.projects || {})) projectPaths.add(path.resolve(p));
}
for (const p of Object.keys(det.projects)) projectPaths.add(path.resolve(p));

const git = (cwd, args) => {
  try { return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 180000, maxBuffer: 256 * 1024 * 1024 }).trim(); }
  catch { return null; }
};
const repos = new Map(); // raíz del repo -> datos
let gitFailed = 0;
const commitDays = {}; const commitHours = {}; const seenCommits = new Set();
let commits = 0; let aiCommits = 0;
for (const p of projectPaths) {
  if (!fs.existsSync(p)) continue;
  const top = git(p, ['rev-parse', '--show-toplevel']);
  if (!top) continue;
  const common = git(p, ['rev-parse', '--git-common-dir']);
  const key = path.resolve(top, common || '.git'); // los worktrees de un mismo repo cuentan una vez
  if (repos.has(key)) continue;
  const email = git(top, ['config', 'user.email']);
  const log = git(top, ['log', '--all', '--no-merges', `--since=${YEAR}-01-01`, `--until=${YEAR + 1}-01-01`,
    ...(email ? [`--author=${email}`] : []), '--pretty=format:%H%x1f%aI%x1f%(trailers:key=Co-Authored-By,valueonly,separator=%x2C)%x1e']);
  if (log === null) gitFailed++; // git no contestó a tiempo: se avisa, no se da por «cero commits»
  const r = { name: path.basename(top), commits: 0, ai: 0, days: new Set(),
    agentFile: ['CLAUDE.md', 'AGENTS.md', '.cursorrules', '.cursor/rules'].some((f) => fs.existsSync(path.join(top, f))),
    skills: fs.existsSync(path.join(top, '.claude/skills')) || fs.existsSync(path.join(top, '.claude/commands')),
    agents: fs.existsSync(path.join(top, '.claude/agents')),
    tests: ['tests', 'test', '__tests__', 'vitest.config.ts', 'vitest.config.mts', 'jest.config.js', 'pytest.ini', 'playwright.config.ts'].some((f) => fs.existsSync(path.join(top, f))),
    worktrees: (git(top, ['worktree', 'list', '--porcelain']) || '').split('\n').filter((l) => l.startsWith('worktree ')).length };
  for (const rec of (log || '').split('\x1e')) {
    const [h, date, co] = rec.trim().split('\x1f');
    if (!h || !date || seenCommits.has(h)) continue;
    seenCommits.add(h);
    const isAi = /claude|anthropic|copilot|cursor|codex|openai|gemini|devin/i.test(co || '');
    r.commits++; commits++; if (isAi) { r.ai++; aiCommits++; }
    const d = date.slice(0, 10); r.days.add(d); inc(commitDays, d); inc(commitHours, Number(date.slice(11, 13)));
  }
  repos.set(key, r);
}

// ---------- 4 · Agentes, skills y conectores instalados ----------
const count = (dir, re) => { try { return fs.readdirSync(dir).filter((f) => re.test(f)).length; } catch { return 0; } };
let ownSkills = 0; let ownAgents = 0; let plugins = 0; const mcpConfigured = new Set();
for (const d of configDirs) {
  ownSkills += count(path.join(d, 'skills'), /./) + count(path.join(d, 'commands'), /\.md$/);
  ownAgents += count(path.join(d, 'agents'), /\.md$/);
  const inst = readJson(path.join(d, 'plugins', 'installed_plugins.json'));
  plugins += inst?.plugins ? Object.keys(inst.plugins).length : 0;
  const cj = readJson(path.join(d, '.claude.json'));
  for (const k of Object.keys(cj?.mcpServers || {})) mcpConfigured.add(k);
  for (const pr of Object.values(cj?.projects || {})) for (const k of Object.keys(pr.mcpServers || {})) mcpConfigured.add(k);
}

// ---------- 5 · Derivados ----------
const inYear = (d) => d.startsWith(String(YEAR));
const activeDates = new Set([...Object.keys(days), ...Object.keys(commitDays)].filter(inYear));
const sorted = [...activeDates].sort();
let streak = 0; let best = 0; let bestEnd = null; let prev = null;
for (const d of sorted) {
  const t = Date.parse(d + 'T12:00:00');
  streak = prev && Math.round((t - prev) / 86400000) === 1 ? streak + 1 : 1;
  if (streak > best) { best = streak; bestEnd = d; }
  prev = t;
}
const weeks = {}; // semana ISO aproximada -> nº de días activos
for (const d of sorted) { const dt = new Date(d + 'T12:00:00'); const onejan = new Date(dt.getFullYear(), 0, 1); inc(weeks, Math.floor((dt - onejan) / 604800000)); }
const hourAll = Array.from({ length: 24 }, (_, h) => (hours[h] || 0));
const peakHour = hourAll.indexOf(Math.max(...hourAll));
const sum = (o, f) => Object.values(o).reduce((a, x) => a + f(x), 0);
const repoList = [...repos.values()].filter((r) => r.commits > 0).sort((a, b) => b.commits - a.commits);
const top = (o, n) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => ({ k, v }));
const byMonth = Array.from({ length: 12 }, () => 0);
for (const d of sorted) byMonth[Number(d.slice(5, 7)) - 1]++;

// Coste equivalente por API (estimación). Precios públicos en $ por millón de tokens: [entrada, salida, lectura de caché, escritura de caché].
// Lectura de caché: el precio publicado si lo hay; si no, 0,1 × entrada. Escritura: 1,25 × entrada (caché de 5 min).
const PRICES = [
  [/opus-5-5/, [4, 20, 0.2, 5]], [/opus-(5|4-[5-8])/, [5, 25, 0.5, 6.25]],
  [/sonnet-5-5/, [2, 10, 0.1, 2.5]], [/sonnet-5/, [2, 10, 0.2, 2.5]], [/sonnet-4/, [3, 15, 0.3, 3.75]],
  [/fable-5-2|mythos-5-2/, [8, 40, 0.2, 10]], [/fable|mythos/, [10, 50, 1, 12.5]],
  [/haiku-5/, [0.1, 0.5, 0.01, 0.125]], [/haiku/, [1, 5, 0.1, 1.25]],
];
let costUsd = 0; let unpriced = 0;
for (const [k, m] of Object.entries(models)) {
  const p = PRICES.find(([re]) => re.test(k))?.[1];
  if (!p) { unpriced += m.out; continue; }
  costUsd += (m.in * p[0] + m.out * p[1] + m.cacheRead * p[2] + m.cacheWrite * p[3]) / 1e6;
}
const claudeDaysAll = Object.keys(days).length;
// Referencia de Anthropic (docs de Claude Code, «Manage costs»): media ≈ 13 $ por día activo; el 90 % queda por debajo de 30 $.
const REF = { avg: 13, p90: 30 };
const perDay = claudeDaysAll ? costUsd / claudeDaysAll : 0;
const band = perDay >= REF.p90 ? 'top10' : perDay >= REF.avg ? 'aboveAvg' : 'belowAvg';

const out = {
  year: YEAR, generatedAt: new Date().toISOString(),
  history: {
    firstSession, totalSessions, activeDays: sorted.length, bestStreak: best, bestStreakEnd: bestEnd,
    dates: sorted, // los días con actividad (solo la fecha), para pintar el calendario del año
    daysByMonth: byMonth, daysPerWeek: weeks,
    messages: sum(days, (x) => x.messages), toolCalls: sum(days, (x) => x.tools),
    hours: hourAll, peakHour,
    tokens: { out: sum(models, (m) => m.out), in: sum(models, (m) => m.in), cacheRead: sum(models, (m) => m.cacheRead), cacheWrite: sum(models, (m) => m.cacheWrite) },
    models: Object.entries(models).map(([k, m]) => ({ k, ...m })).filter((m) => m.out > 0).sort((a, b) => b.out - a.out),
    claudeDays: Object.keys(days).filter(inYear).length,
    cost: { usd: Math.round(costUsd), perActiveDay: Math.round(perDay), band, ref: REF, unpricedOutTokens: unpriced },
  },
  git: {
    repos: repos.size, reposWithCommits: repoList.length, commits, aiCommits,
    commitDays: Object.keys(commitDays).length,
    reposAgentFile: repoList.filter((r) => r.agentFile).length, reposSkills: repoList.filter((r) => r.skills).length,
    reposAgents: repoList.filter((r) => r.agents).length, reposTests: repoList.filter((r) => r.tests).length,
    worktrees: [...repos.values()].reduce((a, r) => a + Math.max(0, r.worktrees - 1), 0),
    top: repoList.slice(0, 8).map((r) => ({ name: r.name, commits: r.commits, ai: r.ai, days: r.days.size })),
  },
  detail: {
    from: det.from && dayOf(det.from), to: det.to && dayOf(det.to), sessions: det.sessions, userPrompts: det.userPrompts,
    toolCalls: det.toolCalls, toolsPerPrompt: det.userPrompts ? +(det.toolCalls / det.userPrompts).toFixed(1) : 0,
    subagentRuns: det.subagentRuns, agentCalls: det.agentCalls, sessionsWithSubagents: det.sessionsWithSubagents, agentTypes: top(det.agentTypes, 6),
    skillCalls: det.skillCalls, skillsUsed: Object.keys(det.skills).length, topSkills: top(det.skills, 6),
    mcpCalls: det.mcpCalls, mcpServersUsed: Object.keys(det.mcpServers).length, topMcp: top(det.mcpServers, 6),
    topTools: top(det.tools, 8), bash: det.bash, ext: top(det.ext, 8), planMode: det.planMode,
    messagesToOtherAgents: det.messagesToOtherAgents, linesAdded: det.linesAdded, linesRemoved: det.linesRemoved,
    projects: Object.keys(det.projects).length, maxParallel: det.maxParallel, parallelDays: det.parallelDays,
    activeHours: +(det.activeMs / 3600000).toFixed(1), longestActiveHours: +(det.longestActiveMs / 3600000).toFixed(1),
    promptHours: Array.from({ length: 24 }, (_, h) => det.promptHours[h] || 0),
  },
  setup: { ownSkills, ownAgents, plugins, mcpConfigured: mcpConfigured.size, configDirs: configDirs.length },
};
out.user = git(HOME, ['config', '--global', 'user.name']) || '';
out.sources = { configDirs: configDirs.length, transcripts: scanned, repos: repos.size, gitFailed };
return out;
}
