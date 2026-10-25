// Monta el fondo WebGL elegido en Keystatic (Prisma, Aurora u Ondas cortadas) en cada canvas [data-hero-bg].
import { createHeroBg } from './hero-bg-core.js';

document.querySelectorAll('[data-hero-bg]').forEach((canvas) => {
  const d = canvas.dataset;
  const extra = d.opts ? JSON.parse(d.opts) : {};
  createHeroBg(canvas, d.heroBg, { colors: d.colors ? d.colors.split(',') : undefined, dir: d.dir, ...extra });
});
