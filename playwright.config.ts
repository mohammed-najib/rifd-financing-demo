import { defineConfig } from '@playwright/test'

export default defineConfig({
  outputDir: process.env.RIFD_ACCEPTANCE_DIR ? `${process.env.RIFD_ACCEPTANCE_DIR}/screens/results` : 'test-results/screens',
  testDir: 'tests/browser', testMatch: ['screens.spec.ts', '*.screens.spec.ts'], fullyParallel: false,
  timeout: 60_000,
  use: { baseURL: 'http://127.0.0.1:4173', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: process.env.RIFD_ACCEPTANCE_DIR ? `${process.env.RIFD_ACCEPTANCE_DIR}/screens/html` : 'playwright-report/screens' }],
    ['json', { outputFile: process.env.RIFD_ACCEPTANCE_DIR ? `${process.env.RIFD_ACCEPTANCE_DIR}/screens/report.json` : 'test-results/screens/report.json' }],
  ],
  projects: [
    { name: 'chrome', use: { channel: 'chrome' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit', launchOptions: { executablePath: process.env.RIFD_WEBKIT_EXECUTABLE } } },
  ],
  webServer: {
    command: process.env.RIFD_HOSTING === '1'
      ? 'firebase emulators:start --only hosting --project demo-rifd'
      : 'node scripts/serve-static.mjs',
    url: 'http://127.0.0.1:4173', reuseExistingServer: process.env.RIFD_GATE_SERVER === 'existing',
  },
})
