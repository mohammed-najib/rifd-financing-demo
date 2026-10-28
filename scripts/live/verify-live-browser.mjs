import { chromium } from '@playwright/test';
import { applicationDefault } from 'firebase-admin/app';
import { readFile, readdir } from 'node:fs/promises';
import { setTimeout } from 'node:timers/promises';

const revoke = process.argv.includes('--revoke-test-session');
if (process.argv.slice(2).some(value => value !== '--revoke-test-session'))
  throw Error('Unknown option');
const env = await readFile('.env.production.local', 'utf8');
const value = name =>
  env
    .split('\n')
    .find(line => line.startsWith(`${name}=`))
    ?.slice(name.length + 1);
const configuration = JSON.parse(value('VITE_LIVE_FIREBASE_CONFIG'));
const siteKey = value('VITE_LIVE_RECAPTCHA_ENTERPRISE_SITE_KEY');
const moduleFile = (await readdir('dist/client/assets')).find(file =>
  /^firebase-client-.+\.js$/.test(file),
);
const endpoints = {
  routed: 'https://rifd-portfolio-mdnb.web.app/api/evidence-analysis',
  direct: 'https://europe-west1-rifd-portfolio-mdnb.cloudfunctions.net/liveAnalysis',
};
// This request is deliberately incomplete, with forbidden keys and no source
// image. It cannot reserve or dispatch a run, even if inference is enabled.
const invalidInput = JSON.stringify({
  questions: { arbitrary: 'fictional control probe' },
  model: 'visitor-option',
  imageUrl: 'https://example.invalid/image.png',
});
const report = {
  checkedAt: new Date().toISOString(),
  providerAttempts: 0,
  method:
    'Real deployed browser bundle and reCAPTCHA Enterprise; no debug or custom App Check token',
  checks: [],
};
async function probe(route, url, check) {
  const response = await globalThis.fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...check.headers },
    body: invalidInput,
    signal: globalThis.AbortSignal.timeout(20_000),
  });
  const body = await response.json().catch(() => null);
  const cacheControl = response.headers.get('cache-control');
  report.checks.push({
    route,
    name: check.name,
    status: response.status,
    cacheControl,
    passed:
      response.status === check.status &&
      body?.status === 'unavailable' &&
      body?.reason === check.reason &&
      /private/.test(cacheControl ?? '') &&
      /no-store/.test(cacheControl ?? ''),
  });
}
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage();
  await page.goto('https://rifd-portfolio-mdnb.web.app/', { waitUntil: 'domcontentloaded' });
  const acquired = await page.evaluate(
    async ({ configuration, siteKey, moduleFile }) => {
      try {
        const { guestCredentials } = await import(`/assets/${moduleFile}`);
        return { credentials: await guestCredentials(configuration, siteKey) };
      } catch (error) {
        return {
          errorCode: typeof error.code === 'string' ? error.code : 'credential-acquisition-failed',
        };
      }
    },
    { configuration, siteKey, moduleFile },
  );
  report.credentialAcquisition = acquired.credentials ? 'passed' : 'failed';
  if (acquired.errorCode) report.errorCode = acquired.errorCode;
  if (acquired.credentials) {
    const credentials = acquired.credentials;
    const headers = {
      Authorization: credentials.authorization,
      'X-Firebase-AppCheck': credentials.appCheck,
    };
    for (const [route, url] of Object.entries(endpoints)) {
      for (const check of [
        {
          name: 'missing-app-check',
          headers: { Authorization: credentials.authorization },
          status: 401,
          reason: 'access-denied',
        },
        {
          name: 'missing-auth',
          headers: { 'X-Firebase-AppCheck': credentials.appCheck },
          status: 401,
          reason: 'access-denied',
        },
        { name: 'authenticated-arbitrary-input', headers, status: 400, reason: 'invalid-request' },
      ])
        await probe(route, url, check);
    }
    if (revoke) {
      // Revoke only the anonymous identity this disposable browser just created.
      // Tokens and the raw Auth ID stay in memory and never enter this report.
      const claims = JSON.parse(
        Buffer.from(credentials.authorization.slice(7).split('.')[1], 'base64url').toString(),
      );
      await setTimeout(1200);
      const operatorToken =
        process.env.RIFD_OPERATOR_ACCESS_TOKEN ??
        (await applicationDefault().getAccessToken()).access_token;
      const revocation = await globalThis.fetch(
        'https://identitytoolkit.googleapis.com/v1/projects/rifd-portfolio-mdnb/accounts:update',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${operatorToken}`,
            'Content-Type': 'application/json',
            'x-goog-user-project': 'rifd-portfolio-mdnb',
          },
          body: JSON.stringify({ localId: claims.sub, validSince: Math.floor(Date.now() / 1000) }),
          signal: globalThis.AbortSignal.timeout(20_000),
        },
      );
      if (!revocation.ok) throw Error('test-session-revocation-failed');
      for (const [route, url] of Object.entries(endpoints))
        await probe(route, url, {
          name: 'revoked-anonymous-session',
          headers,
          status: 401,
          reason: 'access-denied',
        });
    }
  }
} catch {
  report.failure = 'browser-or-request-failed';
} finally {
  await browser.close();
}
report.passed =
  report.credentialAcquisition === 'passed' &&
  report.checks.length === (revoke ? 8 : 6) &&
  report.checks.every(check => check.passed);
console.log(JSON.stringify(report, null, 2));
if (!report.passed) process.exitCode = 1;
