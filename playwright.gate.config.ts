import { defineConfig } from '@playwright/test'
import screens from './playwright.config'

// Core applicant/reviewer journeys for the 10-minute gate. Visual acceptance,
// print/gallery, performance, delivery and deeper recovery runs stay in the full
// configuration. Disabling the GPU keeps headless Chrome below this host's
// memory ceiling; layout still renders through software rasterization.
const launchOptions = { args: ['--disable-gpu'] }

export default defineConfig({
  ...screens,
  projects: (screens.projects ?? []).map(project => project.name === 'firefox' || project.name === 'webkit' || project.name === 'seed-firefox' || project.name === 'seed-webkit'
    ? project
    : { ...project, use: { ...project.use, launchOptions } }),
  testMatch: [
    '**/application/application.screens.spec.ts',
    '**/application/drafts.screens.spec.ts',
    '**/application/submission.screens.spec.ts',
    '**/application/corrections.screens.spec.ts',
    '**/application/correction-response.screens.spec.ts',
    '**/review/review.screens.spec.ts',
    '**/review/decisions.screens.spec.ts',
    '**/review/queue.screens.spec.ts',
    '**/platform/screens.spec.ts',
    '**/platform/smoke.screens.spec.ts',
  ],
})