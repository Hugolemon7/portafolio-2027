# Portafolio · Hugo Buenrostro

Sitio personal de Hugo Buenrostro, Product Designer. Astro 7 · Markdoc · Vercel · (Keystatic en la Etapa 5).

## Comandos

```bash
npm install        # instala dependencias
npm run dev        # servidor local en http://localhost:4321
npm run build      # genera el sitio en dist/
npm run check      # revisa tipos
```

## Dónde está cada cosa

| Qué | Dónde |
|---|---|
| Textos del sitio (ES / EN) | `src/content/site/es.json`, `src/content/site/en.json` |
| Datos generales, color de acento, PDFs, logos | `src/content/settings.json` |
| Proyectos y casos de estudio | `src/content/projects/{es,en}/*.mdoc` |
| Experiencia | `src/content/experience/{es,en}/*.json` |
| Imágenes | `public/images/` · PDFs en `public/files/` |
| Estilos | `src/styles/global.css` (sistema) y `src/styles/pages.css` (páginas) |
| Animaciones y comportamiento | `src/scripts/app.js`, `src/scripts/sky.js` (cielo del hero) |

### Bloques para casos de estudio (Markdoc)

```
{% figure src="/images/..." alt="…" caption="…" wide=true /%}
{% compare before="/images/a.png" after="/images/b.png" alt="…" beforeLabel="Antes" afterLabel="Después" /%}
{% callout title="…" %}Texto{% /callout %}
```

## Rutas

| Español | English |
|---|---|
| `/` | `/en/` |
| `/proyectos/` · `/proyectos/[slug]/` | `/en/work/` · `/en/work/[slug]/` |
| `/sobre-mi/` | `/en/about/` |
| `/contacto/` | `/en/contact/` |

## Formulario de contacto (Resend)

El endpoint `src/pages/api/contact.ts` envía el mensaje con Resend. Variables de entorno (ver `.env.example`):
`RESEND_API_KEY` (obligatoria), `CONTACT_FROM` y `CONTACT_TO` (opcionales).
