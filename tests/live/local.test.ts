import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { request as httpRequest } from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { expect, test } from 'vitest';
import { startLocalJev } from '../../src/live-assistance/server/local-server';
import { localMetadata } from '../../src/live-assistance/server/local-store';
import { input } from './fixtures';
import { nativeIdentity } from '../browser/support/evidence-transport';

const origin = 'http://127.0.0.1:5194';
const headers = { Origin: origin, Host: new URL(origin).host, 'Content-Type': 'application/json' };
const post = (target: string, path: string, value: unknown, extra: Record<string, string> = {}) =>
  new Promise<Response>((resolve, reject) => {
    const request = httpRequest(
      `${target}${path}`,
      { method: 'POST', headers: { ...headers, ...extra } },
      response => {
        const chunks: Buffer[] = [],
          resultHeaders = new Headers();
        for (const [key, value] of Object.entries(response.headers))
          for (const item of Array.isArray(value) ? value : value ? [value] : [])
            resultHeaders.append(key, item);
        response.on('data', chunk => chunks.push(Buffer.from(chunk)));
        response.on('error', reject);
        response.on('end', () =>
          resolve(
            new Response(Buffer.concat(chunks), {
              status: response.statusCode,
              headers: resultHeaders,
            }),
          ),
        );
      },
    );
    request.on('error', reject);
    request.end(JSON.stringify(value));
  });

test('local inference requires same-origin signed credentials and survives restart without redispatch or key storage', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'rifd-local-jev-')),
    statePath = join(directory, 'metadata.sqlite');
  let calls = 0;
  const options = {
    apiKey: 'dummy-local-provider-key',
    origin,
    statePath,
    fetch: async () => {
      calls++;
      return Response.json(nativeIdentity());
    },
  };
  let local = await startLocalJev(options);
  try {
    const rejectedHeaders: Record<string, string>[] = [
      { Origin: 'https://elsewhere.example' },
      { Host: 'elsewhere.example' },
      { 'Sec-Fetch-Site': 'cross-site' },
    ];
    for (const extra of rejectedHeaders) {
      expect((await post(local.target, '/api/local-evidence-session', {}, extra)).status).toBe(401);
    }
    expect((await post(local.target, '/api/evidence-analysis', input())).status).toBe(401);
    const session = await post(local.target, '/api/local-evidence-session', {});
    expect(session.headers.get('set-cookie')).toContain('HttpOnly; SameSite=Strict');
    const tokens = (await session.json()) as { authorization: string; appCheck: string };
    expect(JSON.stringify(tokens)).not.toContain(options.apiKey);
    const auth = { Authorization: tokens.authorization, 'X-Firebase-AppCheck': tokens.appCheck };
    const request = input();
    expect(
      (
        await post(
          local.target,
          '/api/evidence-analysis',
          { ...request, prompt: 'arbitrary work' },
          auth,
        )
      ).status,
    ).toBe(400);
    expect(calls).toBe(0);
    const result = await post(local.target, '/api/evidence-analysis', request, auth);
    expect(result.headers.get('cache-control')).toContain('no-store');
    expect(await result.json()).toMatchObject({
      status: 'completed',
      stages: [{ stage: 'combined-page-declaration' }],
    });
    expect(calls).toBe(1);
    await local.close();
    local = await startLocalJev(options);
    const restored = await post(
      local.target,
      '/api/local-evidence-session',
      {},
      { Cookie: session.headers.get('set-cookie')!.split(';')[0] },
    );
    expect(await restored.json()).toEqual(tokens);
    expect(
      await (await post(local.target, '/api/evidence-analysis', request, auth)).json(),
    ).toEqual({ status: 'duplicate', completion: 'completed' });
    expect(
      await (
        await post(
          local.target,
          '/api/evidence-analysis',
          { ...request, runId: `${new Date().toISOString().slice(0, 10)}.${randomUUID()}` },
          auth,
        )
      ).json(),
    ).toMatchObject({ reason: 'guest-rate' });
    expect(calls).toBe(1);
    const stored = await readFile(statePath);
    expect(stored.includes(Buffer.from(options.apiKey))).toBe(false);
    expect(stored.includes(Buffer.from('Fictional Person'))).toBe(false);
  } finally {
    await local.close();
    await rm(directory, { recursive: true, force: true });
  }
});

test('local unknown usage stops further inference across a restart and missing controls cannot be recreated', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'rifd-local-jev-')),
    statePath = join(directory, 'metadata.sqlite');
  let calls = 0;
  const options = {
    apiKey: 'dummy-local-provider-key',
    origin,
    statePath,
    fetch: async () => {
      calls++;
      return Response.json({ ...nativeIdentity(), usage: null });
    },
  };
  let local = await startLocalJev(options);
  try {
    const tokens = (await (await post(local.target, '/api/local-evidence-session', {})).json()) as {
      authorization: string;
      appCheck: string;
    };
    const auth = { Authorization: tokens.authorization, 'X-Firebase-AppCheck': tokens.appCheck };
    const request = input();
    expect(
      await (await post(local.target, '/api/evidence-analysis', request, auth)).json(),
    ).toMatchObject({ status: 'unavailable', reason: 'accounting-unavailable' });
    await local.close();
    local = await startLocalJev(options);
    expect(
      await (
        await post(
          local.target,
          '/api/evidence-analysis',
          { ...request, runId: `${new Date().toISOString().slice(0, 10)}.${randomUUID()}` },
          auth,
        )
      ).json(),
    ).toMatchObject({ reason: 'accounting-unavailable' });
    expect(calls).toBe(1);
  } finally {
    await local.close();
  }
  try {
    const db = new DatabaseSync(statePath);
    db.exec("DELETE FROM metadata WHERE key = 'control'");
    db.close();
    expect(() => localMetadata(statePath)).toThrow('Missing local admission control');
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
