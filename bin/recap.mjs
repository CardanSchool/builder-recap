#!/usr/bin/env node
// Builder Recap · Cardan School. Calcula tu resumen del año en este equipo y lo abre en la web de Cardan School, con
// las cifras detrás del `#` de la dirección (no llegan al servidor). Con --local, en un archivo, sin conexión.
// Idioma: `--lang es|en` lo fija para la página y para estos mensajes; sin él, vale el del sistema: la orden abre
// `/es/recap/ver` o `/en/recap/ver` (en la web manda la dirección). Con `--local`, va en los datos.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { collect } from '../src/extract.mjs';
import { publicData } from '../src/sanitize.mjs';
import { buildPage, packData, webRecap } from '../src/build.mjs';

const args = process.argv.slice(2);
const opt = { year: new Date().getFullYear(), dirs: [], out: null, open: true, names: false, local: false, web: null, lang: '' };
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--year') opt.year = Number(args[++i]);
  else if (a === '--config-dir') opt.dirs.push(args[++i]);
  else if (a === '--out') opt.out = args[++i];
  else if (a === '--no-open') opt.open = false;
  else if (a === '--names') opt.names = true;
  else if (a === '--local') opt.local = true;
  else if (a === '--lang') opt.lang = String(args[++i] || '').toLowerCase();
  else if (a === '--web') opt.web = args[++i]; // para probar contra una preview de la web
  else if (a === '--help' || a === '-h') opt.help = true;
  else { opt.bad = a; }
}
const sysEs = (() => { try { return /^es\b/i.test(Intl.DateTimeFormat().resolvedOptions().locale); } catch { return true; } })();
const L = opt.lang === 'en' || opt.lang === 'es' ? opt.lang : sysEs ? 'es' : 'en';
const T = {
  es: {
    help: ['Uso: builder-recap [opciones]', '',
      '  --year <año>          Año a resumir (por defecto, el actual)',
      '  --config-dir <ruta>   Otra carpeta de configuración de Claude Code (se puede repetir)',
      '  --lang <es|en>        Idioma de las tarjetas (por defecto, el del sistema)',
      '  --local               Guardar las tarjetas en un archivo en vez de abrirlas en la web (sin conexión)',
      '  --out <archivo>       Con --local, dónde guardar el HTML (por defecto, tu carpeta de usuario)',
      '  --no-open             No abrir el navegador al terminar',
      '  --names               Incluir los nombres de tus repos (por defecto no salen del análisis)'],
    bad: (a) => `Opción desconocida: ${a}. Prueba con --help.`, badLang: 'El idioma tiene que ser es o en.', badYear: 'El año no es válido.',
    intro: 'Todo se calcula en este equipo. Solo salen recuentos, y solo a tu navegador.\n', reading: (n) => `Leyendo sesiones de Claude Code… ${n}`,
    none: ['No he encontrado sesiones de Claude Code ni commits tuyos en este equipo.', 'Si tu configuración de Claude Code está en otra carpeta, pásala con --config-dir <ruta>.'],
    read: (sec, s) => `Leído en ${sec} s: ${s.transcripts} sesiones, ${s.repos} repos, ${s.configDirs} carpeta(s) de Claude Code.`,
    sum: (d, p, c) => `${d} días construyendo · ${p} proyectos · ${c} commits`,
    gitFailed: (n) => `Aviso: git no contestó a tiempo en ${n} repo(s); sus commits no están contados. Vuelve a ejecutarlo con el equipo más libre.`,
    file: (t) => `\nTu resumen: ${t}`,
    fileNames: 'Ese archivo lleva tus cifras y los nombres de tus repos: comparte las imágenes o el vídeo, no el archivo.',
    fileNoNames: 'Ese archivo lleva tus cifras, sin nombres de repos. Para compartir, usa «Compartir» en la página.',
    web: ['\nTu resumen se abre en la web de Cardan School. Tus cifras van detrás del # de la dirección: no llegan a',
      'ningún servidor, solo a tu navegador. Desde ahí lo compartes; en LinkedIn se publica sin salir de la página.'],
    manual: (t) => `Si no se abre solo, copia esta dirección en el navegador:\n${t}`,
  },
  en: {
    help: ['Usage: builder-recap [options]', '',
      '  --year <year>         Year to summarise (default: the current one)',
      '  --config-dir <path>   Another Claude Code configuration folder (can be repeated)',
      '  --lang <es|en>        Language of the cards (default: the system\'s)',
      '  --local               Save the cards to a file instead of opening them on the web (offline)',
      '  --out <file>          With --local, where to save the HTML (default: your home folder)',
      '  --no-open             Do not open the browser at the end',
      '  --names               Include your repo names (left out of the analysis by default)'],
    bad: (a) => `Unknown option: ${a}. Try --help.`, badLang: 'The language must be es or en.', badYear: 'The year is not valid.',
    intro: 'Everything is calculated on this machine. Only counts leave it, and only to your browser.\n', reading: (n) => `Reading Claude Code sessions… ${n}`,
    none: ['I could not find any Claude Code sessions or commits of yours on this machine.', 'If your Claude Code configuration is in another folder, pass it with --config-dir <path>.'],
    read: (sec, s) => `Read in ${sec} s: ${s.transcripts} sessions, ${s.repos} repos, ${s.configDirs} Claude Code folder(s).`,
    sum: (d, p, c) => `${d} days building · ${p} projects · ${c} commits`,
    gitFailed: (n) => `Note: git did not answer in time in ${n} repo(s); their commits are not counted. Run it again when the machine is less busy.`,
    file: (t) => `\nYour recap: ${t}`,
    fileNames: 'That file contains your numbers and your repo names: share the images or the video, not the file.',
    fileNoNames: 'That file contains your numbers, without repo names. To share, use «Share» on the page.',
    web: ['\nYour recap opens on the Cardan School website. Your numbers travel after the # in the address: they reach',
      'no server, only your browser. Share it from there; on LinkedIn it is posted without leaving the page.'],
    manual: (t) => `If it does not open by itself, copy this address into your browser:\n${t}`,
  },
}[L];

