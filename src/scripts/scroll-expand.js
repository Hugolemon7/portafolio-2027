// Scroll Expand: mientras el encabezado del proyecto está fijo, el avance del scroll (0 → 1) abre la portada
// de un marco redondeado a pantalla completa. El dibujo es CSS (pages.css); aquí solo se calcula --p.
(() => {
  const els = document.querySelectorAll('[data-expand]');
  if (!els.length) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    els.forEach((el) => { el.style.height = '100svh'; el.style.setProperty('--p', '1'); });
    return;
  }
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  let queued = false;
  const paint = () => {
    queued = false;
    for (const el of els) {
      const r = el.getBoundingClientRect();
      const run = r.height - innerHeight;
      const t = run > 0 ? Math.min(1, Math.max(0, -r.top / run)) : 1;
      el.style.setProperty('--p', ease(t).toFixed(4));
    }
  };
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(paint); } };
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);
  paint();
})();
