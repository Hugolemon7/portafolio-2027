import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Proyectos y casos de estudio: un archivo por idioma (src/content/projects/{es,en}/slug.mdoc)
const projects = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    client: z.string(),
    year: z.string(),
    kind: z.enum(['case', 'project', 'archive']),
    visibility: z.enum(['public', 'private']).default('public'),
    order: z.number().default(99),
    featured: z.boolean().default(false),
    summary: z.string(),
    discipline: z.string(),
    role: z.string().optional(),
    team: z.string().optional(),
    duration: z.string().optional(),
    platforms: z.string().optional(),
    tools: z.string().optional(),
    cover: z.string().default(""),
    coverAlt: z.string().default(""),
    paneLeft: z.string().default(""),
    paneLeftAlt: z.string().default(""),
    paneRight: z.string().default(""),
    paneRightAlt: z.string().default(''),
    paneRightDetail: z.boolean().default(false),
  }),
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

export const collections = { projects, experience };
