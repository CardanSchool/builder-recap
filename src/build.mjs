// Monta una página autónoma (un solo HTML, sin nada externo) a partir de las piezas de `src/app`.
//   buildPage('web')          → la edición de Claude Code tal como la sirve la web de Cardan School (`/recap/ver`): lee
//                               las cifras del `#d=` y comparte desde ahí mismo (LinkedIn se publica en la página)
//   buildPage('code', datos)  → la misma edición en un archivo, con los datos dentro (`--local`, sin conexión)
//   buildPage('chat')         → la edición chat, que recibe los datos cuando la persona pega la respuesta
// `node src/build.mjs` regenera `docs/index.html` (la edición chat) y `docs/prompt.txt` y `docs/prompt-en.txt` (su prompt).
// `node src/build.mjs --web-module <archivo.ts>` escribe la página web como módulo para el repo del curso.
import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const rd = (f) => fs.readFileSync(path.join(here, 'app', f), 'utf8');
const opt = (f) => { try { return rd(f); } catch { return ''; } };
const script = (code) => `<script>\n${code.replace(/<\/script/gi, '<\\/script')}\n</script>`;

// Dónde vive el repo público y su web (GitHub Pages desde `docs/`). Si se mueve, se cambia solo aquí: las piezas
// llevan el hueco `__REPO__`, y un test comprueba que README, AGENTS.md y package.json dicen lo mismo.
export const REPO = 'github.com/CardanSchool/builder-recap';
export const SITE = 'https://cardanschool.github.io/builder-recap/';
export const DESCRIPTION = 'Tu año construyendo con IA, en tarjetas para compartir. Gratis y de código abierto, de Cardan School. '
  + 'Con ChatGPT, Claude o Claude Code: tus cifras se calculan en tu equipo y solo llegan a tu navegador.';

// La imagen para redes y buscadores (1200 × 630). Se dibuja con `node src/og-image.mjs` y se sirve desde `docs/`.
export const OG_IMAGE = SITE + 'og.png';
export const LICENSE_URL = 'https://' + REPO + '/blob/main/LICENSE';

