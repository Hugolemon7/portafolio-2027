// Cielo interactivo: estrellas en tres profundidades, rastro de nebulosa morada que sigue
// al cursor con retraso, y estallidos de estrellas al hacer clic o tocar. Sin dependencias.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;

  // nebulosa de fondo (oscura) y rastro del cursor (morado)
  const BACK = [[46, 32, 110], [22, 52, 92], [70, 36, 120]];
  const TRAIL_RGB = [[124, 77, 255], [167, 112, 255], [92, 56, 214], [196, 150, 255]];
  const FOLLOW = 0.045;     // retraso del rastro: menor = más lento
  const TRAIL = 26;

  function sky(canvas) {
    const host = canvas.closest('[data-sky-host]');
    const ctx = canvas.getContext('2d');
    let W = 0, H = 0, stars = [], bursts = [];
    const mouse = { x: 0, y: 0, tx: 0, ty: 0, active: false, energy: 0 };
    const trail = [];
    let raf = 0, running = false;
    const t0 = performance.now();

    function resize() {
      const r = host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.round(r.width); H = Math.round(r.height);
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(coarse ? 260 : 620, Math.round((W * H) / (coarse ? 2600 : 2100)));
      stars = Array.from({ length: count }, () => {
        const z = Math.random();
        return { x: Math.random() * W, y: Math.random() * H, z, r: 0.35 + z * z * 1.5, a: 0.35 + Math.random() * 0.55,
          tw: 0.6 + Math.random() * 2.2, ph: Math.random() * Math.PI * 2, dx: 0, dy: 0, boost: 0,
          vx: (Math.random() - 0.5) * 0.02 * (0.3 + z) };
      });
      if (reduce) draw(performance.now());
    }

    function glow(x, y, rad, rgb, alpha) {
      if (rad <= 0 || alpha <= 0) return;
      const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
      g.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`);
      g.addColorStop(0.45, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha * 0.45})`);
      g.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }

    function draw(now) {
      const t = (now - t0) / 1000;
      const M = Math.max(W, H);
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      glow(W * 0.8 + Math.sin(t * 0.05) * 30, H * 0.25, M * 0.55, BACK[0], 0.2);
      glow(W * 0.15, H * 0.85 + Math.cos(t * 0.04) * 24, M * 0.5, BACK[1], 0.14);
      glow(W * 0.55, H * 0.6, M * 0.35, BACK[2], 0.08);

      // rastro morado: cada punto es una nube que se queda atrás y se desvanece
      for (let i = 0; i < trail.length; i++) {
        const p = trail[i], k = (i + 1) / trail.length;
        glow(p.x, p.y, 60 + k * 170, TRAIL_RGB[i % TRAIL_RGB.length], (0.03 + k * 0.08) * mouse.energy);
      }
      ctx.globalCompositeOperation = 'source-over';

      const px = mouse.active ? mouse.x / W - 0.5 : 0, py = mouse.active ? mouse.y / H - 0.5 : 0;
      for (const s of stars) {
        if (!reduce) {
          s.x += s.vx; if (s.x < -4) s.x = W + 4; if (s.x > W + 4) s.x = -4;
          const ddx = s.x + s.dx - mouse.x, ddy = s.y + s.dy - mouse.y, d2 = ddx * ddx + ddy * ddy, R = 150;
          if (mouse.active && d2 < R * R) {
            const d = Math.sqrt(d2) || 1, f = (1 - d / R) * 18 * (0.4 + s.z);
            s.dx += (ddx / d) * f * 0.08; s.dy += (ddy / d) * f * 0.08; s.boost = 1 - d / R;
          } else s.boost *= 0.92;
          s.dx *= 0.94; s.dy *= 0.94;
        }
        const x = s.x + s.dx - px * 24 * s.z, y = s.y + s.dy - py * 16 * s.z;
        const tw = reduce ? 1 : 0.65 + 0.35 * Math.sin(t * s.tw + s.ph);
        const a = Math.min(1, s.a * tw + s.boost * 0.8), r = s.r * (1 + s.boost * 1.2);
        ctx.fillStyle = `rgba(236,236,250,${a})`;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
        if (s.z > 0.82 || s.boost > 0.4) {
          ctx.globalCompositeOperation = 'lighter';
          glow(x, y, r * 7, [200, 190, 255], a * 0.18);
          ctx.globalCompositeOperation = 'source-over';
        }
      }

      for (let i = bursts.length - 1; i >= 0; i--) {
        const b = bursts[i]; b.life -= 0.012;
        if (b.life <= 0) { bursts.splice(i, 1); continue; }
        for (const p of b.parts) {
          p.x += p.vx; p.y += p.vy; p.vx *= 0.985; p.vy *= 0.985;
          ctx.fillStyle = `rgba(236,236,250,${b.life})`;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r * b.life + 0.3, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalCompositeOperation = 'lighter';
        glow(b.x, b.y, 170 * (1.2 - b.life), TRAIL_RGB[b.c], 0.22 * b.life);
        ctx.globalCompositeOperation = 'source-over';
      }
    }

    function loop(now) {
      mouse.x += (mouse.tx - mouse.x) * FOLLOW;
      mouse.y += (mouse.ty - mouse.y) * FOLLOW;
      mouse.energy += ((mouse.active ? 1 : 0) - mouse.energy) * 0.04;   // aparece y se va con calma
      if (mouse.energy > 0.01) { trail.push({ x: mouse.x, y: mouse.y }); if (trail.length > TRAIL) trail.shift(); }
      draw(now);
      raf = requestAnimationFrame(loop);
    }
    const start = () => { if (!running && !reduce) { running = true; raf = requestAnimationFrame(loop); } };
    const stop = () => { running = false; cancelAnimationFrame(raf); };
    const local = (e) => { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };

    host.addEventListener('pointermove', (e) => {
      const p = local(e);
      if (!mouse.active && mouse.energy < 0.05) { mouse.x = p.x; mouse.y = p.y; trail.length = 0; }
      mouse.tx = p.x; mouse.ty = p.y; mouse.active = true;
    });
    host.addEventListener('pointerleave', () => { mouse.active = false; });
    host.addEventListener('pointerdown', (e) => {
      if (e.target.closest('a, button, .foot')) return;
      const p = local(e);
      const parts = Array.from({ length: 26 }, () => {
        const a = Math.random() * Math.PI * 2, v = 0.6 + Math.random() * 2.6;
        return { x: p.x, y: p.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: 0.6 + Math.random() * 1.4 };
      });
      bursts.push({ x: p.x, y: p.y, parts, life: 1, c: Math.floor(Math.random() * TRAIL_RGB.length) });
      if (reduce) draw(performance.now());
    });

    new ResizeObserver(resize).observe(host);
    new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop())).observe(host);
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
    resize();
  }

  document.querySelectorAll('[data-sky]').forEach(sky);
})();
