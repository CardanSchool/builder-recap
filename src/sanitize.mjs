// Lo que se incrusta en el HTML: solo lo que pintan las tarjetas. Nada que identifique tus herramientas o tus clientes.
// - Fuera los nombres de skills, conectores, agentes, herramientas y extensiones (las tarjetas solo usan los recuentos).
// - Los nombres de tus repos solo viajan si lo pides (`--names`); sin eso, las tarjetas dicen «Proyecto 1», «Proyecto 2»…
// - `lang` ('es' o 'en', o nada): el idioma que pide la orden con `--lang`; sin él, la página usa el del navegador.
export function publicData(data, { names = false, lang = '' } = {}) {
  const d = data.detail;
  return {
    ...(lang === 'es' || lang === 'en' ? { lang } : {}),
    year: data.year,
    user: data.user,
    history: data.history,
    git: { ...data.git, top: data.git.top.map((r) => ({ ...r, name: names ? r.name : '' })) },
    detail: {
      from: d.from, to: d.to, sessions: d.sessions, userPrompts: d.userPrompts, toolCalls: d.toolCalls, toolsPerPrompt: d.toolsPerPrompt,
      subagentRuns: d.subagentRuns, agentCalls: d.agentCalls, messagesToOtherAgents: d.messagesToOtherAgents,
      skillsUsed: d.skillsUsed, mcpServersUsed: d.mcpServersUsed, maxParallel: d.maxParallel, parallelDays: d.parallelDays,
      activeHours: d.activeHours, longestActiveHours: d.longestActiveHours, promptHours: d.promptHours,
    },
  };
}
