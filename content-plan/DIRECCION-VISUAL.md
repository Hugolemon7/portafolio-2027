# Etapa 3 — Dirección visual

**Maqueta:** `mockup/index.html` (home en español, HTML estático). Para verla: `cd mockup && python3 -m http.server 8766` → http://localhost:8766

---

## 1. Lo que tomé (y lo que no) de tus referencias

| Referencia | Tomé | Evité (como pediste) |
|---|---|---|
| **Molecular Therapeutics** | Nombre/wordmark gigante como arquitectura del hero; secciones que cambian el color de todo el fondo; tipografía grande con mucho aire; scroll suave (usa Lenis) | Su paleta azul eléctrico y el CTA animado |
| **Pacôme Pertant** | El menú: botón "Menú" que se abre como panel desde su propia esquina, links enormes que suben escalonados, correo y redes abajo, fondo oscurecido | La falta de navegación: aquí los links están siempre visibles en escritorio y el panel es un extra |
| **Art Yakushev /info** | El split 50/50 texto/retrato del hero; el título enorme de sección; la tabla limpia de "Awards" (la uso para Experiencia) | Scroll y navegación horizontal: todo es vertical |
| **Inflect** | Scroll amable: Lenis + entradas suaves por sección. Dato útil: Inflect está hecho en **Astro**, igual que tu sitio | Gradientes de fondo y tarjetas con brillo |

## 2. Dirección (tasteskill)

- **Dirección dealt:** *The name as a monument* (seed 511654266). Elegida entre 3 porque es literalmente la composición del hero de Molecular, tu referencia de UI.
- **Idea:** *En esta página, tu nombre se vuelve la estructura del sitio, y el antes/después de tus productos se parte en la costura y se vuelve a unir* — lo que haces como diseñador de sistemas: unificar.
- **La cosa viva:** el visitante cambia el **color de temporada** y el **modo claro/oscuro** del sitio desde la sección "Cómo trabajo", y ve los tokens (`--accent`, contraste AA/AAA) actualizarse en vivo. Demuestra tu skill de Design Systems y es tu requisito de cambiar colores por temporada.

### Tipografía
- **Gambarino** (display, serif angosta) para nombre, títulos y listas-póster.
- **General Sans** (texto) para todo lo demás. Ambas de Fontshare, gratuitas para uso comercial.
- 7 tamaños en escritorio (el sitio actual usa 11).

### Color — "Three stones" + acento por temporada
| Token | Claro | Oscuro |
|---|---|---|
| Fondo | `#eeecea` | `#1b1a19` |
| Superficie | `#e4e1dd` | `#262523` |
| Campo (Facilitación) | `#cdc3b6` | `#34312d` |
| Tinta | `#2b2a29` | `#edebe8` |

**Temporadas (materiales de Oaxaca)** — el acento solo vive en el botón principal, hovers y un detalle:
| Temporada | Hex | Contraste con texto blanco |
|---|---|---|
| Salvia (default, eco de tu gorra) | `#5c6b54` | 5.7:1 AA |
| Grana cochinilla | `#8e1f2f` | 8.8:1 AAA |
| Cempasúchil | `#9a4a08` | 6.3:1 AA |
| Barro negro | `#2f2c29` | 13.9:1 AAA |

En Keystatic podrás elegir la temporada por defecto o meter un hex propio; el sitio te avisa si el contraste no pasa AA.

### Movimiento
- Nombre que sube desde su línea base al cargar (gesto principal).
- Proyectos: dos paneles por proyecto se desplazan en sentidos opuestos y el título se parte en la costura; se une cuando el proyecto está centrado.
- Entradas suaves por sección, menú animado, scroll suave con Lenis.
- Todo respeta `prefers-reduced-motion`.

## 3. Estructura del home

1. **Hero** — "Hugo / Buenrostro" monumental + h1 "Diseño productos que escalan" + Escríbeme + retrato.
2. **Impacto medible** — 70+ · 40% · +25% · 100+.
3. **Proyectos** — Wiggot (caso), Monopolio, Empréndete, Convención; link a todos.
4. **Cómo trabajo** — datos → sistema → sprint → IA, cada uno con evidencia real; aquí vive el selector de temporada.
5. **Facilitación** — metodologías como póster + lugares donde impartiste.
6. **Diez años de producto** — tabla de experiencia + CV.
7. **Contacto** — tu correo como tipografía gigante, fondo invertido.
8. **Footer** — tu nombre de lado a lado.

## 4. Verificación

- `lint.mjs`: **0 FAIL, 0 WARN**.
- `inspect.mjs` a 1440 / 768 / 390 px: **0 FAIL**, 5 WARN, defendidos así:
  - *3 tipografías:* la tercera es monoespaciada solo dentro del bloque de código real de tokens.
  - *Sin video:* el video del sitio de Framer no reproduce en Chromium; si tienes un clip real de tu proceso (pantalla grabada de Figma, prototipo), lo agregamos.
  - *Títulos sobre imágenes en Proyectos:* es el diseño de la sección (título en la costura); las imágenes van oscurecidas al 62% para legibilidad.
  - *10 tamaños en móvil:* vienen de tamaños fluidos (vw) del nombre y pósters; se afinará en Astro.
