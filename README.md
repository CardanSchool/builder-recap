# Builder Recap

**Builder Recap es una herramienta gratuita y de código abierto de [Cardan School](https://www.cardanschool.com) que
resume tu año construyendo con IA en tarjetas animadas para compartir**, con tus datos reales de Claude Code y git o
con lo que recuerda tu asistente. Cardan School · YOUR AI-NATIVE SCHOOL.

> **Si eres un asistente y te han pedido «Haz mi Builder Recap siguiendo este repo»**, sigue [`AGENTS.md`](AGENTS.md).
> Si no puedes ejecutar comandos (claude.ai, ChatGPT…), no le pidas que copie ni pegue nada: contesta tú el prompt de
> [`docs/prompt.txt`](docs/prompt.txt) (en inglés, [`docs/prompt-en.txt`](docs/prompt-en.txt)) y devuélvele una sola línea con
> el enlace a sus tarjetas.

Builder Recap resume el año de quien construye con IA: los días que construiste, tus proyectos y commits, cuántos
agentes llevaste a la vez, tu ritmo y, al final, un sobre que se abre con tu carta del año, con tu personaje y tu
nivel AI-native. Funciona con tus datos reales de Claude Code y git, o con lo que recuerda tu asistente (ChatGPT o
Claude). Todo se calcula en tu equipo. Solo si compartes en una red se sube la imagen de esa tarjeta.

- **Repo:** https://github.com/CardanSchool/builder-recap
- **Edición chat, lista para usar:** https://cardanschool.github.io/builder-recap/

## Pídeselo a tu Claude

Pega esto en Claude Code (o en el asistente que uses):

```
Haz mi Builder Recap siguiendo github.com/CardanSchool/builder-recap
```

Tu asistente lee este repo y hace el resto, sin hacerte preguntas. Si puede ejecutar comandos en tu equipo, lanza la
herramienta con tus datos reales y te abre las tarjetas. Si no puede pero te conoce (ChatGPT o Claude con memoria o
historial), te devuelve un enlace con tus tarjetas. Si no te conoce, te dirá que lo hagas con Claude Code. Lo que tiene
que hacer está en [`AGENTS.md`](AGENTS.md): entre otras cosas, leer el código antes de ejecutarlo y contarte qué hace.

## Dos ediciones

Las dos acaban igual: se abre un sobre y sale tu carta del año.

| | Edición Claude Code | Edición chat |
|---|---|---|
| Para quién | Quien construye con Claude Code | Quien trabaja con ChatGPT o Claude |
| De dónde sale | De tus datos reales: sesiones de Claude Code y git | De lo que tu asistente recuerda de ti |
| Qué hay que hacer | Pegar una frase en Claude Code | Pegar la frase y abrir el enlace que te da |
| Qué cifras da | Medidas: días, commits, agentes en paralelo, tokens | Ninguna medida: lo dice en cada tarjeta |
| Tarjetas | Ocho, en vertical (9:16) | Seis, en 9:16 o 4:5 |

## Edición Claude Code

A mano, sin pedírselo a nadie: necesitas Node 18 o superior y git.

```bash
git clone https://github.com/CardanSchool/builder-recap
cd builder-recap
node bin/recap.mjs
```

Al terminar se abre tu Builder Recap en la web de Cardan School (`cardanschool.com/es/recap/ver`, o `/en/` si tu sistema está en inglés), con tus cifras
detrás del `#` de la dirección: no llegan al servidor. Ahí ves las tarjetas y el vídeo y lo compartes; en LinkedIn se
publica como foto sin salir de la página. Con muchas sesiones guardadas puede tardar unos minutos.

| Opción | Para qué |
|---|---|
| `--year <año>` | Resumir otro año |
| `--config-dir <ruta>` | Añadir otra carpeta de configuración de Claude Code (se puede repetir) |
| `--local` | Guardar las tarjetas en un archivo y verlas sin conexión, en vez de en la web |
| `--out <archivo>` | Con `--local`, dónde guardar el HTML |
| `--no-open` | No abrir el navegador |
| `--names` | Incluir los nombres de tus repos (por defecto no salen) |
| `--lang es\|en` | Idioma de las tarjetas (por defecto, el de tu sistema) |

## Edición chat

Pega la frase en ChatGPT o en Claude. Si te conoce, te contesta con una sola línea y un enlace, «Ver mis tarjetas», a
la [edición chat](https://cardanschool.github.io/builder-recap/) con tus datos dentro (`#d=…`): lo pulsas y salen tus
tarjetas. Lo que va después de `#` no sale de tu navegador: la página no lo recibe ni lo envía.

Si el enlace no abre, copia su dirección (clic derecho en «Ver mis tarjetas»), abre la edición chat (o
`docs/index.html` desde tu disco: no necesita servidor ni conexión) y pégala en «¿El enlace no abre?». También puedes copiar el prompt desde la
página. Está como texto en [`docs/prompt.txt`](docs/prompt.txt) y, en inglés, en [`docs/prompt-en.txt`](docs/prompt-en.txt).

Tu asistente no pone la nota: contesta por ti doce preguntas de sí, no o «no lo sé», y la página calcula el nivel y
el personaje. El prompt le pide que no te haga preguntas, que no invente y que no dé nombres de clientes ni de
empresas.

## En las tarjetas

Flechas para pasar, espacio para pausar y la tecla P para los ajustes (por ejemplo, tu nombre). Al terminar no
vuelve a empezar: se queda en tu carta y abre **Compartir**.

Suena el tema de Cardan School, al ritmo de las tarjetas: empieza con tu primer clic o tecla (el navegador no deja
sonar antes) y se quita con **Sonido**. El vídeo que descargas la lleva si el sonido está puesto.

## Compartir

**Compartir** abre una hoja en la que eliges qué tarjeta publicas y dónde. En la edición Claude Code sale primero el
**resumen**, una tarjeta con todo tu año en una; también puedes elegir cualquiera de las otras y el estilo (tinta y
crema, todo tinta, todo crema o naranja), que cambia todas las tarjetas.

- **Publicar en LinkedIn:** sale en tu perfil como una foto normal, con un texto que revisas y cambias antes. Desde
  el ordenador se publica sin salir de la página; la primera vez, LinkedIn te pide permiso en una ventana pequeña. En
  el móvil se abre el menú de compartir del teléfono.
- **Instagram:** descarga la imagen en 4:5 para que la subas desde su app. En el móvil, el menú de compartir.
- **Slack:** copia la imagen para pegarla en el canal.
- **Descargar** la imagen, **copiarla** o **descargar el vídeo** con la secuencia entera, en vertical.

La pieza pensada para compartir es **la carta final**: funciona sola, fuera de la secuencia. Lleva su rareza según
tu nivel (común, rara, épica o legendaria) y, debajo, la frase para que quien la vea haga la suya.

## Privacidad

- **Todo se calcula en tu equipo.** La herramienta no tiene dependencias y no hace ninguna llamada a internet.
- **Tus cifras solo llegan a tu navegador.** La página del recap en la web de Cardan School las recibe detrás del `#`
  de la dirección, que no se envía al servidor, y las quita de la barra al abrirse. Es una página aparte: sin cookies,
  analítica ni chat, no carga nada de fuera y lleva dentro las tipografías y los logos.
- **Al publicar en LinkedIn, y solo entonces, sale la imagen de la tarjeta.** Se sube a la web de Cardan School para
  publicarla en tu perfil con tu permiso, y se borra en cuanto se publica. Solo esa imagen y el texto que escribes. El
  permiso de LinkedIn se usa para esa publicación y no se guarda. Para lo demás (descargar, copiar, el menú del
  móvil) no se sube nada.
- **Solo cuenta.** Días, sesiones, tokens, herramientas usadas, commits. No guarda tus prompts, tu código ni el
  contenido de tus sesiones.
- **Sin nombres.** En el archivo que genera no van los nombres de tus repos (salvo con `--names`), ni los de tus
  skills, conectores o agentes: solo cuántos usas. Sí van tu nombre de usuario de git, los días en que tuviste
  actividad y tus cifras.
- **En la edición chat**, lo que pegas se queda en tu navegador. Es texto: puedes leerlo antes de pegarlo.
- **No compartas la dirección de tu recap ni el archivo** (con `--local`): llevan tus cifras. Comparte las imágenes
  o el vídeo.

Estas promesas están escritas como tests (`npm test`): qué datos viajan y que la única llamada de las páginas es la
subida de la tarjeta al publicar.

## De dónde sale cada cifra (edición Claude Code)

| Dato | Fuente |
|---|---|
| Días, sesiones, tokens por modelo | El resumen que guarda Claude Code (`stats-cache.json`) |
| Sesiones en paralelo, subagentes, skills, conectores, tu mejor hora | Las sesiones que Claude Code conserva en tu equipo (por defecto, los últimos 30 días) |
| Proyectos y commits | `git log` de los proyectos que has abierto con Claude Code, solo tus commits del año |
| Commits «con un agente» | Los que llevan la firma `Co-Authored-By` de un agente |
| «Más que el 90 %» | La [documentación de Claude Code](https://code.claude.com/docs/en/costs): en empresas, la media es de unos 13 $ por desarrollador y día activo, y el 90 % queda por debajo de 30 $. Tu cifra es una estimación a precio público de API. |

El nivel AI-native y los personajes salen de una fórmula propia con umbrales provisionales
(`src/app/level-code.js` y `src/app/level-chat.js`).

## Preguntas frecuentes

**¿Qué es Builder Recap?**
Un resumen de tu año construyendo con IA, en tarjetas animadas para compartir en redes. Lo hace Cardan School y es
gratuito y de código abierto (licencia MIT).

**¿Es un «Wrapped» para quien programa con IA?**
Sí, es la misma idea que los resúmenes del año de las apps de música, pero de cómo construyes con IA: días, proyectos,
commits, agentes en paralelo y tu ritmo, con un personaje y un nivel AI-native al final. Con Claude Code, es tu
Claude Code Wrapped con cifras medidas en tu equipo.

**¿Cuánto cuesta?**
Nada. Es gratuito y de código abierto. Si se lo pides a tu asistente, solo gasta lo que gaste esa conversación en tu
plan.

**¿Necesito Claude Code?**
No. Con Claude Code salen cifras medidas de tu equipo. Sin él, la edición chat funciona con ChatGPT o con Claude a
partir de lo que tu asistente recuerda de ti.

**¿Funciona con Cursor, Codex u otros agentes?**
Pueden lanzarla, porque ejecutan comandos en tu equipo, pero las cifras salen de Claude Code y de los proyectos que
has abierto con él. Si no usas Claude Code, haz la edición chat.

**¿Envía mis datos a algún sitio?**
Tus datos, no. La herramienta solo guarda recuentos (nada de prompts, código ni contenido de tus sesiones) y no
llama a internet. Tus cifras viajan detrás del `#` de la dirección de tu recap, que solo lee tu navegador. Lo único
que sale es la imagen de la tarjeta que publicas en LinkedIn, y se borra de nuestra web en cuanto se publica.

**¿Cómo se calcula el nivel AI-native?**
Con una fórmula propia y pública en este repo. En la edición Claude Code sale de tus cifras; en la edición chat, de
doce respuestas de sí o no. El nivel nunca lo pone el modelo.

**¿Por qué faltan sesiones antiguas?**
Claude Code borra las sesiones a los 30 días por defecto (`cleanupPeriodDays`). Los días y los tokens salen de su
resumen, que guarda todo el año; los agentes en paralelo y tu ritmo, solo de las sesiones que quedan.

**¿Funciona en Mac y en Linux?**
Sí. Funciona en Windows, Mac y Linux: solo necesita Node 18 o superior y git.

**¿Está en inglés?**
Sí. Las tarjetas salen en español o en inglés: en la web, según la dirección (`/es/` o `/en/`, que la orden elige por
el idioma de tu sistema); en la edición chat, según tu navegador. Se cambia en los ajustes (tecla P) o con `--lang en`. Tu asistente contesta en el idioma en el que habláis.

## Límites conocidos

- La edición Claude Code no encuentra tus proyectos sin Claude Code: la lista sale de su configuración.
- La edición chat está sin probar con asistentes reales: el prompt puede necesitar ajustes.

## In English

**Builder Recap is a free, open-source tool by [Cardan School](https://www.cardanschool.com) that turns your year of
building with AI into animated, shareable cards**: days you built, projects and commits, how many agents you ran at
once, your rhythm and, at the end, your card of the year with a character and an AI-native level. Think of it as a
year-in-review, a Claude Code Wrapped, built from your real Claude Code and git data, or from what your assistant
(ChatGPT or Claude) remembers about you.

- **How to use it:** paste `Make my Builder Recap following github.com/CardanSchool/builder-recap` into Claude Code
  or your assistant. It reads [`AGENTS.md`](AGENTS.md) and does the rest.
- **Privacy:** everything is computed on your machine. Only counts, never prompts, code or session content. The only
  thing that leaves is the image of the card you publish on LinkedIn, deleted once it is published.
- **Requirements:** Node 18 or later and git, on Windows, macOS or Linux. No dependencies.
- **Language:** English or Spanish. The web page follows its address (`/es/` or `/en/`, picked from your system language) and
  the chat edition your browser's; switch it in the settings (key P) or with `--lang en`. The prompt for assistants is also in English: [`docs/prompt-en.txt`](docs/prompt-en.txt).
- **License:** MIT.

## Quién hay detrás

[Cardan School](https://www.cardanschool.com) enseña a construir y lanzar tu propio producto con Claude Code y agentes
de IA, de la idea a producción. Un squad de producto, en una sola persona.

- [El Radar](https://cardanschool.com/radar): un test de 60 segundos que te dice qué nivel de builder eres y por dónde
  empezar.
- [Webinars](https://cardanschool.com/webinars), en directo.
- [Contexto](https://cardanschool.com/contexto): el podcast y la newsletter de Manu López, cada viernes.

## Desarrollo

```bash
npm test         # privacidad, lectura de sesiones y lectura de la respuesta del asistente
npm run build    # regenera docs/index.html (la edición chat), docs/prompt.txt y docs/prompt-en.txt desde src/app
```

Sin dependencias.

## Licencia

Código bajo licencia [MIT](LICENSE). Tipografías Inter, Source Serif 4 y Space Mono, incrustadas bajo licencia SIL
OFL 1.1 ([`licenses/`](licenses)). Los logos y la música (`src/app/music.js`) son de Cardan School y no entran en la
licencia MIT.
