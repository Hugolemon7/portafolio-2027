// @ts-check
import { defineConfig } from 'astro/config';
import markdoc from '@astrojs/markdoc';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';

export default defineConfig({
  // cambia a tu dominio cuando lo conectes (Etapa 7)
  site: 'https://hugo-buenrostro.vercel.app',
  output: 'static',
  adapter: vercel(),
  integrations: [react(), markdoc(), keystatic(), sitemap({ i18n: { defaultLocale: 'es', locales: { es: 'es-MX', en: 'en-US' } }, filter: (page) => !page.includes('/keystatic') })],
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  prefetch: { prefetchAll: true },
});