// Las preguntas frecuentes, sacadas del README (una sola fuente): bloques «**¿Pregunta?**» + respuesta, en texto plano.
export function faq() {
  const md = fs.readFileSync(path.join(here, '..', 'README.md'), 'utf8');
  const sec = (md.split(/^## Preguntas frecuentes\s*$/m)[1] || '').split(/^## /m)[0];
  const plain = (s) => s.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*\*|`/g, '').replace(/\s+/g, ' ').trim();
  return sec.split(/\n\s*\n/).map((b) => b.trim().match(/^\*\*(¿[^*]+\?)\*\*\s*\n([\s\S]+)$/)).filter(Boolean)
    .map(([, q, a]) => ({ q: plain(q), a: plain(a) }));
}

// Metadatos de la edición chat, la que se publica en la web: para buscadores, asistentes y redes. No cargan nada.
function meta() {
  const title = 'Builder Recap · Tu año construyendo con IA, en tarjetas';
  const pkg = JSON.parse(fs.readFileSync(path.join(here, '..', 'package.json'), 'utf8'));
  const org = { '@type': 'Organization', '@id': 'https://www.cardanschool.com', name: 'Cardan School', url: 'https://www.cardanschool.com' };
  const ld = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebApplication', name: 'Builder Recap', url: SITE, description: DESCRIPTION, image: OG_IMAGE,
      inLanguage: ['es', 'en'], applicationCategory: 'DeveloperApplication', operatingSystem: 'Navegador web', isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' }, publisher: org, sameAs: ['https://' + REPO] },
    { '@type': 'SoftwareSourceCode', name: 'Builder Recap', codeRepository: 'https://' + REPO, license: LICENSE_URL,
      version: pkg.version, programmingLanguage: 'JavaScript', runtimePlatform: 'Node.js ' + pkg.engines.node,
      operatingSystem: 'Windows, macOS, Linux', keywords: pkg.keywords.join(', '), author: org, description: pkg.description },
    { '@type': 'FAQPage', inLanguage: 'es', mainEntity: faq().map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
  ] };
  return [`<meta name="description" content="${DESCRIPTION}">`, `<link rel="canonical" href="${SITE}">`,
    '<meta property="og:type" content="website">', `<meta property="og:title" content="${title}">`,
    `<meta property="og:description" content="${DESCRIPTION}">`, `<meta property="og:url" content="${SITE}">`,
    '<meta property="og:site_name" content="Cardan School">', '<meta property="og:locale" content="es_ES">',
    `<meta property="og:image" content="${OG_IMAGE}">`, '<meta property="og:image:width" content="1200">',
    '<meta property="og:image:height" content="630">', `<meta property="og:image:alt" content="${title}">`,
    '<meta name="twitter:card" content="summary_large_image">', `<meta name="twitter:image" content="${OG_IMAGE}">`,
    `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`].join('\n');
}

// El prompt de la edición chat, como texto: lo que lee un asistente que no puede ejecutar nada. `lang`: 'es' o 'en'.
export function promptText(lang = 'es') { return fill(new Function(`${rd('chat-prompt.js')}; return ${lang === 'en' ? 'RECAP_PROMPT_EN' : 'RECAP_PROMPT'};`)()) + '\n'; }
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const fill = (s) => s.replaceAll('__REPO__', REPO).replaceAll('__SITE__', SITE);

// La edición Claude Code se ve en la web de Cardan School: la orden abre esta dirección con las cifras comprimidas
// detrás del `#` (no llegan al servidor). La página la sirve la web (repo del curso, `/recap/ver`).
export const WEB_RECAP = 'https://www.cardanschool.com/es/recap/ver';
export const webRecap = (lang) => (lang === 'en' ? WEB_RECAP.replace('/es/', '/en/') : WEB_RECAP);
export const packData = (data) => zlib.deflateRawSync(Buffer.from(JSON.stringify(data)), { level: 9 }).toString('base64url');
// Arranque de la página web: lee el `#d=`, lo quita de la barra (si alguien copia la dirección, no se lleva tus cifras)
// y lo guarda en la pestaña por si recargas.
const WEB_BOOT = `(async () => {
  const KEY = 'recap.web', msg = (t) => { document.body.innerHTML = ''; const p = document.createElement('p'); p.style.cssText = 'max-width:520px;margin:20vh auto;padding:0 16px;font:18px/1.5 Inter,system-ui,sans-serif;color:#F2EDE6'; p.textContent = t; document.body.appendChild(p); };
  let txt = null;
  if (location.hash.startsWith('#d=')) {
    try {
      const b64 = location.hash.slice(3).replace(/-/g, '+').replace(/_/g, '/');
      const bytes = Uint8Array.from(atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4)), (c) => c.charCodeAt(0));
      txt = await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).text();
      JSON.parse(txt); try { sessionStorage.setItem(KEY, txt); } catch {}
    } catch { return msg(tl('web.cut')); }
    history.replaceState(null, '', location.pathname);
  } else { try { txt = sessionStorage.getItem(KEY); } catch {} }
  if (!txt) return msg(tl('web.empty'));
  window.RECAP = JSON.parse(txt);
  window.startRecap();
})();`;

export function buildPage(edition, data) {
  const web = edition === 'web';
  if (web) edition = 'code';
  const chat = edition === 'chat';
  // Las piezas comparten ámbito: se juntan, en este orden, dentro de una sola función.
  const engine = ["window.startRecap = () => {\n'use strict';", `const WEB = ${web};`, rd('engine-core.js'), rd(chat ? 'level-chat.js' : 'level-code.js'), rd('pieces.js'), rd('final-card.js'),
    chat ? '' : rd('style-kit.js'), rd(chat ? 'cards-chat.js' : 'cards-code.js'), rd('engine-run.js'), rd('share.js'), '};'].join('\n');
  const boot = chat ? rd('chat-prompt.js') + '\n' + rd('chat-parse.js') + '\n' + rd('chat-boot.js')
    : web ? WEB_BOOT : `window.RECAP = ${JSON.stringify(data).replace(/</g, '\u003c')};\nwindow.startRecap();`;
  // El título va en español en el HTML (buscadores) y lo cambia i18n.js al idioma de la página.
  const tkey = chat ? 'title.chat' : web ? 'title.web' : 'title.code';
  return rd('shell.html')
    .replace('<!--TKEY-->', tkey)
    .replace('<!--TITLE-->', () => new Function(`${rd('i18n.js')}; return I18N.es[${JSON.stringify(tkey)}];`)())
    .replace('<!--META-->', () => (chat ? meta() : web ? '<meta name="robots" content="noindex, nofollow">\n<meta name="referrer" content="same-origin">' : ''))
    .replace('/*FONTS*/', () => opt('fonts.css'))
    .replace('/*EXTRA-CSS*/', () => (chat ? rd('chat-intro.css') : ''))
    .replace('<!--INTRO-->', () => (chat ? rd('chat-intro.html').replace('<!--PROMPT-->', () => esc(promptText().trimEnd())) : ''))
    .replace('<!--AGAIN-->', () => (chat ? '<button id="again" data-i="ui.again">Empezar de nuevo</button>' : ''))
    .replace('<!--SCRIPTS-->', () => [script(rd('assets.js')), script(opt('music.js')), script(rd('i18n.js')), script(engine), script(boot)].join('\n'))
    .replaceAll('__REPO__', REPO).replaceAll('__SITE__', SITE);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url) && process.argv[2] === '--web-module') {
  // La página web, como módulo TypeScript para el repo del curso (lo sirve `/recap/ver`). Generado: no se edita a mano.
  const file = path.resolve(process.argv[3]);
  const head = '// Generado por `node src/build.mjs --web-module` en el repo CardanSchool/builder-recap. No editar a mano.';
  fs.writeFileSync(file, [head, 'export const RECAP_HTML = ' + JSON.stringify(buildPage('web')) + ';', ''].join('\n'));
  console.log(`Página web → ${file} (${Math.round(fs.statSync(file).size / 1024)} KB)`);
} else if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const out = path.join(here, '..', 'docs', 'index.html');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, buildPage('chat'));
  fs.writeFileSync(path.join(path.dirname(out), 'prompt.txt'), promptText());
  fs.writeFileSync(path.join(path.dirname(out), 'prompt-en.txt'), promptText('en'));
  console.log(`Edición chat → ${out} (${Math.round(fs.statSync(out).size / 1024)} KB)`);
}
