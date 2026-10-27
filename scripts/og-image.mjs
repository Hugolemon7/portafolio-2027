// Imagen para redes (og:image) generada en cada build con lo que el sitio tiene en ese momento:
// textos del hero, colores, tipografías y nombre (src/content). Así, cada vez que guardas en Keystatic y se publica,
// el preview al compartir el link se actualiza solo. Salida: public/_og/og-es.png y og-en.png (1200 × 630).
// Si en Keystatic → Imagen para redes eliges "Subir mi propia imagen", el sitio usa esa y esto solo genera la automática.
import fs from 'node:fs/promises';
import path from 'node:path';
import satori from 'satori';
import sharp from 'sharp';
import woff2 from 'wawoff2';

const root = process.cwd();
const read = async (p) => JSON.parse(await fs.readFile(path.join(root, p), 'utf8'));
const settings = await read('src/content/settings.json');
const hero = await read('src/content/site/hero.json');
const OUT = path.join(root, 'public/_og');
const W = 1200, H = 630;

// ---------- colores: los del tema elegido (por defecto, oscuro como el hero) ----------
const theme = settings.social?.theme === 'light' ? 'light' : 'dark';
const SITE = { light: { bg: '#eceef1', ink: '#1f2328', muted: '#444a53' }, dark: { bg: '#121418', ink: '#eceef2', muted: '#aeb3bd' } };
const site = { ...SITE[theme], ...(settings.accent?.site?.[theme] ?? {}) };
const accent = theme === 'light' ? settings.accent?.light ?? '#5a3ec8' : settings.accent?.dark ?? '#b9a4ff';

// ---------- tipografías: las de "Combinación de tipografías" (las incluidas son woff2 → se descomprimen) ----------
const pair = settings.fonts?.pair ?? {};
const BUILT_IN = {
  'Clash Grotesk': [{ file: 'public/fonts/clash-grotesk-500.woff2', weight: 500 }],
  Satoshi: [{ file: 'public/fonts/satoshi-400.woff2', weight: 400 }, { file: 'public/fonts/satoshi-700.woff2', weight: 700 }],
};
// satori no lee fuentes variables: se quitan las tablas de variación y queda el estilo base del archivo
const VARIATION = new Set(['fvar', 'gvar', 'avar', 'cvar', 'HVAR', 'VVAR', 'MVAR', 'STAT']);
function staticInstance(buf) {
  const n = buf.readUInt16BE(4);
  const tables = [];
  for (let i = 0; i < n; i++) {
    const o = 12 + i * 16;
    const tag = buf.toString('latin1', o, o + 4);
    if (!VARIATION.has(tag)) tables.push({ tag, sum: buf.readUInt32BE(o + 4), off: buf.readUInt32BE(o + 8), len: buf.readUInt32BE(o + 12) });
  }
  if (tables.length === n) return { buf, weight: null };
  const head = 12 + tables.length * 16;
  let size = head;
  for (const t of tables) size += (t.len + 3) & ~3;
  const out = Buffer.alloc(size);
  buf.copy(out, 0, 0, 4);
  out.writeUInt16BE(tables.length, 4);
  const pow = 2 ** Math.floor(Math.log2(tables.length));
  out.writeUInt16BE(pow * 16, 6); out.writeUInt16BE(Math.log2(pow), 8); out.writeUInt16BE(tables.length * 16 - pow * 16, 10);
  let at = head;
  tables.forEach((t, i) => {
    const o = 12 + i * 16;
    out.write(t.tag, o, 'latin1'); out.writeUInt32BE(t.sum, o + 4); out.writeUInt32BE(at, o + 8); out.writeUInt32BE(t.len, o + 12);
    buf.copy(out, at, t.off, t.off + t.len);
    at += (t.len + 3) & ~3;
  });
  const os2 = tables.find((t) => t.tag === 'OS/2');
  return { buf: out, weight: os2 ? buf.readUInt16BE(os2.off + 4) : 400 };
}
async function load(file) {
  let buf = await fs.readFile(path.join(root, file));
  if (file.endsWith('.woff2')) buf = Buffer.from(await woff2.decompress(buf));
  return staticInstance(buf);
}
async function faces(family, fallback, minWeight = 0) {
  const lib = (settings.fonts?.library ?? []).filter((f) => f.family?.trim() === family && f.file && (f.style ?? 'normal') === 'normal');
  const list = lib.length
    ? lib.map((f) => ({ file: `public${f.file}`, weight: f.weight === 'variable' ? 400 : Number(f.weight) || 400 }))
    : BUILT_IN[family] ?? BUILT_IN[fallback];
  const out = [];
  for (const f of list) {
    try {
      const { buf, weight } = await load(f.file);
      // un archivo variable cuyo estilo base es muy delgado (p. ej. ExtraLight) no sirve para el texto de la imagen
      if (weight !== null && weight < minWeight) { console.warn(`[og] ${family}: el estilo base del archivo variable es ${weight}; se usa ${fallback} para el texto de la imagen`); continue; }
      out.push({ name: family, data: buf, weight: weight ?? f.weight, style: 'normal' });
    } catch { /* archivo ausente o ilegible: se omite */ }
  }
  return out.length || family === fallback ? out : faces(fallback, fallback);
}
const display = pair.display || 'Clash Grotesk';
const text = pair.text || 'Satoshi';
const fonts = [...(await faces(display, 'Clash Grotesk')), ...(await faces(text, 'Satoshi', 350))];
const displayName = fonts.find((f) => f.name === display) ? display : 'Clash Grotesk';
const textName = fonts.find((f) => f.name === text) ? text : 'Satoshi';

