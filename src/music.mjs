// Genera `src/app/music.js`: el tema de Cardan School incrustado en la página (base64), para que suene sin cargar
// nada de fuera. Lo usa `engine-run.js` con Web Audio (no hace falta una URL, así que la CSP de la web no cambia).
//   node src/music.mjs <tema-principal.mp3>
// Necesita ffmpeg solo aquí, al generar. El tema sale del kit de música de Cardan School. Se baja a 96 kbps para que la página no pese.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const src = process.argv[2];
if (!src || !fs.existsSync(src)) { console.error('Uso: node src/music.mjs <tema-principal.mp3>'); process.exit(1); }
const out = path.join(path.dirname(fileURLToPath(import.meta.url)), 'app', 'music.js');
const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'recap-music-')), 'tema.mp3');
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', src, '-map_metadata', '-1', '-ac', '2', '-ar', '44100', '-b:a', '96k', tmp]);
const b64 = fs.readFileSync(tmp).toString('base64');
fs.rmSync(path.dirname(tmp), { recursive: true, force: true });
fs.writeFileSync(out, '// Generado con `node src/music.mjs` desde el tema de Cardan School (60 s). No editar a mano.\n'
  + '// La música es de Cardan School y no entra en la licencia MIT del código.\n'
  + `window.MUSIC = '${b64}';\n`);
console.log(`Música → ${out} (${Math.round(b64.length / 1024)} KB en base64)`);
