// Lee lo que contesta el asistente y lo deja limpio y acotado. Sin DOM: se prueba con `node --test` (con i18n.js delante:
// los mensajes de error salen de `tl`).
const QKEYS = ['d1', 'd2', 'd3', 'd4', 't1', 't2', 't3', 't4', 'p1', 'p2', 'p3', 'p4'];
const YEAR = new Date().getFullYear();

function normalizeAnswer(o) {
  const str = (v, n) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, n);
  const peso = (v) => Math.min(5, Math.max(1, Math.round(Number(v) || 1)));
  const ans = (v) => { const s = String(v ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim(); return ['si', 's', 'yes', 'y', 'true'].includes(s) ? 'si' : ['no', 'n', 'false'].includes(s) ? 'no' : 'ns'; };
  const list = (v) => (Array.isArray(v) ? v : []);
  const proyectos = list(o.proyectos).map((p) => ({ nombre: str(p && p.nombre, 28), que: str(p && p.que, 50), peso: peso(p && p.peso) })).filter((p) => p.nombre).sort((a, b) => b.peso - a.peso).slice(0, 5);
  const temas = list(o.temas).map((t) => ({ tema: str(t && t.tema, 24), peso: peso(t && t.peso) })).filter((t) => t.tema).sort((a, b) => b.peso - a.peso).slice(0, 6);
  const herramientas = list(o.herramientas).map((h) => str(h, 18)).filter(Boolean).slice(0, 8);
  if (!proyectos.length) throw new Error(tl('p.noProject'));
  if (!temas.length) throw new Error(tl('p.noTopic'));
  const respuestas = {}; for (const k of QKEYS) respuestas[k] = ans(o.respuestas && o.respuestas[k]);
  const nombre = str(o.nombre, 20);
  return { v: 1, edition: 'chat', year: YEAR, user: nombre, nombre, asistente: str(o.asistente, 14), frase: str(o.frase, 90), proyectos, temas, herramientas, respuestas, lang: ['es', 'en'].includes(o.idioma) ? o.idioma : '' };
}
function parseAnswer(txt) {
  // Si lo pegado es el enlace (copiado con «Copiar dirección del enlace») o lo lleva dentro, se lee el enlace
  const link = String(txt).match(/#d=([A-Za-z0-9_\-%.~!*'()]+)/);
  if (link && !String(txt).includes('{')) {
    let raw = link[1];
    if (/\]\([^\s]*#d=/.test(txt) && raw.endsWith(')')) raw = raw.slice(0, -1); // [Ver mis tarjetas](…): sin el ) del final
    return readLink('#d=' + raw);
  }
  const clean = String(txt).replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
  const a = clean.indexOf('{'), b = clean.lastIndexOf('}');
  if (a < 0 || b <= a) throw new Error(tl('p.noBlock'));
  let o; try { o = JSON.parse(clean.slice(a, b + 1)); } catch { throw new Error(tl('p.cut')); }
  return normalizeAnswer(o);
}
// Enlace con los datos dentro (`#d=…`): lo genera el asistente que conoce a la persona. El fragmento (#) no sale del
// navegador: GitHub Pages no lo recibe. Acepta el JSON en base64url (lo que pide el prompt) o codificado para URL
// (lo que sale si el modelo no puede calcular base64). Devuelve null si no hay enlace y lanza un error si está roto.
const LINK_MAX = 12000;
function readLink(hash) {
  if (!String(hash || '').startsWith('#d=')) return null;
  const raw = String(hash).slice(3).trim();
  if (!raw) throw new Error(tl('p.emptyLink'));
  if (raw.length > LINK_MAX) throw new Error(tl('p.longLink'));
  let txt = null;
  if (/^[A-Za-z0-9_-]+={0,2}$/.test(raw)) {
    try {
      const b64 = raw.replace(/-/g, '+').replace(/_/g, '/').replace(/=+$/, '');
      txt = new TextDecoder().decode(Uint8Array.from(atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4)), (c) => c.charCodeAt(0)));
    } catch { txt = null; }
  }
  if (txt === null || !txt.includes('{')) { try { txt = decodeURIComponent(raw); } catch { txt = raw; } }
  try { return parseAnswer(txt); } catch { throw new Error(tl('p.badLink')); }
}
