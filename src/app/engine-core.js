// Motor (1 de 2): marca, ajustes, utilidades de dibujo, gimbal, fondo y marco.
// Estos archivos no son módulos: `src/build.mjs` los junta, en orden, dentro de una sola función (`startRecap`).
const D = window.RECAP, A = window.ASSETS || {};
const cv = document.getElementById('c'), ctx = cv.getContext('2d');
const msg = (t) => { document.getElementById('msg').textContent = t || ''; };
if (!D) return;
langFromData(D);

// ---------- Marca (cardan:brand-guide · School) ----------
const W = 1080, H = 1350, M = 84, CW = W - 2 * M;
const ORANGE = '#E8824D';
const TH = {
  cream: { bg: '#F2EDE6', fg: '#1A1714', mute: '#6B6560', line: '#DCD4C9', card: '#FFFFFF', acc: ORANGE, shape: '#E7DFD3', pop: ORANGE, key: '#1A1714', keyFg: '#F2EDE6', keyMute: '#A3988F', gim: 0.09, gimCol: ORANGE, lockup: 'lockupInk', mark: 'markOrange' },
  ink: { bg: '#1A1714', fg: '#F2EDE6', mute: '#A3988F', line: '#38322E', card: '#272320', acc: ORANGE, shape: '#272320', pop: ORANGE, key: ORANGE, keyFg: '#1A1714', keyMute: '#583725', gim: 0.12, gimCol: ORANGE, lockup: 'lockupCream', mark: 'markOrange' },
  orange: { bg: ORANGE, fg: '#1A1714', mute: '#583725', line: '#C96D3D', card: '#F2EDE6', acc: '#F2EDE6', shape: '#DB7440', pop: '#1A1714', key: '#1A1714', keyFg: '#F2EDE6', keyMute: '#A3988F', gim: 0.12, gimCol: '#1A1714', lockup: 'lockupInk', mark: 'markInk' },
};
const SERIF = '"Source Serif 4", Georgia, serif', SANS = 'Inter, system-ui, sans-serif', MONO = '"Space Mono", ui-monospace, monospace';

// ---------- Ajustes del panel ----------
const store = { get: (k, d) => { try { return localStorage.getItem('recap.' + (D.edition || 'code') + '.' + k) ?? d; } catch { return d; } }, set: (k, v) => { try { localStorage.setItem('recap.' + (D.edition || 'code') + '.' + k, v); } catch {} } };
const S = { gimbal: store.get('gimbal', 'settle'), names: store.get('names', 'hide'), arch: store.get('arch', 'auto'), cost: store.get('cost', 'show'), user: store.get('user', D.user || ''), format: store.get('format', '9x16') };

