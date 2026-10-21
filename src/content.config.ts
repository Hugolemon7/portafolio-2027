import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Proyectos: una carpeta por proyecto (src/content/projects/<slug>/).
// index.mdoc = datos de ambos idiomas + contenido en español; contentEn.mdoc = contenido en inglés.
const loc = z.object({
  title: z.string().optional(),
  summary: z.string().default(''),
  discipline: z.string().default(''),
  role: z.string().default(''),
  team: z.string().default(''),
  duration: z.string().default(''),
  platforms: z.string().default(''),
  tools: z.string().default(''),
  coverAlt: z.string().default(''),
  paneLeftAlt: z.string().default(''),
  paneRightAlt: z.string().default(''),
});
const projects = defineCollection({
  loader: glob({ pattern: '*/index.mdoc', base: './src/content/projects', generateId: ({ entry }) => entry.split('/')[0] }),
  schema: z.object({
    title: z.string(),
    client: z.string().default(''),
    year: z.string().default(''),
    kind: z.enum(['case', 'project', 'archive']).default('project'),
    visibility: z.enum(['public', 'private']).default('public'),
    order: z.number().default(99),
    featured: z.boolean().default(false),
    cover: z.string().nullish().transform((v) => v ?? ''),
    paneLeft: z.string().nullish().transform((v) => v ?? ''),
    paneRight: z.string().nullish().transform((v) => v ?? ''),
    paneRightDetail: z.boolean().default(false),
    es: loc.prefault({}),
    en: loc.prefault({}),
  }),
});
const projectsEn = defineCollection({
  loader: glob({ pattern: '*/contentEn.mdoc', base: './src/content/projects', generateId: ({ entry }) => entry.split('/')[0] }),
  schema: z.object({}).passthrough(),
});

// Experiencia: un archivo por puesto e idioma
const experience = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/experience' }),
  schema: z.object({
    order: z.number(),
    years: z.string(),
    role: z.string(),
    company: z.string(),
    highlight: z.string(),
    paragraphs: z.array(z.string()),
  }),
});

export const collections = { projects, projectsEn, experience };
