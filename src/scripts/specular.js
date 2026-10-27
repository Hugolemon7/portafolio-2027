// Botón "especular": un brillo recorre el contorno sin parar (no sigue al cursor).
// El dibujo es CSS (conic-gradient en el borde, global.css); aquí solo avanza el ángulo.
(() => {
  const els = [...document.querySelectorAll('[data-specular]')];
  if (!els.length) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SPEED = 80;     // grados por segundo
  const state = els.map((el, i) => ({ el, a: i * 140, visible: false }));
  state.forEach((s) => s.el.style.setProperty('--spec-i', '0.85'));
  if (reduce) { state.forEach((s) => s.el.style.setProperty('--spec-a', `${s.a}deg`)); return; }

  let raf = 0, last = 0;
  function loop(now) {
    const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
    let any = false;
    for (const s of state) {
      if (!s.visible) continue;
      any = true;
      s.a = (s.a + SPEED * dt) % 360;
      s.el.style.setProperty('--spec-a', `${s.a.toFixed(1)}deg`);
    }
    raf = any ? requestAnimationFrame(loop) : 0;
    if (!any) last = 0;
  }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) state.find((s) => s.el === e.target).visible = e.isIntersecting;
    if (!raf && state.some((s) => s.visible)) raf = requestAnimationFrame(loop);
  });
  els.forEach((el) => io.observe(el));
})();
