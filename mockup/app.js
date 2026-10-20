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
new IntersectionObserver(([e]) => bar.classList.toggle('is-solid', !e.isIntersecting), { rootMargin: '-72px 0px 0px 0px' }).observe(hero);

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

// ---------- tema claro / oscuro (switch en el menú) ----------
const isDark = () => root.dataset.theme === 'dark' || (!root.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
function paintMode() {
  document.querySelectorAll('[data-mode-toggle]').forEach((b) => b.setAttribute('aria-checked', String(isDark())));
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', getComputedStyle(root).getPropertyValue('--space').trim());
}
document.querySelectorAll('[data-mode-toggle]').forEach((b) => b.addEventListener('click', () => {
  const next = isDark() ? 'light' : 'dark';
  root.dataset.theme = next;
  try { localStorage.setItem('mode', next); } catch (e) {}
  paintMode();
}));
paintMode();

// ---------- proyectos: los dos paneles viajan en sentidos opuestos; el título queda completo ----------
const seams = [...document.querySelectorAll('[data-seam]')];
if (!reduce && seams.length) {
  const parts = seams.map((s) => ({
    el: s,
    l: s.querySelector('.seam__pane--l'),
    r: s.querySelector('.seam__pane--r'),
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
