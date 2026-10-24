// Botones "especulares": un brillo recorre el contorno sin parar y, cuando el cursor se acerca,
// gira hacia él y se intensifica. El dibujo es CSS (conic-gradient en el borde); aquí solo se mueve el ángulo.
(() => {
  const els = [...document.querySelectorAll('[data-specular]')];
  if (!els.length) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const IDLE_SPEED = 80;    // grados por segundo en reposo
  const PROXIMITY = 220;    // px alrededor del botón en los que el brillo busca al cursor
  const IDLE_I = 0.6;       // intensidad en reposo

  const state = els.map((el, i) => ({ el, a: i * 140, i: IDLE_I, visible: false }));
  if (reduce) { state.forEach((s) => s.el.style.setProperty('--spec-a', `${s.a}deg`)); return; }

  const pointer = { x: -1e4, y: -1e4 };
  addEventListener('pointermove', (e) => { pointer.x = e.clientX; pointer.y = e.clientY; }, { passive: true });
  document.addEventListener('pointerleave', () => { pointer.x = pointer.y = -1e4; });

  let raf = 0, last = 0;
  function loop(now) {
    const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
    let any = false;
    for (const s of state) {
      if (!s.visible) continue;
      any = true;
      const r = s.el.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const dx = pointer.x - cx, dy = pointer.y - cy;
      // distancia al borde del botón, no al centro
      const gap = Math.hypot(Math.max(0, Math.abs(dx) - r.width / 2), Math.max(0, Math.abs(dy) - r.height / 2));
      const near = gap < PROXIMITY ? 1 - gap / PROXIMITY : 0;
      if (near > 0) {
        const target = (Math.atan2(dy, dx) * 180) / Math.PI + 90;      // 0° del conic-gradient = arriba
        const diff = ((target - s.a + 540) % 360) - 180;
        s.a += diff * (1 - Math.exp(-dt * (4 + near * 8)));
      } else s.a += IDLE_SPEED * dt;
      s.i += (IDLE_I + (1 - IDLE_I) * near - s.i) * (1 - Math.exp(-dt * 6));
      s.el.style.setProperty('--spec-a', `${(s.a % 360).toFixed(1)}deg`);
      s.el.style.setProperty('--spec-i', s.i.toFixed(3));
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
