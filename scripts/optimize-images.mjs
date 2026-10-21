// Genera variantes WebP de todas las imágenes de public/images y un manifiesto con sus dimensiones.
// Las variantes van a public/_img (ignorado en git) para no interferir con los archivos que gestiona Keystatic.
// Se ejecuta antes de `dev` y `build`; solo procesa lo que cambió.
import { readdir, stat, mkdir, writeFile, readFile } from 'node:fs/promises';
import { join, relative, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = fileURLToPath(new URL('../public/', import.meta.url));
const SRC = join(ROOT, 'images');
const OUT = join(ROOT, '_img');
const MANIFEST = fileURLToPath(new URL('../src/generated/images.json', import.meta.url));
const WIDTHS = [640, 1280, 1920, 2560];
const EXT = new Set(['.png', '.jpg', '.jpeg', '.webp']);

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (EXT.has(extname(e.name).toLowerCase())) yield p;
  }
}

let prev = {};
try { prev = JSON.parse(await readFile(MANIFEST, 'utf8')); } catch {}
const manifest = {};
let made = 0;
for await (const file of walk(SRC)) {
  const rel = relative(ROOT, file);                 // images/projects/wiggot/cover.png
  const key = '/' + rel.split('\\').join('/');
  const { mtimeMs } = await stat(file);
  const old = prev[key];
  if (old && old.mtime === Math.round(mtimeMs)) {
    let ok = true;
    for (const v of old.variants) { try { await stat(join(ROOT, v.src.slice(1))); } catch { ok = false; break; } }
    if (ok) { manifest[key] = old; continue; }
  }
  const img = sharp(file);
  const { width, height } = await img.metadata();
  const widths = WIDTHS.filter((w) => w < width);
  if (!widths.length || width <= 2560) widths.push(Math.min(width, 2560));
  const variants = [];
  for (const w of [...new Set(widths)]) {
    const outRel = join('_img', rel.replace(/\.[^.]+$/, `-${w}.webp`));
    await mkdir(dirname(join(ROOT, outRel)), { recursive: true });
    await sharp(file).resize({ width: w, withoutEnlargement: true }).webp({ quality: 78, effort: 5 }).toFile(join(ROOT, outRel));
    variants.push({ w, src: '/' + outRel.split('\\').join('/') });
    made++;
  }
  manifest[key] = { w: width, h: height, mtime: Math.round(mtimeMs), variants };
}
await mkdir(dirname(MANIFEST), { recursive: true });
await writeFile(MANIFEST, JSON.stringify(manifest, null, 1));
console.log(`[imágenes] ${Object.keys(manifest).length} imágenes · ${made} variantes nuevas`);
