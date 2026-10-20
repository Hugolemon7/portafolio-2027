# Etapa 2 — Estrategia y contenido

> Documento para revisar. Todo lo marcado con **[?]** necesita tu confirmación.
> Ningún dato fue inventado: cada número viene de tu sitio, tu CV o tus respuestas.

---

## 1. Posicionamiento

**Para quién es el sitio:** reclutadores y hiring managers de equipos de producto (fintech, proptech, SaaS), en México y remotos para EE. UU./LatAm. Deciden en ~30 segundos.

**Qué deben creer después de la primera pantalla:**
> Hugo es un Product Designer que ordena productos complejos con sistemas de diseño y datos, y que trabaja codo a codo con ingeniería — incluso prototipando en código con IA.

**Tus tres diferenciadores reales (lo que un competidor no puede firmar igual):**
1. **Design Systems con impacto medible** — 70+ componentes consolidados en AEM, 40% reconstruido (Experian, EE. UU.).
2. **Producto + negocio** — +25% retención y campañas que llevaron ventas +65% en Q2 2024 (Wiggot).
3. **Facilitador de innovación** — más de 5 años impartiendo Design Thinking, LEGO® Serious Play®, Working Backwards en TalentLand, UNAM, UANL y la Secretaría de Innovación de Jalisco. Esto te separa de la mayoría de candidatos: sabes alinear equipos, no solo pantallas.
4. **(2027) Flujo con IA** — vibecoding, prototipos en código e investigación asistida con Claude.

**Título profesional:** `Product Designer` (antes "UX/UI Designer"). Subtítulo: *Design Systems · Fintech & Proptech*.

---

## 2. Arquitectura del sitio

| Español | English | Contenido |
|---|---|---|
| `/` | `/en` | Home: hero, impacto, trabajo seleccionado, cómo trabajo, experiencia resumida, facilitación, contacto |
| `/proyectos` | `/en/work` | Todos los proyectos (casos completos + proyectos breves + branding) |
| `/proyectos/[slug]` | `/en/work/[slug]` | Caso de estudio |
| `/sobre-mi` | `/en/about` | Historia, experiencia completa, formación, certificaciones, facilitación, herramientas |
| `/contacto` | `/en/contact` | Formulario (Resend) + email + LinkedIn + CV |
| `/keystatic` | — | Panel de edición (solo tú, vía GitHub) |

**Navegación:** `Hugo Buenrostro` · Proyectos · Sobre mí · Contacto · `ES / EN` · botón **Escríbeme**
**Descargas** (en Sobre mí y en el footer): CV y Portafolio (con logofolio), cada uno en el idioma de la página — reemplazables desde Keystatic.

Detección de idioma: la primera visita sugiere inglés si el navegador está en inglés (sin redirigir a la fuerza); el selector recuerda la elección.

---

## 3. Argumento del Home (una afirmación por sección + su prueba)

```
1. Hero        Soy Product Designer: diseño productos que escalan.      → tu retrato editorial + botón "Escríbeme"
2. Impacto     Mis decisiones mueven métricas.                          → 4 cifras reales, grandes
3. Trabajo     Esto es lo que he construido.                            → 4–5 proyectos, imagen grande, métrica/rol en cada uno
4. Proceso     Trabajo con datos, sistemas, ingeniería e IA.            → 4 principios, cada uno con un ejemplo real
5. Experiencia 10+ años, de innovación a producto.                      → línea de tiempo compacta + CV descargable
6. Facilitación Sé alinear equipos, no solo pantallas.                   → conferencias y talleres, lugares reales
7. Contacto    Hablemos.                                                → formulario corto + email + LinkedIn
```

Se eliminan: las 5 estrellas (sin fuente), "User-Centered Design" como título de sección (no dice nada), el CV completo en el home, los logos de marcas ajenas (ver §8 pregunta 6).

---

## 4. Copy deck — Home

### 4.1 Hero

**Elegida: Opción A.**

**Opción A — La afirmación** (recomendada)
| | ES | EN |
|---|---|---|
| h1 | Diseño productos que escalan | I design products that scale |
| Apoyo | Soy Hugo Buenrostro, Product Designer. Construyo sistemas de diseño y flujos para productos fintech y proptech, con datos y pruebas con usuarios. | I'm Hugo Buenrostro, a Product Designer. I build design systems and flows for fintech and proptech products, backed by data and user testing. |
| Botón | Escríbeme | Get in touch |
| Secundario | Ver proyectos | See work |

**Opción B — El nombre**
| | ES | EN |
|---|---|---|
| h1 | Hugo Buenrostro | Hugo Buenrostro |
| Apoyo | Product Designer especializado en sistemas de diseño para fintech y proptech. Hoy en Experian. | Product Designer specialized in design systems for fintech and proptech. Currently at Experian. |