// ---------- Utilidades ----------
const clamp = (x) => Math.min(1, Math.max(0, x));
const ease = (x) => 1 - Math.pow(1 - clamp(x), 3);
const pr = (t, s, d) => clamp((t - s) / d);
const nf = new Intl.NumberFormat(LOC(), { useGrouping: 'always' });
const n0 = (v) => nf.format(Math.round(v));
const n1 = (v) => new Intl.NumberFormat(LOC(), { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(v);
const imgs = {};
const loadImg = (k) => new Promise((res) => { if (!A[k]) return res(); const i = new Image(); i.onload = () => { imgs[k] = i; res(); }; i.onerror = () => res(); i.src = A[k]; });

function mono(txt, x, y, size, color, o = {}) {
  ctx.save(); ctx.font = `${o.weight || 400} ${size}px ${MONO}`;
  try { ctx.letterSpacing = `${size * (o.track ?? 0.18)}px`; } catch {}
  ctx.fillStyle = color; ctx.globalAlpha *= o.alpha ?? 1; ctx.textAlign = o.align || 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillText(o.raw ? txt : UP(txt), x, y); ctx.restore();
}
function text(txt, x, y, font, color, o = {}) {
  ctx.save(); ctx.font = font; ctx.fillStyle = color; ctx.globalAlpha *= o.alpha ?? 1; ctx.textAlign = o.align || 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillText(txt, x, y); ctx.restore();
}
function wrap(txt, maxW) {
  const out = []; let cur = '';
  for (const w of txt.split(' ')) { const test = cur ? cur + ' ' + w : w; if (cur && ctx.measureText(test).width > maxW) { out.push(cur); cur = w; } else cur = test; }
  if (cur) out.push(cur); return out;
}
// Titular en dos tonos: afirmación + contrapunto en naranja. Devuelve la y donde acaba.
function headline(parts, y, size, t, t0 = 0.15) {
  ctx.save(); ctx.font = `700 ${size}px ${SERIF}`; ctx.textBaseline = 'alphabetic';
  let i = 0; const lh = size * 1.1;
  for (const p of parts) for (const line of wrap(p.text, CW)) {
    const k = ease(pr(t, t0 + i * 0.13, 0.55));
    ctx.save(); ctx.globalAlpha *= k; ctx.fillStyle = p.color; ctx.fillText(line, M - (1 - k) * 30, y + size * 0.82); ctx.restore();
    y += lh; i++;
  }
  ctx.restore(); return y;
}
function stat(label, value, x, y, th, t, t0) {
  const k = ease(pr(t, t0, 0.5));
  ctx.save(); ctx.globalAlpha *= k;
  mono(label, x, y, 15, th.mute, { track: 0.14 });
  text(value, x, y + 50, `700 42px ${SERIF}`, th.fg);
  ctx.restore();
}
function rect(x, y, w, h, color, alpha = 1) { ctx.save(); ctx.globalAlpha *= alpha; ctx.fillStyle = color; ctx.fillRect(x, y, w, h); ctx.restore(); }

// ---------- Gimbal de fondo: geometría oficial (gimbal-fondo.svg) ----------
// En reposo es exactamente el trazado del SVG; al entrar, los anillos giran y se estabilizan.
function gimbal(x, y, size, color, alpha, k, drift) {
  const s = size / 100, phi = Math.asin(13.5 / 32), psi = Math.asin(11 / 32);
  const a1 = phi + k * Math.PI * 1.5 + drift, a2 = psi - k * Math.PI + drift * 0.6;
  const rx1 = Math.max(0.6, 32 * Math.abs(Math.sin(a1))), ry2 = Math.max(0.6, 32 * Math.abs(Math.sin(a2)));
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 1.7; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.ellipse(50, 50, rx1, 32, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(50, 50, 32, ry2, (-7 + k * 38) * Math.PI / 180, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(50, 16); ctx.lineTo(50, 84); ctx.stroke();
  for (const [a, b, c] of [[9, 17, 25], [91, 83, 75]]) { ctx.beginPath(); ctx.moveTo(50, a); ctx.lineTo(53.5, b); ctx.lineTo(50, c); ctx.lineTo(46.5, b); ctx.closePath(); ctx.fill(); }
  ctx.beginPath(); ctx.arc(50, 50, 3.2, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// ---------- Formato y fondo con vida ----------
let FH = 1920, OY = 250; // alto real del lienzo y dónde empieza el bloque de contenido (diseñado a 1080 × 1350)
function setFormat() {
  const tall = S.format !== '4x5'; FH = tall ? 1920 : H; OY = tall ? 250 : 0;
  cv.height = FH; cv.style.aspectRatio = `1080 / ${FH}`;
  const bar = document.getElementById('bar'); if (bar) bar.style.width = `min(100%, calc((100vh - 120px) * ${1080 / FH}))`;
}
function diamond(cx, cy, hw, hh) { ctx.beginPath(); ctx.moveTo(cx, cy - hh); ctx.lineTo(cx + hw, cy); ctx.lineTo(cx, cy + hh); ctx.lineTo(cx - hw, cy); ctx.closePath(); ctx.fill(); }
// Formas grandes y planas sacadas del gimbal (anillos, rombos, órbitas) y bandas. No paran de moverse.
function pattern(kind, th, t, clock) {
  const e = ease(pr(t, 0.05, 0.9));
  ctx.save();
  if (kind === 'anillos') { // anillos que respiran, sangrando por abajo a la derecha
    const cx = W * 0.93, cy = FH - 120, popRing = FH > H ? 0 : -1;
    for (let i = 3; i >= 0; i--) {
      const r = (130 + i * 140 + Math.sin(clock * 1.1 + i * 0.9) * 24) * e; if (r < 30) continue;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.lineWidth = 54; ctx.strokeStyle = i === popRing ? th.pop : th.shape; ctx.stroke();
    }
  } else if (kind === 'rombos') { // columna de rombos que sube sin parar por el borde derecho
    const step = 250, scroll = clock * 80, off = scroll % step, base = Math.floor(scroll / step);
    for (let s = 0, y = FH + step; y > -step; y -= step, s++) { ctx.fillStyle = (((s - base) % 3) + 3) % 3 === 0 ? th.pop : th.shape; diamond(W - 2, y - off, 74 * e, 118 * e); }
  } else if (kind === 'bandas') { // bandas diagonales que se desplazan
    ctx.translate(W / 2, FH / 2); ctx.rotate(-0.5); const step = 250, off = (clock * 50) % step; ctx.fillStyle = th.shape;
    for (let x = -1500; x < 1500; x += step) ctx.fillRect(x + off, -1600, 92 * e, 3200);
  } else if (kind === 'orbitas') { // elipses que giran como los anillos del gimbal; la de contraste se queda tumbada, por debajo del pie
    const cy = FH - 170;
    for (let i = 0; i < 2; i++) {
      ctx.save(); ctx.translate(W * 0.5, cy); ctx.rotate(clock * 0.3 * (i ? -1 : 1) + 0.6 + i * 1.3);
      ctx.beginPath(); ctx.ellipse(0, 0, 560 * e, 200 * e, 0, 0, Math.PI * 2); ctx.lineWidth = 44; ctx.strokeStyle = th.shape; ctx.stroke(); ctx.restore();
    }
    if (FH > H) { ctx.beginPath(); ctx.ellipse(W * 0.5, cy + 40, 600 * e, (130 + Math.sin(clock * 1.2) * 22) * e, 0, 0, Math.PI * 2); ctx.lineWidth = 40; ctx.strokeStyle = th.pop; ctx.stroke(); }
  }
  ctx.restore();
}
// Rótulo que pasa sin parar por arriba y por abajo (solo en vertical, en la zona que queda fuera del bloque).
function marquee(word, th, clock) {
  if (FH <= H || !word) return;
  ctx.save(); ctx.font = `700 104px ${SERIF}`; ctx.fillStyle = th.shape; ctx.textBaseline = 'alphabetic';
  const txt = `${word} · `, w = ctx.measureText(txt).width;
  for (const [y, dir] of [[156, -1], [FH - 64, 1]]) { let x = (clock * 70 * dir) % w; if (x > 0) x -= w; for (; x < W; x += w) ctx.fillText(txt, x, y); }
  ctx.restore();
}
function backdrop(th, c, t, clock) {
  ctx.fillStyle = th.bg; ctx.fillRect(-40, -40, W + 80, FH + 80);
  marquee(typeof c.word === 'function' ? c.word(t) : c.word, th, clock);
  pattern(c.pat, th, t, clock);
  ctx.save(); ctx.globalAlpha = 0.045; ctx.strokeStyle = th.fg; ctx.lineWidth = 1; ctx.beginPath();
  for (let x = 72; x < W; x += 72) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, FH); }
  for (let y = OY % 72; y < FH; y += 72) { ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5); }
  ctx.stroke(); ctx.restore();
  ctx.save(); ctx.translate(0, OY);
  if (GOV) gimbal(GOV.x, GOV.y, GOV.size, ORANGE, GOV.alpha, GOV.k, 0);
  else {
    const k = S.gimbal === 'drift' ? 0 : (1 - ease(pr(t, 0, SPIN.dur))) * SPIN.turns;
    gimbal(W + 300 - 940, 170, 940, th.gimCol, th.gim, k, S.gimbal === 'drift' ? clock * 0.22 : 0);
  }
  ctx.restore();
}

// ---------- Marco del bloque: marcas de corte, cabecera y pie ----------
function frame(th, n, total, sources) {
  ctx.save(); ctx.globalAlpha = 0.38; ctx.strokeStyle = th.mute; ctx.lineWidth = 1.5; ctx.beginPath();
  for (const [cx, cy, dx, dy] of [[40, 40, 1, 1], [W - 40, 40, -1, 1], [40, H - 40, 1, -1], [W - 40, H - 40, -1, -1]]) { ctx.moveTo(cx + dx * 44, cy); ctx.lineTo(cx, cy); ctx.lineTo(cx, cy + dy * 44); }
  ctx.stroke(); ctx.restore();
  const lk = imgs[th.lockup];
  if (lk) ctx.drawImage(lk, M, 100, 40 * (232.49 / 31), 40);
  mono(`${String(n).padStart(2, '0')} / ${String(total).padStart(2, '0')}`, W - M, 128, 18, th.mute, { align: 'right', track: 0.14 });
  let fy = H - 88;
  mono('www.cardanschool.com', M, fy, 19, th.acc, { raw: true, track: 0.04 });
  for (const line of [...sources].reverse()) { fy -= 26; mono(line, M, fy, 15, th.mute, { raw: true, track: 0.02 }); }
  const mk = imgs[th.mark]; if (mk) ctx.drawImage(mk, W - M - 56, H - 84 - 56, 56, 56);
}
