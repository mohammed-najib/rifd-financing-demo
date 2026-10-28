import { defineConfig } from '@playwright/test'

export default defineConfig({
  outputDir: process.env.RIFD_ACCEPTANCE_DIR ? `${process.env.RIFD_ACCEPTANCE_DIR}/api/results` : 'test-results/api',
  timeout: 60_000,
  testDir: 'tests/browser', testMatch: ['api.spec.ts', '*.api.spec.ts'], fullyParallel: true,
  use: { baseURL: 'http://127.0.0.1:4174', trace: 'retain-on-failure' },
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: process.env.RIFD_ACCEPTANCE_DIR ? `${process.env.RIFD_ACCEPTANCE_DIR}/api/html` : 'playwright-report/api' }],
    ['json', { outputFile: process.env.RIFD_ACCEPTANCE_DIR ? `${process.env.RIFD_ACCEPTANCE_DIR}/api/report.json` : 'test-results/api/report.json' }],
  ],
  projects: [
    { name: 'seed', testMatch: '**/seed.api.setup.ts', use: { channel: 'chrome', launchOptions: { args: ['--disable-gpu'] } } },
    { name: 'seed-full', testMatch: '**/seed.api-full.setup.ts', use: { channel: 'chrome', launchOptions: { args: ['--disable-gpu'] } }, dependencies: ['seed'] },
    { name: 'chrome', use: { channel: 'chrome', storageState: 'test-results/seed/api.json', launchOptions: { args: ['--disable-gpu'] } }, dependencies: ['seed', 'seed-full'] },
  ],
  webServer: { command: 'pnpm exec vite --config vite.api.config.ts --host 127.0.0.1 --port 4174', url: 'http://127.0.0.1:4174/tests/browser/support/api.html', reuseExistingServer: false },
})