Detalle bajo el apoyo (pequeño): **ES** `Oaxaca, México · Solo remoto · 10+ años · Español / English (B2)` · **EN** `Oaxaca, Mexico · Remote only · 10+ years · Spanish / English (B2)`

### 4.2 Impacto

| Cifra | ES | EN | Fuente |
|---|---|---|---|
| **70+** | componentes consolidados en el Design System de Experian | components consolidated in Experian's design system | CV |
| **40%** | del sistema reconstruido para alinearlo con producción | of the system rebuilt to match production | CV |
| **+25%** | retención de usuarios en Wiggot con nuevos flujos | user retention at Wiggot through redesigned flows | CV |
| **100+** | talleres y conferencias impartidos en todo México en 5 años | workshops and talks delivered across Mexico in 5 years | tu respuesta |

> "+65% ventas Q2 2024" va en la línea de tiempo (campañas que coordinaste) y en Herramientas como *Marketing digital*, no en las cifras principales. ✅ Confirmado.

Título de sección: **ES** Impacto medible · **EN** Measurable impact

### 4.3 Trabajo seleccionado

Título: **ES** Proyectos · **EN** Selected work

| Proyecto | Cliente · Año | Tipo | Línea de tarjeta ES | EN |
|---|---|---|---|---|
| Rediseño de Wiggot | DD360 · 2024 | **Caso completo** | Nuevo Design System sobre Material Design para unificar desktop y mobile. | A new Material-based design system that unified desktop and mobile. |
| Monopolio: buscador inmobiliario | Wiggot · 2024 | Proyecto | Un buscador rediseñado para encontrar propiedades en menos pasos. | A redesigned search to find properties in fewer steps. |
| Empréndete | CONTPAQi · 2022 | Proyecto | Marca y blog en Webflow para estudiantes emprendedores, desde cero. | Brand and Webflow blog for student entrepreneurs, from scratch. |
| App Convención Algarabía / Sincronía | CONTPAQi · 2022–23 | Proyecto | UI kits para la app del evento: agenda, ponentes, mapa y notificaciones push. | UI kits for the event app: agenda, speakers, map and push notifications. |
| CONTPAQi Connection | CONTPAQi · 2020 | Proyecto | Plataforma de gamificación: flujo, wireframes, personajes y medallas. | Gamification platform: flow, wireframes, characters and badges. |
| Branding (5 marcas) | 2020–22 | Archivo | Verde Botella, Irving Leal, Ángeles Caloca, Ladrar.Ladrar, Capire. | — |
| Web: Capire / Verde Botella | 2021 | Archivo | Sitio educativo y e-commerce de vidrio reciclado. | Education site and recycled-glass e-commerce. |

Experian: espacio reservado en Keystatic con `visibilidad: privado` — no aparece hasta que lo cambies.

### 4.4 Cómo trabajo

Título: **ES** Cómo trabajo · **EN** How I work

| Principio | ES | EN |
|---|---|---|
| Decido con datos | Hotjar, Adobe Analytics y pruebas con usuarios antes de mover un píxel. | Hotjar, Adobe Analytics and user testing before moving a pixel. |
| Diseño sistemas, no pantallas | Componentes documentados que ingeniería puede usar sin preguntarme. | Documented components engineering can ship without asking me. |
| Trabajo dentro del sprint | Grooming, refinamiento y planeación junto a Product Owners y desarrollo. | Grooming, refinement and planning alongside POs and engineers. |
| Prototipo con IA y código | Vibecoding y prototipos funcionales para validar ideas en días, no semanas; investigación asistida con Claude. | Vibe-coded, working prototypes to validate ideas in days, not weeks; AI-assisted research with Claude. |

### 4.5 Experiencia (resumen en home)

Título: **ES** Experiencia · **EN** Experience

| Rol | Empresa | Fechas | Una línea ES | EN |
|---|---|---|---|---|
| UX Designer | Experian (EE. UU.) | Ene 2025 – hoy | Reconstruí el Design System: 70+ componentes en AEM alineados a producción. | Rebuilt the design system: 70+ AEM components aligned with production. |
| Product Designer | DD360 | Feb – Sep 2024 | Rediseño de Wiggot, nuevo Design System y tour guiado para adopción. | Wiggot redesign, new design system and onboarding tour. |
| UX/UI Designer (líder de diseño) | Wiggot | Oct 2023 – Feb 2024 | Lideré diseño; nuevos flujos con +25% de retención; coordiné campañas que llevaron ventas +65% en Q2 2024. | Led design; new flows drove +25% retention; coordinated campaigns that lifted Q2 2024 sales by 65%. |
| Ejecutivo de Contenido Digital | CONTPAQi | Ene 2022 – Oct 2023 | Creé el blog universitario Empréndete en Webflow. | Built the Empréndete student blog on Webflow. |
| Ejecutivo de Innovación | CONTPAQi | Ene 2019 – Ene 2022 | Journey maps, personas y UI kits para una plataforma de gamificación. | Journey maps, personas and UI kits for a gamification platform. |

