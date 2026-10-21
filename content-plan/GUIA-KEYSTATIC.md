# Guía de Keystatic

Panel para editar el portafolio sin tocar código.

- **En tu computadora:** `npm run dev` y abre http://localhost:4321/keystatic. Los cambios se guardan directo en los archivos del proyecto.
- **En línea (después de la Etapa 7):** https://TU-SITIO.vercel.app/keystatic. Entras con tu cuenta de GitHub y cada "Save" crea un commit; Vercel publica el cambio en ~1 minuto.

## Qué puedes editar

| Sección | Para qué |
|---|---|
| **Proyectos** | Agregar, editar u ocultar proyectos y casos de estudio. Cada proyecto tiene sus textos en **español e inglés** en la misma pantalla, y las imágenes se suben **una sola vez** para ambos idiomas. |
| **Experiencia (ES / EN)** | Puestos, fechas, logro principal y el desglose de "Ver más". |
| **Textos en español / Texts in English** | Todo el texto del sitio: hero, impacto, sobre mí, cómo trabajo, facilitación, cierre, footer, formulario y 404. |
| **Ajustes generales** | Nombre, correo, LinkedIn, **color de acento**, PDFs (CV y portafolio), video de "Y con IA", imágenes de "Cómo trabajo", lugares donde has impartido (con logo opcional) y marcas de Branding. |

## Agregar un proyecto

1. **Proyectos → +**.
2. Escribe el **título en español**; el slug (la URL) se genera solo. Ej.: `mi-proyecto` → `/proyectos/mi-proyecto/` y `/en/work/mi-proyecto/`.
3. Elige el **tipo** (caso de estudio, proyecto o web) y el **orden**.
4. Sube la **portada** y, si quieres que aparezca en el home, marca **"Mostrar en el home"** y sube los dos **paneles** (izquierdo y derecho).
5. Llena **Textos en español** y **English texts** (si el título en inglés es igual, déjalo vacío).
6. Escribe el **contenido** en ambos idiomas. Con el botón **+** del editor puedes insertar:
   - **Imagen** (con pie de foto y opción de ancho completo),
   - **Antes / después** (comparador deslizable),
   - **Nota destacada**.
7. **Save**.

Para un proyecto bajo NDA: **Visibilidad → Privado**. Queda guardado pero no aparece en el sitio.

## Color de acento

**Ajustes generales → Color de acento.** Ves una vista previa del botón y del enlace, y el contraste de las cuatro combinaciones que usa el sitio:

- Si alguna queda **por debajo de AA (4.5:1)**, aparece el error en rojo y **no te deja guardar**.
- Las que llegan a **AAA (7:1)** se marcan en verde.

Además, el sitio no se publica si alguien edita el archivo a mano con un color que no pase AA.

## Cosas que conviene saber

- **Nombres de archivo:** al guardar, Keystatic renombra las imágenes y PDFs según el campo (ej. `wiggot/cover.png`, `files/cvEs.pdf`) y borra los que ya no usa ninguna entrada. Es normal.
- **Borradores:** si dejas cambios sin guardar, Keystatic los recuerda en ese navegador y los vuelve a mostrar ("Unsaved"). Si no los quieres, usa **… → Reset changes** antes de guardar otra cosa.
- **Imágenes:** súbelas en buena resolución (≥ 1600 px de ancho) y en PNG/JPG/WebP. Los PDFs, idealmente < 2 MB.