// ---------- composición: el hero en pequeño (puntos de fondo, titular, texto, nombre y dirección) ----------
const h = (type, props, ...children) => ({ type, props: { ...props, children: children.length <= 1 ? children[0] : children } });
const hexA = (hex, a) => `${hex}${Math.round(a * 255).toString(16).padStart(2, '0')}`;
const dots = Array.from({ length: Math.ceil(H / 40) }, (_, j) => Array.from({ length: Math.ceil(W / 40) }, (_, i) => {
  const near = Math.hypot(i * 40 - 1020, j * 40 - 400) < 150;        // un grupo de cruces, como al pasar el cursor
  const c = near ? accent : site.ink, s = near ? 14 : 3;
  return near
    ? `<path d="M${i * 40 + 20 - s / 2} ${j * 40 + 20}h${s}M${i * 40 + 20} ${j * 40 + 20 - s / 2}v${s}" stroke="${c}" stroke-width="3" stroke-linecap="round" opacity="0.85"/>`
    : `<circle cx="${i * 40 + 20}" cy="${j * 40 + 20}" r="1.6" fill="${c}" opacity="0.28"/>`;
}).join('')).join('');
const grid = `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${dots}</svg>`).toString('base64')}`;
const host = (process.env.PUBLIC_SITE_URL || 'hugo-buenrostro.vercel.app').replace(/^https?:\/\//, '').replace(/\/$/, '');

function card(lang) {
  const t = hero[lang] ?? hero.es;
  const title = `${t.line1} ${t.line2Before} ${t.highlight}`.replace(/\s+/g, ' ').trim();
  const size = title.length > 34 ? 82 : 96;
  return h('div', { style: { width: W, height: H, display: 'flex', position: 'relative', background: site.bg, color: site.ink, fontFamily: textName } },
    h('img', { src: grid, width: W, height: H, style: { position: 'absolute', left: 0, top: 0 } }),
    // velo hacia la izquierda para que el texto se lea, como el degradado de contraste del hero
    h('div', { style: { position: 'absolute', left: 0, top: 0, width: 760, height: H, backgroundImage: `linear-gradient(to right, ${site.bg}, ${hexA(site.bg, 0.85)} 60%, ${hexA(site.bg, 0)})` } }),
    h('div', { style: { position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%', height: '100%', padding: '56px 64px' } },
      h('div', { style: { fontFamily: displayName, fontSize: 30, letterSpacing: -0.6 } }, settings.name ?? 'Hugo Buenrostro'),
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: 26, maxWidth: 820 } },
        h('div', { style: { fontFamily: displayName, fontSize: size, lineHeight: 0.98, letterSpacing: -size * 0.035 } }, title),
        h('div', { style: { fontSize: 28, lineHeight: 1.35, color: site.muted, maxWidth: 700 } }, t.lead)),
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 14, fontSize: 22, color: site.muted } },
        h('div', { style: { width: 12, height: 12, borderRadius: 6, background: accent } }),
        `${host}${lang === 'en' ? '/en/' : ''}`)));
}

await fs.mkdir(OUT, { recursive: true });
for (const lang of ['es', 'en']) {
  const svg = await satori(card(lang), { width: W, height: H, fonts });
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(path.join(OUT, `og-${lang}.png`));
}
console.log(`[og] imagen para redes generada (${theme}, ${displayName} + ${textName}) → public/_og/og-es.png, og-en.png`);