Botón: **ES** Descargar CV · **EN** Download résumé

### 4.6 Facilitación

Título: **ES** Facilitación · **EN** Facilitation
Apoyo **ES:** Más de 100 talleres y conferencias en 5 años, por todo México, sobre innovación centrada en las personas.
Apoyo **EN:** 100+ workshops and talks over 5 years across Mexico on human-centered innovation.

- **Metodologías:** Design Thinking · LEGO® Serious Play® · Amazon Working Backwards · Herramientas de Board of Innovation
- **Dónde:** Talent Land · UNAM · UANL · Secretaría de Innovación Jalisco · CONTPAQi
- **Presentación:** pendiente decisión (logos de instituciones donde impartí + metodologías como texto, recomendado; o logos de metodologías con leyenda)

### 4.7 Contacto

Título: **ES** Hablemos · **EN** Let's talk
Apoyo **ES:** Estoy abierto a roles remotos como Product Designer. Te respondo en menos de 48 horas.
Apoyo **EN:** I'm open to remote Product Designer roles. I reply within 48 hours.
Campos: Nombre · Email · Empresa (opcional) · Mensaje · botón **Enviar mensaje / Send message**
Estados: "Enviando…" · "Listo. Te escribo pronto." · error con alternativa: "No se pudo enviar. Escríbeme a buenrsotro.h@gmail.com".

---

## 5. Sobre mí (resumen)

**h1 ES:** Diseño para que los equipos decidan mejor
**h1 EN:** I design so teams make better decisions

**Texto ES:** Soy tapatío, vivo en Oaxaca y estudié Diseño para la Comunicación Gráfica en la Universidad de Guadalajara. Llevo más de diez años entre innovación, contenido y producto digital. Empecé facilitando talleres de Design Thinking y LEGO® Serious Play® en CONTPAQi; hoy diseño y mantengo el sistema de diseño de Experian para su mercado en EE. UU. Lo que me mueve es ordenar productos complejos para que sean claros para quien los usa y sostenibles para quien los construye.

**Texto EN:** I'm from Guadalajara, live in Oaxaca, and studied Graphic Communication Design at Universidad de Guadalajara. I've spent over ten years across innovation, content and digital product. I started out facilitating Design Thinking and LEGO® Serious Play® workshops at CONTPAQi; today I design and maintain Experian's design system for the US market. I like taking complex products and making them clear for the people who use them and sustainable for the people who build them.

Bloques: Experiencia completa (bullets editados, sin erratas) · Formación · Certificaciones (Harvard Business Publishing 2025: Customer Focus, Innovation and Creativity; Amazon Working Backwards 2021; Design Thinking 2020; LEGO® Serious Play® 2019) · Herramientas · Descargas.

---

## 6. Plantilla de caso de estudio (editable en Keystatic)

```
Encabezado     Título · cliente · año · imagen principal grande
Ficha          Rol · Equipo · Duración · Plataformas · Herramientas
Resumen        3 líneas: problema → qué hice → resultado
Contexto       Qué es el producto y para quién
Problema       Qué estaba roto, con evidencia
Mi rol         Qué hice yo (no el equipo)
Proceso        Investigación → hallazgos → ideación (bloques libres)
Decisiones     2–3 decisiones clave: opción elegida, alternativas, por qué
Antes/después  Comparador deslizable
Resultados     Métricas si existen; si no, resultados cualitativos honestos
Aprendizajes   Qué haría distinto
Siguiente      Siguiente proyecto
```

Bloques disponibles en el editor: Imagen, Galería, **Antes/Después**, **Métrica**, Cita, Video, Callout, Texto en 2 columnas.

### Caso Wiggot reescrito (ES)

