// Hugo Buenrostro — maqueta Etapa 3
const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- scroll suave (Lenis), solo si el usuario no pidió menos movimiento ----------
let lenis = null;
if (!reduce && window.Lenis && !navigator.webdriver) {
  lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  // si algo movió la página por fuera (ancla, buscar en página, restaurar scroll), Lenis parte de ahí
  const sync = () => {
    if (!lenis.isScrolling && Math.abs(window.scrollY - lenis.animatedScroll) > 4) lenis.scrollTo(window.scrollY, { immediate: true, force: true });
  };
  addEventListener('wheel', sync, { capture: true, passive: true });
  addEventListener('touchstart', sync, { capture: true, passive: true });
  addEventListener('keydown', sync, { capture: true });
  const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
}
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    closeMenu();
    if (lenis) lenis.scrollTo(target, { offset: -72 });
    else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    history.replaceState(null, '', id);
  });
});

// ---------- barra: sólida al salir del hero ----------
const bar = document.querySelector('[data-bar]');
const hero = document.querySelector('.hero');
let pastHero = false;
new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting; bar.classList.toggle('is-solid', pastHero); if (!pastHero) bar.classList.remove('is-hidden'); }, { rootMargin: '-72px 0px 0px 0px' }).observe(hero);
// se esconde al bajar, vuelve al subir
let lastY = scrollY;
addEventListener('scroll', () => {
  const y = scrollY;
  if (pastHero && Math.abs(y - lastY) > 6) bar.classList.toggle('is-hidden', y > lastY && !bar.contains(document.activeElement));
  lastY = y;
}, { passive: true });

// ---------- menú ----------
const menu = document.querySelector('[data-menu]');
const openBtn = document.querySelector('[data-menu-open]');
let lastFocus = null;
function openMenu() {
  lastFocus = document.activeElement;
  menu.hidden = false;
  openBtn.setAttribute('aria-expanded', 'true');
  lenis && lenis.stop();
  requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('is-open')));
  setTimeout(() => menu.querySelector('.menu__links a').focus(), reduce ? 0 : 350);
}
function closeMenu() {
  if (menu.hidden) return;
  menu.classList.remove('is-open');
  openBtn.setAttribute('aria-expanded', 'false');
  lenis && lenis.start();
  setTimeout(() => { menu.hidden = true; lastFocus && lastFocus.focus(); }, reduce ? 0 : 650);
}
openBtn.addEventListener('click', openMenu);
menu.querySelectorAll('[data-menu-close]').forEach((el) => el.addEventListener('click', closeMenu));
document.addEventListener('keydown', (e) => {
  if (menu.hidden) return;
  if (e.key === 'Escape') closeMenu();
  if (e.key === 'Tab') {
    const f = [...menu.querySelectorAll('a, button')].filter((el) => el.offsetParent !== null);
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

// ---------- temporadas y modo (la "cosa viva": los tokens del sitio) ----------
const seasons = [
  { id: 'salvia', name: 'Salvia', hex: '#5c6b54' },
  { id: 'grana', name: 'Grana cochinilla', hex: '#8e1f2f' },
  { id: 'cempasuchil', name: 'Cempasúchil', hex: '#9a4a08' },
  { id: 'barro', name: 'Barro negro', hex: '#2f2c29' },
];
const lum = (hex) => {
  const c = hex.match(/\w\w/g).map((h) => parseInt(h, 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const isDark = () => root.dataset.theme === 'dark' || (!root.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);

function paintTokens() {
  const cs = getComputedStyle(root);
  const accent = cs.getPropertyValue('--accent').trim();
  const ink = cs.getPropertyValue('--accent-ink').trim();
  const r = ratio(accent, ink);
  const set = (sel, v) => document.querySelectorAll(sel).forEach((el) => (el.textContent = v));
  set('[data-token-accent]', accent);
  set('[data-token-ink]', ink);
  set('[data-token-ratio]', `${r.toFixed(1)}:1 ${r >= 7 ? 'AAA' : r >= 4.5 ? 'AA' : 'insuficiente'}`);
  const meta = document.querySelector('meta[name="theme-color"]');
  meta && meta.setAttribute('content', cs.getPropertyValue('--bg').trim());
  document.querySelectorAll('[data-mode-toggle]').forEach((b) => { b.setAttribute('aria-pressed', String(isDark())); b.textContent = isDark() ? 'Modo claro' : 'Modo oscuro'; });
}
function setSeason(id) {
  root.dataset.season = id;
  try { localStorage.setItem('season', id); } catch (e) {}
  document.querySelectorAll('.swatch').forEach((s) => s.setAttribute('aria-checked', String(s.dataset.id === id)));
  paintTokens();
}
document.querySelectorAll('.season__swatches').forEach((group) => {
  seasons.forEach((s) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'swatch';
    b.dataset.id = s.id;
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-label', s.name);
    b.setAttribute('aria-checked', String(root.dataset.season === s.id));
    b.title = s.name;
    b.style.setProperty('--c', s.hex);
    b.innerHTML = '<span></span>';
    b.addEventListener('click', () => setSeason(s.id));
    group.appendChild(b);
  });
});
document.querySelectorAll('[data-mode-toggle]').forEach((b) => b.addEventListener('click', () => {
  const next = isDark() ? 'light' : 'dark';
  root.dataset.theme = next;
  try { localStorage.setItem('mode', next); } catch (e) {}
  paintTokens();
}));
paintTokens();

// ---------- trabajo: el título se parte en la costura y se une al centrar ----------
const seams = [...document.querySelectorAll('[data-seam]')];
if (!reduce && seams.length) {
  const parts = seams.map((s) => ({
    el: s,
    l: s.querySelector('.seam__pane--l'),
    r: s.querySelector('.seam__pane--r'),
    hl: s.querySelector('.seam__half--l'),
    hr: s.querySelector('.seam__half--r'),
  }));
  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = innerHeight;
    for (const p of parts) {
      const rect = p.el.getBoundingClientRect();
      if (rect.bottom < -vh || rect.top > 2 * vh) continue;
      // 0 cuando el proyecto entra por abajo, 1 cuando sale por arriba
      const prog = Math.min(1, Math.max(0, (vh - rect.top) / (rect.height + vh)));
      const k = 0.5 - prog;
      p.l.style.transform = `translate3d(0, ${k * 30}svh, 0)`;
      p.r.style.transform = `translate3d(0, ${-k * 30}svh, 0)`;
      p.hl.style.transform = `translate3d(0, ${k * 36}svh, 0)`;
      p.hr.style.transform = `translate3d(0, ${-k * 36}svh, 0)`;
    }
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  update();
}

// ---------- entradas al hacer scroll (una vez) ----------
(() => {
  const targets = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window)) { targets.forEach((el) => el.classList.add('is-in')); return; }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
  targets.forEach((el) => io.observe(el));
  addEventListener('load', () => setTimeout(() => targets.forEach((el) => {
    const r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) el.classList.add('is-in');
  }), 2500));
})();
