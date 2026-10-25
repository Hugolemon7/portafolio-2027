// Fondos WebGL del hero: Prisma (pirámide de luz espectral que gira hacia el cursor), Aurora (bandas de color que
// caen desde arriba o suben desde abajo) y Ondas cortadas (cintas de color vistas a través de barras verticales).
// Cada uno calcula su luz sobre negro y luego se mezcla con el fondo del tema: en oscuro suma luz; en claro tiñe.
// Lo usan el hero y la vista previa de Keystatic (keystatic/hero-bg-field.tsx), así ambos se ven igual.

const VERT = 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }';

const COMMON = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;     // -1..1, con inercia
uniform vec3 uBg;
uniform float uLight;    // 1 = tema claro
vec3 finish(vec3 c) {
  c = max(c, 0.0);
  vec3 dark = 1.0 - (1.0 - uBg) * (1.0 - min(c, 1.0));                 // suma luz (screen)
  float k = clamp(dot(c, vec3(0.299, 0.587, 0.114)) * 1.15, 0.0, 0.9);
  vec3 tint = c / max(max(c.r, max(c.g, c.b)), 1e-3);                   // solo el tono
  vec3 light = uBg * mix(vec3(1.0), tint, k);                           // tiñe (multiply)
  return mix(dark, light, uLight);
}
`;

const PRISM = COMMON + `
uniform float uScale;    // tamaño del prisma (1–10×)
mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
// pirámide de base cuadrada (lado 1) y altura h, apoyada en y = 0
float sdPyramid(vec3 p, float h) {
  float m2 = h * h + 0.25;
  p.xz = abs(p.xz);
  p.xz = (p.z > p.x) ? p.zx : p.xz;
  p.xz -= 0.5;
  vec3 q = vec3(p.z, h * p.y - 0.5 * p.x, h * p.x + 0.5 * p.y);
  float s = max(-q.x, 0.0);
  float t = clamp((q.y - 0.5 * p.z) / (m2 + 0.25), 0.0, 1.0);
  float a = m2 * (q.x + s) * (q.x + s) + q.y * q.y;
  float b = m2 * (q.x + 0.5 * t) * (q.x + 0.5 * t) + (q.y - m2 * t) * (q.y - m2 * t);
  float d2 = min(q.y, -q.x * m2 - q.y * 0.5) > 0.0 ? 0.0 : min(a, b);
  return sqrt((d2 + q.z * q.z) / m2) * sign(max(q.z, -p.y));
}
void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - uRes) / uRes.y;
  uv.x -= 0.6 * clamp(uRes.x / uRes.y - 1.0, 0.0, 1.0);             // en pantallas anchas, a la derecha del texto
  vec3 ro = vec3(0.0, 0.9, -4.2);
  vec3 rd = normalize(vec3(uv, 1.7));
  rd.yz *= rot(-0.12);
  vec3 col = vec3(0.0);
  float t = 0.0;
  float s = uScale, k = 0.55 / s;
  for (int i = 0; i < 96; i++) {
    vec3 p = ro + rd * t;
    p.y += 0.55 * s;
    p.xz *= rot(uTime * 0.22 + uMouse.x * 0.9);
    p.yz *= rot(uMouse.y * 0.25);
    float d = sdPyramid(p * k, 1.15) / k;
    d = abs(d) * 0.55 + 0.018 * s;
    vec3 spectrum = 0.5 + 0.5 * cos(6.2831 * (p.y * 0.32 / s - t * 0.05 / s + vec3(0.0, 0.33, 0.67)) + uTime * 0.35);
    col += spectrum / (d / s);                                         // el brillo no cambia con el tamaño
    t += d * 0.8;
    if (t > 14.0 + 6.0 * s) break;
  }
  col = 1.0 - exp(-col * 0.0032);
  gl_FragColor = vec4(finish(col * 1.15), 1.0);
}
`;

const AURORA = COMMON + `
uniform vec3 uC0, uC1, uC2;
uniform float uDir;      // 1 = arriba, -1 = abajo
vec3 perm(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = perm(perm(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
vec3 ramp(float x) {
  return x < 0.5 ? mix(uC0, uC1, smoothstep(0.0, 0.5, x)) : mix(uC1, uC2, smoothstep(0.5, 1.0, x));
}
void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float y = uDir > 0.0 ? uv.y : 1.0 - uv.y;                          // distancia al borde de origen, invertida
  float x = uv.x + uMouse.x * 0.04;
  float n = snoise(vec2(x * 2.0 + uTime * 0.08, uTime * 0.22)) * 0.5;
  float h = y * 2.0 - exp(n) + 0.2;
  float intensity = 0.6 * h;
  float a = smoothstep(0.2 - 0.25, 0.2 + 0.25, intensity);
  vec3 c = ramp(clamp(uv.x, 0.0, 1.0)) * intensity * a;
  gl_FragColor = vec4(finish(c * 1.7), 1.0);
}
`;

const SLICED = COMMON + `
uniform vec3 uC0, uC1, uC2;
uniform float uDpr;
uniform float uBarW, uSpacing, uSpeed, uFreq, uBlur;   // grosor (fracción del espacio), espacio (px), velocidad, curvas, desenfoque
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
float ribbon(float x, float y, float center, float phase, float amp) {
  float c = center + amp * sin(x * 6.2831 * 1.1 * uFreq + uTime * 0.6 * uSpeed + phase) + amp * 0.5 * sin(x * 6.2831 * 2.3 * uFreq - uTime * 0.45 * uSpeed + phase * 1.7);
  float d = (y - c) / 0.042;
  return exp(-d * d);
}
void main() {
  vec2 px = gl_FragCoord.xy;
  vec2 uv = px / uRes;
  float spacing = uSpacing * uDpr;
  float bx = floor(px.x / spacing);
  float cx = (bx + 0.5) * spacing / uRes.x;                          // cada barra muestra la onda en su centro
  float fx = fract(px.x / spacing) - 0.5;
  float depth = mix(0.55, 1.25, cx);                                 // perspectiva: más cerca a la derecha
  float focus = 1.0 - smoothstep(0.0, 0.6, abs(cx - (uMouse.x * 0.5 + 0.5)));
  float w = 0.5 * uBarW * depth;                                     // medio ancho de barra
  float soft = max(0.004, mix(0.09, 0.025, focus) * uBlur * 1.7);
  float bar = smoothstep(w + soft, w - soft * 0.5, abs(fx));
  float yy = uv.y;
  vec3 c = vec3(0.0);
  c += uC0 * ribbon(cx, yy, 0.27, 0.0, 0.05);
  c += uC1 * ribbon(cx, yy, 0.20, 1.9, 0.055);
  c += uC2 * ribbon(cx, yy, 0.13, 3.7, 0.045);
  c *= bar * depth * (0.8 + 0.5 * focus);
  c += (hash(px + uTime) - 0.5) * 0.05 * bar;                        // grano
  gl_FragColor = vec4(finish(c * 0.85), 1.0);
}
`;

const SHADERS = { prism: PRISM, aurora: AURORA, sliced: SLICED };
// resolución de render por efecto (la pirámide es la más costosa)
const SCALE = { prism: 0.6, aurora: 0.5, sliced: 1 };

export const hexToRgb = (h) => {
  const m = /^#?([0-9a-f]{6})$/i.exec((h || '').trim());
  return m ? m[1].match(/../g).map((x) => parseInt(x, 16) / 255) : null;
};
const cssRgb = (s) => {
  const m = /rgba?\(([^)]+)\)/.exec(s || '');
  return m ? m[1].split(',').slice(0, 3).map((v) => parseFloat(v) / 255) : null;
};

/**
 * Monta un fondo en `canvas`. opts: { colors: [hex,hex,hex], dir: 'top'|'bottom', scale, barWidth, spacing, speed, frequency, blur,
 *   bg: () => hex|rgb(), light: () => bool }.
 * Devuelve una función que lo desmonta.
 */
export function createHeroBg(canvas, kind, opts = {}) {
  const host = canvas.closest('[data-wave-host]') || canvas.parentElement;
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, premultipliedAlpha: false, preserveDrawingBuffer: true });
  const src = SHADERS[kind];
  if (!gl || !src) { canvas.style.display = 'none'; return () => {}; }
  const sh = (type, s) => { const o = gl.createShader(type); gl.shaderSource(o, s); gl.compileShader(o); return o; };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, src));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.style.display = 'none'; return () => {}; }
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = (n) => gl.getUniformLocation(prog, n);
  const u = { res: U('uRes'), time: U('uTime'), mouse: U('uMouse'), bg: U('uBg'), light: U('uLight'), dir: U('uDir'), dpr: U('uDpr'), c: [U('uC0'), U('uC1'), U('uC2')] };
  // ajustes numéricos de Keystatic (con sus valores por defecto)
  const NUM = { uScale: opts.scale ?? 1, uBarW: opts.barWidth ?? 0.25, uSpacing: opts.spacing ?? 28, uSpeed: opts.speed ?? 1, uFreq: opts.frequency ?? 1, uBlur: opts.blur ?? 0.6 };

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ac = new AbortController(), on = { signal: ac.signal };
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  const t0 = performance.now();
  let raf = 0, running = false, visible = false, dpr = 1;

  const isLight = opts.light || (() => !(document.documentElement.dataset.theme === 'dark' || (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches)));
  const bgOf = opts.bg || (() => getComputedStyle(host).backgroundColor);
  function colors() {
    const bg = bgOf();
    gl.uniform3fv(u.bg, hexToRgb(bg) || cssRgb(bg) || [0.07, 0.08, 0.09]);
    gl.uniform1f(u.light, isLight() ? 1 : 0);
    const list = opts.colors || [];
    u.c.forEach((l, i) => l && gl.uniform3fv(l, hexToRgb(list[i]) || [0.5, 0.5, 0.5]));
    if (u.dir) gl.uniform1f(u.dir, opts.dir === 'bottom' ? -1 : 1);
    for (const [name, v] of Object.entries(NUM)) { const l = U(name); if (l) gl.uniform1f(l, Number(v)); }
  }
  function resize() {
    const r = host.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2) * SCALE[kind];
    canvas.width = Math.max(1, Math.round(r.width * dpr)); canvas.height = Math.max(1, Math.round(r.height * dpr));
    canvas.style.width = '100%'; canvas.style.height = '100%';
    gl.viewport(0, 0, canvas.width, canvas.height);
    draw(performance.now());
  }
  function draw(now) {
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;
    gl.uniform2f(u.res, canvas.width, canvas.height);
    gl.uniform1f(u.time, reduce ? 4 : (now - t0) / 1000);
    gl.uniform2f(u.mouse, mouse.x, mouse.y);
    if (u.dpr) gl.uniform1f(u.dpr, dpr);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  const loop = (now) => { draw(now); raf = requestAnimationFrame(loop); };
  const start = () => { if (!running && visible && !reduce && !document.hidden) { running = true; raf = requestAnimationFrame(loop); } };
  const stop = () => { running = false; cancelAnimationFrame(raf); };

  host.addEventListener('pointermove', (e) => {
    const r = host.getBoundingClientRect();
    mouse.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
    mouse.ty = -(((e.clientY - r.top) / r.height) * 2 - 1);
  }, on);
  host.addEventListener('pointerleave', () => { mouse.tx = 0; mouse.ty = 0; }, on);
  const ro = new ResizeObserver(resize); ro.observe(host);
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? start() : stop(); }); io.observe(host);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()), on);
  // el fondo del hero tiene transición de color: se lee al terminar
  const recolor = () => setTimeout(() => { colors(); if (!running) draw(performance.now()); }, 320);
  const mo = new MutationObserver(recolor); mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', recolor, on);
  colors();
  resize();

  return () => { stop(); ac.abort(); ro.disconnect(); io.disconnect(); mo.disconnect(); gl.getExtension('WEBGL_lose_context')?.loseContext(); };
}
