// Panel de edición del portafolio: /keystatic
// En local (npm run dev) guarda en los archivos del proyecto; en producción, en GitHub (Etapa 7).
// Para probar el modo GitHub en local: PUBLIC_KEYSTATIC_LOCAL_GITHUB=1 npm run dev
import { config, collection, singleton, fields } from '@keystatic/core';
import { block, wrapper } from '@keystatic/core/content-components';
import { accentField } from './keystatic/accent-field';
import { plusColorField } from './keystatic/plus-color-field';
import { finaleColorField } from './keystatic/finale-color-field';
import { fontPairField, fontFileField } from './keystatic/font-fields';
import { heroBackdropField } from './keystatic/hero-bg-field';

const repo = import.meta.env.PUBLIC_KEYSTATIC_GITHUB_REPO as `${string}/${string}` | undefined;

// ---------- piezas reutilizables ----------
const txt = (label: string, description?: string) => fields.text({ label, description });
const area = (label: string, description?: string) => fields.text({ label, description, multiline: true });
const paragraphs = (label: string) =>
  fields.array(fields.text({ label: 'Párrafo', multiline: true }), { label, itemLabel: (p) => p.value.slice(0, 60) || 'Párrafo' });

const projectImage = (label: string, description?: string) =>
  fields.image({ label, description, directory: 'public/images/projects', publicPath: '/images/projects/' });

// Bloques disponibles dentro del contenido de un caso de estudio
const caseComponents = {
  figure: block({
    label: 'Imagen',
    schema: {
      src: projectImage('Imagen'),
      alt: txt('Texto alternativo', 'Describe la imagen para lectores de pantalla.'),
      caption: txt('Pie de foto (opcional)'),
      wide: fields.checkbox({ label: 'Ancho completo', defaultValue: false }),
    },
  }),
  compare: block({
    label: 'Antes / después',
    schema: {
      before: projectImage('Imagen "antes"'),
      after: projectImage('Imagen "después"'),
      beforeLabel: txt('Etiqueta "antes"', 'Ej.: Sistema anterior'),
      afterLabel: txt('Etiqueta "después"', 'Ej.: Nuevo sistema'),
      alt: txt('Texto alternativo'),
      caption: txt('Pie de foto (opcional)'),
    },
  }),
  callout: wrapper({
    label: 'Nota destacada',
    schema: { title: txt('Título de la nota') },
  }),
};

// ---------- tipografías: pareja (con vista previa combinada) + archivos propios (opcionales) ----------
const WEIGHTS = ['100', '200', '300', '400', '500', '600', '700', '800', '900'].map((w) => ({ label: w, value: w }));
const fontLibrary = fields.array(
  fields.object({
    family: fields.text({ label: 'Nombre de la fuente (familia)', description: 'Con este nombre aparece en la lista de “Combinación de tipografías”. Usa el mismo nombre en todos los archivos de una familia (p. ej. Unbounded).', validation: { length: { min: 1 } } }),
    file: fontFileField({ label: 'Archivo (.woff2 recomendado; también .woff, .ttf u .otf)', directory: 'public/fonts/custom', publicPath: '/fonts/custom/' }),
    weight: fields.select({ label: 'Peso', description: '“Variable” si el archivo trae todos los pesos (suele decir “Variable” o “VF” en el nombre).', options: [{ label: 'Variable (todos los pesos)', value: 'variable' }, ...WEIGHTS], defaultValue: '400' }),
    style: fields.select({ label: 'Estilo', options: [{ label: 'Normal', value: 'normal' }, { label: 'Itálica', value: 'italic' }], defaultValue: 'normal' }),
  }),
  {
    label: 'Fuentes subidas',
    itemLabel: (p) => `${p.fields.family.value || 'Sin nombre'} · ${p.fields.weight.value === 'variable' ? 'variable' : p.fields.weight.value}${p.fields.style.value === 'italic' ? ' · itálica' : ''}`,
  },
);

