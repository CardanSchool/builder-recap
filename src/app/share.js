// ---------- Compartir: una hoja, qué tarjeta y dónde ----------
// · Publicar en LinkedIn (ordenador): con la cuenta de la persona, como foto (ver «LinkedIn en el ordenador» abajo).
//   Descartado tras probarlo: pegar con Ctrl + V (LinkedIn no la pegó), descargar y subir, y un enlace con vista
//   previa (LinkedIn la pinta en miniatura).
// · Slack: se copia la imagen y se pega en el canal (Slack sí acepta imágenes pegadas).
// · En el móvil, el menú del sistema lleva la imagen a la app de LinkedIn o de Instagram.
// · Descargar la imagen o el vídeo y copiar la imagen.
const $s = (id) => document.getElementById(id);
const CODE = typeof kitFrame === 'function'; // edición Claude Code: estilos y tarjeta resumen
const NAMES = CODE && CARDS.length === 8 ? tl('s.names') : CARDS.map((_, i) => tl('s.card', i + 1));
const SH = { card: CODE ? 'resumen' : CARDS.length - 1, step: 'start', msg: '', blob: null, link: null, text: '', busy: '', postUrl: '' };
const canShareFiles = () => { try { return !!(navigator.canShare && navigator.canShare({ files: [new File([''], 'a.png', { type: 'image/png' })] })); } catch { return false; } };
const isPhone = () => matchMedia('(pointer: coarse)').matches;
const shareText = () => (typeof CAPTION_LI === 'function' ? CAPTION_LI() : CAPTION());

