// Liquid glass de la barra (estilo "Liquid glass" en Keystatic): el fondo se refracta en los bordes y cada canal
// (rojo, verde, azul) se desplaza distinto, lo que da la aberración cromática. Es un filtro SVG usado como
// backdrop-filter; solo Chrome/Edge lo soportan, así que en Safari y Firefox queda el vidrio desenfocado del CSS.
(() => {
  const bar = document.querySelector('.bar--glass');
  if (!bar) return;
  const ua = navigator.userAgent;
  const webkit = /Safari/.test(ua) && !/Chrome|Chromium|Edg/.test(ua);
  const firefox = /Firefox/.test(ua);
  const probe = document.createElement('div');
  probe.style.backdropFilter = 'url(#x)';
  if (webkit || firefox || !probe.style.backdropFilter) return;

  const DISTORTION = -150;          // fuerza de la refracción
  const OFFSETS = [0, 8, 16];       // desplazamiento extra por canal (R, G, B) = aberración cromática
  const EDGE = 0.07;                // grosor del borde que refracta (fracción del lado menor)
  const NS = 'http://www.w3.org/2000/svg';

  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'bar__glass');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = `<defs><filter id="bar-glass" color-interpolation-filters="sRGB" x="0" y="0" width="100%" height="100%">
    <feImage x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map" />
    ${['R', 'G', 'B'].map((c, i) => `
      <feDisplacementMap in="SourceGraphic" in2="map" scale="${DISTORTION + OFFSETS[i]}" xChannelSelector="R" yChannelSelector="G" result="d${c}" />
      <feColorMatrix in="d${c}" type="matrix" values="${[0, 1, 2].map((r) => [0, 1, 2, 3].map((k) => (k === r && r === i ? 1 : 0)).concat(0).join(' ')).join('  ')}  0 0 0 1 0" result="c${c}" />`).join('')}
    <feBlend in="cR" in2="cG" mode="screen" result="rg" />
    <feBlend in="rg" in2="cB" mode="screen" result="out" />
    <feGaussianBlur in="out" stdDeviation="0.6" />
  </filter></defs>`;
  bar.prepend(svg);
  const image = svg.querySelector('feImage');

  // mapa de desplazamiento: degradado rojo horizontal + azul vertical; el centro (gris) no se mueve, solo los bordes
  function map() {
    const r = bar.getBoundingClientRect();
    const w = Math.round(r.width), h = Math.round(r.height);
    const radius = Math.min(h / 2, parseFloat(getComputedStyle(bar).borderTopLeftRadius) || h / 2);
    const e = Math.min(w, h) * EDGE * 0.5;
    const art = `<svg viewBox="0 0 ${w} ${h}" xmlns="${NS}"><defs>
      <linearGradient id="r" x1="100%" y1="0%" x2="0%" y2="0%"><stop offset="0%" stop-color="#0000"/><stop offset="100%" stop-color="red"/></linearGradient>
      <linearGradient id="b" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#0000"/><stop offset="100%" stop-color="blue"/></linearGradient></defs>
      <rect width="${w}" height="${h}" fill="black"/>
      <rect width="${w}" height="${h}" rx="${radius}" fill="url(#r)"/>
      <rect width="${w}" height="${h}" rx="${radius}" fill="url(#b)" style="mix-blend-mode:difference"/>
      <rect x="${e}" y="${e}" width="${w - e * 2}" height="${h - e * 2}" rx="${Math.max(0, radius - e)}" fill="hsl(0 0% 50% / 0.93)" style="filter:blur(11px)"/></svg>`;
    image.setAttribute('href', `data:image/svg+xml,${encodeURIComponent(art)}`);
  }
  map();
  new ResizeObserver(map).observe(bar);
  bar.style.setProperty('--glass-filter', 'blur(2px) url(#bar-glass) saturate(1.2)');
  bar.classList.add('has-refraction');
})();
