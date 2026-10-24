// Campo de "+": una cuadrícula de cruces que crecen y se engrosan alrededor del cursor y, al hacer clic,
// sueltan una onda en anillo que recorre todo el campo. Lo usan el hero (variante "wave") y las tarjetas de Impacto.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  const hex = (h) => {
    const m = /^#?([0-9a-f]{6})$/i.exec(h || '');
    if (!m) return null;
    const n = parseInt(m[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const rgbOf = (value) => {
    const h = hex(value);
    if (h) return h;
    const m = /rgba?\(([^)]+)\)/.exec(value || '');
    return m ? m[1].split(',').slice(0, 3).map((v) => parseFloat(v)) : [236, 238, 245];
  };

  // los dos siguen el tema claro / oscuro (el hero lee --hero-ink; las tarjetas, --ink)
  const darkTheme = () => {
    const [r, g, b] = rgbOf(css('--hero-bg'));
    return r * 0.299 + g * 0.587 + b * 0.114 < 128;
  };
  const PRESETS = {
    hero: {
      cell: 40, radius: 0.3, idle: 0.32, peak: [1.25, 2.05], attack: 0.35, release: 0.7,
      // onda: ancha y pausada, crece más que el hover y deja un eco detrás
      burstSpeed: 620, burstWidth: 300, burstBoost: 1.4, echo: 0.6, pulse: 6,
      idleAlpha: 0.32, activeAlpha: 1, intro: true,
      idleColor: () => rgbOf(css('--hero-ink')),
      colors: () => darkTheme()
        ? [hex(css('--accent-dark')) || [185, 164, 255], [124, 77, 255], [167, 112, 255], [201, 184, 255], [255, 122, 198], [111, 211, 255], [236, 238, 245]]
        : [hex(css('--accent-light')) || [90, 62, 200], [124, 77, 255], [143, 91, 240], [214, 64, 150], [30, 150, 210], [31, 35, 40]],
    },
    card: {
      cell: 24, radius: 0.62, idle: 0.36, peak: [1.4, 2.4], attack: 0.35, release: 0.55,
      burstSpeed: 700, burstWidth: 110, burstBoost: 1, echo: 0, pulse: 0, idleAlpha: 0.2, activeAlpha: 0.9, intro: false,
      idleColor: () => rgbOf(css('--ink')),
      colors: () => [rgbOf(css('--accent')), [124, 77, 255], [167, 112, 255], [255, 122, 198]],
    },
  };

  function field(canvas) {
    const o = PRESETS[canvas.dataset.plusWave] || PRESETS.hero;
    const host = canvas.closest('[data-wave-host]') || canvas.parentElement;
    const ctx = canvas.getContext('2d');
    let W = 0, H = 0, cells = [], rings = [], idleRGB = o.idleColor(), palette = o.colors();
    const mouse = { x: 0, y: 0, active: false };
    let raf = 0, running = false, visible = false, last = 0, lastTouch = performance.now();

    function resize() {
      const r = host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.round(r.width); H = Math.round(r.height);
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cols = Math.floor(W / o.cell), rows = Math.floor(H / o.cell);
      const ox = (W - (cols - 1) * o.cell) / 2, oy = (H - (rows - 1) * o.cell) / 2;
      cells = [];
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        cells.push({ x: ox + i * o.cell, y: oy + j * o.cell, s: o.idle, peak: o.peak[0] + Math.random() * (o.peak[1] - o.peak[0]),
          c: Math.floor(Math.random() * 1e6) });
      }
      draw();
    }

    // brazo y grosor crecen distinto: al activarse, la cruz se agranda y sobre todo se engruesa
    function plus(x, y, s) {
      const L = o.cell * 0.22 * s, T = Math.max(1, o.cell * 0.045 * Math.pow(s, 1.45));
      ctx.beginPath();
      ctx.rect(x - L, y - T / 2, L * 2, T);
      ctx.rect(x - T / 2, y - L, T, L * 2);
      ctx.fill();
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (const c of cells) {
        const k = Math.max(0, Math.min(1, (c.s - o.idle) / (c.peak - o.idle)));
        const to = palette[c.c % palette.length];
        const r = Math.round(idleRGB[0] + (to[0] - idleRGB[0]) * k);
        const g = Math.round(idleRGB[1] + (to[1] - idleRGB[1]) * k);
        const b = Math.round(idleRGB[2] + (to[2] - idleRGB[2]) * k);
        ctx.fillStyle = `rgba(${r},${g},${b},${o.idleAlpha + (o.activeAlpha - o.idleAlpha) * k})`;
        plus(c.x, c.y, c.s);
      }
    }

    function step(now) {
      const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
      const R = Math.min(W, H) * o.radius;
      const kUp = 1 - Math.exp(-dt / o.attack), kDown = 1 - Math.exp(-dt / o.release);
      const far = Math.hypot(W, H) + o.burstWidth;
      for (let i = rings.length - 1; i >= 0; i--) {
        const ring = rings[i];
        if (ring.wait > 0) { ring.wait -= dt; continue; }
        ring.r += o.burstSpeed * dt;
        if (ring.r > far) rings.splice(i, 1);
      }
      let moving = rings.length > 0 || mouse.active;
      for (const c of cells) {
        let f = 0;
        if (mouse.active) {
          const d = Math.hypot(c.x - mouse.x, c.y - mouse.y);
          if (d < R) { const u = 1 - d / R; f = u * u * (3 - 2 * u); }
        }
        for (const ring of rings) {
          if (ring.wait > 0) continue;
          const dd = Math.abs(Math.hypot(c.x - ring.x, c.y - ring.y) - ring.r), half = o.burstWidth / 2;
          if (dd < half) { const u = 1 - dd / half; f = Math.max(f, u * u * (3 - 2 * u) * Math.sqrt(1 - ring.r / far) * ring.k); }
        }
        const target = o.idle + (c.peak - o.idle) * f;
        c.s += (target - c.s) * (target > c.s ? kUp : kDown);
        if (Math.abs(target - c.s) > 0.004) moving = true;
      }
      draw();
      return moving;
    }

    // una onda (y su eco, más débil y un poco después)
    function burst(x, y, k = 1) {
      rings.push({ x, y, r: 0, k: k * o.burstBoost, wait: 0 });
      if (o.echo) rings.push({ x, y, r: 0, k: k * o.burstBoost * o.echo, wait: 0.32 });
      while (rings.length > 8) rings.shift();
      wake();
    }

    function loop(now) {
      if (step(now)) raf = requestAnimationFrame(loop);
      else { running = false; last = 0; }
    }
    function wake() {
      if (reduce || running || !visible) return;
      running = true; last = 0; raf = requestAnimationFrame(loop);
    }
    function sleep() { running = false; cancelAnimationFrame(raf); last = 0; }

    const local = (e) => { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    host.addEventListener('pointerenter', () => { idleRGB = o.idleColor(); palette = o.colors(); });
    host.addEventListener('pointermove', (e) => { Object.assign(mouse, local(e), { active: true }); lastTouch = performance.now(); wake(); });
    host.addEventListener('pointerleave', () => { mouse.active = false; wake(); });
    host.addEventListener('pointerdown', (e) => {
      if (host !== e.target.closest('a, button') && e.target.closest('a, button, .foot')) return;
      const p = local(e);
      burst(p.x, p.y);
    });

    new ResizeObserver(resize).observe(host);
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? wake() : sleep(); }).observe(host);
    document.addEventListener('visibilitychange', () => (document.hidden ? sleep() : wake()));
    // el tema cambia los colores de las tarjetas: repinta en reposo
    const recolor = () => requestAnimationFrame(() => { idleRGB = o.idleColor(); palette = o.colors(); draw(); });
    new MutationObserver(recolor).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', recolor);
    resize();

    // pulso automático: si nadie interactúa en `pulse` segundos, una onda nace en algún punto del campo
    if (o.pulse && !reduce) setInterval(() => {
      if (!visible || document.hidden || mouse.active || rings.length || performance.now() - lastTouch < o.pulse * 1000) return;
      burst(W * (0.3 + Math.random() * 0.5), H * (0.25 + Math.random() * 0.5), 0.8);
    }, o.pulse * 1000);

    // entrada: una onda desde el titular
    if (o.intro && !reduce) setTimeout(() => {
      const t = host.querySelector('h1');
      const hr = host.getBoundingClientRect(), tr = t ? t.getBoundingClientRect() : hr;
      burst(tr.left - hr.left + tr.width * 0.35, tr.top - hr.top + tr.height / 2);
    }, 700);
  }

  document.querySelectorAll('[data-plus-wave]').forEach(field);
})();