// La tarjeta resumen (edición Claude Code): todo en una, pensada para publicar. Colores según el estilo.
const SUMC = { alterna: ['#1A1714', '#F2EDE6', '#E8824D', '#A3988F'], tinta: ['#1A1714', '#F2EDE6', '#E8824D', '#A3988F'], crema: ['#F2EDE6', '#1A1714', '#C4693A', '#6B6560'], naranja: ['#E8824D', '#1A1714', '#F2EDE6', '#5A2E18'] };
function summaryCard(w, h) { // ojo: aquí `h` es el alto; los datos de historia van por D.history
  const k = document.createElement('canvas'); k.width = w; k.height = h; const c = k.getContext('2d');
  const [bg, fg, acc, mute] = SUMC[S.style] || SUMC.alterna, M = 84, tall = h > w * 1.5, oy = tall ? 250 : 0;
  const mo = (t, x, y, size, col, o = {}) => { c.save(); c.font = (o.w || 400) + ' ' + size + 'px ' + MONO; try { c.letterSpacing = size * (o.tr ?? 0.16) + 'px'; } catch {} c.fillStyle = col; c.textAlign = o.al || 'left'; c.fillText(o.raw ? t : UP(t), x, y); c.restore(); };
  const se = (t, x, y, size, col) => { c.save(); c.font = '700 ' + size + 'px ' + SERIF; c.fillStyle = col; c.fillText(t, x, y); c.restore(); };
  const fit = (t, maxW, size) => { c.save(); for (; size > 40; size -= 4) { c.font = '700 ' + size + 'px ' + SERIF; if (c.measureText(t).width <= maxW) break; } c.restore(); return size; };
  c.fillStyle = bg; c.fillRect(0, 0, w, h);
  c.save(); c.globalAlpha = 0.14; c.strokeStyle = acc; c.lineWidth = 3; c.translate(w - 170, oy + 330); // gimbal en alambre
  c.beginPath(); c.ellipse(0, 0, 150, 330, 0, 0, Math.PI * 2); c.stroke(); c.beginPath(); c.ellipse(0, 0, 340, 120, -0.4, 0, Math.PI * 2); c.stroke(); c.restore();
  mo('Cardan School', M, 96 + (tall ? 40 : 0), 20, mute);
  mo('Builder Recap · ' + D.year, w - M, 96 + (tall ? 40 : 0), 20, mute, { al: 'right' });
  const y0 = oy + 210, who = S.user || D.user;
  c.fillStyle = acc; c.beginPath(); c.arc(M + 7, y0 - 8, 7, 0, Math.PI * 2); c.fill();
  mo((who ? who + ' · ' : '') + tl('sum.mine', D.year), M + 26, y0, 22, acc);
  const nm = archNow().a, ns = fit(nm, w - 2 * M, 132);
  se(nm, M - 4, y0 + 40 + ns, ns, fg);
  se(archNow().b, M, y0 + 96 + ns, 46, acc);
  const ly = y0 + 150 + ns;
  c.fillStyle = fg; c.fillRect(M, ly, w - 2 * M, 2);
  se(String(Math.round(score)), M - 4, ly + 150, 150, fg);
  mo(tl('score'), M + 210, ly + 82, 18, mute);
  mo(LEVELS[level], M + 210, ly + 122, 26, fg, { w: 700 });
  const cells = [[tl('sum.days'), n0(D.history.activeDays)], [tl('sum.streak'), D.history.bestStreak + ' d'], [tl('sum.commits'), n0(g.commits)], [tl('sum.projects'), n0(g.reposWithCommits)], [tl('sum.parallel'), n0(d.maxParallel)], [tl('sum.hour'), peak + ':00']];
  const gy = ly + 210, cw = (w - 2 * M) / 3;
  c.fillStyle = fg; c.fillRect(M, gy - 10, w - 2 * M, 2);
  cells.forEach(([l, v], i) => { const x = M + (i % 3) * cw, y = gy + 40 + Math.floor(i / 3) * 140; mo(l, x, y, 17, mute); se(v, x, y + 78, 72, fg); });
  const ty = gy + 330 + (tall ? 70 : 0);
  c.save(); c.translate(w / 2, ty); c.rotate((-3 * Math.PI) / 180); c.fillStyle = acc; c.fillRect(-w, -38, w * 2, 76);
  c.font = '700 24px ' + MONO; try { c.letterSpacing = '4.8px'; } catch {} c.fillStyle = '#1A1714'; c.textBaseline = 'middle';
  const t = tl('sum.tape', D.year); let x = -w; while (x < w) { c.fillText(t, x, 2); x += c.measureText(t).width; } c.restore();
  const fy = h - (tall ? 210 : 120);
  mo(tl('makeYours'), M, fy, 18, mute);
  mo(tl('phrase.a'), M, fy + 38, 22, acc, { w: 700, raw: true, tr: 0.02 });
  mo('__REPO__', M, fy + 70, 22, acc, { w: 700, raw: true, tr: 0.02 });
  return k;
}
// El resumen en horizontal (1200 × 630): la vista previa del enlace en LinkedIn, que la enseña a todo el ancho del post y
// siempre apaisada. Letra grande: en el feed del móvil se ve a unos 350 px de ancho.
function summaryWide() {
  const w = 1200, ht = 630, k = document.createElement('canvas'); k.width = w; k.height = ht; const c = k.getContext('2d');
  const [bg, fg, acc, mute] = SUMC[S.style] || SUMC.alterna, M = 64, split = 690;
  const mo = (t, x, y, size, col, o = {}) => { c.save(); c.font = (o.w || 400) + ' ' + size + 'px ' + MONO; try { c.letterSpacing = size * 0.14 + 'px'; } catch {} c.fillStyle = col; c.textAlign = o.al || 'left'; c.fillText(UP(t), x, y); c.restore(); };
  const se = (t, x, y, size, col) => { c.save(); c.font = '700 ' + size + 'px ' + SERIF; c.fillStyle = col; c.fillText(t, x, y); c.restore(); };
  const fit = (t, maxW, size, min = 36) => { c.save(); for (; size > min; size -= 4) { c.font = '700 ' + size + 'px ' + SERIF; if (c.measureText(t).width <= maxW) break; } c.restore(); return size; };
  c.fillStyle = bg; c.fillRect(0, 0, w, ht);
  c.save(); c.globalAlpha = 0.12; c.strokeStyle = acc; c.lineWidth = 3; c.translate(split - 40, 300); // gimbal en alambre
  c.beginPath(); c.ellipse(0, 0, 120, 260, 0, 0, Math.PI * 2); c.stroke(); c.beginPath(); c.ellipse(0, 0, 280, 96, -0.4, 0, Math.PI * 2); c.stroke(); c.restore();
  mo('Cardan School', M, 66, 17, mute); mo('Builder Recap · ' + D.year, w - M, 66, 17, mute, { al: 'right' });
  const who = S.user || D.user;
  c.fillStyle = acc; c.beginPath(); c.arc(M + 6, 136, 6, 0, Math.PI * 2); c.fill();
  mo((who ? who + ' · ' : '') + tl('sum.mine', D.year), M + 22, 143, 19, acc);
  const nm = archNow().a, ns = fit(nm, split - M - 40, 96);
  se(nm, M - 3, 160 + ns, ns, fg);
  const sub = archNow().b, ss = fit(sub, split - M - 40, 34, 22); se(sub, M, 160 + ns + 50, ss, acc);
  se(String(Math.round(score)), M - 4, 478, 112, fg);
  mo(tl('sum.level'), M + 150, 430, 16, mute); mo(tl('sum.of', LEVELS[level]), M + 150, 462, 20, fg, { w: 700 });
  c.fillStyle = fg; c.globalAlpha = 0.25; c.fillRect(split, 120, 2, 380); c.globalAlpha = 1;
  const cells = [[tl('sum.days'), n0(D.history.activeDays)], [tl('sum.streak'), D.history.bestStreak + ' d'], [tl('sum.commits'), n0(g.commits)], [tl('sum.projects'), n0(g.reposWithCommits)], [tl('sum.parallel'), n0(d.maxParallel)], [tl('sum.hour'), peak + ':00']];
  const gx = split + 50, cw = (w - M - gx) / 2;
  cells.forEach(([l, v], i) => { const x = gx + (i % 2) * cw, y = 150 + Math.floor(i / 2) * 120; mo(l, x, y, 15, mute); se(v, x, y + 62, 58, fg); });
  c.save(); c.translate(w / 2, 568); c.rotate((-2 * Math.PI) / 180); c.fillStyle = acc; c.fillRect(-w, -28, w * 2, 56);
  c.font = '700 19px ' + MONO; try { c.letterSpacing = '3.6px'; } catch {} c.fillStyle = bg === '#E8824D' ? '#F2EDE6' : '#1A1714'; c.textBaseline = 'middle';
  const t = tl('sum.tapeWide', D.year); let x = -w; while (x < w) { c.fillText(t, x, 2); x += c.measureText(t).width; } c.restore();
  return k;
}
// Edición chat (sin resumen): la tarjeta elegida a la derecha y el personaje a la izquierda, en 1200 × 630.
function cardWide(img) {
  const o = document.createElement('canvas'); o.width = 1200; o.height = 630; const x = o.getContext('2d');
  x.fillStyle = '#1A1714'; x.fillRect(0, 0, 1200, 630);
  const hh = 570, ww = Math.round((hh * img.width) / img.height); x.save(); x.shadowColor = 'rgba(0,0,0,.5)'; x.shadowBlur = 30; x.drawImage(img, 1200 - ww - 60, 30, ww, hh); x.restore();
  const tx = 70, maxW = 1200 - ww - 60 - tx - 50, name = archNow().a; let size = 76;
  x.fillStyle = '#E8824D'; x.font = '700 22px ' + MONO; x.fillText('BUILDER RECAP · ' + D.year, tx, 150);
  x.fillStyle = '#F2EDE6'; for (; size > 40; size -= 4) { x.font = '700 ' + size + 'px ' + SERIF; if (x.measureText(name).width <= maxW) break; }
  x.fillText(name, tx, 150 + size + 30);
  x.font = '700 22px ' + MONO; x.fillStyle = '#E8824D'; x.fillText(tl('sum.wideYours'), tx, 540);
  return o;
}
// Una tarjeta en el formato pedido: 9:16 tal cual; en 4:5, entera, como una tarjeta sobre la mesa.
function cardCanvas(sel, fmt) {
  if (sel === 'resumen') return fmt === '916' ? summaryCard(1080, 1920) : summaryCard(1080, 1350);
  render(sel, CARDS[sel].dur - 0.6, 0); render(sel, CARDS[sel].dur - 0.6, 0);
  const k = document.createElement('canvas'); k.width = 1080; k.height = fmt === '916' ? 1920 : 1350; const c = k.getContext('2d');
  if (fmt === '916' && FH === 1920) { c.drawImage(cv, 0, 0); return k; }
  c.fillStyle = (SUMC[S.style] || SUMC.alterna)[0] === '#F2EDE6' ? '#E8E0D5' : '#0F0D0C'; c.fillRect(0, 0, k.width, k.height);
  const hh = k.height - 80, ww = (hh * W) / FH;
  c.save(); c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = 40; c.shadowOffsetY = 14; c.drawImage(cv, (k.width - ww) / 2, 40, ww, hh); c.restore();
  return k;
}
const fileName = () => `builder-recap-${D.year}-${SH.card === 'resumen' ? tl('file.summary') : String(SH.card + 1).padStart(2, '0')}.png`;
const pngOf = (fmt) => new Promise((ok) => cardCanvas(SH.card, fmt).toBlob(ok, 'image/png'));
// ---------- La hoja ----------
const sheet = $s('pub');
let sheetWasPaused = false, thumbs = [], preview = '';
const hold = () => { if (!st.paused) setPaused(true); return st.i; }; // se para en la tarjeta que hay en pantalla
function makeThumbs() {
  const t = CODE ? [['resumen', tl('s.summary'), summaryCard(1080, 1350).toDataURL('image/jpeg', 0.7)]] : [];
  CARDS.forEach((c, i) => { render(i, c.dur - 0.6, 0); render(i, c.dur - 0.6, 0); t.push([i, NAMES[i], cv.toDataURL('image/jpeg', 0.6)]); });
  return t;
}
// La imagen se prepara al elegir la tarjeta, no al pulsar: así copiarla es inmediato y el navegador deja abrir LinkedIn
// en el mismo clic (si tarda, lo bloquea).
function snap() { const k = cardCanvas(SH.card, '45'); preview = k.toDataURL('image/jpeg', 0.85); SH.blob = null; k.toBlob((b) => { SH.blob = b; }, 'image/png'); }
const isMac = () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
const esc = (t) => String(t).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);
function draw() {
  const side = '<div class="side"><img src="' + preview + '" alt="' + esc(tl('s.alt')) + '"><span class="size">' + esc(tl('s.size')) + '</span></div>';
  const close = '<button class="x" data-go="close" aria-label="' + esc(tl('s.close')) + '">×</button>';
  let m = '';
  if (SH.step === 'start') {
    m = close + '<h2 id="pub-title">' + tl('s.title') + '</h2><p class="sub">' + tl('s.sub') + '</p>'
      + '<p class="lbl">' + tl('s.what') + '</p><div class="pick">' + thumbs.map(([k, n, src]) => '<button data-card="' + k + '" aria-pressed="' + (String(k) === String(SH.card)) + '"><img src="' + src + '" alt=""><span>' + esc(n) + '</span></button>').join('') + '</div>'
      + (typeof STYLES !== 'undefined' ? '<p class="lbl">' + tl('s.style') + '</p><div class="styles">' + Object.entries(STYLES).map(([k, s2]) => '<button data-style="' + k + '" aria-pressed="' + (k === S.style) + '"><span class="sw" style="background:linear-gradient(135deg,' + s2.dark.bg + ' 50%,' + s2.light.bg + ' 50%)"><i style="background:' + s2.dark.acc + '"></i></span>' + esc(s2.name) + '</button>').join('') + '</div>' : '')
      + '<div class="nets"><button class="li" data-go="li"><b>in</b> ' + tl('s.li') + '</button><button class="ig" data-go="ig"><b>IG</b> Instagram</button></div>'
      + '<div class="row">' + (isPhone() && canShareFiles() ? '<button class="ghost" data-go="apps">' + tl('s.apps') + '</button>' : '<button class="ghost" data-go="slack">Slack</button>') + '<button class="ghost" data-go="dl">' + tl('s.dl') + '</button></div>'
      + '<p class="msg" role="status" aria-live="polite">' + esc(SH.msg) + '</p>'
      + '<p class="hint">' + tl('s.hint') + ' <button class="lnk" data-go="copy">' + tl('s.copy') + '</button> · <button class="lnk" data-go="rec">' + tl('s.video') + '</button></p>';
  } else if (SH.step === 'compose') {
    // Versión web: el texto y «Publicar» van aquí mismo; LinkedIn solo pide permiso en una ventanita la primera vez.
    m = '<button class="x" data-go="start" aria-label="' + esc(tl('s.back')) + '">‹</button>'
      + '<h2 id="pub-title">' + tl('s.li') + '</h2><p class="sub">' + tl('s.compose.sub') + '</p>'
      + '<textarea id="li-text" maxlength="1500" aria-label="' + esc(tl('s.textAria')) + '">' + esc(SH.text) + '</textarea>'
      + '<button class="li" data-go="publish"' + (SH.busy ? ' disabled' : '') + '><b>in</b> ' + (SH.busy ? esc(SH.busy) : tl('s.li')) + '</button>'
      + '<p class="msg" role="status" aria-live="polite">' + esc(SH.msg) + '</p>'
      + '<p class="hint">' + tl('s.compose.hint') + '</p>';
  } else if (SH.step === 'done') {
    m = close + '<div class="done"><span class="tick">✓</span><h2 id="pub-title">' + tl('s.done') + '</h2><p class="sub">' + tl('s.done.sub') + '</p>'
      + '<div class="row"><a class="ghost" href="' + esc(SH.postUrl) + '" target="_blank" rel="noopener">' + tl('s.seePost') + '</a><button class="ghost" data-go="start">' + tl('s.another') + '</button></div></div>';
  } else if (SH.step === 'li') {
    m = '<button class="x" data-go="start" aria-label="' + esc(tl('s.back')) + '">‹</button>'
      + '<h2 id="pub-title">' + tl('s.tab') + '</h2><p class="sub">' + tl('s.tab.sub') + '</p>'
      + '<ol class="steps big">' + tl('s.tab.steps') + '</ol>'
      + '<p class="sub">' + tl('s.tab.photo') + '</p>'
      + '<div class="row"><button class="ghost" data-go="reopen">' + tl('s.reopen') + '</button><button class="ghost" data-go="unshare">' + tl('s.unshare') + '</button></div>'
      + '<p class="msg" role="status" aria-live="polite">' + esc(SH.msg) + '</p>';
  }
  sheet.innerHTML = '<div class="box">' + side + '<div class="main">' + m + '</div></div>';
}
const say = (t) => { SH.msg = t || ''; const el = sheet.querySelector('.msg'); if (el) el.textContent = SH.msg; };
const imageNow = () => (SH.blob ? Promise.resolve(SH.blob) : pngOf('45'));
const copyImage = async () => navigator.clipboard.write([new ClipboardItem({ 'image/png': SH.blob || pngOf('45') })]);
// ---------- LinkedIn en el ordenador: se publica la foto con la cuenta de la persona ----------
// Un enlace no sirve: LinkedIn pinta su vista previa en miniatura (probado). Una foto grande solo
// sale si se sube como foto, y desde una web eso es su API: la tarjeta se sube a la web de Cardan School y se abre
// `/es/recap/publicar/<id>`, donde la persona revisa el texto y publica (permiso de LinkedIn la primera vez). Al
// publicar, la web la borra. La confirmación va allí y no aquí: si bastara con esta página, cualquier web podría
// publicar en el LinkedIn de quien ya dio permiso una vez. Servidor: `recap-shares` y `api/recap/linkedin` del curso.
// Lo único que sale de la página, y solo al pulsar. Dos direcciones de la misma web: cardanschool.com redirige hoy
// (307) sin permiso CORS y el navegador corta la subida; la directa sí lo tiene. Se prueba en orden.
// En la versión web (la sirve la propia web) la subida es a la misma dirección.
const SHARE_APIS = WEB ? ['/api/recap/share'] : ['https://www.cardanschool.com/api/recap/share', 'https://www.foundingproductengineer.com/api/recap/share'];
async function postShare(suffix, fd) {
  let last = null;
  for (const SHARE_API of SHARE_APIS) { try { return await fetch(SHARE_API + suffix, { method: 'POST', body: fd }); } catch (e) { last = e; } }
  throw last;
}
const jpegOf = (k) => new Promise((ok) => k.toBlob(ok, 'image/jpeg', 0.9));
const uploads = new Map(); // tarjeta + ajustes → enlace: pulsar otra vez no la vuelve a subir
async function uploadCard() {
  const key = SH.card + '|' + JSON.stringify(S);
  if (uploads.has(key)) return uploads.get(key);
  const card = cardCanvas(SH.card, '45'), wide = CODE ? summaryWide() : cardWide(card);
  const fd = new FormData();
  fd.append('card', await jpegOf(card), 'carta.jpg'); fd.append('og', await jpegOf(wide), 'og.jpg');
  fd.append('card_index', String(SH.card === 'resumen' ? 0 : SH.card + 1)); fd.append('edition', D.edition || 'code'); fd.append('lang', LANG);
  let r; try { r = await postShare('', fd); } catch { throw new Error(tl('s.noNet')); }
  if (!r.ok) throw new Error(r.status === 429 ? tl('s.tooMany') : tl('s.upFail'));
  const j = await r.json(); j.key = key; uploads.set(key, j); return j;
}
const PUBLISH_PAGE = { es: 'https://www.cardanschool.com/es/recap/publicar/', en: 'https://www.cardanschool.com/en/recap/publicar/' };
const publishUrl = () => PUBLISH_PAGE[LANG] + encodeURIComponent(SH.link.id) + '?t=' + encodeURIComponent(shareText().slice(0, 1500));
function openLinkedIn() {
  if (!SH.link) return null;
  const win = window.open(publishUrl(), '_blank');
  if (win) { try { win.opener = null; } catch {} }
  return win;
}
// En el móvil, como en las apps: el menú del sistema lleva la imagen a la app de LinkedIn. El texto va copiado por si
// la app no lo recoge.
async function publishLinkedInPhone() {
  try { navigator.clipboard.writeText(shareText()).catch(() => {}); } catch {}
  const f = new File([await imageNow()], fileName(), { type: 'image/png' });
  try { await navigator.share({ files: [f], text: shareText() }); say(tl('s.phone.ok')); }
  catch (e) { if (e && e.name !== 'AbortError') say(tl('s.phone.fail')); }
}
// ---------- Versión web: escribir y publicar aquí mismo ----------
// Al entrar se sube ya la tarjeta (así «Publicar» es inmediato). «Publicar» abre una ventanita con nombre y le manda el
// formulario a `/api/recap/linkedin/start` (misma web: pasa el control de origen), que pide permiso a LinkedIn y
// publica. La página de resultado (`/recap/linkedin`) deja el resultado en localStorage (`recap-li-result`) y se
// cierra; esta página lo oye con el evento `storage`. Así no se sale nunca de aquí.
const LI_WIN = 'recap-linkedin';
async function composeLinkedIn() {
  SH.step = 'compose'; SH.text = shareText(); SH.msg = ''; SH.busy = tl('s.preparing'); draw();
  try { SH.link = await uploadCard(); SH.busy = ''; } catch (e) { SH.busy = ''; SH.msg = e.message + tl('s.manual'); }
  if (SH.step === 'compose') draw();
}
function submitLinkedIn() {
  if (!SH.link) return say(tl('s.notReady'));
  const ta = $s('li-text'); SH.text = ta ? ta.value : SH.text;
  const w = Math.min(620, screen.availWidth || 620), h = Math.min(760, screen.availHeight || 760);
  const win = window.open('', LI_WIN, `popup=yes,width=${w},height=${h},left=${Math.round(((screen.availWidth || w) - w) / 2)},top=${Math.round(((screen.availHeight || h) - h) / 2)}`);
  const f = document.createElement('form'); f.method = 'post'; f.action = '/api/recap/linkedin/start'; f.target = win ? LI_WIN : '_self';
  for (const [k, v] of [['id', SH.link.id], ['text', SH.text], ['locale', LANG]]) { const i = document.createElement('input'); i.type = 'hidden'; i.name = k; i.value = v; f.appendChild(i); }
  document.body.appendChild(f); f.submit(); f.remove();
  SH.busy = tl('s.waiting'); SH.msg = ''; draw();
}
addEventListener('storage', (e) => {
  if (e.key !== 'recap-li-result' || !e.newValue) return;
  let r = {}; try { r = JSON.parse(e.newValue); } catch {}
  SH.busy = '';
  if (r.post) { SH.postUrl = 'https://www.linkedin.com/feed/update/' + r.post + '/'; SH.link = null; uploads.clear(); SH.step = 'done'; }
  else { SH.step = 'compose'; SH.msg = r.error === 'cancelled' ? tl('s.cancelled') : tl('s.rejected'); }
  if (!sheet.hidden) draw();
});
// En el ordenador, un clic: la pestaña se abre ya (tras la subida el navegador la bloquearía), se sube la tarjeta y la
// pestaña va a la página de publicar.
async function publishLinkedIn() {
  SH.msg = '';
  if (isPhone() && canShareFiles()) return publishLinkedInPhone();
  if (WEB) return composeLinkedIn();
  const win = window.open('', '_blank');
  if (win) { try { win.document.write('<p style="font:16px system-ui,sans-serif;padding:24px">' + tl('s.prepPub') + '</p>'); } catch {} }
  const btn = sheet.querySelector('.li'); if (btn) { btn.disabled = true; btn.lastChild.textContent = tl('s.uploading'); }
  try {
    SH.link = await uploadCard();
    if (win && !win.closed) { win.location.href = publishUrl(); try { win.opener = null; } catch {} }
    SH.step = 'li'; draw();
    if (!win) say(tl('s.blocked'));
  } catch (e) { if (win) win.close(); draw(); say(e.message + tl('s.manual')); }
}
async function unshare() {
  const j = SH.link; if (!j) return;
  const fd = new FormData(); fd.append('token', j.deleteToken);
  try { const r = await postShare('/' + j.id, fd); if (!r.ok && r.status !== 404) throw new Error(); uploads.delete(j.key); SH.link = null; say(tl('s.removed')); }
  catch { say(tl('s.removeFail')); }
}
async function shareFile() {
  const f = new File([await pngOf('45')], fileName(), { type: 'image/png' });
  try { await navigator.share({ files: [f], text: CAPTION() }); } catch (e) { if (e && e.name !== 'AbortError') say(tl('s.menuFail')); }
}
sheet.addEventListener('click', async (e) => {
  const b = e.target.closest('button'); if (!b) { if (e.target === sheet) closeSheet(); return; }
  const dt = b.dataset;
  if (dt.card) { SH.card = dt.card === 'resumen' ? 'resumen' : +dt.card; SH.msg = ''; snap(); return draw(); }
  if (dt.style && window.__setStyle) { window.__setStyle(dt.style); thumbs = makeThumbs(); snap(); return draw(); }
  const go = dt.go;
  if (go === 'close') return closeSheet();
  if (go === 'start') { SH.step = 'start'; return draw(); }
  if (go === 'li') return publishLinkedIn();
  if (go === 'publish') return submitLinkedIn();
  if (go === 'unshare') return unshare();
  if (go === 'reopen') { if (!openLinkedIn()) say(tl('s.popup')); return; }
  if (go === 'ig') {
    if (isPhone() && canShareFiles()) return shareFile();
    download(await pngOf('45'), fileName());
    return say(tl('s.ig'));
  }
  if (go === 'apps') return shareFile();
  if (go === 'dl') { download(await imageNow(), fileName()); return say(tl('s.dlDone')); }
  if (go === 'slack') {
    // Slack sí acepta imágenes pegadas: un clic copia la imagen y abre la app de Slack (el navegador pregunta la primera
    // vez). Se copia antes de abrir: con el foco ya en Slack, el navegador no dejaría escribir en el portapapeles.
    if (isPhone() && canShareFiles()) return shareFile();
    // Imagen y texto en el mismo copiado: así Ctrl + V en Slack puede pegar las dos cosas. Si pega solo la imagen
    // (pasa en algunos equipos), queda «Copiar el texto» para pegarlo después.
    try { await navigator.clipboard.write([new ClipboardItem({ 'image/png': SH.blob || pngOf('45'), 'text/plain': new Blob([CAPTION()], { type: 'text/plain' }) })]); }
    catch { try { await copyImage(); } catch { download(await imageNow(), fileName()); return say(tl('s.slackDl')); } }
    try { location.href = 'slack://open'; } catch {}
    say(tl('s.slackOk', (isMac() ? '⌘ + V' : 'Ctrl + V')));
    const t = document.createElement('button'); t.type = 'button'; t.className = 'lnk'; t.dataset.go = 'slacktext'; t.textContent = tl('s.slackText');
    const el = sheet.querySelector('.msg'); if (el) el.appendChild(t);
    return;
  }
  if (go === 'slacktext') {
    try { await navigator.clipboard.writeText(CAPTION()); say(tl('s.slackTextOk', (isMac() ? '⌘ + V' : 'Ctrl + V'))); } catch { say(tl('s.slackTextFail')); }
    return;
  }
  if (go === 'copy') {
    try { await copyImage(); say(tl('s.copied', (isMac() ? '⌘ + V' : 'Ctrl + V'))); } catch { say(tl('s.copyFail')); }
    return;
  }
  if (go === 'rec') { closeSheet(true); document.getElementById('rec').click(); }
});
function openSheet() {
  sheetWasPaused = st.paused; const i = hold();
  if (!CODE || SH.card !== 'resumen') SH.card = i; // abre con la tarjeta que se está viendo (en la de Claude Code, con el resumen)
  thumbs = makeThumbs(); SH.step = 'start'; SH.msg = ''; snap(); draw();
  render(i, CARDS[i].dur - 0.6, 0);
  sheet.hidden = false; const f = sheet.querySelector('.li'); if (f) f.focus();
}
function closeSheet(keep) { if (sheet.hidden) return; sheet.hidden = true; if (!keep) { if (!sheetWasPaused) setPaused(false); $s('sb-open').focus(); } }
$s('sb-open').onclick = openSheet;
