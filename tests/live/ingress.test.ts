import { expect, test } from 'vitest'
import { trustedNetwork } from '../../src/live-assistance/ingress'

test('unverified forwarded headers give no network allowance identity', () => {
  expect(trustedNetwork('192.0.2.1', [])).toBeNull()
  expect(trustedNetwork('192.0.2.1, 203.0.113.2', ['203.0.113.3'])).toBeNull()
  expect(trustedNetwork('chosen-address, 192.0.2.1, 203.0.113.2', ['203.0.113.2'])).toBe('192.0.2.1')
  expect(trustedNetwork('2001:0db8:0:0:0:0:0:1, 203.0.113.2', ['203.0.113.2'])).toBe('2001:db8::1')
})
