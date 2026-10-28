import { createHmac, timingSafeEqual } from 'node:crypto';
import { isIP } from 'node:net';
import { z } from 'zod';

const policySchema = z
  .object({
    profile: z.literal('cloud-run-v2'),
    authority: z.string().regex(/^[a-z0-9-]+\.cloudfunctions\.net$/),
    peers: z.array(z.string()).min(1).max(8),
  })
  .strict();
const proofSchema = z
  .object({
    day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    guest: z.string().regex(/^[a-f0-9]{64}$/),
    network: z.string().regex(/^[a-f0-9]{64}$/),
  })
  .strict();

function normalize(address: string | undefined): string | null {
  if (!address || !isIP(address)) return null;
  if (isIP(address) === 4) return address;
  const normalized = new URL(`http://[${address}]/`).hostname.slice(1, -1);
  const mapped = /^::ffff:([a-f0-9]{1,4}):([a-f0-9]{1,4})$/.exec(normalized);
  if (!mapped) return normalized;
  const high = parseInt(mapped[1], 16),
    low = parseInt(mapped[2], 16);
  return `${high >>> 8}.${high & 255}.${low >>> 8}.${low & 255}`;
}

// A direct authenticated handshake sees Cloud Run's appended caller address.
// Hosting's rotating proxies never become authorities for an earlier XFF hop.
// The browser carries only this guest-bound, daily signed proof to either route.
export function createIngressVerifier(secret: string, configuration: string | undefined) {
  let policy: z.infer<typeof policySchema> | undefined;
  try {
    const parsed = policySchema.parse(JSON.parse(configuration ?? 'null'));
    if (Buffer.byteLength(secret) >= 32 && parsed.peers.every(peer => normalize(peer)))
      policy = parsed;
  } catch {
    /* Missing or invalid deployment evidence keeps issuance closed. */
  }
  const keyed = (kind: string, value: string) =>
    createHmac('sha256', secret).update(`network-proof-v1:${kind}\0`).update(value).digest('hex');
  return {
    issue(
      input: { forwarded?: string; peer?: string; authority?: string; guest: string },
      now = Date.now(),
    ): string | null {
      if (!policy || input.authority !== policy.authority || !input.guest) return null;
      const peer = normalize(input.peer);
      if (!peer || !policy.peers.some(expected => normalize(expected) === peer)) return null;
      // On the verified direct endpoint, only the rightmost platform-appended
      // value is used. Caller-supplied prefixes and forwarding host claims have
      // no influence. The same handshake is refused on run.app and Hosting.
      const client = normalize(input.forwarded?.split(',').at(-1)?.trim());
      if (!client || !Number.isFinite(now)) return null;
      const day = new Date(now).toISOString().slice(0, 10);
      const payload = Buffer.from(
        JSON.stringify({
          day,
          guest: keyed('guest', input.guest),
          network: keyed('network', `${day}\0${client}`),
        }),
      ).toString('base64url');
      return `${payload}.${keyed('signature', payload)}`;
    },
    verify(token: string | null | undefined, guest: string, now = Date.now()): string | null {
      if (!policy || !token || token.length > 1024 || !guest || !Number.isFinite(now)) return null;
      const parts = token.split('.');
      if (
        parts.length !== 2 ||
        !/^[A-Za-z0-9_-]+$/.test(parts[0]) ||
        !/^[a-f0-9]{64}$/.test(parts[1])
      )
        return null;
      const expected = Buffer.from(keyed('signature', parts[0]), 'hex'),
        signature = Buffer.from(parts[1], 'hex');
      if (!timingSafeEqual(expected, signature)) return null;
      try {
        const proof = proofSchema.parse(
          JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8')),
        );
        if (
          proof.day !== new Date(now).toISOString().slice(0, 10) ||
          proof.guest !== keyed('guest', guest)
        )
          return null;
        return proof.network;
      } catch {
        return null;
      }
    },
  };
}
