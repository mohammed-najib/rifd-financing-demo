import { defineConfig } from '@playwright/test';
import screens from './playwright.config';

export default defineConfig({
  ...screens,
  testMatch: '*.gates.spec.ts',
  timeout: 180_000,
  workers: 1,
  outputDir: process.env.RIFD_ACCEPTANCE_DIR
    ? `${process.env.RIFD_ACCEPTANCE_DIR}/delivery/results`
    : 'test-results/delivery',
  use: { ...screens.use, trace: 'on' },
  reporter: [
    ['list'],
    [
      'json',
      {
        outputFile: process.env.RIFD_ACCEPTANCE_DIR
          ? `${process.env.RIFD_ACCEPTANCE_DIR}/delivery/report.json`
          : 'test-results/delivery/report.json',
      },
    ],
  ],
  webServer: process.env.RIFD_GATE_SERVER === 'existing' ? [] : screens.webServer,
});
