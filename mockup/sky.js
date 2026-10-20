// Cielo del hero: estrellas en tres profundidades, nebulosa que sigue al cursor
// y estallidos de estrellas al hacer clic o tocar. Sin dependencias.
(() => {
  const canvas = document.querySelector('[data-sky]');
  if (!canvas) return;
  const hero = canvas.closest('[data-hero]');
  const ctx = canvas.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;

  let W = 0, H = 0, dpr = 1, stars = [], bursts = [];
  const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999, active: false };
  const trail = [];
  const TRAIL = 14;
  let raf = 0, running = false, t0 = performance.now();

  // colores de nebulosa (oscuros, sin violeta): azul petróleo y polvo cálido
  const NEB = [
    [38, 92, 112],   // petróleo
    [138, 84, 44],   // polvo cálido
    [70, 110, 98],   // verde salvia profundo
  ];

  function resize() {
    const r = hero.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.round(r.width); H = Math.round(r.height);
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(coarse ? 260 : 620, Math.round((W * H) / (coarse ? 2600 : 2100)));
    stars = Array.from({ length: count }, () => {
      const z = Math.random();               // 0 lejos · 1 cerca
      return {
        x: Math.random() * W, y: Math.random() * H,
        z, r: 0.35 + z * z * 1.5,
        a: 0.35 + Math.random() * 0.55,
        tw: 0.6 + Math.random() * 2.2, ph: Math.random() * Math.PI * 2,
        dx: 0, dy: 0,                        // desplazamiento por el cursor
        vx: (Math.random() - 0.5) * 0.02 * (0.3 + z),
      };
    });
    if (reduce) draw(performance.now());
  }

  function glow(x, y, rad, rgb, alpha) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`);
    g.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }

  function draw(now) {
    const t = (now - t0) / 1000;
    ctx.clearRect(0, 0, W, H);

    // nebulosas de fondo que respiran despacio
    ctx.globalCompositeOperation = 'lighter';
    glow(W * 0.78 + Math.sin(t * 0.05) * 30, H * 0.28, Math.max(W, H) * 0.55, NEB[0], 0.16);
    glow(W * 0.18, H * 0.82 + Math.cos(t * 0.04) * 24, Math.max(W, H) * 0.5, NEB[1], 0.10);
    glow(W * 0.55, H * 0.6, Math.max(W, H) * 0.35, NEB[2], 0.06);

    // rastro de nebulosa que sigue al cursor
    if (mouse.active) {
      for (let i = 0; i < trail.length; i++) {
        const p = trail[i];
        const k = (i + 1) / trail.length;
        glow(p.x, p.y, 70 + k * 130, NEB[i % 3], 0.05 + k * 0.07);
      }
    }
    ctx.globalCompositeOperation = 'source-over';

    // parallax suave según el cursor
    const px = mouse.active ? (mouse.x / W - 0.5) : 0;
    const py = mouse.active ? (mouse.y / H - 0.5) : 0;

    for (const s of stars) {
      if (!reduce) {
        s.x += s.vx; if (s.x < -4) s.x = W + 4; if (s.x > W + 4) s.x = -4;
        // el cursor aparta y enciende las estrellas cercanas
        const sx = s.x + s.dx, sy = s.y + s.dy;
        const ddx = sx - mouse.x, ddy = sy - mouse.y;
        const d2 = ddx * ddx + ddy * ddy, R = 150;
        if (mouse.active && d2 < R * R) {
          const d = Math.sqrt(d2) || 1, f = (1 - d / R) * 18 * (0.4 + s.z);
          s.dx += (ddx / d) * f * 0.08; s.dy += (ddy / d) * f * 0.08;
          s.boost = 1 - d / R;
        } else s.boost = (s.boost || 0) * 0.92;
        s.dx *= 0.94; s.dy *= 0.94;
      }
      const x = s.x + s.dx - px * 24 * s.z;
      const y = s.y + s.dy - py * 16 * s.z;
      const tw = reduce ? 1 : 0.65 + 0.35 * Math.sin(t * s.tw + s.ph);
      const a = Math.min(1, s.a * tw + (s.boost || 0) * 0.8);
      const r = s.r * (1 + (s.boost || 0) * 1.2);
      ctx.fillStyle = `rgba(236,238,245,${a})`;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      if (s.z > 0.82 || (s.boost || 0) > 0.4) { // destello en las más cercanas
        ctx.globalCompositeOperation = 'lighter';
        glow(x, y, r * 7, [200, 220, 235], a * 0.18);
        ctx.globalCompositeOperation = 'source-over';
      }
    }

    // estallidos al hacer clic
    for (let i = bursts.length - 1; i >= 0; i--) {
      const b = bursts[i]; b.life -= 0.012;
      if (b.life <= 0) { bursts.splice(i, 1); continue; }
      for (const p of b.parts) {
        p.x += p.vx; p.y += p.vy; p.vx *= 0.985; p.vy *= 0.985;
        ctx.fillStyle = `rgba(236,238,245,${b.life})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * b.life + 0.3, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalCompositeOperation = 'lighter';
      glow(b.x, b.y, 160 * (1.2 - b.life), NEB[b.c], 0.18 * b.life);
      ctx.globalCompositeOperation = 'source-over';
    }
  }

  function loop(now) {
    mouse.x += (mouse.tx - mouse.x) * 0.12;
    mouse.y += (mouse.ty - mouse.y) * 0.12;
    if (mouse.active) {
      trail.push({ x: mouse.x, y: mouse.y });
      if (trail.length > TRAIL) trail.shift();
    }
    draw(now);
    raf = requestAnimationFrame(loop);
  }
  const start = () => { if (!running && !reduce) { running = true; raf = requestAnimationFrame(loop); } };
  const stop = () => { running = false; cancelAnimationFrame(raf); };

  function local(e) {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
  hero.addEventListener('pointermove', (e) => {
    const p = local(e);
    if (!mouse.active) { mouse.x = p.x; mouse.y = p.y; }
    mouse.tx = p.x; mouse.ty = p.y; mouse.active = true;
  });
  hero.addEventListener('pointerleave', () => { mouse.active = false; trail.length = 0; });
  hero.addEventListener('pointerdown', (e) => {
    if (e.target.closest('a, button')) return;
    const p = local(e);
    const parts = Array.from({ length: 26 }, () => {
      const a = Math.random() * Math.PI * 2, v = 0.6 + Math.random() * 2.6;
      return { x: p.x, y: p.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: 0.6 + Math.random() * 1.4 };
    });
    bursts.push({ x: p.x, y: p.y, parts, life: 1, c: Math.floor(Math.random() * 3) });
    if (reduce) draw(performance.now());
  });

  new ResizeObserver(resize).observe(hero);
  new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop())).observe(hero);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  resize();
})();
