// ---------- Piezas compartidas: cifra gigante, guiño y sello ----------
const back = (x) => { x = clamp(x); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
function fit(txt, maxW, maxSize) { let s = maxSize; ctx.save(); for (; s > 44; s -= 4) { ctx.font = `700 ${s}px ${SERIF}`; if (ctx.measureText(txt).width <= maxW) break; } ctx.restore(); return s; }
// Cifra o nombre gigante: entra enorme, se pasa un poco y asienta (golpe). `ref` fija el tamaño con el texto final.
function big(txt, y, t, t0, th, maxSize = 300, ref = txt, color = null, opt = {}) {
  const slam = opt.slam ?? (0.5 + FX * 0.55), size = fit(ref, CW, maxSize), k = pr(t, t0, 0.34), sc = 1 + slam * (1 - (slam ? back(k) : 1));
  ctx.save(); ctx.font = `700 ${size}px ${SERIF}`; const w = ctx.measureText(ref).width, cy = y - size * 0.33;
  ctx.globalAlpha *= slam ? clamp(k * 4) : 1; ctx.translate(M + w / 2, cy); ctx.scale(sc, sc); ctx.fillStyle = color || th.fg; ctx.textBaseline = 'alphabetic';
  ctx.fillText(txt, -w / 2 - size * 0.035, size * 0.33); ctx.restore();
  if (!opt.quiet && slam) { hit(t0 + 0.27, opt.amp ?? 4 + FX * 4); if (FX >= 2) ticks(M + w / 2, cy, w / 2 + 46, size * 0.36 + 46, t, t0 + 0.27, th); }
  return size;
}
function wink(txt, y, t, t0, th) {
  ctx.save(); ctx.font = `500 30px ${SANS}`; ctx.globalAlpha *= ease(pr(t, t0, 0.5)); ctx.fillStyle = th.mute; ctx.textBaseline = 'alphabetic';
  wrap(txt, CW - 40).forEach((l, i) => ctx.fillText(l, M, y + i * 42)); ctx.restore();
}
// Sello: entra grande y «cae» en su sitio, un poco torcido. Devuelve su ancho.
function stamp(txt, x, y, t, t0, th, rot = -4, right = false, size = 19, measure = false) {
  ctx.save(); ctx.font = `700 ${size}px ${MONO}`; try { ctx.letterSpacing = '3px'; } catch {}
  const label = UP(txt), w = ctx.measureText(label).width + 36, k = pr(t, t0, 0.38);
  if (!measure) hit(t0 + 0.3, 3 + FX * 1.5);
  if (k > 0 && !measure) {
    const s = 1 + (1 - back(k)) * (0.55 + FX * 0.4);
    ctx.translate(right ? x - w : x, y); ctx.rotate(rot * Math.PI / 180); ctx.scale(s, s); ctx.globalAlpha *= clamp(k * 3);
    if (th.sticker) { ctx.fillStyle = th.sticker; ctx.fillRect(0, -34, w, 50); }
    ctx.strokeStyle = th.fg; ctx.lineWidth = 2.5; ctx.strokeRect(0, -34, w, 50);
    ctx.fillStyle = th.fg; ctx.textBaseline = 'alphabetic'; ctx.fillText(label, 18, 0);
  }
  ctx.restore(); return w;
}
