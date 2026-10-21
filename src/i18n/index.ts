import es from '../content/site/es.json';
import en from '../content/site/en.json';
import settings from '../content/settings.json';

export type Lang = 'es' | 'en';
export const languages: Record<Lang, string> = { es: 'Español', en: 'English' };
export const htmlLang: Record<Lang, string> = { es: 'es-MX', en: 'en' };

const dict = { es, en };

// El color de acento debe cumplir AA en todas sus combinaciones (Keystatic ya lo impide; esto protege el build)
const lum = (hex: string) => {
  const c = hex.slice(1).match(/../g)!.map((h) => parseInt(h, 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
{
  const a = settings.accent;
  const pairs: [string, string, string][] = [[a.lightInk, a.light, 'botón claro'], [a.light, '#eceef1', 'enlace claro'], [a.darkInk, a.dark, 'botón oscuro'], [a.dark, '#121418', 'enlace oscuro']];
  for (const [fg, bg, name] of pairs) {
    if (!/^#[0-9a-f]{6}$/i.test(fg) || !/^#[0-9a-f]{6}$/i.test(bg)) throw new Error(`Color de acento inválido (${name}).`);
    const r = ratio(fg, bg);
    if (r < 4.5) throw new Error(`El color de acento no cumple AA en ${name}: ${r.toFixed(2)}:1 (mínimo 4.5:1). Corrígelo en Keystatic → Ajustes.`);
  }
}
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
