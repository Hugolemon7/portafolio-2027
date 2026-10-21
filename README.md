# Portafolio · Hugo Buenrostro

Sitio personal de Hugo Buenrostro, Product Designer · https://hugo-buenrostro.vercel.app · Astro 7 · Markdoc · Keystatic · Vercel.

Editar contenido: `npm run dev` → http://localhost:4321/keystatic (guía en `content-plan/GUIA-KEYSTATIC.md`).

## Comandos

```bash
npm install        # instala dependencias
npm run dev        # servidor local en http://localhost:4321
npm run build      # genera el sitio en dist/
npm run check      # revisa tipos
npm test           # pruebas Playwright sobre el build (corre antes npm run build)
BASE_URL=https://hugo-buenrostro.vercel.app npm test   # las mismas pruebas sobre el sitio publicado
npm run images     # regenera variantes WebP (también corre solo antes de dev/build)
```

## Dónde está cada cosa

| Qué | Dónde |
|---|---|
| Textos del sitio (ES / EN) | `src/content/site/es.json`, `src/content/site/en.json` |
| Datos generales, color de acento, PDFs, logos | `src/content/settings.json` |
| Proyectos y casos de estudio | `src/content/projects/<slug>/index.mdoc` (datos ES/EN + contenido ES) y `contentEn.mdoc` |
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

## Keystatic en producción (modo GitHub)

En local guarda en archivos. En Vercel, define `PUBLIC_KEYSTATIC_GITHUB_REPO=Hugolemon7/<repo>` y las variables que genera la GitHub App de Keystatic (`KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET`, `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`). Se configura en la Etapa 7.

## Formulario de contacto (Resend)

El endpoint `src/pages/api/contact.ts` envía el mensaje con Resend. Variables de entorno (ver `.env.example`):
`RESEND_API_KEY` (obligatoria), `CONTACT_FROM` y `CONTACT_TO` (opcionales).
