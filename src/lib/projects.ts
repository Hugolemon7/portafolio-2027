import { getCollection } from 'astro:content';
import type { Lang } from '../i18n';

// Rutas estáticas de cada proyecto público, con el siguiente proyecto y si existe traducción
export async function projectPaths(lang: Lang) {
  const all = await getCollection('projects', (p) => p.data.visibility === 'public');
  const mine = all.filter((p) => p.id.startsWith(`${lang}/`)).sort((a, b) => a.data.order - b.data.order);
  const other = lang === 'es' ? 'en' : 'es';
  const otherSlugs = new Set(all.filter((p) => p.id.startsWith(`${other}/`)).map((p) => p.id.split('/')[1]));
  return mine.map((entry, i) => {
    const slug = entry.id.split('/')[1];
    return { params: { slug }, props: { entry, next: mine[(i + 1) % mine.length], hasAlt: otherSlugs.has(slug) } };
  });
}
