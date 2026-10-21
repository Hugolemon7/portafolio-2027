import { defineConfig, devices } from '@playwright/test';

// Pruebas del sitio ya compilado (npm run build) servido como estático.
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: [['list']],
  use: { baseURL: 'http://localhost:4410', channel: 'chrome' },
  webServer: { command: 'node tests/serve.mjs', url: 'http://localhost:4410', reuseExistingServer: true },
  projects: [
    { name: 'escritorio', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
    { name: 'movil', use: { ...devices['Pixel 7'], channel: 'chrome' } },
  ],
});