- Nota técnica: Lenis se desactiva solo cuando el navegador es automatizado (`navigator.webdriver`), porque impedía que el inspector hiciera scroll. Los visitantes reales lo tienen siempre.

### Crítica (rúbrica Taste, ronda final)
```
Visto en un segundo: el nombre "Hugo Buenrostro" enorme junto a tu retrato.
Idea: tu nombre es la estructura; el antes/después se parte en la costura y se une.
Cosa viva: selector de temporada + modo oscuro con tokens en vivo.
Layout por sección: hero=split monumental / impacto=lista de cifras / proyectos=pinned split / cómo trabajo=columna / facilitación=póster / experiencia=tabla / contacto=statement / footer=wordmark
Scores: diseño 7.5 · usabilidad 8 · creatividad 7.5 · contenido 7 → 7.6
Pendientes más visibles:
1. Imágenes de proyectos a baja resolución (570–900 px) se ven suaves en paneles de 720×900. → Exportar desde Figma a 2×.
2. Experian no aparece en Proyectos (NDA). → Bloque privado listo en Keystatic para el futuro.
3. Facilitación sin logos (pendiente tu decisión).
```

## 5. Pendientes para ti

1. ¿Apruebas la dirección (tipos, paleta, temporadas, composición)? Si algo no te convence, dime qué y por qué.
2. ¿Puedes exportar desde Figma las imágenes de tus proyectos en mejor resolución (ideal ≥ 1600 px de ancho, 2×)?
3. Decisión de logos en Facilitación.
4. ¿Tienes algún clip corto (10–20 s) de tu proceso para el "video" del sitio? Opcional.

---

# Ronda 2 (tu feedback)

| Pediste | Hice |
|---|---|
| El nav bar no se ve | Barra **siempre visible y sólida**: oscura sobre el hero, clara al bajar. Tu nombre a la izquierda, links a 17–19 px, botón "Menú" en alto contraste. Quité el auto-ocultado al hacer scroll. |
| La foto en "Sobre mí" | Nueva sección **Sobre mí**: tu retrato fijo a la izquierda mientras a la derecha se lee tu historia, datos (base, idiomas, herramientas), CV y "Cómo trabajo". |
| Quitar colores de temporada del sitio | Eliminados de la página y del menú. El acento lo defines tú en **Keystatic**, que **no te dejará guardar un color que no pase AA** (texto normal 4.5:1) y te indicará si llega a AAA (7:1). Se implementa en la Etapa 5. |
| Switch de tema solo en el menú | Switch accesible (`role="switch"`) **claro/oscuro** dentro del menú. Recuerda la elección del visitante. |
| No cortar el texto | El título de cada proyecto queda **completo**; solo las imágenes se desplazan y se recortan. |
| Hero espacial interactivo | Fondo **espacio oscuro con nebulosa** (petróleo + polvo cálido, sin violeta) y un **campo de estrellas en canvas**: 3 profundidades con parallax, titileo, el cursor deja un **rastro de nebulosa** y aparta/enciende las estrellas cercanas, y **clic o toque = estallido de estrellas**. Se pausa fuera de pantalla y respeta "reducir movimiento". |
| 3 opciones tipográficas | Ver `mockup/fonts.html`. A: **Clash Grotesk + Satoshi** · B: **Instrument Serif + Instrument Sans** · C: **Switzer**. En el home: `index.html?font=a`, `?font=b`, `?font=c`. |
| Imágenes | Se quedan las actuales; las reemplazas desde Keystatic. |
| Logos de Facilitación | **Placeholders** en "Dónde he impartido" (Talent Land, UNAM, UANL, Sec. Innovación Jalisco, CONTPAQi), reemplazables desde Keystatic. |
| Video | **Placeholder** en "Cómo trabajo → Y con IA". |

**Verificación ronda 2:** `lint` 0 FAIL · `inspect` 0 FAIL a 1440/768/390 (con permiso explícito para el gradiente que pediste) · consola sin errores.

## Qué grabar para el video (sugerencia)

**Objetivo:** demostrar en 20 s que vas de diseño a producto funcionando con IA — tu diferenciador 2027.

**Guion (20–25 s, sin audio, en loop):**
1. **0–6 s · Figma:** un componente (p. ej. una card de propiedad) con el panel de **Variables/tokens** abierto; cambias un token (color o radio) y se actualiza.
2. **6–14 s · Claude Code:** la terminal/editor generando ese mismo componente en código a partir del diseño (se ve el prompt corto y el código aparecer).
3. **14–22 s · Navegador:** el prototipo funcionando: hover, clic, un filtro o un estado vacío → lleno.

**Formato técnico:**
- 16:9, grabado a 1440p o 1080p, recortado a 1920×1080.
- MP4 H.264 (y opcional WebM), **< 8 MB**, 24–30 fps, sin audio.
- Cursor grande y movimientos lentos; nada de datos bajo NDA (usa un proyecto personal o datos ficticios).
- Un frame limpio como **póster** (PNG) para mostrar antes de que cargue.

