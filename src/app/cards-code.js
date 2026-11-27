// ---------- Tarjetas (edición Claude Code) ----------
// Ocho tarjetas, de la portada a la carta. Usan las piezas de style-kit.js.
function up(txt, x, y, font, color, t, t0, o) { _upText(txt, x, y, font, color === 'ACC' ? CUR_TH.acc : color || CUR_TH.fg, t, t0, o); }
function L2(a, b, y, size, t, t0) { ctx.save(); ctx.font = SERIF6(size); const la = wrap(a, CW), lb = wrap(b, CW); ctx.restore(); let yy = y, j = 0;
  for (const l of la) { up(l, M, yy, SERIF6(size), null, t, t0 + j++ * 0.12); yy += size * 1.05; }
  for (const l of lb) { up(l, M, yy, SERIF6(size), 'ACC', t, t0 + j++ * 0.12); yy += size * 1.05; }
  return yy - size * 1.05; }
function wk(txt, y, t, t0) { ctx.save(); ctx.font = '400 36px ' + SANS; const ls = wrap(txt, CW); ctx.restore(); ls.forEach((l, j) => up(l, M, y + j * 48, '400 36px ' + SANS, CUR_TH.mute === undefined ? null : mixc(CUR_TH.fg, CUR_TH.bg, 0.18), t, t0 + j * 0.08)); return y + (ls.length - 1) * 48; }
const CARDS = [
  { dur: 4.8, sources: [tl('c0.tap')], www: 'www.cardanschool.com', draw(t, th, clock) {
    dotLabel((S.user ? S.user + ' · ' : '') + 'Builder Recap', 312, th, t);
    const yr = String(D.year);
    hugeNum(yr.slice(0, 2), yr.slice(0, 2), M - 14, 690, 430, th.fg, t, 0.2);
    hugeNum(yr.slice(2), yr.slice(2), M - 14, 1040, 430, th.fg, t, 0.45);
    tape(1000, -8, th.acc, [['Builder Recap', on(th.acc)], [tl('c0.cards'), on(th.acc)], [tl('c0.year'), on(th.acc)]], t, 0.9, clock);
    const e = L2(tl('c0.a'), tl('c0.b'), 1236, 100, t, 1.2);
    wk(tl('c0.wk', yr), e + 92, t, 1.6);
  } },
  { dur: 6.2, sources: [tl('c1.src')], draw(t, th) {
    dotLabel(tl('c1.lbl'), 312, th, t);
    const v = n0(h.activeDays * ease(pr(t, 0.2, 1.1)));
    hugeNum(v, n0(h.activeDays), M - 16, 860, fitS(n0(h.activeDays), 900, 640), th.fg, t, 0.15);
    if (has('maraton')) sticker(nameOf('maraton'), W - M + 10, 410, 5, t, 1.6, true);
    const e = L2(tl('c1.a'), tl('c1.b', h.bestStreak), 1000, 92, t, 0.8);
    wk(h.bestStreak >= 14 ? tl('c1.wk.long') : tl('c1.wk'), e + 72, t, 1.3);
    // El año por semanas, en dos bloques (enero-junio, julio-diciembre). Tu racha, en color.
    const dates = new Set(h.dates || []), streak = streakSet(), jan1 = new Date(D.year, 0, 1), off = (jan1.getDay() + 6) % 7, cols = 27, pitch = 31, cs = 26, y0 = 1262;
    hit(3.6, 4);
    for (let half = 0; half < 2; half++) for (let c = 0; c < cols; c++) for (let r = 0; r < 7; r++) {
      const idx = (half * cols + c) * 7 + r - off, dt = new Date(D.year, 0, 1 + idx); if (idx < 0 || dt.getFullYear() !== D.year) continue;
      const key = D.year + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0');
      const x = M + c * pitch, y = y0 + half * (7 * pitch + 22) + r * pitch, a = rise(t, 1.5 + c * 0.012, 0.3);
      rect(x, y, cs, cs, th.line, a);
      if (!dates.has(key)) continue; const k = pr(t, 1.8 + (idx / 366) * 1.6, 0.28); if (k <= 0) continue;
      const s = ease(k), on = streak.has(key) && t > 3.5; ctx.save(); ctx.translate(x + cs / 2, y + cs / 2); ctx.scale(s, s); ctx.fillStyle = on ? th.acc : th.fg; ctx.fillRect(-cs / 2, -cs / 2, cs, cs); ctx.restore();
    }
    const ly = 1262 + 2 * 7 * pitch + 22 + 34, la = rise(t, 3.6, 0.4);
    rect(M, ly - 18, 18, 18, th.fg, la); mono(tl('c1.built'), M + 28, ly, 19, th.mute, { alpha: la }); rect(M + 220, ly - 18, 18, 18, th.acc, la); mono(tl('c1.streak'), M + 248, ly, 19, th.mute, { alpha: la });
  } },
  { dur: 6.2, sources: [tl('c2.src')], draw(t, th, clock) {
    dotLabel(tl('c2.lbl'), 312, th, t);
    hugeNum(n0(g.commits * ease(pr(t, 0.2, 1.1))), n0(g.commits), M - 20, 860, fitS(n0(g.commits), 960, 640), th.fg, t, 0.15);
    if (has('git')) tape(800, 3, th.acc, [[nameOf('git'), on(th.acc)]], t, 1.4, clock, 26);
    const e = L2(tl('c2.a', g.reposWithCommits), tl('c2.b', pct), 990, 88, t, 0.8);
    // Barras que salen del borde: cada proyecto, a lo ancho según sus commits.
    const top = g.top.slice(0, 4), rest = g.reposWithCommits - top.length, restC = g.commits - top.reduce((a, r) => a + r.commits, 0);
    const rows = top.map((r, i) => [S.names === 'show' && r.name ? r.name : tl('c2.proj', i + 1), r.commits]); if (rest > 0 && restC > 0) rows.push([tl('c2.more', rest), restC]);
    const mx = Math.max(...rows.map((r) => r[1])), hs = [84, 66, 54, 42, 38], cols = [th.acc, th.fg, mixc(th.fg, th.bg, 0.25), mixc(th.fg, th.bg, 0.62), mixc(th.fg, th.bg, 0.78)];
    let y = e + 70;
    rows.forEach(([name, v], i) => {
      const k = pr(t, 1.7 + i * 0.18, 0.5), w = Math.max(380, (W - M) * (v / mx)) * ease(k), hh = hs[i] || 36; if (k <= 0) { y += hh + 12; return; }
      rect(0, y, w, hh, cols[i] || cols[4]); const fg = on(cols[i] || cols[4]), fs = hh > 60 ? 34 : hh > 50 ? 28 : 24;
      ctx.save(); ctx.globalAlpha *= clamp(k * 2); text(name, M, y + hh / 2 + fs * 0.36, '600 ' + fs + 'px ' + SERIF, fg); mono(n0(v), w - 24, y + hh / 2 + 8, Math.max(18, fs * 0.72), fg, { align: 'right', track: 0.04, weight: 700 }); ctx.restore();
      hit(1.7 + i * 0.18 + 0.3, 2); y += hh + 12;
    });
  } },
  { dur: 6.2, sources: [tl('c3.src')], draw(t, th, clock) {
    dotLabel(tl('c3.lbl'), 312, th, t);
    const n = d.maxParallel, size = 640, num = n0(n);
    // Las sesiones, como ecos del número que salen de detrás: una por cada agente a la vez.
    ctx.save(); ctx.font = SERIF6(size); const wNum = ctx.measureText(num).width, last = num.slice(-1), wl = ctx.measureText(last).width; ctx.restore();
    const echoes = Math.min(n - 1, 6);
    for (let j = echoes; j >= 1; j--) { const k = ease(pr(t, 1.0 + j * 0.12, 0.6)); if (k <= 0) continue; ctx.save(); ctx.font = SERIF6(size); ctx.globalAlpha *= 0.85 - j * 0.1; ctx.strokeStyle = j % 2 ? th.acc : th.mute; ctx.lineWidth = 2.5; ctx.strokeText(last, M - 16 + wNum - wl + j * 46 * k, 860 - j * 10 * k); ctx.restore(); }
    hugeNum(n0(Math.max(1, n * ease(pr(t, 0.2, 0.9)))), num, M - 16, 860, size, th.fg, t, 0.15);
    if (has('torre')) sticker(nameOf('torre'), W - M + 6, 830, -4, t, 1.9, true); else if (has('reparte')) sticker(nameOf('reparte'), W - M + 6, 830, -4, t, 1.9, true);
    const e = L2(n > 1 ? tl('c3.many') : tl('c3.one'), n >= 4 ? tl('c3.office') : n > 1 ? tl('c3.multi') : tl('c3.focus'), 1000, 88, t, 0.8);
    wk(tl('c3.wk', n1(d.toolsPerPrompt)), e + 70, t, 1.3);
    // Una pastilla por sesión, con su luz encendida.
    let x = M, y = e + 160; const lanes = Math.max(1, Math.min(n, 12));
    for (let s = 0; s < lanes; s++) {
      const lab = tl('c3.session', String(s + 1).padStart(2, '0')); ctx.save(); ctx.font = '700 20px ' + MONO; try { ctx.letterSpacing = '3px'; } catch {} const w = ctx.measureText(UP(lab)).width + 64; ctx.restore();
      if (x + w > W - M) { x = M; y += 66; }
      const k = pr(t, 1.9 + s * 0.09, 0.34); if (k > 0) {
        ctx.save(); ctx.translate(x + w / 2, y); const sc = ease(k); ctx.scale(sc, sc); ctx.fillStyle = th.fg; ctx.beginPath(); ctx.roundRect(-w / 2, -26, w, 52, 26); ctx.fill();
        ctx.globalAlpha *= 0.55 + 0.45 * Math.abs(Math.sin(clock * 2.2 + s)); ctx.fillStyle = th.acc === th.fg ? th.bg : th.acc; ctx.beginPath(); ctx.arc(-w / 2 + 24, 0, 6, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        mono(lab, x + 40, y + 7, 20, th.bg, { weight: 700, track: 0.15, alpha: clamp(k * 2) });
      }
      x += w + 12;
    }
    const ry = y + 92; rect(M, ry, CW * rise(t, 2.6, 0.5), 2, th.fg);
    [[n0(d.messagesToOtherAgents), tl('c3.msgs')], [n0(d.skillsUsed), tl('c3.skills')], [n0(d.mcpServersUsed), tl('c3.mcp')]].forEach(([v, l], j) => {
      const xx = M + j * (CW / 3); up(v, xx, ry + 84, SERIF6(60), null, t, 2.8 + j * 0.1); monoW(l, xx, ry + 126, 18, th.mute, CW / 3 - 24, { alpha: rise(t, 2.9 + j * 0.1) });
    });
  } },
  { dur: 6.2, glow: true, sources: [tl('c4.src')], draw(t, th) {
    dotLabel(tl('c4.lbl'), 312, th, t);
    const c = h.cost, big = tokOut >= 1e6 ? n0(tokOut / 1e6) : n0(tokOut), unit = tokOut >= 1e6 ? 'M' : '';
    const w = hugeNum(big, big, M - 16, 860, fitS(big + 'M', 860, 640), th.fg, t, 0.15);
    if (unit) up(unit, M - 16 + w + 6, 860, SERIF6(300), 'ACC', t, 0.6);
    if (c.band === 'top10') sticker(tl('c4.top'), W - M, 380, 6, t, 1.8, true);
    const e = L2(tl('c4.a'), tl('c4.' + c.band), 1000, 88, t, 0.8);
    wk(c.band === 'belowAvg' ? tl('c4.wk.low') : tl('c4.wk'), e + 70, t, 1.3);
    const rows = [[tl('c4.avg'), c.ref.avg, false], [tl('c4.p90'), c.ref.p90, false], [tl('c4.you'), c.perActiveDay, true]], mx = Math.max(c.perActiveDay, c.ref.p90 * 1.2);
    let y = e + 170;
    rows.forEach(([label, v, me], j) => {
      const t0 = me ? 2.7 : 1.7 + j * 0.3, k = pr(t, t0, me ? 0.6 : 0.5), kk = me ? ease(k) : ease(k), hh = me ? 92 : 60, ww = Math.max(8, (me ? W : W - M) * (v / mx)) * kk;
      mono(label, M, y, 19, th.mute, { alpha: rise(t, t0 - 0.2, 0.4) }); y += 18;
      if (k > 0) {
        rect(me ? 0 : M, y, me ? ww : ww, hh, me ? th.acc : j ? th.fg : mixc(th.fg, th.bg, 0.6));
        const val = (me ? '≈ ' : '') + tl('money', n0(v * Math.min(1, kk))) + (me ? tl('c4.perDay') : '');
        if (me) text(val, M + 10, y + hh / 2 + 16, SERIF6(48), on(th.acc)); else { const inside = ww > 170; mono(val, inside ? M + ww - 18 : M + ww + 16, y + hh / 2 + 8, 24, inside ? on(j ? th.fg : mixc(th.fg, th.bg, 0.6)) : th.fg, { align: inside ? 'right' : 'left', raw: true, weight: 700, track: 0.04 }); }
        if (me) hit(t0 + 0.6, 10);
      }
      y += hh + 44;
    });
  } },
  { dur: 6.2, sources: [tl('c5.src')], draw(t, th, clock) {
    dotLabel(tl('c5.lbl'), 312, th, t);
    hugeNum(peak + ':00', peak + ':00', M - 12, 700, fitS(peak + ':00', 920, 470), th.fg, t, 0.15);
    tape(770, -5, th.fg, [[tl('c5.peak'), th.bg], [peak + ':00', th.acc === th.fg ? th.bg : th.acc], [tl('c5.yourPeak'), th.bg]], t, 0.9, clock, 24);
    const joke = peak >= 22 || peak < 5 ? tl('quiet') : peak < 10 ? tl('early') : peak < 14 ? tl('c5.coffee') : peak < 19 ? tl('c5.after') : tl('c5.late');
    const e = L2(tl('c5.a'), joke, 940, 88, t, 0.8);
    wk(tl('c5.wk', n0(d.activeHours)), e + 70, t, 1.3);
    let y = e + 132; const cw2 = 430;
    [[tl('c5.days'), n0(h.claudeDays)], [tl('c5.longest'), n1(d.longestActiveHours) + ' h'], [tl('c5.msgs'), n0(d.userPrompts)]].forEach(([l, v], j) => {
      rect(M, y, cw2 * rise(t, 1.8 + j * 0.15, 0.5), 2, th.line); mono(l, M, y + 42, 19, th.mute, { alpha: rise(t, 1.9 + j * 0.15) }); up(v, M, y + 112, SERIF6(60), null, t, 2.0 + j * 0.15); y += 150;
    });
    // Reloj de 24 h: un radio por hora; la aguja da la vuelta y se para en la tuya.
    const hrs = d.promptHours && Math.max(...d.promptHours) > 0 ? d.promptHours : h.hours, mx = Math.max(...hrs, 1), cx = 774, cy = e + 380, r0 = 118, len = 92, ang = (hh) => (-90 + hh * 15) * Math.PI / 180;
    ctx.save(); ctx.lineWidth = 9; const base = ctx.globalAlpha;
    hrs.forEach((v, i) => { const k = ease(pr(t, 1.7 + i * 0.03, 0.5)), a = ang(i), l = Math.max(10, (v / mx) * len) * k; ctx.globalAlpha = base * k; ctx.strokeStyle = i === peak ? th.acc : th.fg; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); ctx.lineTo(cx + Math.cos(a) * (r0 + l), cy + Math.sin(a) * (r0 + l)); ctx.stroke(); });
    ctx.globalAlpha = base * rise(t, 1.6); ctx.strokeStyle = th.line; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, r0 - 16, 0, Math.PI * 2); ctx.stroke();
    const hk = ease(pr(t, 2.4, 1.0)), ha = ang(0) + (peak * 15 * Math.PI / 180 + Math.PI * 2) * hk; ctx.strokeStyle = th.fg; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.globalAlpha = base * clamp(pr(t, 2.3, 0.2));
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ha) * (r0 - 66), cy + Math.sin(ha) * (r0 - 66)); ctx.stroke(); ctx.fillStyle = th.acc; ctx.beginPath(); ctx.arc(cx, cy, 11, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    hit(3.4, 4);
    for (const i of [0, 6, 12, 18]) { const a = ang(i), r = r0 - 44; mono(i + (i ? '' : ' h'), cx + Math.cos(a) * r, cy + Math.sin(a) * r + 7, 18, th.mute, { align: 'center', track: 0, raw: true, alpha: rise(t, 1.8) }); }
  } },
  { dur: 7.2, R: 3.6, sources: [tl('c6.src')], draw(t, th, clock) {
    const a = archNow(), R = this.R;
    dotLabel(tl('youWere', D.year), 312, th, t);
    wire(870, 900, 330, 470, th.acc, t, clock + (t < R ? t * t * 0.8 : R * R * 0.8));
    const names = ARCH.filter((x) => x.id !== 'base' && x.id !== a.id).map((x) => x.a);
    if (t < R) { // suspense: los nombres pasan en hueco, cada vez más lentos
      const tick = Math.floor(Math.pow(t / R, 0.55) * 18), base = 560;
      for (let j = 0; j < 3; j++) { const nm = names[(tick + j) % names.length]; ctx.save(); ctx.font = SERIF6(150); ctx.globalAlpha *= (0.25 + 0.25 * (2 - j) / 2) * rise(t, 0.3, 0.4); ctx.strokeStyle = th.fg; ctx.lineWidth = 1.8; ctx.strokeText(nm, M, base + j * 175); ctx.restore(); }
      const n = 14, gap = 8, sw = (CW - (n - 1) * gap) / n, f = Math.pow(t / R, 1.3) * n; mono(tl('calc'), M, 1530, 20, th.mute);
      for (let s = 0; s < n; s++) { rect(M + s * (sw + gap), 1556, sw, 10, th.line); if (s < f) rect(M + s * (sw + gap), 1556, sw, 10, s >= n - 2 ? th.acc : th.fg); }
      return;
    }
    // revelado: los otros nombres se quedan en hueco detrás y el tuyo cae
    names.slice(0, 2).forEach((nm, j) => { ctx.save(); ctx.font = SERIF6(150); ctx.globalAlpha *= 0.22; ctx.strokeStyle = th.fg; ctx.lineWidth = 1.6; ctx.strokeText(nm, M, 520 + j * 170); ctx.restore(); });
    ctx.save(); ctx.font = SERIF6(180); const ls = wrap(a.a + '.', CW + 20); ctx.restore();
    ls.forEach((l, j) => { const k = pr(t, R + j * 0.14, 0.42), s = 0.7 + 0.3 * ease(k); if (k <= 0) return; ctx.save(); ctx.translate(M, 1030 + j * 176); ctx.scale(s, s); ctx.globalAlpha *= clamp(k * 3); ctx.font = SERIF6(180); ctx.fillStyle = th.fg; ctx.fillText(l, 0, 0); ctx.restore(); });
    hit(R + 0.3, 14);
    const ye = 1030 + (ls.length - 1) * 176;
    up(a.b, M, ye + 112, SERIF6(62), 'ACC', t, R + 0.6);
    wk(LINE2[a.id] || '', ye + 186, t, R + 0.9);
    const n = 14, gap = 8, sw = (CW - (n - 1) * gap) / n; mono(tl('calc.done'), M, 1530, 20, th.mute); for (let s = 0; s < n; s++) rect(M + s * (sw + gap), 1556, sw, 10, s >= n - 1 ? th.acc : th.fg);
  }, rumble(t) { return t < this.R ? 10 * Math.pow(t / this.R, 2.4) : 0; },
  over(t, th) { // el sobre se abre: fogonazo, ondas y piezas que saltan
    const dt = t - this.R; if (dt < 0 || dt > 2.4) return;
    if (dt < 0.07) rect(0, 0, W, FH, th.acc); else if (dt < 0.13) rect(0, 0, W, FH, CREAM); else if (dt < 0.34) rect(0, 0, W, FH, CREAM, ((0.34 - dt) / 0.21) * 0.5);
    const cx = W / 2, cy = 1000;
    [[0, th.acc, 16], [0.1, th.fg, 8], [0.22, th.acc, 5]].forEach(([dl, col, lw]) => { const p = pr(dt, dl, 0.85); if (p <= 0 || p >= 1) return; ctx.save(); ctx.globalAlpha = 1 - p; ctx.strokeStyle = col; ctx.lineWidth = lw * (1 - p) + 1; ctx.beginPath(); ctx.arc(cx, cy, 80 + ease(p) * 1200, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); });
    for (let j = 0; j < 64; j++) {
      const ang = rnd(j, 1) * Math.PI * 2, sp = 500 + rnd(j, 2) * 1300, life = 1.2 + rnd(j, 3) * 1.1, p = dt / life; if (p >= 1) continue;
      const drag = 1 - Math.exp(-dt * 2.2), x = cx + Math.cos(ang) * sp * drag * 0.62, y = cy + Math.sin(ang) * sp * drag * 0.62 + 520 * dt * dt, s = 8 + rnd(j, 4) * 22;
      ctx.save(); ctx.translate(x, y); ctx.rotate(dt * (rnd(j, 5) - 0.5) * 14); ctx.globalAlpha = 1 - Math.pow(p, 3); ctx.fillStyle = [th.acc, th.fg, th.mute, th.fg][j % 4];
      if (j % 3 === 0) ctx.fillRect(-s / 2, -2, s, 4); else ctx.fillRect(-s / 2, -s / 2, s, s * (j % 2 ? 1 : 0.45)); ctx.restore();
    }
  } },
  { dur: 9, head: () => (S.user ? S.user + ' · ' : '') + tl('profile', D.year), foot: [tl('makeYours')], www: [tl('phrase.a'), '__REPO__'], draw(t, th, clock) {
    const a = archNow(), k = pr(t, 0.1, 0.55), e = ease(k), cw = 928, ch = 1170, P = 56;
    const f = (d0, dur = 0.45) => ease(pr(t, 0.2 + d0, dur)); hit(0.5, 12);
    ctx.save(); ctx.translate(W / 2, 240 + ch / 2); ctx.rotate(((1 - e) * 9 - 2.2) * Math.PI / 180); const sc = Math.max(0.02, ease(k)) * (1.25 - 0.25 * e); ctx.scale(sc, sc); ctx.translate(-cw / 2, -ch / 2);
    ctx.save(); ctx.translate(cw / 2, ch / 2); ctx.rotate(3.2 * Math.PI / 180); const PP = STYLES[S.style].paper, PF = PP.fg, PM = mixc(PP.bg, PP.fg, 0.6);
    ctx.fillStyle = mixc(PP.bg, th.bg, 0.35); ctx.fillRect(-cw / 2 + 10, -ch / 2 + 6, cw, ch); ctx.restore();
    ctx.fillStyle = PP.bg; ctx.fillRect(0, 0, cw, ch);
    for (const [tx, rot] of [[90, -24], [cw - 90, 21]]) { ctx.save(); ctx.translate(tx, 2); ctx.rotate(rot * Math.PI / 180); ctx.globalAlpha *= 0.85 * f(0.3); ctx.fillStyle = '#C9BFB2'; ctx.fillRect(-80, -22, 160, 44); ctx.restore(); }
    const acc = PP.acc;
    mono('Builder Recap · ' + D.year, P, 112, 22, PM, { track: 0.16, alpha: f(0.3) });
    mono(LEVELS[level], cw - P, 112, 22, PF, { align: 'right', weight: 700, track: 0.16, alpha: f(0.3) });
    text(String(Math.round(score * f(0.4, 0.9))), P - 8, 360, SERIF6(230), PF, { alpha: f(0.4) });
    mono(tl('score'), P, 406, 20, PM, { alpha: f(0.55) });
    ctx.save(); ctx.globalAlpha *= f(0.5); ctx.translate(cw - P - 100, 250); ctx.strokeStyle = acc; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(0, 0, 38, 96, 0, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.ellipse(0, 0, 96, 38, 0, 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = acc; ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    if (PHOTO) { const ph = 200, s2 = Math.max(ph / PHOTO.width, ph / PHOTO.height), sw = ph / s2, sh = ph / s2; ctx.save(); ctx.globalAlpha *= f(0.5); try { ctx.filter = 'grayscale(1) contrast(1.08)'; } catch {} ctx.drawImage(PHOTO, (PHOTO.width - sw) / 2, (PHOTO.height - sh) / 2, sw, sh, cw - P - 200, 150, ph, ph); try { ctx.filter = 'none'; } catch {} ctx.restore(); }
    const ns = fitS(a.a, cw - 2 * P, 104);
    text(a.a, P, 548, SERIF6(ns), PF, { alpha: f(0.75) });
    text(a.b, P, 612, SERIF6(46), acc, { alpha: f(0.95) });
    rect(P, 650, (cw - 2 * P) * f(1.05), 2, PF);
    AXES.forEach((ax, j) => { const x = P + j * ((cw - 2 * P) / 3), al = f(1.2 + j * 0.12); text(String(Math.round(ax.v * al)), x, 750, SERIF6(84), PF, { alpha: al }); monoW(ax.k, x, 792, 18, PM, (cw - 2 * P) / 3 - 24, { alpha: al }); });
    rect(P, 832, (cw - 2 * P) * f(1.5), 2, PF);
    [[tl('c7.days'), n0(h.activeDays)], [tl('c7.projects'), n0(g.reposWithCommits)], [tl('c7.commits'), n0(g.commits)], [tl('c7.tokens'), tokShort]].forEach(([l, v], j) => { const x = P + j * ((cw - 2 * P) / 4), al = f(1.7 + j * 0.1); mono(l, x, 890, 19, PM, { alpha: al }); text(v, x, 948, SERIF6(54), PF, { alpha: al }); });
    ctx.restore();
    const also = ARCH.filter((x) => x.ok && x.id !== a.id && x.id !== 'base').slice(0, 3);
    let sx = 116, sy = 1262;
    also.forEach((x, j) => { const w = stickerW(x.a, 20); if (sx + w > W - 110) { sx = 136; sy += 84; } sticker(x.a, sx, sy + (j % 2) * 8, j % 2 ? 3 : -3, t, 2.6 + j * 0.25, false, 20); sx += w + 22; });
    tape(1470, -3, th.acc, [['Builder Recap ' + D.year, on(th.acc)], ['cardanschool.com', on(th.acc)]], t, 3.4, clock, 26);
  } },
];
const FX_LEVELS = [1, 1, 1, 1, 1, 1, 2, 2];
const THEMES = ['ink', 'cream', 'ink', 'cream', 'ink', 'cream', 'ink', 'ink'];
const MINIS = [], EARN = [];
// El texto que va escrito al abrir LinkedIn. Lo firma la persona (primera persona) y vale para cualquier tarjeta.
// LinkedIn corta hacia los 200 caracteres («ver más»): lo que engancha, en la primera línea. Revisado con la voz de
// Cardan School (2026-11-26): precisa, sin «fácil», «truco» ni «secreto»; cada cifra es un recuento de su equipo.
const CAP_DATA = () => ({ year: D.year, name: archNow().a, tag: archNow().b, days: n0(h.activeDays), score: Math.round(score), levelName: LEVELS[level] });
const CAPTION_LI = () => tl('cap.li', CAP_DATA());
const CAPTION = () => tl('cap.code', CAP_DATA());