- **Título:** Rediseño de Wiggot · **Cliente:** DD360 · **Año:** 2024
- **Ficha:** Rol: Product Designer · Equipo: 3 UX Designers + Product + desarrollo · Duración: feb – sep 2024 (DD360 + Wiggot) · Plataformas: Web app responsiva y base para app móvil · Herramientas: Figma, Material Design 3
- **Resumen:** Wiggot, una plataforma inmobiliaria para asesores, tenía interfaces duplicadas, un sistema de diseño sin documentar y una versión móvil fragmentada. Diseñé junto a dos diseñadores un nuevo Design System sobre Material Design con Atomic Design y rediseñé el buscador, la bolsa inmobiliaria, las listas compartidas y la tarjeta de propiedad. Los asesores percibieron una plataforma más clara y menos saturada en desktop y móvil.
- **Problema:** varias versiones de diseño para la misma función, información sin jerarquía clara y secciones clave sin adaptar a móvil. El sistema existente no tenía documentación, así que cada cambio costaba más.
- **Mi rol:** estrategia UX, wireframes y prototipos de alta fidelidad en Figma, pruebas de usabilidad con usuarios internos, documentación del sistema para desarrollo; además benchmarking, síntesis, co-ideación y flujos.
- **Hallazgos:** (1) inadaptable a móvil, (2) multiplicidad de interfaces, (3) arquitectura de información deficiente; la competencia tenía un sistema homogéneo que reforzaba su marca.
- **Decisiones clave:**
  1. *Material Design como base* en lugar de un sistema propio desde cero → velocidad y paridad desktop/móvil.
  2. *Atomic Design* para documentar → ingeniería encuentra cada pieza por nivel.
  3. *Proceso de documentación obligatorio*: crear componente → documentar en plantilla → anunciar en el canal del equipo.
- **Antes/después:** buscador · resultados de búsqueda · tarjeta de propiedad.
- **Resultados:** sin métricas cuantitativas disponibles. Cualitativo: los usuarios percibieron menos saturación y más claridad; un solo sistema para desktop y móvil; base de la app móvil. Relacionado: el tour guiado implementado en DD360 aumentó adopción y retención.
- **Aprendizajes:** un sistema sin documentación es deuda; la consistencia visual mejora la percepción de simplicidad. **Qué haría distinto:** definir métricas de éxito (tiempo de búsqueda, tareas completadas) antes de empezar, para poder medir el antes y el después. *(Esto es lo que los hiring managers valoran: honestidad sobre la falta de métricas + lo que aprendiste.)*

La versión EN se traduce al cerrar el ES.

---

## 7. Modelo de contenido en Keystatic (resumen)

| Tipo | Campos principales |
|---|---|
| **Ajustes** (singleton) | Nombre, título ES/EN, email, LinkedIn, **color de acento** (preajustes por temporada + hex libre, con aviso de contraste), disponibilidad, PDFs: CV ES, CV EN, Portafolio ES, Portafolio EN (incluye logofolio) |
| **Home** (singleton) | Hero ES/EN, retrato, cifras de impacto, principios, proyectos destacados (orden) |
| **Sobre mí** (singleton) | Texto ES/EN, formación, certificaciones, herramientas |
| **Proyectos** (colección) | Slug, título ES/EN, cliente, año, rol, equipo, duración, plataformas, herramientas, tipo (caso / proyecto / archivo), **visibilidad (público / privado / NDA con contraseña — futuro)**, portada, galería, métrica destacada, contenido ES y EN con bloques |
| **Experiencia** (colección) | Rol, empresa, país, fechas, logros ES/EN |
| **Facilitación** (colección) | Evento, institución, ciudad, año, metodología |
| **Marcas** (colección) | Nombre, giro ES/EN, año, logo SVG |

**Color por temporada:** eliges un acento (p. ej. verde → rojo) y el sitio deriva automáticamente sus tonos (hover, fondos suaves, texto sobre acento) manteniendo contraste AA. Un cambio en Keystatic → commit → Vercel publica en ~1 min.

---

## 8. Herramientas y skills (confirmadas)

**Diseño:** Figma avanzado (tokens, variables, Dev Mode), Design Systems, Atomic Design, Material Design, prototipado de alta fidelidad
**Investigación:** entrevistas, pruebas de usabilidad, A/B testing, journey maps, evaluación heurística, investigación asistida con IA (Claude)
**Datos:** Hotjar, Adobe Analytics
**Construir con IA:** Claude Code, vibecoding, prototipos funcionales en código
**Accesibilidad:** WCAG 2.2
**Producto y equipo:** Jira, Scrum (grooming, refinement, sprint planning), facilitación (Design Thinking, LEGO® Serious Play®, Working Backwards)
**Otros:** Webflow, Framer, AEM, Miro, marketing digital, UX writing

**Proyecto personal de IA:** un caso pequeño de diseño de experiencia con IA; se propone en una etapa posterior.

## 9. Pendientes

1. Decisión sobre logos en Facilitación.
2. PDFs finales del Portafolio ES/EN.