Herramientas: grabación de pantalla de macOS (⌘⇧5) y recorte en QuickTime o CapCut.

---

# Ronda 3 (tipografía A + 10 ajustes)

- **Tipografía:** Clash Grotesk (títulos) + Satoshi (texto).
- **Rastro del cursor morado** con retraso (sigue al mouse más lento y aparece/desaparece con suavidad).
- **"Diseño productos que destacan"**: "destacan" con gradiente morado y aura de nebulosa que respira; el cierre repite el gesto ("¿Diseñamos algo que destaque?").
- **Botones redondeados** 12 px; tarjetas 18 px; paneles y footer 22 px.
- **Barra translúcida** sobre el espacio (hero y cierre) con desenfoque; contraste del texto 16.8:1 (AAA). Sólida sobre secciones claras.
- **Grises fríos:** fondo `#eceef1`, superficie `#e1e4e9`, campo `#d3d8e0`, tinta `#1f2328` (13.6:1).
- **Acento morado:** `#5a3ec8` en claro (7.1:1 AAA con blanco) y `#b9a4ff` en oscuro (9:1 AAA).
- **Descargar CV:** botón relleno con ícono de descarga y etiqueta "PDF · ES"; enlace al résumé en inglés junto.
- **Footer al estilo Molecular:** sección final sobre el cielo estrellado con frase y botón, y el footer como tarjeta redondeada que flota encima (marca, Navegar, Contacto, Descargas, volver arriba).
- **Impacto y Facilitación interactivos (como "Leadership Team"):** al pasar el cursor, el elemento se llena con nebulosa morada que nace donde está el mouse, el texto pasa a blanco y aparece un cursor circular "Ver"; al hacer clic se abre un panel lateral con el contexto real de cada cifra o metodología. Funciona con teclado (foco = mismo relleno).
- **Diez años de producto:** cada empleo tiene "Ver más / Ver menos" con el desglose de actividades del CV (redacción corregida), con animación de apertura.

**Verificación:** lint 0 FAIL · inspect 0 FAIL a 1440/768/390. Excepciones explícitas por pedido tuyo: gradientes, texto con gradiente, barra con desenfoque y paleta morada (la skill de Taste las prohíbe por defecto).

---

# Ronda 4

- **Gas del cursor:** ya no son círculos. Son bocanadas en forma de **óvalos irregulares** (dos lóbulos que giran en sentidos opuestos) que crecen, rotan y **se diluyen como tinta en agua** cuando dejas de mover el mouse (~3 s). Intensidad al **75%**.
- **"destacan" / "destaque":** gradiente cónico de **aberración cromática** (magenta, ámbar, cian, azul, violeta) que **gira continuamente** alrededor de la palabra, con franjas rojo/cian desplazadas y un aura del mismo espectro. Respeta "reducir movimiento".
- **Jerarquía de botones:** primario = acento morado / claro sobre espacio · **secundario = negro del espacio** (`#06070b`, en oscuro se invierte) → "Descargar CV" · terciario = gris tenue → "Ver más".
- **Footer como Molecular:** la sección clara termina con **esquinas inferiores redondeadas** sobre el cielo, y la **tarjeta del footer entra al 100% del ancho** (esquinas casi rectas) y **se reduce** a su tamaño final con esquinas de 22 px conforme haces scroll.
- **Hover de Impacto y Facilitación al 20%:** tinte de nebulosa suave; el número o la metodología cambian a morado; el texto conserva su tinta. Facilitación: **+16 px arriba y abajo** en cada fila.
- **Experiencia:** cada "Ver más" ahora abre **dos párrafos** que narran las actividades con detalle (basados en tu CV y en los retos de tus proyectos).

**Verificación:** lint 0 FAIL · inspect 0 FAIL a 1440/768/390.

---

# Ronda 5

- **Gas del cursor:** menos retraso (sigue al mouse un poco más rápido).
- **"destacan":** la palabra queda **en blanco** con franjas de **aberración cromática** (magenta/cian); el gradiente cónico gira **detrás** como aura.
- **Ícono de expandir:** círculo con "+" en cada tarjeta de Impacto y cada fila de Facilitación; en hover gira y se pinta de morado.
- **Experiencia:** nuevo puesto **Diseñador gráfico · CONTPAQi Marketing (2015–19)**: campañas, planeación de proyectos, branding interno hacia stakeholders y adaptaciones de marca. Párrafo de Innovación ampliado con la adopción de VR/AR y la renovación del área con exposición externa.
- **Cierre:** texto **centrado y plano** ("¿Diseñamos algo que destaque?"), sobre un **velo morado oscuro** que lo distingue del hero.
- **Botones ghost:** "Ver proyectos" y "Usar el formulario" con borde fino; en hover, un velo claro que separa el texto del fondo.

**Verificación:** lint 0 FAIL · inspect 0 FAIL a 1440/768/390 (excepciones pedidas: gradientes, texto con sombra cromática, barra con blur, paleta morada).
