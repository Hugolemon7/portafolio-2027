import { defineConfig, devices } from '@playwright/test';

// Pruebas del sitio: por defecto sobre el build local; con BASE_URL=https://… prueban el sitio publicado.
const remote = process.env.BASE_URL;
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: [['list']],
  use: { baseURL: remote || 'http://localhost:4410', channel: 'chrome' },
  webServer: remote ? undefined : { command: 'node tests/serve.mjs', url: 'http://localhost:4410', reuseExistingServer: true },
  projects: [
    { name: 'escritorio', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
    { name: 'movil', use: { ...devices['Pixel 7'], channel: 'chrome' } },
  ],
});
