// Lava luminosa: metaballs que se funden y se separan como en una lámpara de lava, dibujadas como un halo
// (contorno rosa con franja azul, interior casi transparente) sobre el color de acento.
// El cursor añade un cuerpo que se une a los demás; un clic suelta uno que crece y se disuelve.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MAX = 12;           // cuerpos en el shader (7 fijos + cursor + 4 de clic)
  const BODIES = 7;
  const SPEED = 0.22;       // velocidad general de la lava
  const FOLLOW = 0.06;      // retraso del cuerpo que sigue al cursor
  const DROP_LIFE = 3.4;    // segundos que vive un cuerpo soltado con clic

  const VERT = 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }';
  const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime, uScale;
uniform vec3 uBodies[${MAX}];
uniform vec3 uBg, uRimA, uRimB;
uniform vec4 uText;   // caja del texto: ahí el halo baja para no restar contraste
float field(vec2 q) {
  float f = 0.0;
  for (int i = 0; i < ${MAX}; i++) {
    vec3 b = uBodies[i];
    vec2 d = q - b.xy;
    f += b.z * b.z / (dot(d, d) + 1.0);
  }
  return f;
}
vec3 screen(vec3 a, vec3 b) { return 1.0 - (1.0 - a) * (1.0 - b); }
void main() {
  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  // deformación orgánica: el contorno respira
  vec2 q = p + uScale * 14.0 * vec2(sin(p.y * 0.007 / uScale + uTime * 0.6), cos(p.x * 0.006 / uScale - uTime * 0.5));
  float f = field(q);
  float rimA = exp(-pow((f - 1.0) / 0.08, 2.0));            // línea rosa en el borde
  float rimB = exp(-pow((f - 0.84) / 0.11, 2.0));           // franja azul por fuera
  float halo = smoothstep(0.45, 0.95, f) * (1.0 - smoothstep(1.0, 2.0, f));
  float core = smoothstep(1.05, 2.4, f);                    // interior: apenas más claro
  vec2 tq = max(max(uText.xy - p, p - uText.zw), 0.0);
  float calm = 1.0 - 0.6 * exp(-dot(tq, tq) / (2500.0 * uScale * uScale));
  rimA *= calm; rimB *= calm; halo *= calm; core *= calm;
  vec3 col = uBg;
  col = screen(col, uRimB * (rimB * 0.55 + halo * 0.12));
  col = screen(col, uRimA * rimA * 0.8);
  col = screen(col, vec3(1.0) * (rimA * rimA * 0.35 + core * 0.06));
  gl_FragColor = vec4(col, 1.0);
}`;

  const rgb = (s) => (/rgba?\(([^)]+)\)/.exec(s) || [0, '90,62,200'])[1].split(',').slice(0, 3).map((v) => parseFloat(v) / 255);

  function lava(canvas) {
    const host = canvas.closest('[data-lava-host]') || canvas.parentElement;
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, premultipliedAlpha: false });
    if (!gl) { canvas.remove(); return; }                   // sin WebGL queda el color de acento con su degradado
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); return; }
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = Object.fromEntries(['uRes', 'uTime', 'uScale', 'uBodies', 'uBg', 'uRimA', 'uRimB', 'uText'].map((n) => [n, gl.getUniformLocation(prog, n)]));

    let W = 0, H = 0, dpr = 1, zoneH = 0, raf = 0, running = false;
    const t0 = performance.now();
    const data = new Float32Array(MAX * 3);
    const mouse = { x: 0, y: 0, tx: 0, ty: 0, r: 0, active: false };
    const drops = [];
    // cada cuerpo: centro relativo, amplitud y frecuencias propias (lámpara de lava: sobre todo sube y baja)
    const bodies = Array.from({ length: BODIES }, (_, i) => ({
      cx: 0.12 + (0.76 * i) / (BODIES - 1) + (Math.random() - 0.5) * 0.08, cy: 0.35 + Math.random() * 0.3,
      ax: 0.05 + Math.random() * 0.07, ay: 0.22 + Math.random() * 0.16,
      fx: 0.5 + Math.random() * 0.6, fy: 0.35 + Math.random() * 0.45, ph: Math.random() * 6.28,
      r: 0.05 + Math.random() * 0.045,
    }));

    function colors() {
      const bg = rgb(getComputedStyle(host).backgroundColor);
      gl.uniform3fv(U.uBg, bg);
      gl.uniform3fv(U.uRimA, [1, 0.56, 0.84]);                // rosa
      gl.uniform3fv(U.uRimB, [0.56, 0.78, 1]);                // azul
    }
    function resize() {
      const r = host.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = Math.round(r.width); H = Math.round(r.height);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      // la lava vive sobre el bloque de texto; debajo está la tarjeta del footer
      const foot = host.querySelector('.foot');
      zoneH = foot ? Math.max(H * 0.35, foot.getBoundingClientRect().top - r.top) : H;
      const text = host.querySelector('.finale__cta');
      const tr = text ? text.getBoundingClientRect() : { left: -1e4, top: -1e4, right: -1e4, bottom: -1e4 };
      gl.uniform4f(U.uText, (tr.left - r.left) * dpr, (tr.top - r.top) * dpr, (tr.right - r.left) * dpr, (tr.bottom - r.top) * dpr);
      colors();
      draw(performance.now());
    }

    function draw(now) {
      const t = ((now - t0) / 1000) * SPEED * (reduce ? 0 : 1) + 3;
      const M = Math.min(W, zoneH * 1.6);
      for (let i = 0; i < BODIES; i++) {
        const b = bodies[i];
        const x = (b.cx + Math.sin(t * b.fx + b.ph) * b.ax) * W;
        const y = (b.cy + Math.sin(t * b.fy + b.ph * 1.7) * b.ay) * zoneH;
        const r = b.r * M * (1 + 0.12 * Math.sin(t * 1.3 + b.ph));
        data.set([x * dpr, y * dpr, r * dpr], i * 3);
      }
      data.set([mouse.x * dpr, mouse.y * dpr, mouse.r * M * dpr], BODIES * 3);
      for (let i = 0; i < MAX - BODIES - 1; i++) {
        const d = drops[i], k = d ? (now - d.born) / 1000 / DROP_LIFE : 1;
        const r = d && k < 1 ? Math.sin(Math.PI * Math.min(1, k * 1.6)) * (1 - k * 0.5) * 0.09 * M : 0;
        data.set(d ? [d.x * dpr, (d.y - k * 40) * dpr, r * dpr] : [0, 0, 0], (BODIES + 1 + i) * 3);
      }
      gl.uniform2f(U.uRes, canvas.width, canvas.height);
      gl.uniform1f(U.uTime, ((now - t0) / 1000) * (reduce ? 0 : 1));
      gl.uniform1f(U.uScale, dpr);
      gl.uniform3fv(U.uBodies, data);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    function loop(now) {
      mouse.x += (mouse.tx - mouse.x) * FOLLOW;
      mouse.y += (mouse.ty - mouse.y) * FOLLOW;
      mouse.r += ((mouse.active ? 0.07 : 0) - mouse.r) * 0.05;
      for (let i = drops.length - 1; i >= 0; i--) if ((now - drops[i].born) / 1000 > DROP_LIFE) drops.splice(i, 1);
      draw(now);
      raf = requestAnimationFrame(loop);
    }
    const start = () => { if (!running && !reduce) { running = true; raf = requestAnimationFrame(loop); } };
    const stop = () => { running = false; cancelAnimationFrame(raf); };
    const local = (e) => { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };

    host.addEventListener('pointermove', (e) => {
      const p = local(e);
      if (p.y > zoneH) { mouse.active = false; return; }
      if (!mouse.active && mouse.r < 0.005) { mouse.x = p.x; mouse.y = p.y; }
      mouse.tx = p.x; mouse.ty = p.y; mouse.active = true;
    });
    host.addEventListener('pointerleave', () => { mouse.active = false; });
    host.addEventListener('pointerdown', (e) => {
      if (e.target.closest('a, button, .foot')) return;
      drops.push({ ...local(e), born: performance.now() });
      if (drops.length > MAX - BODIES - 1) drops.shift();
    });

    new ResizeObserver(resize).observe(host);
    new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop())).observe(host);
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
    // el acento cambia con el tema claro / oscuro
    const recolor = () => { colors(); if (!running) draw(performance.now()); };
    new MutationObserver(recolor).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', recolor);
    resize();
  }

  document.querySelectorAll('[data-lava]').forEach(lava);
})();
