import { defineConfig } from '@playwright/test'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const origin = process.env.RIFD_HOSTED_ORIGIN
if (!origin || !process.env.RIFD_HOSTED_RESULTS || !/^https:\/\/rifd-portfolio-mdnb(?:--rifd-review-[a-z0-9-]+)?\.web\.app$/.test(origin)) {
  throw new Error('Set RIFD_HOSTED_ORIGIN to the RIFD live or review HTTPS origin and RIFD_HOSTED_RESULTS to a fresh artifact directory.')
}
const directory = resolve(process.env.RIFD_HOSTED_RESULTS)

// Reuse accepted screen and delivery checks against Hosting, without a local server.
export default defineConfig({
  testDir: fileURLToPath(new URL('../../../../tests/browser', import.meta.url)),
  testMatch: ['delivery.gates.spec.ts', 'submission.screens.spec.ts', 'resubmission.screens.spec.ts', 'decisions.screens.spec.ts', 'reset.screens.spec.ts', 'drafts.screens.spec.ts', 'notifications.screens.spec.ts'],
  grep: /public static deep links|protected direct links|complete first submission, linked validation|resubmission publishes changed targets|first submission through approval|a new young business submits|cancel and aborted reset|draft saves incomplete text|notification/,
  timeout: 180_000,
  workers: 3,
  retries: 0,
  outputDir: `${directory}/results`,
  metadata: { origin, releaseCommit: '1352c140782168ce9e77773547e35658c19cff45' },
  use: { baseURL: origin, trace: 'on', screenshot: 'only-on-failure' },
  reporter: [['list'], ['json', { outputFile: `${directory}/report.json` }]],
  projects: [
    { name: 'chrome', use: { channel: 'chrome' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit', launchOptions: { executablePath: process.env.RIFD_WEBKIT_EXECUTABLE } } },
  ],
})