// ---------- proyectos: una entrada por proyecto con ambos idiomas ----------
// Las imágenes se comparten entre idiomas (se guardan una sola vez por proyecto).
const localized = (lang: 'es' | 'en') =>
  fields.object(
    {
      ...(lang === 'en' ? { title: txt('Title (English)', 'Si lo dejas vacío se usa el título en español.') } : {}),
      summary: area(lang === 'es' ? 'Resumen (1–2 líneas)' : 'Summary (1–2 lines)'),
      discipline: txt(lang === 'es' ? 'Disciplina' : 'Discipline'),
      role: txt(lang === 'es' ? 'Rol' : 'Role'),
      team: txt(lang === 'es' ? 'Equipo' : 'Team'),
      duration: txt(lang === 'es' ? 'Duración' : 'Timeline'),
      platforms: txt(lang === 'es' ? 'Plataformas' : 'Platforms'),
      tools: txt(lang === 'es' ? 'Herramientas' : 'Tools'),
      coverAlt: txt(lang === 'es' ? 'Portada: texto alternativo' : 'Cover: alt text'),
      paneLeftAlt: txt(lang === 'es' ? 'Panel izquierdo: texto alternativo' : 'Left pane: alt text'),
      paneRightAlt: txt(lang === 'es' ? 'Panel derecho: texto alternativo' : 'Right pane: alt text'),
    },
    { label: lang === 'es' ? 'Textos en español' : 'English texts' },
  );

const projects = collection({
  label: 'Proyectos',
  slugField: 'title',
  path: 'src/content/projects/*/',
  format: { contentField: 'contentEs' },
  entryLayout: 'content',
  columns: ['title', 'year'],
  schema: {
    title: fields.slug({ name: { label: 'Título (español)' }, slug: { label: 'Slug (URL)', description: 'Se usa en /proyectos/slug y /en/work/slug.' } }),
    client: txt('Cliente'),
    year: txt('Año'),
    kind: fields.select({
      label: 'Tipo',
      options: [
        { label: 'Caso de estudio', value: 'case' },
        { label: 'Proyecto', value: 'project' },
        { label: 'Archivo (web)', value: 'archive' },
      ],
      defaultValue: 'project',
    }),
    visibility: fields.select({
      label: 'Visibilidad',
      description: '"Privado" lo oculta del sitio (útil para proyectos bajo NDA).',
      options: [
        { label: 'Público', value: 'public' },
        { label: 'Privado', value: 'private' },
      ],
      defaultValue: 'public',
    }),
    order: fields.integer({ label: 'Orden', description: 'Menor número = aparece primero.', defaultValue: 99 }),
    featured: fields.checkbox({ label: 'Mostrar en el home', defaultValue: false }),
    cover: projectImage('Portada'),
    paneLeft: projectImage('Home: panel izquierdo', 'Imagen que sube en la sección Proyectos del home.'),
    paneRight: projectImage('Home: panel derecho', 'Imagen que baja en la sección Proyectos del home.'),
    paneRightDetail: fields.checkbox({ label: 'Panel derecho como acercamiento (zoom)', defaultValue: false }),
    es: localized('es'),
    en: localized('en'),
    contentEs: fields.markdoc({
      label: 'Contenido en español',
      options: { image: { directory: 'public/images/projects', publicPath: '/images/projects/' } },
      components: caseComponents,
    }),
    contentEn: fields.markdoc({
      label: 'Content in English',
      options: { image: { directory: 'public/images/projects', publicPath: '/images/projects/' } },
      components: caseComponents,
    }),
  },
});

