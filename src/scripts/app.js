// Hugo Buenrostro — comportamiento del sitio
import Lenis from 'lenis';

const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

// ---------- scroll suave (Lenis) ----------
let lenis = null;
if (!reduce && !navigator.webdriver) {
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

// ---------- paneles (menú y detalle) ----------
const menuEl = $('[data-menu]');
const sheetEl = $('[data-sheet]');
const openBtn = $('[data-menu-open]');
let lastFocus = null, openEl = null;
function openPanel(el, trigger) {
  if (!el) return;
  lastFocus = trigger || document.activeElement;
  el.hidden = false; openEl = el;
  if (el === menuEl) openBtn.setAttribute('aria-expanded', 'true');
  lenis && lenis.stop();
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('is-open')));
  setTimeout(() => ($('.menu__links a', el) || $('.menu__close', el)).focus(), reduce ? 0 : 350);
}
function closePanel(el) {
  if (!el || el.hidden) return;
  el.classList.remove('is-open');
  if (el === menuEl) openBtn.setAttribute('aria-expanded', 'false');
  lenis && lenis.start();
  openEl = null;
  if (el === sheetEl && location.hash) history.replaceState(null, '', location.pathname + location.search);
  setTimeout(() => { el.hidden = true; lastFocus && lastFocus.focus(); }, reduce ? 0 : 650);
}
openBtn && openBtn.addEventListener('click', () => openPanel(menuEl, openBtn));
menuEl && $$('[data-menu-close]', menuEl).forEach((b) => b.addEventListener('click', () => closePanel(menuEl)));
sheetEl && $$('[data-sheet-close]', sheetEl).forEach((b) => b.addEventListener('click', () => closePanel(sheetEl)));
$$('[data-detail]').forEach((btn) => {
  btn.setAttribute('aria-haspopup', 'dialog');
  btn.addEventListener('click', () => {
    const tpl = document.getElementById(btn.dataset.detail);
    if (!tpl || !sheetEl) return;
    $('[data-sheet-body]', sheetEl).replaceChildren(tpl.content.cloneNode(true));
    openPanel(sheetEl, btn);
    history.replaceState(null, '', `#${btn.dataset.detail}`);   // enlazable
  });
});
// abrir el panel si la URL lo indica (p. ej. /#impact-1)
if (location.hash) {
  const btn = $(`[data-detail="${CSS.escape(location.hash.slice(1))}"]`);
  if (btn) setTimeout(() => btn.click(), 400);
}
document.addEventListener('keydown', (e) => {
  if (!openEl) return;
  if (e.key === 'Escape') closePanel(openEl);
  if (e.key === 'Tab') {
    const f = $$('a, button', openEl).filter((el) => el.offsetParent !== null);
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

// ---------- anclas internas con scroll suave ----------
$$('a[href*="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || url.hash.length < 2) return;
    const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!target) return;
    e.preventDefault();
    closePanel(menuEl);
    if (lenis) lenis.scrollTo(target, { offset: -72 });
    else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    history.replaceState(null, '', url.hash);
  });
});

// ---------- barra: translúcida sobre el espacio, sólida sobre el resto ----------
const bar = $('[data-bar]');
const darkHosts = $$('[data-sky-host]');
const paintBar = () => {
  if (!bar) return;
  const y = bar.offsetHeight / 2;
  // el hero "campo de +" sigue el tema: en modo claro la barra va sólida sobre él
  const lightNow = !(root.dataset.theme === 'dark' || (!root.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches));
  const overDark = darkHosts.some((el) => { if (lightNow && el.matches('.hero--themed')) return false; const r = el.getBoundingClientRect(); return r.top <= y && r.bottom >= y; });
  bar.classList.toggle('is-solid', !overDark);
  const meta = $('[data-theme-color]');
  if (meta) meta.setAttribute('content', getComputedStyle(bar).backgroundColor === 'rgba(0, 0, 0, 0)' || overDark ? '#06070b' : getComputedStyle(root).getPropertyValue('--bg').trim());
};
addEventListener('scroll', () => requestAnimationFrame(paintBar), { passive: true });
addEventListener('resize', paintBar);
paintBar();

// ---------- tema claro / oscuro (switch en el menú) ----------
const isDark = () => root.dataset.theme === 'dark' || (!root.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
const paintMode = () => $$('[data-mode-toggle]').forEach((b) => b.setAttribute('aria-checked', String(isDark())));
$$('[data-mode-toggle]').forEach((b) => b.addEventListener('click', () => {
  const next = isDark() ? 'light' : 'dark';
  root.dataset.theme = next;
  try { localStorage.setItem('mode', next); } catch (e) {}
  paintMode();
  paintBar();
}));
paintMode();

// ---------- cursor "Ver" + relleno que nace donde está el mouse ----------
const cur = $('[data-cursor]');
if (fine && cur) {
  const label = $('[data-cursor-label]', cur);
  let x = -100, y = -100, tx = -100, ty = -100;
  addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
  const tick = () => { x += (tx - x) * 0.18; y += (ty - y) * 0.18; cur.style.translate = `${x}px ${y}px`; requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  const setPos = (el, e) => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
  };
  $$('[data-cursor-text]').forEach((el) => {
    el.addEventListener('pointerenter', (e) => { label.textContent = el.dataset.cursorText; cur.classList.add('is-on'); setPos(el, e); });
    el.addEventListener('pointermove', (e) => setPos(el, e));
    el.addEventListener('pointerleave', () => cur.classList.remove('is-on'));
  });
}

// ---------- footer: la tarjeta entra al 100 % del ancho y se reduce ----------
const foot = $('.foot');
if (foot) {
  const paintFoot = () => {
    const r = foot.getBoundingClientRect(), vh = innerHeight;
    let p = reduce ? 1 : Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.55)));
    p = 1 - Math.pow(1 - p, 3);
    const full = document.documentElement.clientWidth / r.width;
    foot.style.setProperty('--foot-s', (full + (1 - full) * p).toFixed(4));
    foot.style.setProperty('--foot-r', `${(2 + 20 * p).toFixed(1)}px`);
  };
  addEventListener('scroll', () => requestAnimationFrame(paintFoot), { passive: true });
  addEventListener('resize', paintFoot);
  paintFoot();
}

