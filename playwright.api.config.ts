import { defineConfig } from '@playwright/test'

export default defineConfig({
  outputDir: 'test-results/api',
  timeout: 60_000,
  testDir: 'tests/browser', testMatch: 'api.spec.ts', fullyParallel: false,
  use: { baseURL: 'http://127.0.0.1:4174', trace: 'retain-on-failure' },
  projects: [{ name: 'chrome', use: { channel: 'chrome' } }],
  webServer: { command: 'pnpm exec vite --config vite.api.config.ts --host 127.0.0.1 --port 4174', url: 'http://127.0.0.1:4174/tests/browser/api.html', reuseExistingServer: false },
})
