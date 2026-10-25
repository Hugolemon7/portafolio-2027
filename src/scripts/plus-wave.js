// Monta el campo de "+" en cada canvas [data-plus-wave] con las opciones que Keystatic deja en data-*.
import { createPlusField, SPEEDS, hex } from './plus-wave-core.js';

const dark = () => {
  const c = hex(getComputedStyle(document.documentElement).getPropertyValue('--hero-bg').trim());
  return c ? c[0] * 0.299 + c[1] * 0.587 + c[2] * 0.114 < 128 : false;
};

document.querySelectorAll('[data-plus-wave]').forEach((canvas) => {
  const d = canvas.dataset;
  const o = {};
  if (d.speed && SPEEDS[d.speed]) o.burstSpeed = SPEEDS[d.speed];
  if (d.pulse !== undefined) o.pulse = Number(d.pulse) || 0;
  if (d.cell) o.cell = Number(d.cell);
  if (d.weight) o.weight = Number(d.weight);
  if (d.size) o.size = Number(d.size);
  if (d.grow) o.grow = Number(d.grow);
  if (d.opacity) o.opacity = Number(d.opacity);
  if (d.radius) o.radius = Number(d.radius);
  // un solo color (por modo) en lugar de la paleta
  if (d.colorLight && d.colorDark) o.colors = () => [hex(dark() ? d.colorDark : d.colorLight) || [124, 77, 255]];
  createPlusField(canvas, d.plusWave, o);
});
