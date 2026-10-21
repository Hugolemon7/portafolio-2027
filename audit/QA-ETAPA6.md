# Etapa 6 — Calidad

## 1. Imágenes
- `scripts/optimize-images.mjs` (corre antes de `dev`, `build` y `check`) genera **variantes WebP** (640/1280/1920/2560 px, calidad 78) en `public/_img/` y un manifiesto con **ancho y alto reales**.
- Componente `src/components/Img.astro`: `<picture>` con `srcset` WebP + `sizes` por uso + `width`/`height` (CLS = 0). Si una imagen nueva aún no está en el manifiesto, cae a un `<img>` normal.
- Las variantes viven fuera de las carpetas que gestiona Keystatic, así que guardar en el panel no las borra. Vercel las regenera en cada deploy.

## 2. Web Interface Guidelines (Vercel) — hallazgos y correcciones
```
src/styles/global.css      - foco bajo la barra fija → scroll-padding-top en html
src/styles/global.css      - -webkit-tap-highlight-color sin definir → transparent (el foco sigue visible)
src/styles/global.css      - barra sin safe-area → padding con env(safe-area-inset-*) + viewport-fit=cover
src/layouts/Base.astro     - theme-color fijo oscuro en páginas claras → se actualiza con el fondo de la barra
src/components/home/About  - video en autoplay sin pausa → botón Pausar/Reproducir; sin autoplay con reduced-motion
src/scripts/app.js         - paneles de detalle sin URL → #impact-N / #method-N enlazables (y se abren al cargar)
src/views/ContactPage      - salir con mensaje a medias → aviso beforeunload; autocomplete="off" en el mensaje
src/components/Header,Finale - nombre propio traducible → translate="no"
src/views/AboutPage        - salto h1 → h3 → corregido a h1 → h2
src/views/ProjectsPage     - alt de logos en español en /en → localizado
✓ sin transition: all · sin outline:none sin reemplazo · sin bloqueo de zoom · sin autofocus · enlaces externos con rel=noopener
✓ labels, autocomplete, inputmode y spellcheck en el formulario; errores en línea y foco al primero; aria-live
✓ prefers-reduced-motion en todo · tabular-nums en cifras · "…" en placeholders y estados de carga
```
**Decisiones conscientes:** encabezados en *sentence case* también en inglés (estilo de la dirección visual, no Title Case de Chicago); textos en primera persona (es un portafolio personal).

## 3. Lighthouse (build de producción, servidor local sin compresión)
| Página | Rendimiento | Accesibilidad | Buenas prácticas | SEO | LCP | CLS |
|---|---|---|---|---|---|---|
| Home · móvil | 96 | 100 | 96* | 100 | 2.4 s | 0 |
| Home · escritorio | 100 | 100 | 100 | 100 | 0.5 s | 0 |
| Caso Wiggot · móvil | 96 | 100 | 100 | 100 | 2.6 s | 0 |
| Caso Wiggot · escritorio | 100 | 100 | 100 | 100 | 0.5 s | 0 |
| Home EN · móvil | 97 | 100 | 100 | 100 | 2.5 s | 0 |
| Home EN · escritorio | 100 | 100 | 100 | 100 | 0.5 s | 0 |

\* Un recurso cortado por el servidor local de prueba. Compresión y caché no aplican en local; en Vercel van por defecto + `vercel.json` (caché inmutable para `/_astro`, `/fonts`; 30 días para `/_img`; cabeceras de seguridad).

## 4. Pruebas automáticas (Playwright) — `npm run build && npm test`
**58/58 pasan** (29 escenarios × escritorio y móvil Pixel 7):
- Las 20 páginas (10 × 2 idiomas): status 200, `lang` correcto, un solo `h1`, `hreflang` al equivalente, botón de idioma correcto, sin desborde horizontal, todas las imágenes con `alt`, sin errores de consola.
- Cambio de idioma a la página equivalente · menú con foco atrapado y Escape · modo oscuro persistente · panel de impacto y URL enlazable · "Ver más" · comparador con teclado · validación del formulario · 404 · sitemap con ambos idiomas y sin `/keystatic`.

## 5. Taste (inspector) tras los cambios
Home, caso, proyectos y sobre mí en español: **0 FAIL**. En inglés, el aviso de idioma cubre texto mientras está visible (el navegador de prueba está en español); comportamiento esperado y descartable.
