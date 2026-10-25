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
  const L = a.site?.light ?? { bg: '#eceef1', surface: '#e1e4e9', ink: '#1f2328', muted: '#444a53' };
  const D = a.site?.dark ?? { bg: '#121418', surface: '#1b1e24', ink: '#eceef2', muted: '#aeb3bd' };
  // mismas combinaciones que valida Keystatic (keystatic/accent-field.tsx → themeChecks)
  const pairs: [string, string, string][] = [
    [a.lightInk, a.light, 'botón claro'], [a.light, L.bg, 'enlace claro'], [a.light, L.surface, 'acento sobre tarjetas claro'],
    [L.ink, L.bg, 'texto claro'], [L.muted, L.bg, 'texto secundario claro'], [L.ink, L.surface, 'texto en tarjetas claro'], [L.muted, L.surface, 'texto secundario en tarjetas claro'],
    [a.darkInk, a.dark, 'botón oscuro'], [a.dark, D.bg, 'enlace oscuro'], [a.dark, D.surface, 'acento sobre tarjetas oscuro'],
    [D.ink, D.bg, 'texto oscuro'], [D.muted, D.bg, 'texto secundario oscuro'], [D.ink, D.surface, 'texto en tarjetas oscuro'], [D.muted, D.surface, 'texto secundario en tarjetas oscuro'],
  ];
  for (const [fg, bg, name] of pairs) {
    if (!/^#[0-9a-f]{6}$/i.test(fg) || !/^#[0-9a-f]{6}$/i.test(bg)) throw new Error(`Color de acento inválido (${name}).`);
    const r = ratio(fg, bg);
    if (r < 4.5) throw new Error(`Los colores del sitio no cumplen AA en ${name}: ${r.toFixed(2)}:1 (mínimo 4.5:1). Corrígelo en Keystatic → Ajustes.`);
  }
  // colores propios de la sección de contacto (Keystatic → Efectos): texto sobre fondo en cada modo
  const fc = settings.look?.finaleColor;
  if (fc?.mode === 'custom') {
    for (const [m, name] of [['light', 'modo claro'], ['dark', 'modo oscuro']] as const) {
      const { bg, ink } = fc[m];
      if (!/^#[0-9a-f]{6}$/i.test(bg) || !/^#[0-9a-f]{6}$/i.test(ink)) throw new Error(`Color de contacto inválido (${name}).`);
      const r = ratio(ink, bg);
      if (r < 4.5) throw new Error(`Los colores de contacto no cumplen AA en ${name}: ${r.toFixed(2)}:1 (mínimo 4.5:1). Corrígelos en Keystatic → Ajustes → Efectos.`);
    }
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
