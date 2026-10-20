// Hugo Buenrostro — maqueta Etapa 3, ronda 3
const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

// ---------- scroll suave (Lenis) ----------
let lenis = null;
if (!reduce && window.Lenis && !navigator.webdriver) {
  lenis = new Lenis({ duration: 1.1, smoothWheel: true });
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
    closePanel(menuEl, openBtn);
    if (lenis) lenis.scrollTo(target, { offset: -72 });
    else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    history.replaceState(null, '', id);
  });
});

// ---------- barra: translúcida sobre el espacio (hero y cierre), sólida sobre el resto ----------
const bar = document.querySelector('[data-bar]');
const darkHosts = [...document.querySelectorAll('[data-sky-host]')];
const paintBar = () => {
  const y = bar.offsetHeight / 2;
  const overDark = darkHosts.some((el) => { const r = el.getBoundingClientRect(); return r.top <= y && r.bottom >= y; });
  bar.classList.toggle('is-solid', !overDark);
};
addEventListener('scroll', () => requestAnimationFrame(paintBar), { passive: true });
addEventListener('resize', paintBar);
paintBar();

// ---------- paneles (menú y detalle) ----------
const menuEl = document.querySelector('[data-menu]');
const sheetEl = document.querySelector('[data-sheet]');
const openBtn = document.querySelector('[data-menu-open]');
let lastFocus = null, openEl = null;
function openPanel(el, trigger) {
  lastFocus = trigger || document.activeElement;
  el.hidden = false; openEl = el;
  if (el === menuEl) openBtn.setAttribute('aria-expanded', 'true');
  lenis && lenis.stop();
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('is-open')));
  setTimeout(() => (el.querySelector('.menu__links a') || el.querySelector('[data-sheet-close].menu__close') || el.querySelector('button')).focus(), reduce ? 0 : 350);
}
function closePanel(el) {
  if (!el || el.hidden) return;
  el.classList.remove('is-open');
  if (el === menuEl) openBtn.setAttribute('aria-expanded', 'false');
  lenis && lenis.start();
  openEl = null;
  setTimeout(() => { el.hidden = true; lastFocus && lastFocus.focus(); }, reduce ? 0 : 650);
}
openBtn.addEventListener('click', () => openPanel(menuEl, openBtn));
menuEl.querySelectorAll('[data-menu-close]').forEach((b) => b.addEventListener('click', () => closePanel(menuEl)));
sheetEl.querySelectorAll('[data-sheet-close]').forEach((b) => b.addEventListener('click', () => closePanel(sheetEl)));
document.querySelectorAll('[data-detail]').forEach((btn) => {
  btn.setAttribute('aria-haspopup', 'dialog');
  btn.addEventListener('click', () => {
    const tpl = document.getElementById(btn.dataset.detail);
    sheetEl.querySelector('[data-sheet-body]').replaceChildren(tpl.content.cloneNode(true));
    openPanel(sheetEl, btn);
  });
});
document.addEventListener('keydown', (e) => {
  if (!openEl) return;
  if (e.key === 'Escape') closePanel(openEl);
  if (e.key === 'Tab') {
    const f = [...openEl.querySelectorAll('a, button')].filter((el) => el.offsetParent !== null);
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

// ---------- tema claro / oscuro (switch en el menú) ----------
const isDark = () => root.dataset.theme === 'dark' || (!root.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
const paintMode = () => document.querySelectorAll('[data-mode-toggle]').forEach((b) => b.setAttribute('aria-checked', String(isDark())));
document.querySelectorAll('[data-mode-toggle]').forEach((b) => b.addEventListener('click', () => {
  const next = isDark() ? 'light' : 'dark';
  root.dataset.theme = next;
  try { localStorage.setItem('mode', next); } catch (e) {}
  paintMode();
}));
paintMode();

// ---------- cursor "Ver" + relleno que nace donde está el mouse ----------
if (fine) {
  const cur = document.querySelector('[data-cursor]');
  const label = cur.querySelector('[data-cursor-label]');
  let x = -100, y = -100, tx = -100, ty = -100;
  addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
  const tick = () => { x += (tx - x) * 0.18; y += (ty - y) * 0.18; cur.style.translate = `${x}px ${y}px`; requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  document.querySelectorAll('[data-cursor-text]').forEach((el) => {
    el.addEventListener('pointerenter', (e) => {
      label.textContent = el.dataset.cursorText; cur.classList.add('is-on');
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
      el.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
    });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
      el.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
    });
    el.addEventListener('pointerleave', () => cur.classList.remove('is-on'));
  });
}

// ---------- experiencia: "Ver más" / "Ver menos" ----------
document.querySelectorAll('.job').forEach((d) => {
  const more = d.querySelector('.job__more');
  d.addEventListener('toggle', () => { more.textContent = d.open ? 'Ver menos' : 'Ver más'; });
});

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
