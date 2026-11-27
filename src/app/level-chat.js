// ---------- Edición chat · Nivel y personajes, a partir de lo que contesta el asistente ----------
// Aquí no hay cifras medidas: el asistente responde doce preguntas de sí o no sobre ti y de ahí sale todo.
const SPIN = { dur: 1, turns: 1 };
const RSP = D.respuestas, yes = (k) => RSP[k] === 'si';
const QUESTIONS = Object.fromEntries(['d1', 'd2', 'd3', 'd4', 't1', 't2', 't3', 't4', 'p1', 'p2', 'p3', 'p4'].map((k) => [k, tl('q.' + k)]));
// El asistente y su frase: si la respuesta no los trae, el texto por defecto va en el idioma de la página.
const ASIS = D.asistente && D.asistente !== 'tu asistente' ? D.asistente : tl('chat.assistant'), FRASE = D.frase || tl('chat.frase');
const AXES = [[tl('ax.d'), tl('ax.d.verb'), ['d1', 'd2', 'd3', 'd4']], [tl('ax.t'), tl('ax.t.verb'), ['t1', 't2', 't3', 't4']], [tl('ax.p'), tl('ax.p.verb'), ['p1', 'p2', 'p3', 'p4']]]
  .map(([k, verb, qs]) => ({ k, verb, qs, v: qs.filter(yes).length * 25 }));
const LEVELS = tl('lvl');
const score = AXES.reduce((a, x) => a + x.v, 0) / AXES.length;
const level = score >= 75 ? 3 : score >= 50 ? 2 : score >= 25 ? 1 : 0;
const yesCount = Object.keys(QUESTIONS).filter(yes).length, nsCount = Object.keys(QUESTIONS).filter((k) => RSP[k] === 'ns').length;
const ARCH = [
  { id: 'torre', a: tl('arch.torre'), b: tl('h.torre'), ok: yes('d3') && yes('d1') },
  { id: 'reparte', a: tl('arch.reparte'), b: tl('h.reparte'), ok: yes('d2') && yes('d1') },
  { id: 'produccion', a: tl('arch.produccion'), b: tl('h.produccion'), ok: yes('p1') && yes('p2') },
  { id: 'terreno', a: tl('arch.terreno'), b: tl('h.terreno'), ok: yes('t1') && yes('t3') },
  { id: 'git', a: tl('arch.git'), b: tl('h.git'), ok: yes('t2') && yes('t4') },
  { id: 'piloto', a: tl('arch.piloto'), b: tl('h.piloto'), ok: yes('d4') },
  { id: 'frentes', a: tl('arch.frentes'), b: tl('h.frentes', D.proyectos.length), ok: yes('p4') },
  { id: 'maraton', a: tl('arch.maraton'), b: tl('h.maraton'), ok: yes('p3') },
  { id: 'base', a: tl('arch.base'), b: tl('pieceByPiece'), ok: true },
];
const has = (id) => ARCH.find((x) => x.id === id).ok;
const nameOf = (id) => ARCH.find((x) => x.id === id).a;
const archNow = () => (S.arch !== 'auto' && ARCH.find((x) => x.id === S.arch)) || ARCH.find((x) => x.ok);
const who = () => (S.user ? S.user + ' · ' : '');
const SRC = [tl('h.src', ASIS)];
