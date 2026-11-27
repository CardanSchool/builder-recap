# Instrucciones para agentes

Si una persona te ha pedido «haz mi Builder Recap» y te ha pasado este repo, esto es lo que tienes que hacer.
Builder Recap resume su año construyendo con IA en unas tarjetas para compartir. Se calcula en su equipo.

**Háblale en su idioma.** Las tarjetas salen en español o en inglés: si te habla en inglés, usa la versión inglesa
(abajo se dice cuál); en cualquier otro idioma, en inglés, salvo que sea español.

**No le hagas preguntas.** Elige tú el camino con este árbol y llévalo hasta el final:

```
¿Puedes ejecutar comandos en su ordenador?
├─ Sí (Claude Code, Codex, Cursor…) ─────────────────────────────────────────── A
└─ No (ChatGPT, Claude en el navegador o en el móvil…)
    ├─ ¿Puedes nombrar al menos un proyecto concreto suyo de este año? ─ Sí ─── B
    └─ No ───────────────────────────────────────────────────────────────────── C
```

## A · Puedes ejecutar comandos en su ordenador

1. Comprueba que hay Node 18 o superior (`node --version`) y git. Si falta Node, dile cómo instalarlo
   (nodejs.org) y para ahí: no instales nada por tu cuenta.
2. Clona el repo en una carpeta temporal, no dentro de un proyecto suyo:
   `git clone --depth 1 https://github.com/CardanSchool/builder-recap`
3. Antes de ejecutarlo, léelo. Son tres archivos cortos: `bin/recap.mjs`, `src/extract.mjs` y `src/sanitize.mjs`.
   Dile en una frase lo que has visto: si usa red, si tiene dependencias y qué guarda.
4. Desde la carpeta clonada, ejecuta `node bin/recap.mjs` (si te habla en inglés, `node bin/recap.mjs --lang en`). Puede tardar varios minutos si tiene muchas sesiones
   guardadas: no lo cortes ni lo lances dos veces.
5. Al terminar, dile que su Builder Recap se ha abierto en la web de Cardan School (la orden imprime la dirección por
   si no se abre: lleva sus cifras detrás del `#`, que no llegan al servidor).
   Cuéntale lo justo para usarlo: flechas para pasar y espacio para pausar. Al final se queda en su carta del año y
   se abre «Compartir»: LinkedIn se publica como foto sin salir de la página; también imagen, Slack y vídeo. Que no
   comparta la dirección de su recap: lleva sus cifras.

Si la orden dice que no ha encontrado datos (ni sesiones de Claude Code ni repos con git), díselo en una línea y
para ahí.

Lo que no debes hacer:

- No hagas tú el resumen leyendo sus sesiones o sus repos: los datos los saca la orden, que solo cuenta.
- No subas, envíes ni pegues en ningún sitio la dirección de su recap, el archivo (con `--local`) ni sus cifras.
- No uses `--names` salvo que te lo pida: incluye los nombres de sus repos.
- No toques sus proyectos ni su configuración.

## B · No puedes ejecutar nada, pero la conoces

1. Lee `docs/prompt.txt` de este repo (si te habla en inglés, `docs/prompt-en.txt`) y contéstalo tú, directamente, con tu memoria y vuestras conversaciones de este
   año: no le pidas que copie ni pegue el prompt, ni le expliques los pasos. Sigue sus reglas al pie de la letra: no
   inventes, y lo que no sepas es «ns».
2. Devuélvele lo que pide el prompt: **una sola línea**, «Tu Builder Recap está listo: [Ver mis tarjetas](…)» (en
   inglés, «Your Builder Recap is ready: [See my cards](…)»), con
   el enlace en Markdown a la edición chat y sus datos dentro (`https://cardanschool.github.io/builder-recap/#d=…`).
   No le enseñes el JSON ni la dirección larga. Al pulsar el enlace salen sus tarjetas. Si no abre, que copie la
   dirección del enlace, abra la página y la pegue en «¿El enlace no abre?».
3. La página no envía nada: lo que va después de `#` no sale de su navegador.

No le pongas tú la nota ni el personaje: los calcula la página a partir de tus respuestas.

## C · No puedes ejecutar nada y no la conoces

Dile en una línea que sin historial no puedes hacerlo bien y que lo haga con Claude Code en su ordenador, pegándole
«Haz mi Builder Recap siguiendo github.com/CardanSchool/builder-recap». Nada más: sin preguntas.
