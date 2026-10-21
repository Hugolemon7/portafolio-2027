import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n';

export type Project = ReturnType<typeof localize>;

/** Datos del proyecto en un idioma (el título en inglés cae al título base si está vacío). */
export function localize(entry: CollectionEntry<'projects'>, lang: Lang) {
  const d = entry.data;
  const l = d[lang];
  return {
    slug: entry.id,
    entry,
    title: (lang === 'en' && l.title) || d.title,
    client: d.client,
    year: d.year,
    kind: d.kind,
    featured: d.featured,
    order: d.order,
    cover: d.cover,
    paneLeft: d.paneLeft,
    paneRight: d.paneRight,
    paneRightDetail: d.paneRightDetail,
    ...l,
  };
}

export async function getProjects(lang: Lang) {
  const all = await getCollection('projects', (p) => p.data.visibility === 'public');
  return all.sort((a, b) => a.data.order - b.data.order).map((e) => localize(e, lang));
}

/** Entrada a renderizar como contenido: español = index.mdoc; inglés = contentEn.mdoc (o el español si falta). */
export async function getBody(slug: string, lang: Lang) {
  if (lang === 'en') {
    const en = await getEntry('projectsEn', slug);
    if (en) return en;
  }
  return getEntry('projects', slug);
}

export async function projectPaths(lang: Lang) {
  const list = await getProjects(lang);
  return list.map((p, i) => ({ params: { slug: p.slug }, props: { project: p, next: list[(i + 1) % list.length] } }));
}
