import { defineConfig } from '@playwright/test';

const webkit = {
  browserName: 'webkit' as const,
  launchOptions: { executablePath: process.env.RIFD_WEBKIT_EXECUTABLE },
};
const seed = (browser: string) => `test-results/seed/screens-${browser}.json`;

export default defineConfig({
  outputDir: process.env.RIFD_ACCEPTANCE_DIR
    ? `${process.env.RIFD_ACCEPTANCE_DIR}/screens/results`
    : 'test-results/screens',
  testDir: 'tests/browser',
  testMatch: ['screens.spec.ts', '*.screens.spec.ts'],
  fullyParallel: true,
  timeout: 60_000,
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  reporter: [
    ['list'],
    [
      'html',
      {
        open: 'never',
        outputFolder: process.env.RIFD_ACCEPTANCE_DIR
          ? `${process.env.RIFD_ACCEPTANCE_DIR}/screens/html`
          : 'playwright-report/screens',
      },
    ],
    [
      'json',
      {
        outputFile: process.env.RIFD_ACCEPTANCE_DIR
          ? `${process.env.RIFD_ACCEPTANCE_DIR}/screens/report.json`
          : 'test-results/screens/report.json',
      },
    ],
  ],
  projects: [
    {
      name: 'seed-chrome',
      testMatch: '**/seed.screens.setup.ts',
      use: { channel: 'chrome', launchOptions: { args: ['--disable-gpu'] } },
    },
    {
      name: 'seed-webkit',
      testMatch: '**/seed.screens.setup.ts',
      use: webkit,
    },
    {
      name: 'chrome',
      use: {
        channel: 'chrome',
        storageState: seed('chrome'),
        launchOptions: { args: ['--disable-gpu'] },
      },
      dependencies: ['seed-chrome'],
    },
    {
      name: 'webkit',
      use: { ...webkit, storageState: seed('webkit') },
      dependencies: ['seed-webkit'],
    },
  ],
  webServer: {
    command:
      process.env.RIFD_HOSTING === '1'
        ? 'firebase emulators:start --only hosting --project demo-rifd'
        : 'node scripts/dev/serve-static.mjs',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: process.env.RIFD_GATE_SERVER === 'existing',
  },
});
