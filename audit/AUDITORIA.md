# Auditoría — elhugoux.framer.website

**Fecha:** 20 oct 2026 · **Herramientas:** Playwright CLI (capturas 1440 / 768 / 390 px), Web Interface Guidelines (Vercel), Taste skill `inspect.mjs` + rúbrica de crítica.
**Capturas:** `audit/screens/` y `.taste-skill/before/`

---

## Resumen en una línea

El sitio comunica *quién eres* pero no *por qué contratarte*: se lee como un CV largo en letra de 12 px, con un solo caso de estudio, sin estructura semántica (0 encabezados) y con una estética 2023 (glows verdes, glass, sombras) que no te diferencia.

**Puntuación Taste (estilo jurado Awwwards):**

| Criterio | Nota | Por qué |
| --- | --- | --- |
| Diseño (40%) | 5.0 | 3 tipografías, 11 tamaños, glows/gradientes, huecos de 1,880 px vacíos |
| Usabilidad (30%) | 5.5 | Sin `h1`, CTA principal no es enlace, cuerpo a 12 px, "Made in Framer" tapa contenido en móvil |
| Creatividad (20%) | 5.5 | Hero de categoría (foto recortada + "UX/UI DESIGNER"); intercambiable con cualquier diseñador |
| Contenido (10%) | 6.0 | Buen material real, pero sin métricas visibles, con erratas y en formato lista de tareas |
| **Total** | **5.4 / 10** | Tope por 10 FAIL del inspector: máx. 6.0 |

Referencia: un Site of the Day real queda en 7.5–8.0. La meta del rediseño es **≥ 7.5**.

---

## 1. Hallazgos críticos (bloquean reclutadores / SEO / accesibilidad)

| # | Problema | Evidencia | Impacto |
|---|---|---|---|
| C1 | **Cero encabezados** (`h1`–`h6`) en home y en el caso de estudio | DOM: `headings: []` | Google y lectores de pantalla no entienden la página; el inspector marca `no-title` |
| C2 | **Sin `lang`** en `<html>`, sin `hreflang`; el "English" solo enlaza un PDF en Drive | DOM | No hay sitio en inglés real; mercado remoto/EE. UU. queda fuera |
| C3 | **CTA "PLATIQUEMOS" no es un enlace** (`href=null`); tampoco hay formulario | DOM: 2 `<a>` sin destino ni texto | La acción principal del sitio no hace nada confiable |
| C4 | **Texto de cuerpo a 12 px**, 56 bloques < 13 px, líneas de 157 caracteres | `inspect.mjs` | Ilegible en móvil; reclutadores escanean, no leen |
| C5 | **Las 11 imágenes tienen `alt=""`** (todas tratadas como decorativas) | DOM | Los proyectos son invisibles para accesibilidad y búsqueda de imágenes |
| C6 | **Sin landmarks** (`main`, `nav`, `header`, `footer`) ni skip link | DOM | Navegación por teclado/lector imposible |
| C7 | **Sin `prefers-reduced-motion`** | CSS | Animaciones forzadas |
| C8 | **Huecos vacíos** de 564 px y 1,880 px (secciones Branding / Otros proyectos) | `inspect.mjs blank-gap` | Se ve roto o sin terminar |
| C9 | **Badge "Made in Framer"** fijo tapa texto y CTA en móvil | capturas móviles | Ruido + parece plantilla gratuita |
| C10 | **Texto del hero tapado** ("UX/UI DESIGNER" 38% bajo la foto) | `covered-text` | Mensaje principal cortado |

## 2. Hallazgos de diseño visual (Taste)

