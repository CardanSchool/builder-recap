// ---------- Estilo de las tarjetas (edición Claude Code) ----------
// Diseño de 2026-11-26: 9:16, tinta y crema, cifras serif enormes, cintas que pasan, pegatinas blancas y
// barra de historias arriba. Fondo con contenido (la palabra de la tarjeta en hueco, el gimbal en alambre y
// papelitos). Los estilos para compartir solo combinan tinta, crema y naranja.
// Si este archivo está en la página, `render` usa este marco (ver engine-run.js); la edición chat no lo lleva.
S.format = '9x16';
const CREAM = '#F2EDE6', INKC = '#1A1714';
const mixc = (a, b, k) => '#' + [1, 3, 5].map((o) => Math.round(parseInt(a.slice(o, o + 2), 16) * (1 - k) + parseInt(b.slice(o, o + 2), 16) * k).toString(16).padStart(2, '0')).join('');
// Estilos para compartir: solo combinaciones de los tres colores que ya salen en las tarjetas
// (tinta, crema y naranja). Cambia el fondo de cada tarjeta, el acento y el papel de la carta; la composición no.
const SURF = '#272320', CREAM2 = '#E8E0D5';
const ST = (bg, fg, acc) => ({ bg, fg, acc });
const STYLES = {
  alterna: { name: tl('st.alterna'), dark: ST(INKC, CREAM, ORANGE), light: ST(CREAM, INKC, ORANGE), paper: ST(CREAM, INKC, ORANGE) },
  tinta: { name: tl('st.tinta'), dark: ST(INKC, CREAM, ORANGE), light: ST(SURF, CREAM, ORANGE), paper: ST(CREAM, INKC, ORANGE) },
  crema: { name: tl('st.crema'), dark: ST(CREAM2, INKC, ORANGE), light: ST(CREAM, INKC, ORANGE), paper: ST(INKC, CREAM, ORANGE) },
  naranja: { name: tl('st.naranja'), dark: ST(ORANGE, INKC, CREAM), light: ST(CREAM, INKC, ORANGE), paper: ST(CREAM, INKC, ORANGE) },
};
S.style = store.get('style2', 'alterna'); if (!STYLES[S.style]) S.style = 'alterna';
const lumc = (c) => (parseInt(c.slice(1, 3), 16) * 0.299 + parseInt(c.slice(3, 5), 16) * 0.587 + parseInt(c.slice(5, 7), 16) * 0.114) / 255;
const on = (c) => (lumc(c) > 0.5 ? INKC : CREAM); // texto que se lee sobre ese color
function applyStyle() {
  const st = STYLES[S.style];
  for (const [key, s] of [['ink', st.dark], ['cream', st.light]]) Object.assign(TH[key], { bg: s.bg, fg: s.fg, mute: mixc(s.bg, s.fg, 0.6), line: mixc(s.bg, s.fg, 0.15), card: '#FFFFFF', acc: s.acc, key: s.fg, keyFg: s.bg, keyMute: mixc(s.fg, s.bg, 0.55), gimCol: s.acc, mark: s.bg === ORANGE ? 'markInk' : 'markOrange' });
}
applyStyle();
const SERIF6 = (s) => '600 ' + s + 'px ' + SERIF;
function fitS(txt, maxW, maxSize, w = 600) { let s = maxSize; ctx.save(); for (; s > 40; s -= 4) { ctx.font = w + ' ' + s + 'px ' + SERIF; if (ctx.measureText(txt).width <= maxW) break; } ctx.restore(); return s; }
const rise = (t, t0, d = 0.55) => ease(pr(t, t0, d));
// Texto que sube y aparece.
function upText(txt, x, y, font, color, t, t0, o = {}) { const k = rise(t, t0); if (k <= 0) return; ctx.save(); ctx.globalAlpha *= k; ctx.font = font; ctx.fillStyle = color; ctx.textAlign = o.align || 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText(txt, x, y + (1 - k) * 26); ctx.restore(); }
// La cifra enorme: cuenta y cae con un rebote.
function hugeNum(txt, ref, x, y, size, color, t, t0) {
  const k = pr(t, t0, 0.42); if (k <= 0) return 0; const s = 0.86 + 0.14 * ease(k);
  ctx.save(); ctx.font = SERIF6(size); const w = ctx.measureText(ref).width; ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= clamp(k * 3); ctx.fillStyle = color; ctx.textBaseline = 'alphabetic'; ctx.fillText(txt, 0, (1 - ease(k)) * 60); ctx.restore();
  hit(t0 + 0.35, 2); return w;
}
// Pegatina: papel blanco, filete de tinta y sombra dura; cae torcida.
function sticker(txt, x, y, rot, t, t0, right = false, size = 22) {
  const k = pr(t, t0, 0.36); if (k <= 0) return; hit(t0 + 0.3, 3);
  ctx.save(); ctx.font = '700 ' + size + 'px ' + MONO; try { ctx.letterSpacing = (size * 0.16) + 'px'; } catch {}
  const label = UP(txt), w = ctx.measureText(label).width + size * 1.6, hh = size * 2.3, s = 1 + (1 - ease(k)) * 0.4;
  ctx.translate(right ? x - w / 2 : x + w / 2, y); ctx.rotate(rot * Math.PI / 180); ctx.scale(s, s); ctx.globalAlpha *= clamp(k * 3);
  ctx.fillStyle = INKC; ctx.fillRect(-w / 2 + 6, -hh / 2 + 6, w, hh); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-w / 2, -hh / 2, w, hh);
  ctx.strokeStyle = INKC; ctx.lineWidth = 2.5; ctx.strokeRect(-w / 2, -hh / 2, w, hh);
  ctx.fillStyle = INKC; ctx.textBaseline = 'middle'; ctx.fillText(label, -w / 2 + size * 0.8, 2); ctx.restore();
}
function stickerW(txt, size = 22) { ctx.save(); ctx.font = '700 ' + size + 'px ' + MONO; try { ctx.letterSpacing = (size * 0.16) + 'px'; } catch {} const w = ctx.measureText(UP(txt)).width + size * 1.6; ctx.restore(); return w; }
// Rótulo en mono que parte en dos líneas si no cabe.
function monoW(txt, x, y, size, color, maxW, o = {}) {
  ctx.save(); ctx.font = (o.weight || 400) + ' ' + size + 'px ' + MONO; try { ctx.letterSpacing = (size * 0.18) + 'px'; } catch {}
  const ls = wrap(UP(txt), maxW); ctx.restore(); ls.forEach((l, j) => mono(l, x, y + j * size * 1.45, size, color, { ...o, raw: true }));
}
// Cinta que cruza la tarjeta, con el texto pasando.
function tape(y, deg, bg, parts, t, t0, clock, size = 26) {
  const k = ease(pr(t, t0, 0.5)); if (k <= 0) return;
  ctx.save(); ctx.translate(W / 2, y); ctx.rotate(deg * Math.PI / 180); const hh = size * 2.9, L = W * 1.5;
  ctx.fillStyle = bg; ctx.fillRect(-L / 2 - (1 - k) * L, -hh / 2, L, hh);
  ctx.beginPath(); ctx.rect(-L / 2 - (1 - k) * L, -hh / 2, L, hh); ctx.clip();
  ctx.font = '700 ' + size + 'px ' + MONO; try { ctx.letterSpacing = (size * 0.2) + 'px'; } catch {} ctx.textBaseline = 'middle';
  const seg = parts.map(([s, c]) => [UP(s) + '  ★  ', c]), sw = seg.reduce((a, [s]) => a + ctx.measureText(s).width, 0);
  let x = -L / 2 - ((clock * 60) % sw);
  for (; x < L / 2; ) for (const [s, c] of seg) { ctx.fillStyle = c; ctx.fillText(s, x, 2); x += ctx.measureText(s).width; }
  ctx.restore();
}
function dotLabel(txt, y, th, t, t0 = 0.05) { const a = rise(t, t0, 0.4); ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = th.acc; ctx.beginPath(); ctx.arc(M + 6, y - 8, 6, 0, Math.PI * 2); ctx.fill(); ctx.restore(); mono(txt, M + 24, y, 24, th.acc, { track: 0.16, alpha: a }); }
function wire(cx, cy, rx, ry, col, t, clock) { // el gimbal en alambre, girando despacio
  ctx.save(); ctx.translate(cx, cy); ctx.strokeStyle = col; ctx.lineWidth = 2.5; const a = clock * 0.35;
  ctx.beginPath(); ctx.ellipse(0, 0, rx * (0.35 + 0.65 * Math.abs(Math.cos(a))), ry, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, 0, rx * 1.05, ry * (0.3 + 0.12 * Math.sin(a * 1.3)), -0.42, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, 24, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}
const LINE2 = Object.fromEntries(['torre', 'reparte', 'skills', 'git', 'maraton', 'frentes', 'noche', 'primera', 'base'].map((k) => [k, tl('l2.' + k)]));
const TOTAL = 8;
// Marco: barra de historias arriba, cabecera en mono y la fuente abajo con el gimbal.
function kitFrame(th, i, t, c) {
  const n = TOTAL, gap = 10, sw = (CW - (n - 1) * gap) / n;
  for (let s = 0; s < n; s++) { rect(M + s * (sw + gap), 72, sw, 5, s < i ? th.fg : th.line); if (s === i) rect(M + s * (sw + gap), 72, sw * clamp(t / c.dur), 5, th.acc); }
  mono(c.head ? c.head() : 'Cardan School', M, 152, 22, th.mute, { track: 0.2 });
  mono(String(i + 1).padStart(2, '0') + ' / ' + String(n).padStart(2, '0'), W - M, 152, 22, th.mute, { align: 'right', track: 0.16 });
  const foot = c.foot || c.sources; let fy = 1832;
  if (c.www) [].concat(c.www).reverse().forEach((l) => { mono(l, M, fy, 21, th.acc, { track: 0.12, weight: 700 }); fy -= 34; });
  [...foot].reverse().forEach((l) => { mono(l, M, fy, 21, th.mute, { track: 0.12 }); fy -= 32; });
  const mk = imgs[th.mark]; if (mk) ctx.drawImage(mk, W - M - 52, 1832 - 40, 52, 52);
}
function kitBack(th, c, t) {
  ctx.fillStyle = th.bg; ctx.fillRect(-40, -40, W + 80, FH + 80);
  if (c.glow) { const g2 = ctx.createRadialGradient(240, 420, 40, 240, 420, 1100); g2.addColorStop(0, mixc(th.bg, th.acc, 0.26)); g2.addColorStop(1, th.bg); ctx.fillStyle = g2; ctx.fillRect(0, 0, W, FH); }
  ctx.save(); ctx.globalAlpha = 0.035; ctx.strokeStyle = th.fg; ctx.lineWidth = 1; ctx.beginPath();
  for (let x = 72; x < W; x += 72) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, FH); } for (let y = 0; y < FH; y += 72) { ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5); }
  ctx.stroke(); ctx.restore();
  kitDeep(th, c, t);
}
// Fondo con contenido: la palabra de la tarjeta, enorme y en hueco, pasando despacio; el gimbal en alambre detrás;
// y trocitos de papel que suben. Todo muy bajo de contraste para no competir con el dato.
const BG_WORD = tl('bg');
function kitDeep(th, c, t) {
  const i = CARDS.indexOf(c), clock = CLOCK, word = (BG_WORD[i] || '') + ' · ';
  ctx.save(); ctx.font = SERIF6(430); const ww = ctx.measureText(word).width; ctx.strokeStyle = th.fg; ctx.lineWidth = 2; ctx.globalAlpha = 0.07 * rise(t, 0, 0.8);
  for (const [y, dir, off] of [[560, -1, 0], [1660, 1, ww * 0.37]]) { let x = ((clock * 34 * dir + off) % ww); if (x > 0) x -= ww; for (; x < W; x += ww) ctx.strokeText(word, x, y); }
  ctx.restore();
  if (i !== 6) { ctx.save(); ctx.globalAlpha = 0.16 * rise(t, 0, 1); wire(W - 120, 1180, 300, 520, th.acc, t, clock * 0.6 + i); ctx.restore(); }
  for (let j = 0; j < 16; j++) {
    const sp = 18 + rnd(j, 11) * 30, y = FH + 60 - ((clock * sp + rnd(j, 12) * FH * 1.4) % (FH + 140)), x = rnd(j, 13) * W + Math.sin(clock * 0.6 + j) * 24, s = 8 + rnd(j, 14) * 14;
    ctx.save(); ctx.translate(x, y); ctx.rotate(clock * (rnd(j, 15) - 0.5) * 1.4 + j); ctx.globalAlpha = (j % 3 ? 0.14 : 0.3) * rise(t, 0.2, 0.8); ctx.fillStyle = j % 3 ? th.fg : th.acc;
    ctx.fillRect(-s / 2, -s / 2, s, j % 2 ? s : s * 0.45); ctx.restore();
  }
}
let CLOCK = 0;
// upText con 'ACC' usa el acento del tema que está pintando
let CUR_TH = null;
const _upText = upText;
