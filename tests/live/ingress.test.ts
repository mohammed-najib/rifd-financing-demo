import { expect, test } from 'vitest'
import { createIngressVerifier } from '../../src/live-assistance/server/ingress'

const configuration = JSON.stringify({ profile: 'cloud-run-v2', authority: 'europe-west1-rifd-portfolio-mdnb.cloudfunctions.net', peers: ['169.254.1.1'] })
const secret = 'dummy-key-with-at-least-thirty-two-bytes'
const now = Date.UTC(2026, 9, 18, 12)

test('a signed guest network proof ignores forged prefixes and works independently of the analysis route', () => {
  const ingress = createIngressVerifier(secret, configuration)
  const input = { forwarded: '192.0.2.1', peer: '169.254.1.1', authority: 'europe-west1-rifd-portfolio-mdnb.cloudfunctions.net', guest: 'guest' }
  const plain = ingress.issue(input, now)
  const forged = ingress.issue({ ...input, forwarded: 'chosen-address, 198.51.100.77, 192.0.2.1', peer: '::ffff:169.254.1.1' }, now)
  expect(plain).toBeTypeOf('string')
  expect(ingress.verify(forged, 'guest', now)).toEqual(ingress.verify(plain, 'guest', now))
  expect(ingress.verify(plain, 'guest', now)).toBeTypeOf('string')
  const claims = JSON.parse(Buffer.from(plain!.split('.')[0], 'base64url').toString('utf8'))
  expect(claims.guest).not.toBe('guest')
  expect(claims.network).not.toBe('192.0.2.1')
})

test('network proofs cannot cross guests, UTC days or signing keys, and tampering fails closed', () => {
  const ingress = createIngressVerifier(secret, configuration)
  const input = { forwarded: '192.0.2.1', peer: '169.254.1.1', authority: 'europe-west1-rifd-portfolio-mdnb.cloudfunctions.net', guest: 'guest' }
  const proof = ingress.issue(input, now)!
  expect(ingress.verify(proof, 'other-guest', now)).toBeNull()
  expect(ingress.verify(proof, 'guest', Date.UTC(2026, 9, 19))).toBeNull()
  expect(createIngressVerifier(`${secret}-rotated`, configuration).verify(proof, 'guest', now)).toBeNull()
  expect(ingress.verify(`e30.${proof.split('.')[1]}`, 'guest', now)).toBeNull()
  expect(ingress.verify(`${proof}extra`, 'guest', now)).toBeNull()
})

test('only the verified managed direct connection can issue a proof', () => {
  const ingress = createIngressVerifier(secret, configuration)
  const input = { forwarded: '192.0.2.1', peer: '169.254.1.1', authority: 'europe-west1-rifd-portfolio-mdnb.cloudfunctions.net', guest: 'guest' }
  expect(ingress.issue({ ...input, authority: 'liveanalysis.example.run.app' }, now)).toBeNull()
  expect(ingress.issue({ ...input, authority: 'rifd-portfolio-mdnb.web.app' }, now)).toBeNull()
  expect(ingress.issue({ ...input, peer: '192.0.2.1' }, now)).toBeNull()
  expect(ingress.issue({ ...input, forwarded: '192.0.2.1, chosen-address' }, now)).toBeNull()
  expect(createIngressVerifier(secret, undefined).issue(input, now)).toBeNull()
  expect(createIngressVerifier('short', configuration).issue(input, now)).toBeNull()
  expect(createIngressVerifier(secret, '{bad-json').verify('forged', 'guest', now)).toBeNull()
})

test('equivalent IPv6 spellings and mapped IPv4 produce the same network allowance identity', () => {
  const ingress = createIngressVerifier(secret, configuration)
  const input = { peer: '169.254.1.1', authority: 'europe-west1-rifd-portfolio-mdnb.cloudfunctions.net', guest: 'guest' }
  const identity = (forwarded: string) => ingress.verify(ingress.issue({ ...input, forwarded }, now), 'guest', now)
  expect(identity('2001:0db8:0:0:0:0:0:1')).toEqual(identity('2001:db8::1'))
  expect(identity('::ffff:192.0.2.1')).toEqual(identity('192.0.2.1'))
})