// ---------- experiencia ----------
const experience = (lang: 'es' | 'en') =>
  collection({
    label: lang === 'es' ? 'Experiencia (ES)' : 'Experience (EN)',
    slugField: 'role',
    path: `src/content/experience/${lang}/*`,
    format: { data: 'json' },
    columns: ['role', 'company'],
    schema: {
      role: fields.slug({ name: { label: 'Rol' } }),
      company: txt('Empresa'),
      years: txt('Años', 'Ej.: 2025 – hoy'),
      order: fields.integer({ label: 'Orden', description: '1 = el más reciente.', defaultValue: 1 }),
      highlight: txt('Logro principal (una línea)'),
      paragraphs: paragraphs('Desglose ("Ver más")'),
    },
  });

// ---------- textos del sitio (uno por idioma) ----------
const sheet = (label: string) =>
  fields.object({ kicker: txt('Etiqueta del panel'), title: txt('Título del panel'), body: paragraphs('Párrafos del panel') }, { label });

const siteSchema = {
  meta: fields.object({ title: txt('Título del sitio (pestaña y Google)'), description: area('Descripción para Google y redes') }, { label: 'SEO' }),
  ui: fields.object(
    {
      skip: txt('Saltar al contenido'),
      nav: fields.object({ projects: txt('Proyectos'), about: txt('Sobre mí'), contact: txt('Contacto') }, { label: 'Navegación' }),
      menu: txt('Menú'), close: txt('Cerrar'), darkMode: txt('Modo oscuro'),
      switchLang: txt('Cambiar idioma (largo)'), switchLangShort: txt('Cambiar idioma (corto)'), switchLangLabel: txt('Cambiar idioma (accesible)'),
      view: txt('Cursor "Ver"'), more: txt('Ver más'), less: txt('Ver menos'),
      downloadCv: txt('Descargar CV'), downloadNote: txt('Nota del botón CV'), otherCv: txt('CV en el otro idioma'),
      backToTop: txt('Volver arriba'),
      langSuggest: txt('Aviso de idioma (en el otro idioma)'), langSuggestCta: txt('Aviso: botón'), langSuggestDismiss: txt('Aviso: descartar'),
    },
    { label: 'Interfaz' },
  ),
  hero: fields.object(
    {
      line1: txt('Titular · línea 1'), line2Before: txt('Titular · línea 2 (antes de la última palabra)'), highlight: txt('Titular · línea 2 (última palabra)'),
      lead: area('Texto de apoyo'), primary: txt('Botón principal'), secondary: txt('Botón secundario'), meta: txt('Línea de ubicación'),
    },
    { label: 'Hero' },
  ),
  impact: fields.object(
    {
      title: txt('Título'), lead: area('Texto'),
      items: fields.array(
        fields.object({ value: txt('Cifra'), label: txt('Descripción'), meta: txt('Fuente · año'), kicker: txt('Etiqueta del panel'), title: txt('Título del panel'), body: paragraphs('Párrafos del panel') }),
        { label: 'Cifras', itemLabel: (p) => `${p.fields.value.value} · ${p.fields.label.value}` },
      ),
    },
    { label: 'Impacto medible' },
  ),
  projects: fields.object(
    {
      title: txt('Título en el home'), all: txt('Enlace "todos los proyectos"'), viewCase: txt('Ver caso de estudio'), viewProject: txt('Ver proyecto'),
      pageTitle: txt('Título de la página'), pageLead: area('Texto de la página'),
      groups: fields.object({ case: txt('Casos de estudio'), project: txt('Proyectos'), archive: txt('Web') }, { label: 'Grupos' }),
      brandsTitle: txt('Título Branding'), brandsLead: txt('Texto Branding'),
      facts: fields.object({ role: txt('Rol'), team: txt('Equipo'), duration: txt('Duración'), platforms: txt('Plataformas'), tools: txt('Herramientas'), client: txt('Cliente'), year: txt('Año') }, { label: 'Ficha del caso' }),
      next: txt('Siguiente proyecto'), back: txt('Volver a proyectos'),
    },
    { label: 'Proyectos' },
  ),
  about: fields.object(
    {
      title: txt('Título'), lead: txt('Frase principal'), paragraphs: paragraphs('Historia'), photoAlt: txt('Retrato: texto alternativo'),
      facts: fields.array(fields.object({ label: txt('Etiqueta'), value: txt('Valor') }), { label: 'Datos', itemLabel: (p) => p.fields.label.value }),
      pageTitle: txt('Título de la página'),
      educationTitle: txt('Título Formación'),
      education: fields.array(fields.object({ title: txt('Título'), where: txt('Institución') }), { label: 'Formación', itemLabel: (p) => p.fields.title.value }),
      certsTitle: txt('Título Certificaciones'),
      certs: fields.array(fields.object({ title: txt('Certificación'), where: txt('Emisor'), year: txt('Año') }), { label: 'Certificaciones', itemLabel: (p) => p.fields.title.value }),
      skillsTitle: txt('Título Habilidades'),
      skills: fields.array(fields.object({ group: txt('Grupo'), items: area('Habilidades') }), { label: 'Habilidades', itemLabel: (p) => p.fields.group.value }),
    },
    { label: 'Sobre mí' },
  ),
  how: fields.object(
    {
      title: txt('Título'),
      steps: fields.array(
        fields.object({
          lead: txt('Frase de entrada (negritas)'), text: area('Texto'),
          placeholder: txt('Texto del espacio para video (último paso)'),
        }),
        { label: 'Pasos', itemLabel: (p) => p.fields.lead.value },
      ),
    },
    { label: 'Cómo trabajo' },
  ),
  facilitation: fields.object(
    {
      title: txt('Título'), lead: area('Texto'), venuesTitle: txt('Título de lugares'),
      methods: fields.array(
        fields.object({ name: txt('Metodología'), fact: txt('Origen'), kicker: txt('Etiqueta del panel'), title: txt('Título del panel'), body: paragraphs('Párrafos del panel') }),
        { label: 'Metodologías', itemLabel: (p) => p.fields.name.value },
      ),
    },
    { label: 'Facilitación' },
  ),
  experience: fields.object({ title1: txt('Título · línea 1'), title2: txt('Título · línea 2') }, { label: 'Experiencia' }),
  finale: fields.object({ title: txt('Título'), lead: area('Texto'), primary: txt('Botón principal'), secondary: txt('Botón secundario') }, { label: 'Cierre' }),
  footer: fields.object(
    {
      role: txt('Rol y ciudad'), navigate: txt('Navegar'), contact: txt('Contacto'), downloads: txt('Descargas'), form: txt('Formulario'),
      cv: txt('CV'), cvOther: txt('CV otro idioma'), portfolio: txt('Portafolio PDF'), rights: txt('Derechos'),
    },
    { label: 'Footer' },
  ),
  contact: fields.object(
    {
      pageTitle: txt('Título'), lead: area('Texto'),
      name: txt('Nombre'), namePh: txt('Nombre: ejemplo'), email: txt('Correo'), emailPh: txt('Correo: ejemplo'),
      company: txt('Empresa'), companyPh: txt('Empresa: ejemplo'), message: txt('Mensaje'), messagePh: txt('Mensaje: ejemplo'),
      send: txt('Enviar'), sending: txt('Enviando'), success: txt('Éxito'), error: txt('Error'),
      required: txt('Campo obligatorio'), invalidEmail: txt('Correo inválido'), orWrite: txt('Escríbeme directo'),
    },
    { label: 'Contacto' },
  ),
  notFound: fields.object({ title: txt('Título'), lead: txt('Texto'), cta: txt('Botón') }, { label: 'Página 404' }),
};