if (opt.help) { console.log(T.help.join('\n')); process.exit(0); }
if (opt.bad) { console.error(T.bad(opt.bad)); process.exit(1); }
if (opt.lang && opt.lang !== 'es' && opt.lang !== 'en') { console.error(T.badLang); process.exit(1); }
if (!Number.isInteger(opt.year)) { console.error(T.badYear); process.exit(1); }

console.log(`Builder Recap ${opt.year} · Cardan School`);
console.log(T.intro);
const tty = process.stdout.isTTY;
const started = Date.now();
const data = collect({
  year: opt.year, extraDirs: opt.dirs,
  onProgress: (n) => { if (tty && n % 5 === 0) process.stdout.write('\r' + T.reading(n)); },
});
if (tty) process.stdout.write('\r' + ' '.repeat(50) + '\r');

const s = data.sources;
if (!s.transcripts && !data.git.commits && !data.history.activeDays) {
  for (const l of T.none) console.error(l);
  process.exit(1);
}

const pub = publicData(data, { names: opt.names, lang: opt.lang || L }); // sin --lang, el idioma del sistema
let target;
if (opt.local) {
  target = path.resolve(opt.out || path.join(os.homedir(), `builder-recap-${opt.year}.html`));
  fs.writeFileSync(target, buildPage('code', pub));
} else target = `${opt.web || webRecap(opt.lang || L)}#d=${packData(pub)}`; // /es/ o /en/: en la web manda la dirección

const nf = new Intl.NumberFormat(L === 'en' ? 'en-US' : 'es-ES');
console.log(T.read(Math.round((Date.now() - started) / 1000), s));
console.log(T.sum(nf.format(data.history.activeDays), nf.format(data.git.reposWithCommits), nf.format(data.git.commits)));
if (s.gitFailed) console.log(T.gitFailed(s.gitFailed));
if (opt.local) {
  console.log(T.file(target));
  console.log(opt.names ? T.fileNames : T.fileNoNames);
} else {
  for (const l of T.web) console.log(l);
  console.log(T.manual(target));
}

if (opt.open) {
  const [cmd, argv] = process.platform === 'win32' ? ['cmd', ['/c', 'start', '', target]]
    : process.platform === 'darwin' ? ['open', [target]] : ['xdg-open', [target]];
  try { spawn(cmd, argv, { detached: true, stdio: 'ignore' }).on('error', () => {}).unref(); } catch { /* se abre a mano */ }
}
