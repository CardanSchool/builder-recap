// ---------- Tarjetas (edición chat) ----------
const CARDS = [
  { theme: 'ink', dur: 4.5, sources: [tl('h0.src')], draw(t, th) {
    mono(`${who()}Builder Recap · ${D.year} · ${tl('chat.edition')}`, M, 300, 20, th.mute);
    const end = headline([{ text: tl('h0.a'), color: th.fg }, { text: tl('h0.b'), color: th.acc }], 350, 112, t);
    wink(tl('h0.wink', ASIS, D.year), end + 70, t, 1.0, th);
    mono(tl('h0.list'), M, 1040, 15, th.mute, { track: 0.12, alpha: ease(pr(t, 1.5, 0.6)) });
  } },
  { theme: 'cream', dur: 6, sources: SRC, draw(t, th) {
    mono(tl('h1.lbl'), M, 240, 20, th.mute);
    // La frase, tan grande como quepa en cinco líneas; la última, en naranja.
    let size = 108, lines = [FRASE]; ctx.save();
    for (; size > 50; size -= 6) { ctx.font = `700 ${size}px ${SERIF}`; lines = wrap(FRASE, CW); if (lines.length <= 5) break; }
    ctx.restore();
    lines.forEach((l, i) => { const k = ease(pr(t, 0.3 + i * 0.17, 0.5)); text(l, M - (1 - k) * 30, 320 + size * 0.82 + i * size * 1.1, `700 ${size}px ${SERIF}`, i === lines.length - 1 && lines.length > 1 ? th.acc : th.fg, { alpha: k }); });
    const y = 320 + lines.length * size * 1.1 + 64;
    rect(M, y, 84 * ease(pr(t, 1.5, 0.4)), 4, th.fg);
    mono(tl('h1.by', ASIS, D.year), M, y + 46, 18, th.mute, { track: 0.12, alpha: ease(pr(t, 1.6, 0.5)) });
    stamp(tl('h1.stamp', ASIS), M, y + 140, t, 2.3, th, -3);
  } },
  { theme: 'cream', dur: 6.5, sources: SRC, draw(t, th) {
    mono(tl('h2.lbl'), M, 240, 20, th.mute);
    const ps = D.proyectos, n = ps.length;
    big(n0(n), 440, t, 0.15, th, 220);
    headline([{ text: n === 1 ? tl('h2.one') : tl('h2.many'), color: th.fg }, { text: tl('h2.top', ps[0].nombre), color: th.acc }], 468, 56, t, 0.7);
    // La torre: cada proyecto es un bloque que cae y se apila. Más alto cuanto más habéis trabajado en él.
    const baseY = 1170, total = 440, minH = 52, sum = ps.reduce((a, b) => a + b.peso, 0) || 1;
    let hs = ps.map((b) => Math.max(minH, (b.peso / sum) * total)); const sc = total / hs.reduce((a, x) => a + x, 0); hs = hs.map((x) => Math.max(48, x * sc));
    let y = baseY;
    ps.forEach((b, i) => {
      const bh = hs[i] - 6, t0 = 1.6 + i * 0.26, k = pr(t, t0, 0.34); y -= hs[i];
      if (k <= 0) return; hit(t0 + 0.34, 4 + (n - i) * 1.5);
      const yy = y - (1 - k * k) * (y + 320), dark = i === 0, two = bh >= 84 && b.que;
      ctx.fillStyle = dark ? th.fg : i % 2 ? th.card : th.line; ctx.fillRect(M, yy, CW, bh);
      if (!dark) { ctx.strokeStyle = th.fg; ctx.lineWidth = 1.5; ctx.strokeRect(M + 0.75, yy + 0.75, CW - 1.5, bh - 1.5); }
      const ty = yy + bh / 2 + (two ? -4 : 9);
      text(b.nombre, M + 22, ty, `700 ${bh > 70 ? 28 : 22}px ${SERIF}`, dark ? th.bg : th.fg);
      if (two) text(b.que, M + 22, ty + 30, `400 18px ${SANS}`, dark ? TH.ink.mute : th.mute);
    });
    stamp(n >= 4 ? tl('arch.frentes') : tl('arch.base'), W - M, 330, t, 3.4, th, -5, true);
  } },
  { theme: 'cream', dur: 6.5, sources: SRC, draw(t, th) {
    mono(tl('h3.lbl'), M, 240, 20, th.mute);
    const end = headline([{ text: tl('h3.topic'), color: th.fg }, { text: `${D.temas[0].tema}.`, color: th.acc }], 282, 72, t, 0.2);
    // Cada tema con sus cinco casillas: cuantas más encendidas, más habéis vuelto a él.
    let y = Math.max(end + 56, 520); const seg = 58, gap = 8, x1 = W - M - (5 * seg + 4 * gap);
    D.temas.forEach((tm, i) => {
      const a = ease(pr(t, 1.0 + i * 0.12, 0.5));
      text(tm.tema, M, y + 22, `700 30px ${SERIF}`, th.fg, { alpha: a });
      for (let s = 0; s < 5; s++) {
        const x = x1 + s * (seg + gap); rect(x, y, seg, 26, th.line, a * 0.8);
        if (s < tm.peso) { const k = pr(t, 1.3 + i * 0.12 + s * 0.07, 0.25); if (k > 0) { const sc2 = back(k); ctx.save(); ctx.translate(x + seg / 2, y + 13); ctx.scale(sc2, sc2); ctx.fillStyle = i === 0 ? th.acc : th.fg; ctx.fillRect(-seg / 2, -13, seg, 26); ctx.restore(); } }
      }
      y += 60;
    });
    // Tus herramientas, como sellos.
    y += 26; mono(tl('h3.tools'), M, y, 15, th.mute, { track: 0.14, alpha: ease(pr(t, 2.4, 0.5)) });
    let sx = M, sy = y + 62; const rots = [-3, 2, -2, 3, -1.5, 2.5, -2.5, 1.5];
    D.herramientas.forEach((name, i) => {
      const w = stamp(name, 0, 0, t, 0, th, 0, false, 17, true);
      if (sx + w > W - M) { sx = M; sy += 66; }
      if (sy > 1165) return;
      stamp(name, sx, sy, t, 2.6 + i * 0.16, th, rots[i % rots.length], false, 17); sx += w + 20;
    });
  } },
  { theme: 'cream', dur: 7, sources: SRC, draw(t, th) {
    mono(tl('h4.lbl'), M, 240, 20, th.mute);
    big(n0(Math.round(yesCount * ease(pr(t, 0.2, 0.9)))), 440, t, 0.15, th, 220, n0(yesCount));
    const bestAx = AXES.slice().sort((a, b) => b.v - a.v)[0];
    const end = headline([{ text: tl('h4.of'), color: th.fg }, { text: tl('h4.best', bestAx.verb), color: th.acc }], 468, 56, t, 0.7);
    wink(nsCount ? tl('h4.ns', nsCount, ASIS) : tl('h4.known', ASIS), end + 44, t, 1.4, th);
    // Doce casillas, cuatro por eje: llena = sí, hueca = no, con rayas = tu asistente no lo sabe.
    const gapX = 14, cw = (CW - 3 * gapX) / 4, chh = 86, y0 = 716, pitch = 152;
    AXES.forEach((ax, r) => {
      const y = y0 + r * pitch, a = ease(pr(t, 1.6 + r * 0.2, 0.45));
      mono(ax.k, M, y, 15, th.mute, { track: 0.14, alpha: a });
      mono(String(Math.round(ax.v * a)), W - M, y, 16, th.fg, { align: 'right', track: 0, weight: 700, alpha: a });
      ax.qs.forEach((q, c) => {
        const x = M + c * (cw + gapX), yy = y + 18, v = RSP[q], t0 = 1.8 + r * 0.2 + c * 0.09, k = pr(t, t0, 0.3); if (k <= 0) return;
        if (v === 'si') hit(t0 + 0.25, 2.5);
        ctx.save(); ctx.translate(x + cw / 2, yy + chh / 2); const s2 = v === 'si' ? back(k) : ease(k); ctx.scale(s2, s2); ctx.translate(-cw / 2, -chh / 2);
        if (v === 'si') { ctx.fillStyle = th.fg; ctx.fillRect(0, 0, cw, chh); }
        else { ctx.fillStyle = th.card; ctx.globalAlpha *= v === 'no' ? 1 : 0.5; ctx.fillRect(0, 0, cw, chh); ctx.globalAlpha /= v === 'no' ? 1 : 0.5; ctx.strokeStyle = th.mute; ctx.lineWidth = 1.5; if (v === 'ns') ctx.setLineDash([6, 6]); ctx.strokeRect(0.75, 0.75, cw - 1.5, chh - 1.5); ctx.setLineDash([]); }
        ctx.font = `600 18px ${SANS}`;
        wrap(QUESTIONS[q], cw - 28).slice(0, 2).forEach((l, j) => text(l, 14, 34 + j * 23, `600 18px ${SANS}`, v === 'si' ? th.bg : th.mute));
        mono(v === 'si' ? tl('h4.yes') : v === 'no' ? tl('h4.no') : tl('h4.ns1'), cw - 14, chh - 12, 12, v === 'si' ? TH.ink.mute : th.mute, { align: 'right', track: 0.1 });
        ctx.restore();
      });
    });
  } },
  finalCard({
    sources: SRC,
    header: () => `Builder Recap · ${D.year} · ${tl('chat.edition')}`,
    stats: () => [[tl('h5.projects'), n0(D.proyectos.length)], [tl('h5.topics'), n0(D.temas.length)], [tl('h5.tools'), n0(D.herramientas.length)], [tl('h5.signals'), `${yesCount}/12`]],
  }),
];

// Lo que cambia con la edición: intensidad y tema de cada tarjeta, y la colección de cartas pequeñas.
const FX_LEVELS = [1, 1, 1, 2, 2, 3];
const THEMES = ['ink', 'cream', 'cream', 'cream', 'cream', 'ink'];
const MINIS = [[tl('mini.line'), () => '“ ”'], [tl('h5.projects'), () => n0(D.proyectos.length)], [tl('h5.topics'), () => n0(D.temas.length)], [tl('h5.signals'), () => `${yesCount}/12`], [tl('mini.card'), () => String(Math.round(score))]];
const EARN = [null, 2.6, 3.5, 3.0, 3.4, 3.4]; // segundo de cada tarjeta en el que cae su carta
// El texto que se propone para acompañar la publicación. La persona lo cambia a su gusto.
const CAPTION = () => tl('cap.chat', { year: D.year, asis: ASIS, name: archNow().a, tag: archNow().b });
