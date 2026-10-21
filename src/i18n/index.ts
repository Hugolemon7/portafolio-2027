import es from '../content/site/es.json';
import en from '../content/site/en.json';
import settings from '../content/settings.json';

export type Lang = 'es' | 'en';
export const languages: Record<Lang, string> = { es: 'Español', en: 'English' };
export const htmlLang: Record<Lang, string> = { es: 'es-MX', en: 'en' };

const dict = { es, en };
export const t = (lang: Lang) => dict[lang];
export { settings };

// Rutas equivalentes entre idiomas (los segmentos están traducidos)
export const routes = {
  home: { es: '/', en: '/en/' },
  projects: { es: '/proyectos/', en: '/en/work/' },
  about: { es: '/sobre-mi/', en: '/en/about/' },
  contact: { es: '/contacto/', en: '/en/contact/' },
} as const;
export type RouteKey = keyof typeof routes;

export const projectUrl = (lang: Lang, slug: string) => `${routes.projects[lang]}${slug}/`;

export function getLangFromUrl(url: URL): Lang {
  return url.pathname.startsWith('/en') ? 'en' : 'es';
}
