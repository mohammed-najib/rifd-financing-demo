import { defineConfig } from '@playwright/test';
import api from './playwright.api.config';

// Core operation paths for the 10-minute gate. Exhaustive assistance,
// retention, recovery and UI matrices remain in playwright.api.config.ts.
export default defineConfig({
  ...api,
  timeout: 90_000,
  testMatch: [
    '**/application/application.api.spec.ts',
    '**/application/drafts.api.spec.ts',
    '**/application/submission.api.spec.ts',
    '**/application/corrections.api.spec.ts',
    '**/application/correction-response.api.spec.ts',
    '**/review/review.api.spec.ts',
    '**/review/decisions.api.spec.ts',
    '**/review/queue.api.spec.ts',
    '**/assistance/saved-demonstrations.api.spec.ts',
    '**/platform/api.spec.ts',
    '**/platform/sessions.api.spec.ts',
    '**/platform/sync.api.spec.ts',
  ],
});
