// Tipografías configurables desde Keystatic → Ajustes generales → Tipografías.
// Sin archivos subidos y con el nombre por defecto, el sitio usa las fuentes incluidas (ver global.css).
type FontFile = { file?: string | null; weight?: string; style?: string };
type FontRole = { family?: string; fallback?: string; files?: FontFile[] };
type FontPair = { display?: string; text?: string; displayWeight?: string; displayFallback?: string; textFallback?: string };
// Forma actual: pareja (familias, peso, respaldos) + archivos por rol. La anterior (display/text/displayWeight) se sigue leyendo.
export type FontSettings = { pair?: FontPair; displayFiles?: FontFile[]; textFiles?: FontFile[]; display?: FontRole; text?: FontRole; displayWeight?: string };

const normalize = (f: FontSettings) => ({
  display: { family: f.pair?.display ?? f.display?.family, fallback: f.pair?.displayFallback ?? f.display?.fallback, files: f.displayFiles ?? f.display?.files },
  text: { family: f.pair?.text ?? f.text?.family, fallback: f.pair?.textFallback ?? f.text?.fallback, files: f.textFiles ?? f.text?.files },
  displayWeight: f.pair?.displayWeight ?? f.displayWeight,
});

const DEFAULTS = { display: 'Clash Grotesk', text: 'Satoshi' } as const;
const FORMAT: Record<string, string> = { woff2: 'woff2', woff: 'woff', ttf: 'truetype', otf: 'opentype' };
const MIME: Record<string, string> = { woff2: 'font/woff2', woff: 'font/woff', ttf: 'font/ttf', otf: 'font/otf' };
const ext = (path: string) => path.split('?')[0].split('.').pop()!.toLowerCase();
const quote = (s: string) => JSON.stringify(s);

export function fontSetup(settings: FontSettings = {}) {
  const fonts = normalize(settings);
  const faces: string[] = [];
  const vars: string[] = [];
  const preload: { href: string; type: string }[] = [];
  const builtIn = { display: true, text: true };

  for (const role of ['display', 'text'] as const) {
    const cfg = fonts[role] ?? {};
    const files = (cfg.files ?? []).filter((f): f is FontFile & { file: string } => !!f.file && !!FORMAT[ext(f.file)]);
    const family = cfg.family?.trim() || (files.length ? `Custom ${role}` : DEFAULTS[role]);
    if (family === DEFAULTS[role] && !files.length) continue;
    builtIn[role] = false;
    for (const f of files) {
      faces.push(`@font-face{font-family:${quote(family)};src:url(${quote(f.file)}) format("${FORMAT[ext(f.file)]}");font-weight:${f.weight || 400};font-style:${f.style || 'normal'};font-display:swap}`);
    }
    vars.push(`--font-${role}:${quote(family)}, system-ui, ${cfg.fallback || 'sans-serif'}`);
    // precarga el archivo que más se ve: el peso de títulos o el regular del texto
    const want = role === 'display' ? Number(fonts.displayWeight || 500) : 400;
    const main = [...files].filter((f) => (f.style || 'normal') === 'normal').sort((a, b) => Math.abs(Number(a.weight || 400) - want) - Math.abs(Number(b.weight || 400) - want))[0];
    if (main) preload.push({ href: main.file, type: MIME[ext(main.file)] });
  }
  if (fonts.displayWeight && fonts.displayWeight !== '500') vars.push(`--display-weight:${Number(fonts.displayWeight)}`);

  return { css: faces.join('') + (vars.length ? `:root:root{${vars.join(';')}}` : ''), preload, builtIn };
}
