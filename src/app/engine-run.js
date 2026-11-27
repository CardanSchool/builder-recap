// Motor (2 de 2).
// ---------- Golpes, temblor, colección, cortinilla de tiras y reproducción ----------
FX_LEVELS.forEach((f, i) => { if (CARDS[i]) CARDS[i].fx = f; }); // intensidad del movimiento: sube hacia el final
THEMES.forEach((v, i) => { if (CARDS[i]) CARDS[i].theme = v; });
setFormat();
let FX = 1, GOV = null, CUR_HITS = [];
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const hit = (ti, amp) => CUR_HITS.push([ti, amp]);
const rnd = (j, s) => { const x = Math.sin(j * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
// Temblor: cada golpe registrado al dibujar (cifra que cae, sello) sacude el lienzo y se apaga rápido.
function shakeAt(c, t) {
  if (REDUCED) return [0, 0];
  let a = c.rumble ? c.rumble(t) : 0;
  for (const [ti, amp] of c._hits || []) if (t >= ti) a += amp * Math.exp(-(t - ti) * 9);
  return a < 0.3 ? [0, 0] : [a * Math.sin(t * 97), a * Math.cos(t * 71)];
}
// Marcas de impacto alrededor de la cifra, como las marcas de corte de la pieza.
function ticks(cx, cy, rx, ry, t, t1, th) {
  const p = pr(t, t1, 0.5); if (p <= 0 || p >= 1) return; const e = ease(p);
  ctx.save(); ctx.strokeStyle = th.fg; ctx.lineWidth = 3; ctx.globalAlpha *= 1 - p; ctx.beginPath();
  for (let j = 0; j < 16; j++) {
    const a = (j / 16) * Math.PI * 2 + 0.2, r0 = 1 + e * 0.22, r1 = r0 + 0.1 * (1 - e) + 0.02;
    ctx.moveTo(cx + Math.cos(a) * rx * r0, cy + Math.sin(a) * ry * r0); ctx.lineTo(cx + Math.cos(a) * rx * r1, cy + Math.sin(a) * ry * r1);
  }
  ctx.stroke(); ctx.restore();
}
// Cortinilla: tiras verticales que tapan la tarjeta al salir y la destapan al entrar. Más tiras cuanto más avanza.
// «Tu colección» (solo en vertical, arriba): cada tarjeta te deja una carta pequeña con su cifra; la sexta es la grande.
// Mismo lenguaje que la carta final: papel, filete interior, un poco torcidas y cayendo con golpe.
function tray(i, t, th) {
  if (FH <= H) return;
  const n = MINIS.length, gap = 24, w = (CW - (n - 1) * gap) / n, hh = 116, y = 106, INK = '#1A1714';
  const got = MINIS.filter((_, s) => i > s + 1 || (i === s + 1 && t >= EARN[i])).length;
  mono(tl('tray', got, n), M, 86, 13, th.mute, { track: 0.14 });
  MINIS.forEach(([label, value], s) => {
    const x = M + s * (w + gap), mine = i === s + 1, k = i > s + 1 ? 1 : mine ? pr(t, EARN[i], 0.36) : 0;
    ctx.save(); ctx.strokeStyle = th.line; ctx.lineWidth = 1.5; ctx.setLineDash([6, 6]); ctx.strokeRect(x + 0.75, y + 0.75, w - 1.5, hh - 1.5); ctx.restore();
    if (k <= 0) { if (s === n - 1) mono('?', x + w / 2, y + hh / 2 + 9, 26, th.mute, { align: 'center', track: 0 }); return; }
    if (mine) hit(EARN[i] + 0.3, 5);
    ctx.save(); ctx.translate(x + w / 2, y + hh / 2); ctx.rotate((rnd(s, 3) - 0.5) * 0.13); const sc = 1 + (1 - back(k)) * 0.9; ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 3);
    ctx.fillStyle = th === TH.cream ? '#FFFFFF' : TH.cream.bg; ctx.fillRect(-w / 2, -hh / 2, w, hh);
    ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.strokeRect(-w / 2 + 5, -hh / 2 + 5, w - 10, hh - 10);
    mono(label, -w / 2 + 15, -hh / 2 + 32, 11, '#6B6560', { track: 0.1 });
    text(value(), -w / 2 + 14, hh / 2 - 20, `700 30px ${SERIF}`, INK);
    ctx.restore();
  });
}

function strips(i, t) {
  const c = CARDS[i], prev = CARDS[i - 1], n = 4 + 3 * (c.fx || 1), w = W / n;
  const bar = (s, hh, fromTop, col) => { if (hh > 0.5) { ctx.fillStyle = col; ctx.fillRect(Math.floor(s * w), fromTop ? 0 : FH - hh, Math.ceil(w) + 1, hh); } };
  if (prev && t < 0.7) for (let s = 0; s < n; s++) bar(s, FH * (1 - ease(pr(t, s * (0.26 / n), 0.34))), s % 2 === 0, TH[prev.theme].fg);
  const out = t - (c.dur - 0.42);
  if (i < CARDS.length - 1 && out > 0) for (let s = 0; s < n; s++) bar(s, FH * Math.pow(pr(out, s * (0.2 / n), 0.2), 2), s % 2 === 1, TH[c.theme].fg);
}

// ---------- Reproducción ----------
const st = { i: 0, t0: performance.now(), paused: false, at: 0, rec: null };
const bar = document.getElementById('bar');
CARDS.forEach(() => { const i = document.createElement('i'); i.appendChild(document.createElement('b')); bar.appendChild(i); });
// Render con el marco de style-kit.js (edición Claude Code).
function renderKit(i, t, clock) {
  const c = CARDS[i], th = TH[c.theme]; CUR_TH = th; CLOCK = clock || 0;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = th.bg; ctx.fillRect(0, 0, W, FH);
  FX = c.fx || 1; GOV = null;
  const [dx, dy] = shakeAt(c, t); CUR_HITS = [];
  ctx.save(); ctx.translate(dx, dy);
  kitBack(th, c, t);
  kitFrame(th, i, t, c);
  ctx.save(); c.draw(t, th, clock); ctx.restore();
  ctx.restore();
  c._hits = CUR_HITS;
  if (c.over) c.over(t, th);
  strips(i, t);
}
function render(i, t, clock) {
  if (typeof kitFrame === 'function') return renderKit(i, t, clock);
  const c = CARDS[i], th = TH[c.theme];
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = th.bg; ctx.fillRect(0, 0, W, FH);
  FX = c.fx || 1; SPIN.dur = 1; SPIN.turns = 1 + (FX - 1) * 0.6; GOV = c.gimbal ? c.gimbal(t) : null;
  const [dx, dy] = shakeAt(c, t); CUR_HITS = [];
  ctx.save(); ctx.translate(dx, dy);
  backdrop(th, c, t, clock);
  tray(i, t, th);
  ctx.translate(0, OY); // el bloque de contenido (1080 × 1350) va centrado en la zona segura del vertical
  frame(th, i + 1, CARDS.length, c.sources);
  ctx.save(); c.draw(t, th, clock); ctx.restore();
  ctx.restore();
  c._hits = CUR_HITS;
  if (c.over) c.over(t, th);
  strips(i, t);
}
function go(i) { st.i = (i + CARDS.length) % CARDS.length; st.t0 = performance.now(); st.at = 0; st.done = false; }

// ---------- Música: el tema de Cardan School (music.js), sincronizado con las tarjetas ----------
// Con Web Audio y el audio incrustado: sin URL, así que la CSP de la web no cambia. Los navegadores no dejan sonar
// sin un gesto: arranca con el primer clic o tecla, y el botón «Sonido» la quita (se recuerda). El tema se alinea
// para que su cierre caiga al final de la secuencia (empieza en un múltiplo de 2 s: un compás) y, al terminar, se
// deja sonar el acorde final. El vídeo la lleva si el sonido está puesto.
const SND = { on: store.get('sound', 'on') !== 'off', ctx: null, buf: null, gain: null, dest: null, node: null, t0: 0, off: 0, init: null };
const SEQ_DUR = CARDS.reduce((s, c) => s + c.dur, 0);
const seqT = () => CARDS.slice(0, st.i).reduce((s, c) => s + c.dur, 0) + (st.paused ? st.at : (performance.now() - st.t0) / 1000);
function sndInit() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!SND.init && typeof MUSIC === 'string' && AC) {
    SND.ctx = new AC(); SND.gain = SND.ctx.createGain(); SND.gain.connect(SND.ctx.destination);
    if (SND.ctx.createMediaStreamDestination) { SND.dest = SND.ctx.createMediaStreamDestination(); SND.gain.connect(SND.dest); }
    SND.init = (async () => {
      const bin = atob(MUSIC), bytes = new Uint8Array(bin.length); for (let k = 0; k < bin.length; k++) bytes[k] = bin.charCodeAt(k);
      SND.buf = await SND.ctx.decodeAudioData(bytes.buffer);
      SND.off = Math.max(0, Math.floor((SND.buf.duration - SEQ_DUR) / 2) * 2);
    })().catch(() => { SND.buf = null; });
  }
  if (SND.ctx && SND.ctx.state === 'suspended') SND.ctx.resume().catch(() => {});
  return SND.init || Promise.resolve();
}
function sndStop() { if (SND.node) { try { SND.node.stop(); } catch {} SND.node.disconnect(); SND.node = null; } }
function sndStart(t) {
  sndStop(); const pos = SND.off + t; if (pos >= SND.buf.duration - 0.05) return;
  const n = SND.ctx.createBufferSource(), now = SND.ctx.currentTime; n.buffer = SND.buf; n.connect(SND.gain);
  SND.gain.gain.cancelScheduledValues(now); SND.gain.gain.setValueAtTime(0, now); SND.gain.gain.linearRampToValueAtTime(0.85, now + 0.08);
  n.start(now, pos); SND.node = n; SND.t0 = now - pos;
}
function sndSync() {
  if (!SND.buf || !SND.ctx || SND.ctx.state !== 'running') return;
  if (!SND.on || (st.paused && !st.done)) return sndStop();
  if (st.done) return; // al terminar, el acorde final suena hasta el final
  const want = SND.off + seqT();
  if (!SND.node || Math.abs(SND.ctx.currentTime - SND.t0 - want) > 0.25) sndStart(seqT());
}
const sndBtn = document.getElementById('snd');
const sndLabel = () => { if (sndBtn) { sndBtn.dataset.i = SND.on ? 'ui.soundOn' : 'ui.soundOff'; sndBtn.textContent = tl(sndBtn.dataset.i); sndBtn.setAttribute('aria-pressed', String(SND.on)); } };
if (sndBtn) { if (typeof MUSIC !== 'string') sndBtn.hidden = true; sndLabel(); sndBtn.onclick = (e) => { e.stopPropagation(); SND.on = !SND.on; store.set('sound', SND.on ? 'on' : 'off'); sndLabel(); if (SND.on) sndInit(); else sndStop(); }; }
const firstGesture = () => { if (SND.on) sndInit(); removeEventListener('pointerdown', firstGesture, true); removeEventListener('keydown', firstGesture, true); };
addEventListener('pointerdown', firstGesture, true); addEventListener('keydown', firstGesture, true);

