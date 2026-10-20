// Cielo interactivo: estrellas en tres profundidades, un gas morado que sigue al cursor con
// retraso (óvalos que giran y se diluyen como tinta en agua) y estallidos de estrellas al hacer clic.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;

  // nebulosa de fondo (oscura) y rastro del cursor (morado)
  const BACK = [[46, 32, 110], [22, 52, 92], [70, 36, 120]];
  const TRAIL_RGB = [[124, 77, 255], [167, 112, 255], [92, 56, 214], [196, 150, 255]];
  const FOLLOW = 0.07;      // retraso del rastro: menor = más lento
  const GAS_ALPHA = 0.75;   // intensidad general del gas
  const PUFF_LIFE = 3.2;    // segundos que tarda una bocanada en diluirse

  function sky(canvas) {
    const host = canvas.closest('[data-sky-host]');
    const ctx = canvas.getContext('2d');
    let W = 0, H = 0, stars = [], bursts = [];
    const mouse = { x: 0, y: 0, tx: 0, ty: 0, active: false };
    const puffs = [];
    let lastPuff = { x: -9999, y: -9999 };
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

      // gas morado: óvalos irregulares que giran, crecen y se diluyen
      for (let i = puffs.length - 1; i >= 0; i--) {
        const p = puffs[i];
        const age = (now - p.born) / 1000, k = age / PUFF_LIFE;
        if (k >= 1) { puffs.splice(i, 1); continue; }
        const fade = Math.sin(Math.PI * Math.min(1, k * 1.15)) * (1 - k);     // entra suave, se va lento
        const rad = p.r0 * (1 + k * 1.8);
        p.x += p.vx; p.y += p.vy; p.vx *= 0.985; p.vy *= 0.985;
        for (let j = 0; j < 2; j++) {                                          // dos lóbulos = forma irregular
          const ang = p.a0 + age * p.spin * (j ? -0.6 : 1);
          ctx.save();
          ctx.translate(p.x + Math.cos(ang) * rad * 0.18 * j, p.y + Math.sin(ang) * rad * 0.18 * j);
          ctx.rotate(ang);
          ctx.scale(1, p.aspect * (j ? 1.25 : 1));
          glow(0, 0, rad * (j ? 0.75 : 1), TRAIL_RGB[(p.c + j) % TRAIL_RGB.length], 0.075 * fade * GAS_ALPHA);
          ctx.restore();
        }
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
      // suelta una bocanada cuando el gas recorre distancia; quieto, solo gira y se diluye
      const dx = mouse.x - lastPuff.x, dy = mouse.y - lastPuff.y;
      if (mouse.active && dx * dx + dy * dy > 18 * 18) {
        puffs.push({ x: mouse.x, y: mouse.y, born: now, r0: 70 + Math.random() * 60, a0: Math.random() * Math.PI,
          spin: (Math.random() < 0.5 ? -1 : 1) * (0.25 + Math.random() * 0.45), aspect: 0.42 + Math.random() * 0.35,
          vx: dx * 0.004, vy: dy * 0.004, c: Math.floor(Math.random() * TRAIL_RGB.length) });
        if (puffs.length > 60) puffs.shift();
        lastPuff = { x: mouse.x, y: mouse.y };
      }
      draw(now);
      raf = requestAnimationFrame(loop);
    }
    const start = () => { if (!running && !reduce) { running = true; raf = requestAnimationFrame(loop); } };
    const stop = () => { running = false; cancelAnimationFrame(raf); };
    const local = (e) => { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };

    host.addEventListener('pointermove', (e) => {
      const p = local(e);
      if (!mouse.active && !puffs.length) { mouse.x = p.x; mouse.y = p.y; lastPuff = { x: p.x, y: p.y }; }
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
