import { test, expect, type Page } from '@playwright/test';

const pages = [
  { es: '/', en: '/en/' },
  { es: '/proyectos/', en: '/en/work/' },
  { es: '/proyectos/wiggot/', en: '/en/work/wiggot/' },
  { es: '/proyectos/monopolio/', en: '/en/work/monopolio/' },
  { es: '/proyectos/emprendete/', en: '/en/work/emprendete/' },
  { es: '/proyectos/convencion/', en: '/en/work/convencion/' },
  { es: '/proyectos/contpaqi-connection/', en: '/en/work/contpaqi-connection/' },
  { es: '/proyectos/web-capire-verde-botella/', en: '/en/work/web-capire-verde-botella/' },
  { es: '/sobre-mi/', en: '/en/about/' },
  { es: '/contacto/', en: '/en/contact/' },
];

// el aviso de idioma depende del idioma del navegador; aquí lo damos por elegido
async function quiet(page: Page) {
  await page.addInitScript(() => { try { localStorage.setItem('lang-choice', 'set'); } catch {} });
}

for (const pair of pages) {
  for (const lang of ['es', 'en'] as const) {
    const url = pair[lang];
    test(`${url} carga bien`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
      await quiet(page);
      const res = await page.goto(url);
      expect(res?.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', lang === 'es' ? 'es-MX' : 'en');
      await expect(page.locator('h1')).toHaveCount(1);
      // la versión en el otro idioma existe y está enlazada
      const other = lang === 'es' ? pair.en : pair.es;
      const alt = await page.locator(`link[rel="alternate"][hreflang="${lang === 'es' ? 'en' : 'es-MX'}"]`).getAttribute('href');
      expect(new URL(alt!).pathname).toBe(other);
      await expect(page.locator(`.bar__lang`)).toHaveAttribute('href', other);
      // sin desborde horizontal
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);
      // todas las imágenes tienen alt
      expect(await page.locator('img:not([alt])').count()).toBe(0);
      await page.waitForLoadState('networkidle');
      expect(errors).toEqual([]);
    });
  }
}

test('cambiar de idioma lleva a la página equivalente', async ({ page }) => {
  await quiet(page);
  await page.goto('/proyectos/wiggot/');
  const short = page.locator('.bar__lang');
  if (await short.isVisible()) await short.click();
  else {   // en móvil el cambio de idioma vive en el menú
    await page.locator('[data-menu-open]').click();
    await page.locator('.menu__row a[hreflang="en"]').click();
  }
  await expect(page).toHaveURL(/\/en\/work\/wiggot\/$/);
  await expect(page.locator('h1')).toHaveText('Wiggot');
});

test('el menú abre, atrapa el foco y cierra con Escape', async ({ page }) => {
  await quiet(page);
  await page.goto('/');
  const btn = page.locator('[data-menu-open]');
  await btn.click();
  await expect(page.locator('[data-menu]')).toBeVisible();
  await expect(btn).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-menu]')).toBeHidden();
  await expect(btn).toBeFocused();
});

test('el modo oscuro se activa desde la barra y se recuerda', async ({ page }) => {
  await quiet(page);
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  const sw = page.locator('.bar [data-mode-toggle]');
  await expect(sw).toHaveAttribute('aria-checked', 'false');
  await sw.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('las tarjetas de impacto abren su panel y es enlazable', async ({ page }) => {
  await quiet(page);
  await page.goto('/');
  await page.locator('.card').nth(1).click();
  const sheet = page.locator('[data-sheet]');
  await expect(sheet).toBeVisible();
  await expect(sheet.locator('.sheet__title')).toHaveText('40% reconstruido');
  await expect(page).toHaveURL(/#impact-1$/);
  await page.keyboard.press('Escape');
  await expect(sheet).toBeHidden();
  await page.goto('about:blank');
  await page.goto('/#method-2');
  await expect(sheet.locator('.sheet__title')).toHaveText('Working Backwards');
});

test('"Ver más" despliega el detalle del puesto', async ({ page }) => {
  await quiet(page);
  await page.goto('/');
  const job = page.locator('.job').first();
  await job.locator('summary').click();
  await expect(job).toHaveAttribute('open', '');
  await expect(job.locator('.job__more')).toHaveText('Ver menos');
  await expect(job.locator('.job__text p').first()).toBeVisible();
});

test('el comparador antes/después responde al teclado', async ({ page }) => {
  await quiet(page);
  await page.goto('/proyectos/wiggot/');
  const cmp = page.locator('[data-compare]').first();
  await cmp.scrollIntoViewIfNeeded();
  await cmp.locator('input[type="range"]').focus();
  for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowRight');
  expect(await cmp.evaluate((el) => getComputedStyle(el).getPropertyValue('--pos').trim())).toBe('55%');
});

test('el formulario valida antes de enviar', async ({ page }) => {
  await quiet(page);
  await page.goto('/contacto/');
  await page.locator('button[type="submit"]').click();
  await expect(page.locator('#f-name')).toBeFocused();
  await expect(page.locator('#f-name-error')).toHaveText('Este campo es obligatorio.');
  await page.fill('#f-name', 'Ana');
  await page.fill('#f-email', 'ana@');
  await page.fill('#f-message', 'Hola');
  await page.locator('button[type="submit"]').click();
  await expect(page.locator('#f-email')).toBeFocused();
  await expect(page.locator('#f-email-error')).toContainText('correo válido');
});

test('una ruta inexistente muestra la página 404', async ({ page }) => {
  const res = await page.goto('/no-existe/');
  expect(res?.status()).toBe(404);
  await expect(page.locator('h1')).toContainText('espacio');
});

test('el sitemap incluye ambos idiomas y no el panel', async ({ request }) => {
  const idx = await (await request.get('/sitemap-index.xml')).text();
  const loc = idx.match(/<loc>([^<]+)<\/loc>/)![1];
  const sm = await (await request.get(new URL(loc).pathname)).text();
  expect(sm).toContain('/en/work/wiggot/');
  expect(sm).toContain('/proyectos/wiggot/');
  expect(sm).not.toContain('keystatic');
});
