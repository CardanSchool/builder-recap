// ---------- La carta final (común a las dos ediciones) ----------
// Es la pieza que se comparte: se abre un sobre (carga, fogonazo, estallido) y cae la carta con tu nota, tu
// personaje y tus cifras. Lleva tu foto si la añades, el acabado que elijas, su rareza y, debajo, la frase para
// que quien la vea haga la suya.
const PHRASE = [tl('phrase.a'), '__REPO__'];
const FINISH = {
  crema: { bg: '#F2EDE6', fg: '#1A1714', mute: '#6B6560', line: '#DCD4C9', acc: ORANGE, back: '#CFC6B8', mark: 'markOrange' },
  tinta: { bg: '#272320', fg: '#F2EDE6', mute: '#A3988F', line: '#4A433D', acc: ORANGE, back: '#4A433D', mark: 'markOrange' },
  naranja: { bg: ORANGE, fg: '#1A1714', mute: '#583725', line: '#C96D3D', acc: '#F2EDE6', back: '#C4693A', mark: 'markInk' },
};
const RARITY = tl('rarity'); // una por nivel
S.finish = store.get('finish', 'crema');
let PHOTO = null; // la foto que añade la persona: se queda en la memoria de la página, no se guarda ni se envía

function finalCard(o) {
  return { theme: 'ink', dur: 12, R: 2.7, sources: o.sources,
    rumble(t) { return t < this.R ? 11 * Math.pow(t / this.R, 2.2) : 0; },
    gimbal(t) {
      const R = this.R, home = { x: W + 300 - 940, y: 170, size: 940 }, mid = { x: (W - 700) / 2, y: 420, size: 700 };
      const lerp = (a, b, p) => a + (b - a) * p, p = t < R ? ease(pr(t, 0, 0.8)) : 1 - ease(pr(t, R, 0.9));
      return { x: lerp(home.x, mid.x, p), y: lerp(home.y, mid.y, p), size: lerp(home.size, mid.size, p),
        alpha: t < R ? 0.10 + 0.9 * ease(pr(t, 0.15, 1.3)) : 0.10 + 0.9 * (1 - ease(pr(t, R, 0.5))),
        k: t < R ? t * t * 0.95 : R * R * 0.95 * (1 - ease(pr(t, R, 0.9))) };
    },
    draw(t, th) {
      const a = archNow(), R = this.R;
      mono(who() + tl('profile', D.year), M, 240, 20, th.mute);
      if (t < R) { // la carga: los nombres pasan como una ruleta y la barra se llena
        mono(tl('youWere', D.year), M, 310, 24, th.fg, { track: 0.1, alpha: ease(pr(t, 0.2, 0.4)), raw: true });
        const names = ARCH.filter((x) => x.id !== 'base').map((x) => x.a), longest = names.reduce((p, c) => (c.length > p.length ? c : p), '');
        if (t > 0.45) { ctx.save(); ctx.globalAlpha = 0.16 + 0.5 * (t / R); big(names[Math.floor(Math.pow(t, 1.7) * 7) % names.length], 450, t, 0, th, 120, longest, th.mute, { slam: 0, quiet: true }); ctx.restore(); }
        const n = 14, gap = 8, sw = (CW - (n - 1) * gap) / n, f = Math.pow(t / R, 1.4) * n;
        mono(tl('calc'), M, 1100, 15, th.mute, { track: 0.14 });
        for (let s = 0; s < n; s++) { rect(M + s * (sw + gap), 1120, sw, 14, th.line); if (s < f) rect(M + s * (sw + gap), 1120, sw, 14, s >= n - 2 ? ORANGE : th.fg); }
        return;
      }
      const T0 = R, C = FINISH[S.finish] || FINISH.crema, k = pr(t, T0, 0.5), e = ease(k), cw = CW - 36, ch = 790, P = 46, iw = cw - 2 * P;
      const f = (d0, dur = 0.45) => ease(pr(t, T0 + d0, dur));
      hit(T0 + 0.33, 30);
      // --- la carta: entra girando y queda un poco torcida, con otra asomando detrás y dos tiras de cinta
      ctx.save(); ctx.translate(W / 2, 288 + ch / 2); ctx.rotate(((1 - e) * 10 - 0.9) * Math.PI / 180); ctx.scale(Math.max(0.02, back(k)) * (1.3 - 0.3 * e), 1.3 - 0.3 * e); ctx.translate(-cw / 2, -ch / 2);
      ctx.save(); ctx.translate(cw / 2, ch / 2); ctx.rotate(4.2 * Math.PI / 180); ctx.fillStyle = C.back; ctx.fillRect(-cw / 2 + 8, -ch / 2 + 4, cw, ch); ctx.restore();
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, cw, ch);
      ctx.strokeStyle = C.fg; ctx.lineWidth = 2; ctx.strokeRect(14, 14, cw - 28, ch - 28);
      if (level === 3) { // la legendaria lleva doble filete y rombos en las esquinas
        ctx.lineWidth = 1; ctx.strokeRect(22, 22, cw - 44, ch - 44); ctx.fillStyle = C.fg;
        for (const [x, y] of [[14, 14], [cw - 14, 14], [14, ch - 14], [cw - 14, ch - 14]]) diamond(x, y, 7, 11);
      }
      for (const [tx, ty, rot] of [[74, 4, -27], [cw - 74, 4, 23]]) { ctx.save(); ctx.translate(tx, ty); ctx.rotate(rot * Math.PI / 180); ctx.globalAlpha *= 0.92 * f(0.25); ctx.fillStyle = '#B9AE9F'; ctx.fillRect(-66, -18, 132, 36); ctx.restore(); }
      mono(o.header(), P, 78, 16, C.mute, { track: 0.14, alpha: f(0.35) });
      mono(LEVELS[level], cw - P, 78, 16, C.fg, { track: 0.14, align: 'right', weight: 700, alpha: f(0.35) });
      text(String(Math.round(score * f(0.4, 0.8))), P - 8, 226, `700 160px ${SERIF}`, C.fg, { alpha: f(0.4) });
      mono(tl('score'), P, 260, 14, C.mute, { track: 0.12, alpha: f(0.55) });
      { // rareza, como una etiqueta llena
        const label = UP(tl('rarity.card', RARITY[level])); ctx.save(); ctx.globalAlpha *= f(0.65); ctx.font = `700 13px ${MONO}`; try { ctx.letterSpacing = '1.8px'; } catch {}
        const w = ctx.measureText(label).width + 22; ctx.fillStyle = C.fg; ctx.fillRect(P, 280, w, 28); ctx.fillStyle = C.bg; ctx.textBaseline = 'alphabetic'; ctx.fillText(label, P + 11, 299); ctx.restore();
      }
      { // arriba a la derecha: tu foto si la has puesto; si no, el gimbal
        const al = f(0.55), ph = 172, px = cw - P - ph, py = 98, mk = imgs[C.mark];
        ctx.save(); ctx.globalAlpha *= al;
        if (PHOTO) {
          const s = Math.max(ph / PHOTO.width, ph / PHOTO.height), sw = ph / s, sh = ph / s;
          try { ctx.filter = 'grayscale(1) contrast(1.08)'; } catch {}
          ctx.drawImage(PHOTO, (PHOTO.width - sw) / 2, (PHOTO.height - sh) / 2, sw, sh, px, py, ph, ph);
          try { ctx.filter = 'none'; } catch {}
          ctx.strokeStyle = C.fg; ctx.lineWidth = 2; ctx.strokeRect(px, py, ph, ph);
          ctx.fillStyle = C.bg; ctx.fillRect(px + ph - 50, py + ph - 50, 62, 62); ctx.strokeRect(px + ph - 50, py + ph - 50, 62, 62);
          if (mk) ctx.drawImage(mk, px + ph - 44, py + ph - 44, 50, 50);
        } else if (mk) ctx.drawImage(mk, px + 4, py, 168, 168);
        ctx.restore();
      }
      const size = fit(a.a, iw, 112);
      text(a.a, P - size * 0.03, 410, `700 ${size}px ${SERIF}`, C.fg, { alpha: f(0.75) });
      text(a.b, P, 464, `700 38px ${SERIF}`, C.acc, { alpha: f(0.95) });
      rect(P, 502, iw * f(1.05), 2, C.line);
      AXES.forEach((ax, i) => { const x = P + i * (iw / 3), al = f(1.25 + i * 0.12); text(String(Math.round(ax.v * al)), x, 584, `700 68px ${SERIF}`, C.fg, { alpha: al }); mono(ax.k, x, 616, 13, C.mute, { track: 0.1, alpha: al }); });
      rect(P, 650, iw * f(1.6), 2, C.line);
      o.stats().forEach(([l, v], i) => { const x = P + i * (iw / 4), al = f(1.8 + i * 0.1); mono(l, x, 692, 13, C.mute, { track: 0.12, alpha: al }); text(v, x, 734, `700 36px ${SERIF}`, C.fg, { alpha: al }); });
      // tus otros personajes, como pegatinas junto a la nota (el hueco entre la nota y la foto)
      const also = ARCH.filter((x) => x.ok && x.id !== a.id && x.id !== 'base').slice(0, 2), ST = { fg: '#1A1714', sticker: '#FFFFFF' };
      also.forEach((x, i) => { stamp(x.a, 322 + i * 16, 178 + i * 62, t, T0 + 2.4 + i * 0.26, ST, i ? 3 : -4, false, 15); });
      ctx.restore();
      // --- debajo, la frase para que quien vea tu carta haga la suya
      const k2 = pr(t, T0 + 3.3, 0.4);
      if (k2 > 0) {
        hit(T0 + 3.6, 5);
        const s = 1 + (1 - back(k2)) * 0.5, sw = CW, sh = 110;
        ctx.save(); ctx.translate(W / 2, 1150); ctx.rotate(0.35 * Math.PI / 180); ctx.scale(s, s); ctx.globalAlpha *= clamp(k2 * 3);
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-sw / 2, -sh / 2, sw, sh); ctx.strokeStyle = '#1A1714'; ctx.lineWidth = 1.5; ctx.strokeRect(-sw / 2 + 7, -sh / 2 + 7, sw - 14, sh - 14);
        mono(tl('makeYours.card'), -sw / 2 + 28, -26, 13, '#6B6560', { track: 0.14 });
        PHRASE.forEach((l, i) => mono(l, -sw / 2 + 28, 6 + i * 34, 27, '#1A1714', { raw: true, track: 0, weight: 700 }));
        ctx.restore();
      }
    },
    over(t, th) {
      const dt = t - this.R; if (dt < 0 || dt > 2.4) return;
      if (dt < 0.07) rect(0, 0, W, FH, ORANGE); else if (dt < 0.13) rect(0, 0, W, FH, TH.cream.bg); else if (dt < 0.34) rect(0, 0, W, FH, TH.cream.bg, ((0.34 - dt) / 0.21) * 0.55);
      const cx = W / 2, cy = 770 + OY;
      [[0, ORANGE, 16], [0.1, th.fg, 8], [0.22, ORANGE, 5]].forEach(([dl, col, lw]) => {
        const p = pr(dt, dl, 0.85); if (p <= 0 || p >= 1) return;
        ctx.save(); ctx.globalAlpha = 1 - p; ctx.strokeStyle = col; ctx.lineWidth = lw * (1 - p) + 1; ctx.beginPath(); ctx.arc(cx, cy, 80 + ease(p) * 1000, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      });
      for (let j = 0; j < 64; j++) {
        const ang = rnd(j, 1) * Math.PI * 2, sp = 500 + rnd(j, 2) * 1300, life = 1.2 + rnd(j, 3) * 1.1, p = dt / life; if (p >= 1) continue;
        const drag = 1 - Math.exp(-dt * 2.2), x = cx + Math.cos(ang) * sp * drag * 0.62, y = cy + Math.sin(ang) * sp * drag * 0.62 + 520 * dt * dt, s = 8 + rnd(j, 4) * 22;
        ctx.save(); ctx.translate(x, y); ctx.rotate(dt * (rnd(j, 5) - 0.5) * 14); ctx.globalAlpha = 1 - Math.pow(p, 3);
        ctx.fillStyle = [ORANGE, th.fg, th.mute, th.fg][j % 4];
        if (j % 3 === 0) ctx.fillRect(-s / 2, -2, s, 4); else ctx.fillRect(-s / 2, -s / 2, s, s * (j % 2 ? 1 : 0.45));
        ctx.restore();
      }
    } };
}