// Cada sección de textos es su propio panel con español e inglés uno debajo del otro (src/content/site/<sección>.json).
type SiteKey = keyof typeof siteSchema;
const textSection = (label: string, file: string, keys: SiteKey[]) => {
  const lang = (name: string) =>
    keys.length === 1
      ? fields.object(siteSchema[keys[0]].fields, { label: name })
      : fields.object(Object.fromEntries(keys.map((k) => [k, siteSchema[k]])), { label: name });
  return singleton({
    label,
    path: `src/content/site/${file}`,
    format: { data: 'json' },
    schema: { es: lang('Español'), en: lang('English') },
  });
};

export default config({
  storage: repo && (!import.meta.env.DEV || import.meta.env.PUBLIC_KEYSTATIC_LOCAL_GITHUB) ? { kind: 'github', repo } : { kind: 'local' },
  ui: {
    brand: { name: 'Hugo Buenrostro' },
    navigation: {
      Contenido: ['projects', 'experienceEs', 'experienceEn'],
      'Textos · Inicio': ['textHero', 'textImpact', 'textProjects', 'textAbout', 'textHow', 'textFacilitation', 'textExperience'],
      'Textos · Contacto y pie': ['textContact', 'textFooter'],
      'Textos · General': ['textGeneral'],
      Ajustes: ['settings'],
    },
  },
  singletons: {
    settings: singleton({
      label: 'Ajustes generales',
      path: 'src/content/settings',
      format: { data: 'json' },
      schema: {
        name: txt('Nombre'),
        email: txt('Correo de contacto'),
        linkedin: fields.url({ label: 'LinkedIn' }),
        accent: accentField({ label: 'Colores del sitio y acento' }),
        look: fields.object(
          {
            hero: fields.select({
              label: 'Fondo del hero',
              options: [
                { label: 'Campo de + (crecen con el cursor, onda al hacer clic)', value: 'wave' },
                { label: 'Prisma (luz espectral que sigue al cursor)', value: 'prism' },
                { label: 'Aurora (colores y posición editables)', value: 'aurora' },
                { label: 'Ondas cortadas (colores editables)', value: 'sliced' },
                { label: 'Cielo de estrellas (anterior)', value: 'sky' },
              ],
              defaultValue: 'wave',
            }),
            heroBackdrop: heroBackdropField({ label: 'Fondos animados: Prisma, Aurora y Ondas cortadas' }),
            heroColor: plusColorField({ label: 'Cruces del hero: color, grosor y espaciado' }),
            pulseSpeed: fields.select({
              label: 'Velocidad de la onda del hero',
              options: [
                { label: 'Lenta', value: 'slow' },
                { label: 'Media', value: 'normal' },
                { label: 'Rápida', value: 'fast' },
              ],
              defaultValue: 'normal',
            }),
            pulseEvery: fields.integer({ label: 'Pulso automático cada (segundos)', description: 'Si nadie mueve el cursor, una onda sale sola cada tantos segundos. 0 = sin pulso automático.', defaultValue: 7, validation: { min: 0, max: 60 } }),
            heroButtons: fields.checkbox({ label: 'Botones del hero con contorno de luz animado', defaultValue: true }),
            impactWave: fields.checkbox({ label: 'Tarjetas de "Impacto medible" con campo de +', defaultValue: true }),
            hoverFill: fields.select({
              label: 'Relleno al pasar el cursor (métricas y facilitación)',
              options: [
                { label: 'Overlay del tema (claro u oscuro)', value: 'theme' },
                { label: 'Color de acento', value: 'accent' },
              ],
              defaultValue: 'theme',
            }),
            finale: fields.select({
              label: 'Fondo de la sección de contacto (pie de todas las páginas)',
              options: [
                { label: 'Lava luminosa sobre el color de acento', value: 'lava' },
                { label: 'Cielo de estrellas (anterior)', value: 'sky' },
              ],
              defaultValue: 'lava',
            }),
            finaleColor: finaleColorField({ label: 'Colores de la sección de contacto' }),
            finaleSpeed: fields.select({
              label: 'Velocidad de la lava',
              options: [
                { label: 'Lenta', value: 'slow' },
                { label: 'Media', value: 'normal' },
                { label: 'Rápida', value: 'fast' },
              ],
              defaultValue: 'normal',
            }),
            finaleCount: fields.select({
              label: 'Cantidad de formas en la lava',
              options: [
                { label: 'Pocas (5)', value: '5' },
                { label: 'Normal (7)', value: '7' },
                { label: 'Muchas (9)', value: '9' },
              ],
              defaultValue: '7',
            }),
          },
          { label: 'Efectos e interacciones' },
        ),
        fonts: fields.object(
          {
            pair: fontPairField({ label: 'Combinación de tipografías' }),
            library: fontLibrary,
          },
          { label: 'Tipografías' },
        ),
        files: fields.object(
          {
            cvEs: fields.file({ label: 'CV en español (PDF)', directory: 'public/files', publicPath: '/files/' }),
            cvEn: fields.file({ label: 'CV en inglés (PDF)', directory: 'public/files', publicPath: '/files/' }),
            portfolioEs: fields.file({ label: 'Portafolio en español (PDF)', directory: 'public/files', publicPath: '/files/' }),
            portfolioEn: fields.file({ label: 'Portafolio en inglés (PDF)', directory: 'public/files', publicPath: '/files/' }),
          },
          { label: 'Descargas' },
        ),
        video: fields.object(
          {
            src: fields.file({ label: 'Video de "Y con IA" (MP4, < 8 MB)', directory: 'public/video', publicPath: '/video/' }),
            poster: fields.image({ label: 'Imagen de portada del video', directory: 'public/video', publicPath: '/video/' }),
          },
          { label: 'Video' },
        ),
        howEvidence: fields.array(
          fields.object({
            image: fields.image({ label: 'Imagen', directory: 'public/images/how', publicPath: '/images/how/' }),
            w: fields.integer({ label: 'Ancho (px, opcional)', defaultValue: 0 }),
            h: fields.integer({ label: 'Alto (px, opcional)', defaultValue: 0 }),
            altEs: txt('Texto alternativo (español)'),
            altEn: txt('Alt text (English)'),
          }),
          { label: '"Cómo trabajo": imágenes de evidencia (en orden; el último paso usa el video)', itemLabel: (p) => p.fields.altEs.value || 'Imagen' },
        ),
        venues: fields.array(
          fields.object({ name: txt('Lugar'), logo: fields.image({ label: 'Logo (opcional)', directory: 'public/images/venues', publicPath: '/images/venues/' }) }),
          { label: 'Dónde he impartido', itemLabel: (p) => p.fields.name.value },
        ),
        brands: fields.array(
          fields.object({
            name: txt('Marca'),
            logo: fields.image({ label: 'Logo', directory: 'public/images/brands', publicPath: '/images/brands/' }),
            year: txt('Año'),
            es: txt('Giro (español)'),
            en: txt('Giro (inglés)'),
          }),
          { label: 'Branding', itemLabel: (p) => p.fields.name.value },
        ),
      },
    }),
    textHero: textSection('Hero (portada)', 'hero', ['hero']),
    textImpact: textSection('Impacto medible', 'impact', ['impact']),
    textProjects: textSection('Proyectos (inicio y página)', 'projects', ['projects']),
    textAbout: textSection('Sobre mí', 'about', ['about']),
    textHow: textSection('Cómo trabajo', 'how', ['how']),
    textFacilitation: textSection('Facilitación', 'facilitation', ['facilitation']),
    textExperience: textSection('Experiencia', 'experience', ['experience']),
    textContact: textSection('Contacto (cierre y página)', 'contact', ['finale', 'contact']),
    textFooter: textSection('Pie de página', 'footer', ['footer']),
    textGeneral: textSection('General: SEO, menú y 404', 'general', ['meta', 'ui', 'notFound']),
  },
  collections: {
    projects,
    experienceEs: experience('es'),
    experienceEn: experience('en'),
  },
});
