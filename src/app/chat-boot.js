// Arranque de la edición chat: el prompt, la lectura de la respuesta y el paso de la portada a las tarjetas.
(() => {
  'use strict';
  const KEY = 'recapchat.data', $ = (id) => document.getElementById(id), YEAR = new Date().getFullYear();
  // Ejemplo inventado, solo para ver cómo quedan las tarjetas (uno por idioma).
  const EXAMPLE_ES = {
    v: 1, idioma: 'es', nombre: 'Ejemplo', asistente: 'ChatGPT', frase: 'Empezó preguntando cómo se hace y acabó enseñando cómo lo hizo.',
    proyectos: [
      { nombre: 'Plataforma de cursos', que: 'Web con pagos y zona de alumnos', peso: 5 },
      { nombre: 'Panel de anuncios', que: 'Hoja que junta el gasto y las ventas', peso: 3 },
      { nombre: 'Asistente de soporte', que: 'Contesta dudas con la documentación', peso: 3 },
      { nombre: 'Web personal', que: 'Portfolio y blog', peso: 1 },
    ],
    temas: [{ tema: 'Agentes de IA', peso: 5 }, { tema: 'Bases de datos', peso: 4 }, { tema: 'Diseño de producto', peso: 3 }, { tema: 'Anuncios y métricas', peso: 3 }, { tema: 'Git y despliegues', peso: 2 }],
    herramientas: ['Claude Code', 'Next.js', 'Supabase', 'Stripe', 'Figma', 'Google Sheets'],
    respuestas: { d1: 'si', d2: 'si', d3: 'no', d4: 'si', t1: 'si', t2: 'si', t3: 'si', t4: 'ns', p1: 'si', p2: 'si', p3: 'si', p4: 'si' },
  };
  const EXAMPLE_EN = {
    v: 1, idioma: 'en', nombre: 'Example', asistente: 'ChatGPT', frase: 'Started out asking how it is done and ended up showing how they did it.',
    proyectos: [
      { nombre: 'Course platform', que: 'Website with payments and a student area', peso: 5 },
      { nombre: 'Ads dashboard', que: 'Sheet that brings spend and sales together', peso: 3 },
      { nombre: 'Support assistant', que: 'Answers questions from the docs', peso: 3 },
      { nombre: 'Personal site', que: 'Portfolio and blog', peso: 1 },
    ],
    temas: [{ tema: 'AI agents', peso: 5 }, { tema: 'Databases', peso: 4 }, { tema: 'Product design', peso: 3 }, { tema: 'Ads and metrics', peso: 3 }, { tema: 'Git and deploys', peso: 2 }],
    herramientas: ['Claude Code', 'Next.js', 'Supabase', 'Stripe', 'Figma', 'Google Sheets'],
    respuestas: { d1: 'yes', d2: 'yes', d3: 'no', d4: 'yes', t1: 'yes', t2: 'yes', t3: 'yes', t4: 'dk', p1: 'yes', p2: 'yes', p3: 'yes', p4: 'yes' },
  };
  const EXAMPLE = LANG === 'en' ? EXAMPLE_EN : EXAMPLE_ES, PROMPT = LANG === 'en' ? RECAP_PROMPT_EN : RECAP_PROMPT;

  window.__recapChat = { parse: parseAnswer, PROMPT, EXAMPLE };

  let saved = null; try { saved = JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch {}
  const start = (data) => { try { sessionStorage.setItem(KEY, JSON.stringify(data)); } catch {} window.RECAP = data; $('intro').hidden = true; window.startRecap(); };
  $('again').onclick = () => { try { sessionStorage.removeItem(KEY); } catch {} location.reload(); };
  // Enlace de tu asistente (#d=…): un clic y salen tus tarjetas. Los datos se quitan de la barra de direcciones.
  let linkError = '';
  if (location.hash.startsWith('#d=')) {
    try { const data = readLink(location.hash); history.replaceState(null, '', location.pathname + location.search); start(data); return; }
    catch (e) { linkError = e.message; history.replaceState(null, '', location.pathname + location.search); }
  }
  if (saved && saved.v === 1) { start(saved); return; }

  $('intro').hidden = false;
  if (linkError) { $('alt').open = true; $('err').textContent = linkError; $('answer').focus(); }
  $('prompt').value = PROMPT;
  $('copy').onclick = async () => {
    try { await navigator.clipboard.writeText(PROMPT); $('copied').textContent = tl('i.copied'); }
    catch { $('prompt').closest('details').open = true; $('prompt').focus(); $('prompt').select(); $('copied').textContent = tl('i.copyFail'); }
  };
  $('copy-cc').onclick = async () => {
    const line = $('cc-line').textContent;
    try { await navigator.clipboard.writeText(line); $('copy-cc').textContent = tl('i.ccCopied'); }
    catch { const r = document.createRange(); r.selectNodeContents($('cc-line')); getSelection().removeAllRanges(); getSelection().addRange(r); }
  };
  $('go').onclick = () => { $('err').textContent = ''; try { start(parseAnswer($('answer').value)); } catch (e) { $('err').textContent = e.message; $('answer').focus(); } };
  $('demo').onclick = () => start(normalizeAnswer(EXAMPLE));
})();
