// Tipografías configurables desde Keystatic → Ajustes generales → Tipografías.
// "Fuentes subidas" es una biblioteca: cada archivo lleva el nombre de su familia; la "Combinación" elige qué familia
// usan los títulos y cuál el texto. Sin cambios, el sitio usa las fuentes incluidas (ver global.css).
type FontFile = { family?: string; file?: string | null; weight?: string; style?: string };
type FontPair = { display?: string; text?: string; displayWeight?: string; displayFallback?: string; textFallback?: string; heroScale?: number };
// La forma anterior (displayFiles/textFiles o display/text) se sigue leyendo.
type FontRole = { family?: string; fallback?: string; files?: FontFile[] };
export type FontSettings = { pair?: FontPair; library?: FontFile[]; displayFiles?: FontFile[]; textFiles?: FontFile[]; display?: FontRole; text?: FontRole; displayWeight?: string };

const DEFAULTS = { display: 'Clash Grotesk', text: 'Satoshi' } as const;
const FORMAT: Record<string, string> = { woff2: 'woff2', woff: 'woff', ttf: 'truetype', otf: 'opentype' };
const MIME: Record<string, string> = { woff2: 'font/woff2', woff: 'font/woff', ttf: 'font/ttf', otf: 'font/otf' };
const ext = (path: string) => path.split('?')[0].split('.').pop()!.toLowerCase();
const quote = (s: string) => JSON.stringify(s);
// "variable" = un solo archivo con todos los pesos
const weightRange = (w?: string) => (w === 'variable' ? '100 900' : String(Number(w) || 400));

export function fontSetup(f: FontSettings = {}) {
  const pair = {
    display: (f.pair?.display ?? f.display?.family)?.trim() || DEFAULTS.display,
    text: (f.pair?.text ?? f.text?.family)?.trim() || DEFAULTS.text,
    displayFallback: f.pair?.displayFallback ?? f.display?.fallback ?? 'sans-serif',
    textFallback: f.pair?.textFallback ?? f.text?.fallback ?? 'sans-serif',
    displayWeight: f.pair?.displayWeight ?? f.displayWeight ?? '500',
    heroScale: Number(f.pair?.heroScale) || 1,
  };
  // biblioteca: cada archivo con su familia (los de la forma anterior heredan la familia de su rol)
  const library: (FontFile & { file: string; family: string })[] = [
    ...(f.library ?? []),
    ...(f.displayFiles ?? f.display?.files ?? []).map((x) => ({ ...x, family: x.family || pair.display })),
    ...(f.textFiles ?? f.text?.files ?? []).map((x) => ({ ...x, family: x.family || pair.text })),
  ].filter((x): x is FontFile & { file: string; family: string } => !!x.file && !!x.family?.trim() && !!FORMAT[ext(x.file)]);

  const faces = library.map((x) =>
    `@font-face{font-family:${quote(x.family.trim())};src:url(${quote(x.file)}) format("${FORMAT[ext(x.file)]}");font-weight:${weightRange(x.weight)};font-style:${x.style || 'normal'};font-display:swap}`);

  const vars: string[] = [];
  const preload: { href: string; type: string }[] = [];
  const builtIn = { display: pair.display === DEFAULTS.display, text: pair.text === DEFAULTS.text };
  for (const role of ['display', 'text'] as const) {
    if (builtIn[role]) continue;
    vars.push(`--font-${role}:${quote(pair[role])}, system-ui, ${role === 'display' ? pair.displayFallback : pair.textFallback}`);
    // precarga el archivo que más se ve: el peso de títulos o el regular del texto
    const want = role === 'display' ? Number(pair.displayWeight) : 400;
    const dist = (x: FontFile) => (x.weight === 'variable' ? 0 : Math.abs(Number(x.weight || 400) - want));
    const main = library.filter((x) => x.family.trim() === pair[role] && (x.style || 'normal') === 'normal').sort((a, b) => dist(a) - dist(b))[0];
    if (main && !preload.some((p) => p.href === main.file)) preload.push({ href: main.file, type: MIME[ext(main.file)] });
  }
  if (pair.displayWeight !== '500') vars.push(`--display-weight:${Number(pair.displayWeight)}`);
  if (pair.heroScale !== 1) vars.push(`--hero-title-scale:${pair.heroScale}`);

  return { css: faces.join('') + (vars.length ? `:root:root{${vars.join(';')}}` : ''), preload, builtIn };
}