// ---------- experiencia: "Ver más" / "Ver menos" ----------
$$('.job').forEach((d) => {
  const more = $('.job__more', d);
  d.addEventListener('toggle', () => { more.textContent = d.open ? more.dataset.less : more.dataset.more; });
});

// ---------- proyectos: los dos paneles viajan en sentidos opuestos ----------
const seams = $$('[data-seam]');
if (!reduce && seams.length) {
  const parts = seams.map((s) => ({ el: s, l: $('.seam__pane--l', s), r: $('.seam__pane--r', s) }));
  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = innerHeight;
    for (const p of parts) {
      const rect = p.el.getBoundingClientRect();
      if (rect.bottom < -vh || rect.top > 2 * vh) continue;
      const k = 0.5 - Math.min(1, Math.max(0, (vh - rect.top) / (rect.height + vh)));
      p.l.style.transform = `translate3d(0, ${k * 30}svh, 0)`;
      p.r.style.transform = `translate3d(0, ${-k * 30}svh, 0)`;
    }
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  update();
}

// ---------- comparador antes / después ----------
$$('[data-compare]').forEach((c) => {
  const input = $('input[type="range"]', c);
  const set = () => c.style.setProperty('--pos', `${input.value}%`);
  input.addEventListener('input', set);
  set();
});

// ---------- video: sin reproducción automática si se pidió menos movimiento; con pausa ----------
$$('[data-autoplay]').forEach((v) => {
  const btn = v.parentElement.querySelector('[data-video-toggle]');
  const sync = () => { if (btn) btn.textContent = v.paused ? btn.dataset.play : btn.dataset.pause; };
  if (!reduce) v.play().catch(() => {});
  sync();
  btn && btn.addEventListener('click', () => { v.paused ? v.play() : v.pause(); });
  v.addEventListener('play', sync); v.addEventListener('pause', sync);
});

// ---------- formulario de contacto ----------
const form = $('[data-contact-form]');
if (form) {
  const status = $('[data-form-status]', form);
  const btn = $('button[type="submit"]', form);
  const msgs = JSON.parse(form.dataset.messages);
  const showError = (field, text) => {
    const err = $(`#${field.id}-error`, form);
    field.setAttribute('aria-invalid', text ? 'true' : 'false');
    if (err) err.textContent = text || '';
  };
  let dirty = false;
  form.addEventListener('input', () => { dirty = true; });
  addEventListener('beforeunload', (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let firstBad = null;
    for (const field of $$('[required]', form)) {
      let text = '';
      if (!field.value.trim()) text = msgs.required;
      else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim())) text = msgs.invalidEmail;
      showError(field, text);
      if (text && !firstBad) firstBad = field;
    }
    if (firstBad) { firstBad.focus(); return; }
    btn.disabled = true; btn.textContent = msgs.sending; status.dataset.state = ''; status.textContent = '';
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(String(res.status));
      form.reset(); dirty = false;
      status.dataset.state = 'ok'; status.textContent = msgs.success;
    } catch (err) {
      status.dataset.state = 'error';
      status.innerHTML = `${msgs.error} <a href="mailto:${msgs.email}">${msgs.email}</a>.`;
    } finally {
      btn.disabled = false; btn.textContent = msgs.send;
    }
  });
}

// ---------- sugerencia de idioma (no redirige; recuerda la elección) ----------
const hint = $('[data-lang-hint]');
if (hint) {
  let seen = null;
  try { seen = localStorage.getItem('lang-choice'); } catch (e) {}
  const pageLang = root.lang.startsWith('en') ? 'en' : 'es';
  const prefers = (navigator.languages || [navigator.language]).map((l) => l.slice(0, 2));
  const wants = prefers.find((l) => l === 'es' || l === 'en');
  if (!seen && wants && wants !== pageLang) setTimeout(() => hint.classList.add('is-on'), 1800);
  const remember = (v) => { try { localStorage.setItem('lang-choice', v); } catch (e) {} };
  $('a', hint).addEventListener('click', () => remember(wants));
  $('button', hint).addEventListener('click', () => { remember(pageLang); hint.classList.remove('is-on'); });
}
$$('[data-lang-switch]').forEach((a) => a.addEventListener('click', () => { try { localStorage.setItem('lang-choice', a.hreflang); } catch (e) {} }));

// ---------- entradas al hacer scroll (una vez) ----------
(() => {
  const targets = $$('[data-reveal]');
  if (!('IntersectionObserver' in window)) { targets.forEach((el) => el.classList.add('is-in')); return; }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
  targets.forEach((el) => io.observe(el));
  addEventListener('load', () => setTimeout(() => targets.forEach((el) => {
    const r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) el.classList.add('is-in');
  }), 2500));
})();
