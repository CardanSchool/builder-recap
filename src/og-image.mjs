// Dibuja `docs/og.png` (1200 × 630): la imagen que enseñan las redes y los buscadores al enlazar la edición chat.
// Sin dependencias: monta una página con las tipografías y los logos del repo y la fotografía con el Chrome (o Edge)
// del equipo en modo headless. Solo hace falta volver a lanzarlo si cambia el texto o la marca:
//   node src/og-image.mjs            (o CHROME=<ruta al navegador> node src/og-image.mjs)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const rd = (f) => fs.readFileSync(path.join(here, 'app', f), 'utf8');
const ASSETS = new Function('window', rd('assets.js') + '; return window.ASSETS;')({});
const out = path.join(here, '..', 'docs', 'og.png');

// Gimbal de fondo de cardan:brand-guide (assets/gimbal-fondo.svg), en naranja.
const gimbal = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" color="#E8824D"><g stroke="currentColor" fill="none" stroke-width="1.1" stroke-linecap="round"><ellipse cx="50" cy="50" rx="13.5" ry="32"/><ellipse cx="50" cy="50" rx="32" ry="11" transform="rotate(-7 50 50)"/><line x1="50" y1="16" x2="50" y2="84"/></g><g fill="currentColor"><path d="M50,9 L53.5,17 L50,25 L46.5,17 Z"/><path d="M50,91 L53.5,83 L50,75 L46.5,83 Z"/><circle cx="50" cy="50" r="3.2"/></g></svg>';

const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>${rd('fonts.css')}
*{margin:0;box-sizing:border-box}
html,body{width:1200px;height:630px;overflow:hidden;background:#1A1714}
.c{position:relative;width:1200px;height:630px;padding:56px 72px 52px;color:#F2EDE6;font-family:Inter,sans-serif;
  background-image:linear-gradient(rgba(242,237,230,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(242,237,230,.045) 1px,transparent 1px);background-size:72px 72px}
.bg{position:absolute;width:720px;height:720px;right:-250px;top:-40px;opacity:.10}
.mk{position:absolute;width:36px;height:36px;border-color:rgba(242,237,230,.35);border-style:solid;border-width:0}
.tl{top:24px;left:24px;border-top-width:1px;border-left-width:1px}.tr{top:24px;right:24px;border-top-width:1px;border-right-width:1px}
.bl{bottom:24px;left:24px;border-bottom-width:1px;border-left-width:1px}.br{bottom:24px;right:24px;border-bottom-width:1px;border-right-width:1px}
header{position:relative;display:flex;justify-content:space-between;align-items:center}
header img{height:34px}
.mono{font-family:"Space Mono",monospace;font-size:17px;letter-spacing:.18em;text-transform:uppercase;color:rgba(242,237,230,.6)}
h1{position:relative;margin-top:92px;font-family:"Source Serif 4",serif;font-weight:700;font-size:74px;line-height:1.04;letter-spacing:-.01em;max-width:900px}
h1 em{font-style:normal;color:#E8824D}
p.sub{position:relative;margin-top:26px;font-size:25px;line-height:1.4;color:#A3988F;max-width:820px}
footer{position:absolute;left:72px;right:72px;bottom:52px;display:flex;justify-content:space-between;align-items:flex-end}
footer .url{font-family:"Space Mono",monospace;font-size:19px;letter-spacing:.06em;color:#E8824D}
footer img{width:40px;height:40px}
</style></head><body><div class="c">
<img class="bg" src="data:image/svg+xml;base64,${Buffer.from(gimbal).toString('base64')}" alt="">
<i class="mk tl"></i><i class="mk tr"></i><i class="mk bl"></i><i class="mk br"></i>
<header><img src="${ASSETS.lockupCream}" alt="Cardan School"><span class="mono">Builder Recap</span></header>
<h1>Tu año construyendo con IA, <em>en tarjetas para compartir.</em></h1>
<p class="sub">Con tus datos reales de Claude Code y git, o con lo que recuerda tu asistente. Gratis y de código abierto.</p>
<footer><span class="url">www.cardanschool.com</span><img src="${ASSETS.markOrange}" alt=""></footer>
</div></body></html>`;

const browsers = [process.env.CHROME,
  'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'];
const browser = browsers.find((b) => b && fs.existsSync(b));
if (!browser) { console.error('No encuentro Chrome ni Edge: pásame la ruta con CHROME=<ruta>.'); process.exit(1); }

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'recap-og-'));
const page = path.join(dir, 'og.html');
fs.writeFileSync(page, html);
execFileSync(browser, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
  '--window-size=1200,630', '--virtual-time-budget=3000', `--user-data-dir=${path.join(dir, 'perfil')}`,
  `--screenshot=${out}`, 'file:///' + page.replace(/\\/g, '/')], { stdio: 'ignore' });
fs.rmSync(dir, { recursive: true, force: true });
console.log('Imagen para redes → ' + out);
