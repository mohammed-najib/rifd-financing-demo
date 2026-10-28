import { createServer } from 'node:http';
import { expect, test } from 'vitest';
import { createAdmission } from '../../src/live-assistance/server/admission';
import { createLiveService } from '../../src/live-assistance/server/service';
import { input, memoryStore, native, stageRequest } from './fixtures';

test('local direct and Hosting routes share authorization, deduplication and non-cacheable responses', async () => {
  let dispatched = 0;
  const handle = createLiveService({
    admission: createAdmission(memoryStore(), 'dummy-key-with-at-least-thirty-two-bytes'),
    authorize: async (auth, app) => {
      if (auth !== 'Bearer dummy-auth' || app !== 'dummy-app') throw Error();
      return 'guest';
    },
    execute: async (request, work) => {
      await work.evaluate(stageRequest(request), async () => async () => {
        dispatched++;
        return native;
      });
    },
  });
  const server = createServer(async (request, response) => {
    const chunks = [];
    for await (const chunk of request) chunks.push(Buffer.from(chunk));
    const reply = await handle({
      path: request.url,
      body: Buffer.concat(chunks),
      network: '192.0.2.1',
      authorization: request.headers.authorization,
      appCheck: request.headers['x-firebase-appcheck'] as string | undefined,
    });
    response.writeHead(reply.status, reply.headers);
    response.end(JSON.stringify(reply.body));
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const address = server.address();
    if (!address || typeof address === 'string') throw Error('local-listener');
    const base = `http://127.0.0.1:${address.port}`;
    for (const path of ['/liveAnalysis', '/api/evidence-analysis']) {
      const denied = await fetch(`${base}${path}`, {
        method: 'POST',
        body: JSON.stringify(input()),
        headers: {
          'Content-Type': 'application/json',
          Origin: 'https://fictional-demo.example',
          'X-Demo-Identity': 'reviewer',
        },
      });
      expect(denied.status).toBe(401);
      expect(denied.headers.get('cache-control')).toBe('private, no-store, max-age=0');
    }
    const body = JSON.stringify(input());
    const headers = {
      'Content-Type': 'application/json',
      Authorization: 'Bearer dummy-auth',
      'X-Firebase-AppCheck': 'dummy-app',
    };
    const first = await fetch(`${base}/liveAnalysis`, { method: 'POST', body, headers });
    expect(await first.json()).toMatchObject({ status: 'completed', stages: [{ answer: native }] });
    const duplicate = await fetch(`${base}/api/evidence-analysis`, {
      method: 'POST',
      body,
      headers,
    });
    expect(await duplicate.json()).toEqual({ status: 'duplicate', completion: 'completed' });
    expect(dispatched).toBe(1);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close(error => (error ? reject(error) : resolve()));
      server.closeAllConnections();
    });
  }
});