function tick(now) {
  const c = CARDS[st.i]; let t = st.paused ? st.at : (now - st.t0) / 1000;
  if (t >= c.dur) {
    if (st.rec && st.i === CARDS.length - 1) { const r = st.rec; st.rec = null; st.paused = true; st.done = true; st.at = c.dur - 0.6; t = st.at; setTimeout(() => r.stop(), SND.on && SND.buf ? 2500 : 0); } // el vídeo recoge el acorde final
    else if (st.i === CARDS.length - 1) { st.paused = true; st.done = true; st.at = c.dur - 0.6; t = st.at; playBtn.textContent = tl('ui.play'); if (sheet.hidden) openSheet(); } // al terminar, se queda en la carta y sale la hoja de compartir
    else { go(st.i + 1); t = 0; }
  }
  sndSync();
  render(st.i, t, now / 1000);
  [...bar.children].forEach((el, j) => { el.firstChild.style.transform = `scaleX(${j < st.i ? 1 : j === st.i ? t / CARDS[st.i].dur : 0})`; });
  requestAnimationFrame(tick);
}
const playBtn = document.getElementById('play');
function setPaused(p) { if (p) st.at = Math.min((performance.now() - st.t0) / 1000, CARDS[st.i].dur - 0.6); else st.t0 = performance.now() - st.at * 1000; st.paused = p; st.done = false; playBtn.textContent = p ? tl('ui.play') : tl('ui.pause'); }
playBtn.onclick = () => setPaused(!st.paused);
const step = (dir) => { go(st.i + dir); if (st.paused) st.at = CARDS[st.i].dur - 0.6; };
document.getElementById('prev').onclick = () => step(-1);
document.getElementById('next').onclick = () => step(1);
cv.onclick = (e) => { const r = cv.getBoundingClientRect(); step(e.clientX - r.left < r.width / 3 ? -1 : 1); };
const download = (blob, name) => { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); };
document.getElementById('rec').onclick = async () => {
  if (st.rec) return;
  closeSheet(true);
  if (SND.on) await sndInit(); // el clic es el gesto que deja arrancar el audio
  const audio = SND.on && SND.buf && SND.dest ? SND.dest.stream.getAudioTracks() : [];
  const types = audio.length ? ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus'] : [];
  const type = [...types, 'video/mp4;codecs=avc1.42E01E', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm'].find((m) => window.MediaRecorder && MediaRecorder.isTypeSupported(m));
  if (!type) return msg(tl('video.no'));
  const stream = new MediaStream([...cv.captureStream(30).getVideoTracks(), ...(types.includes(type) ? audio : [])]);
  const chunks = []; const rec = new MediaRecorder(stream, { mimeType: type, videoBitsPerSecond: 8e6 });
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  rec.onstop = () => { download(new Blob(chunks, { type }), `recap-${D.year}.${type.includes('mp4') ? 'mp4' : 'webm'}`); msg(tl('video.ready', type.includes('mp4') ? 'MP4' : 'WebM')); playBtn.textContent = tl('ui.play'); };
  msg(tl('video.wait')); st.paused = false; playBtn.textContent = tl('ui.pause'); go(0); st.rec = rec; rec.start();
};
addEventListener('keydown', (e) => {
  if (!sheet.hidden) { if (e.key === 'Escape') closeSheet(); return; }
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
  if (e.key === 'ArrowRight') step(1); else if (e.key === 'ArrowLeft') step(-1);
  else if (e.key === ' ') { e.preventDefault(); setPaused(!st.paused); }
  else if (e.key.toLowerCase() === 'p') document.getElementById('panel').classList.toggle('open');
});
// panel
const sel = document.getElementById('vArch');
ARCH.forEach((a) => { const o = document.createElement('option'); o.value = a.id; o.textContent = `${a.a} ${a.b}`; sel.appendChild(o); });
for (const [id, key] of [['vGimbal', 'gimbal'], ['vNames', 'names'], ['vArch', 'arch'], ['vCost', 'cost'], ['vUser', 'user'], ['vFormat', 'format']]) {
  const el = document.getElementById(id); el.value = S[key];
  el.oninput = () => { S[key] = el.value; store.set(key, el.value); if (key === 'format') setFormat(); };
}
// Estilos para compartir (solo si la página lleva style-kit.js): se eligen en la hoja de compartir (share.js).
if (typeof STYLES !== 'undefined') {
  bar.hidden = true; // el marco del kit ya dibuja su barra de historias dentro de cada tarjeta
  const o = document.querySelector('#vFormat option[value="4x5"]'); if (o) o.remove(); // las tarjetas, solo en vertical
  window.__setStyle = (k) => { if (!STYLES[k]) return; S.style = k; store.set('style2', k); applyStyle(); };
}
window.__recap = { render, CARDS, st, go, setPaused, AXES, level, arch: archNow, snd: SND };

const fonts = [`700 92px ${SERIF}`, `400 23px ${SANS}`, `500 30px ${SANS}`, `400 20px ${MONO}`, `700 20px ${MONO}`];
Promise.race([Promise.all([...fonts.map((f) => document.fonts.load(f)), loadImg('lockupInk'), loadImg('lockupCream'), loadImg('markOrange'), loadImg('markInk')]), new Promise((r) => setTimeout(r, 3000))])
  .then(() => { if (matchMedia('(prefers-reduced-motion: reduce)').matches) { st.paused = true; st.at = CARDS[0].dur - 0.6; playBtn.textContent = tl('ui.play'); } st.t0 = performance.now(); window.__recapReady = true; requestAnimationFrame(tick); });