- **3 familias tipográficas** (Inter, Plus Jakarta, Playfair) + DM Sans y Red Hat cargadas sin uso → máximo 2, idealmente 1.
- **11 tamaños de fuente** (10→88 px) → 5 bastan: display, título, lead, cuerpo, pequeño.
- **Acento serif itálico verde** en cada subtítulo ("Web | Empréndete Blog") → es el "tell" más fechado; además compite con el verde del CTA.
- **6 gradientes, 4 sombras de reposo, 7 superficies glass, glows verdes** detrás de cada mockup → lenguaje visual 2022–2023. Reemplazar por planos de color y tono.
- **Márgenes desiguales** (0 px izq. / 200 px der. a 1440 px).
- **Cinco estrellas ★★★★★ sobre "+10 años"** → no hay fuente de esa calificación; resta credibilidad.
- **Navegación en píldora flotante con glass** → barra simple: nombre, 3–5 enlaces, una acción.
- **Mockups pequeños** (el hero media ocupa 19% del primer pantallazo; en sitios top ≥ 50%). Tu trabajo debería ser el protagonista, no tu foto.
- **Misma composición repetida** en "Trabajo reciente" (texto + mockup alternado ×3) y "Otros proyectos" (tarjeta oscura ×4).

## 3. Hallazgos de UX y contenido (posicionamiento Product Designer 2027)

1. **El título dice "UX/UI Designer"**, pero tu último rol en DD360 fue Product Designer y tu trabajo en Experian es de Design Systems + datos. El mercado 2026–27 contrata *Product Designers* que hablan de **impacto en negocio, sistemas y decisiones con datos**.
2. **El "Acerca de mí" es un CV completo** (≈ 700 palabras de bullets) antes de ver cualquier proyecto. Un reclutador decide en ~30 s: proyectos primero, experiencia resumida, CV descargable.
3. **Métricas enterradas.** Tienes números fuertes (+40% componentes reconstruidos, 70+ componentes en AEM, +25% retención, +65% ventas Q2) en bullets de 12 px. Deben ser titulares.
4. **Un solo caso de estudio**, y ese caso:
   - no indica **tu rol, equipo, duración ni herramientas** al inicio;
   - tiene texto diminuto sobre fondo negro, sin encabezados reales;
   - "Resultados" muestra pantallas, **no resultados medibles**;
   - no tiene "Aprendizajes / qué haría distinto" (lo que más valoran en entrevistas senior).
5. **Erratas:** "comuniación", "metolodologías", "Implemeté", "Writting", "Sintenización", "contínua", "metodologías metodologías".
6. **Logos de "Facilitador de metodologías"** (Stanford, Amazon, FORTH, Serious Play, Board of Innovation): no queda claro la relación (¿certificaciones? ¿clientes?). Mostrar logos ajenos sin contexto puede leerse como afiliación.
7. **Descargas:** solo existen links al CV (ES/EN en Google Drive). "Portafolio UX/UI" y "Logofolio" no enlazan a nada.
8. **No hay forma de contacto real** más allá de íconos (WhatsApp / LinkedIn / mail).
9. **Faltan señales 2027:** cómo trabajas con IA en tu proceso, Design Systems/tokens, colaboración con ingeniería, métricas de producto, disponibilidad (remoto, zona horaria, idiomas).

## 4. Las tres cosas que más moverían la aguja

1. **Proyectos primero, con impacto en titulares.** Hero = quién eres + qué resuelves + tu mejor trabajo grande; después 3–4 casos con métrica principal visible en la tarjeta.
2. **Plantilla de caso de estudio sólida y editable** (Keystatic): contexto → rol/equipo/tiempo → problema → proceso → decisiones clave → resultados medibles → aprendizajes.
3. **Sistema visual de una tipografía, color de acento configurable por temporada, y semántica/accesibilidad correctas** (h1, lang, alt, foco, motion reducido, ES/EN reales).

---

## Inventario de assets recibidos

- `Hugo Buenrostro_files/`: **10 PNG + 1 SVG** (mockups Wiggot, Empréndete, Convención, foto hero, etc.). El resto son scripts de Framer (no se usan).
- El HTML referencia imágenes adicionales alojadas en `framerusercontent.com` (logos de branding, "Otros proyectos", imágenes del caso Wiggot) que **no** están en la carpeta.
- Caso Wiggot: PNG de página completa con secciones Problema y objetivo → Solución → Metodología (Atomic Design) → Descubrimientos (competencia, aprendizajes) → Resultados.
