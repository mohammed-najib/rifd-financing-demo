// Only incomplete, invalid requests are ever transmitted. This cannot start a
// run, even if the deployed provider capability is accidentally enabled.
const endpoints = {
  routed: 'https://rifd-portfolio-mdnb.web.app/api/evidence-analysis',
  direct: 'https://europe-west1-rifd-portfolio-mdnb.cloudfunctions.net/liveAnalysis',
};
const cases = [
  { name: 'missing-tokens', headers: {}, status: 401, reason: 'access-denied' },
  {
    name: 'forged-tokens-and-role',
    headers: {
      Authorization: 'Bearer invalid-control-probe',
      'X-Firebase-AppCheck': 'invalid-control-probe',
      'X-Demo-Identity': 'reviewer',
      Origin: 'https://rifd-portfolio-mdnb.web.app',
      'X-Forwarded-For': '192.0.2.1, 198.51.100.1',
    },
    status: 401,
    reason: 'access-denied',
  },
  { name: 'wrong-method', method: 'GET', status: 400, reason: 'invalid-request' },
];
const idToken = process.env.LIVE_CHECK_ID_TOKEN,
  appToken = process.env.LIVE_CHECK_APP_CHECK_TOKEN;
if (idToken)
  cases.push({
    name: 'missing-app-check',
    headers: { Authorization: `Bearer ${idToken}` },
    status: 401,
    reason: 'access-denied',
  });
if (appToken)
  cases.push({
    name: 'missing-auth',
    headers: { 'X-Firebase-AppCheck': appToken },
    status: 401,
    reason: 'access-denied',
  });
if (idToken && appToken)
  cases.push({
    name: 'authenticated-arbitrary-input',
    headers: { Authorization: `Bearer ${idToken}`, 'X-Firebase-AppCheck': appToken },
    status: 400,
    reason: 'invalid-request',
  });
const report = {
  checkedAt: new Date().toISOString(),
  endpoints,
  providerAttempts: 0,
  authenticatedSchemaCheck: idToken && appToken ? 'attempted' : 'skipped-no-real-tokens',
  limitations: [
    'Invalid requests only. No valid run or inference is sent.',
    'A denial with forged tokens does not prove real App Check acceptance, trusted ingress, quotas, telemetry, cleanup or billing.',
  ],
  checks: [],
};
for (const [route, url] of Object.entries(endpoints))
  for (const check of cases) {
    try {
      const response = await globalThis.fetch(url, {
        method: check.method ?? 'POST',
        headers: { 'Content-Type': 'application/json', ...check.headers },
        body: check.method
          ? undefined
          : JSON.stringify({
              questions: { arbitrary: 'invalid fictional control probe' },
              model: 'visitor-option',
              imageUrl: 'https://example.invalid/image.png',
            }),
        redirect: 'manual',
        signal: globalThis.AbortSignal.timeout(15_000),
      });
      // Never persist response content, tokens, addresses or application input.
      const body = await response.json().catch(() => null);
      const cacheControl = response.headers.get('cache-control');
      const passed =
        response.status === check.status &&
        body?.status === 'unavailable' &&
        body?.reason === check.reason &&
        /private/.test(cacheControl ?? '') &&
        /no-store/.test(cacheControl ?? '');
      report.checks.push({
        route,
        name: check.name,
        status: response.status,
        contentType: response.headers.get('content-type'),
        cacheControl,
        passed,
      });
    } catch {
      report.checks.push({ route, name: check.name, passed: false, failure: 'request-failed' });
    }
  }
report.basicChecksPassed = report.checks.every(check => check.passed);
console.log(JSON.stringify(report, null, 2));
if (!report.basicChecksPassed) process.exitCode = 1;
