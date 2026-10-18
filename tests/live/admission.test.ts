import { expect, test } from 'vitest'
import { createAdmission } from '../../src/live-assistance/admission'

import { memoryStore } from './fixtures'

test('independent revisions reserve a complete nine-attempt run once under a guest race', async () => {
  const store = memoryStore()
  const first = createAdmission(store, 'dummy-key-with-at-least-thirty-two-bytes')
  const second = createAdmission(store, 'dummy-key-with-at-least-thirty-two-bytes')
  const input = { guest: 'guest', network: '192.0.2.1', runId: 'run1', fingerprint: 'same', attempts: 9, now: Date.UTC(2026, 9, 18) }
  const outcomes = await Promise.allSettled([first.reserve(input), second.reserve({ ...input, runId: 'run2' })])
  expect(outcomes.filter(result => result.status === 'fulfilled')).toHaveLength(1)
  expect(outcomes.find(result => result.status === 'rejected')).toMatchObject({ reason: { message: 'guest-active' } })
})

test('expired work leases never authorize a second dispatch of a run ID', async () => {
  const admission = createAdmission(memoryStore(), 'dummy-key-with-at-least-thirty-two-bytes')
  const input = { guest: 'guest', network: '192.0.2.1', runId: 'run', fingerprint: 'same', attempts: 2, now: Date.UTC(2026, 9, 18) }
  const reservation = await admission.reserve(input)
  await admission.mark(reservation, 0, input.now)
  const duplicate = await admission.reserve({ ...input, now: input.now + 61_000 })
  expect(duplicate).toMatchObject({ duplicate: true })
  await expect(admission.mark(duplicate, 0, input.now + 61_000)).rejects.toThrow('run-stopped')
  await expect(admission.mark(reservation, 1, input.now + 61_000)).rejects.toThrow('run-stopped')
})

test('only unsent reservations are refunded and changed input cannot reuse an ID', async () => {
  const admission = createAdmission(memoryStore(), 'dummy-key-with-at-least-thirty-two-bytes')
  const input = { guest: 'guest', network: '192.0.2.1', runId: 'run', fingerprint: 'same', attempts: 9, now: Date.UTC(2026, 9, 18) }
  const first = await admission.reserve(input)
  const connection = await admission.mark(first, 0, input.now)
  await admission.disconnect(connection)
  await admission.finish(first, 'stopped', input.now)
  await expect(admission.reserve({ ...input, fingerprint: 'changed' })).rejects.toThrow('run-conflict')
  const second = await admission.reserve({ ...input, runId: 'second', now: input.now + 60_000 })
  for (let i = 0; i < 9; i++) await admission.disconnect(await admission.mark(second, i, input.now + 60_000))
  await admission.finish(second, 'completed', input.now + 60_000)
  const third = await admission.reserve({ ...input, runId: 'third', now: input.now + 120_000 })
  for (let i = 0; i < 9; i++) await admission.disconnect(await admission.mark(third, i, input.now + 120_000))
  await admission.finish(third, 'completed', input.now + 120_000)
  // 1 + 9 + 9 consumed. Another two cannot fit the guest's 20 attempts.
  await expect(admission.reserve({ ...input, runId: 'fourth', attempts: 2, now: input.now + 180_000 })).rejects.toThrow('guest-allowance')
})

test('two connection leases are shared across guests and revisions', async () => {
  const store = memoryStore()
  const admission = createAdmission(store, 'dummy-key-with-at-least-thirty-two-bytes')
  const other = createAdmission(store, 'dummy-key-with-at-least-thirty-two-bytes')
  const input = { guest: 'guest', network: '192.0.2.1', runId: 'run', fingerprint: 'same', attempts: 2, now: Date.UTC(2026, 9, 18) }
  const tickets = await Promise.all([0, 1, 2].map(i => admission.reserve({ ...input, guest: `guest-${i}` })))
  const a = await admission.mark(tickets[0], 0, input.now)
  await other.mark(tickets[1], 0, input.now)
  await expect(other.mark(tickets[2], 0, input.now)).rejects.toThrow('service-busy')
  await admission.disconnect(a)
  await expect(other.mark(tickets[2], 0, input.now)).resolves.toBeTypeOf('string')
})

test('network, shared UTC-day and UTC-month limits reserve atomically across visitors', async () => {
  const key = 'dummy-key-with-at-least-thirty-two-bytes'
  const admission = createAdmission(memoryStore(), key)
  const start = Date.UTC(2026, 9, 1)
  const reserve = (guest: string, network: string, attempts: number, now = start) => admission.reserve({ guest, network, attempts, now, runId: `${guest}-${now}`, fingerprint: 'same' })
  const spend = async (guest: string, network: string, attempts: number, now = start) => {
    const ticket = await reserve(guest, network, attempts, now)
    for (let i = 0; i < attempts; i++) await admission.disconnect(await admission.mark(ticket, i, now))
    await admission.finish(ticket, 'completed', now)
  }
  for (let i = 0; i < 6; i++) await spend(`network-${i}`, 'same-network', 9)
  await expect(reserve('network-over', 'same-network', 9)).rejects.toThrow('network-allowance')
  await spend('network-last', 'same-network', 6)
  for (let i = 0; i < 4; i++) await spend(`shared-${i}`, `network-${i}`, 9)
  await expect(reserve('shared-over', 'other-network', 5)).rejects.toThrow('daily-allowance')
  await spend('shared-last', 'other-network', 4)
  for (let day = 1; day < 10; day++) {
    for (let i = 0; i < 11; i++) await spend(`day-${day}-${i}`, `network-${i}`, 9, start + day * 86_400_000)
    await spend(`day-${day}-last`, 'last-network', 1, start + day * 86_400_000)
  }
  await expect(reserve('month-over', 'another-network', 1, start + 10 * 86_400_000)).rejects.toThrow('monthly-allowance')
  await expect(reserve('next-month', 'another-network', 2, Date.UTC(2026, 10, 1))).resolves.toMatchObject({ duplicate: false })
})

test('missing control and a missing already-started day counter fail closed', async () => {
  const store = memoryStore()
  const admission = createAdmission(store, 'dummy-key-with-at-least-thirty-two-bytes')
  const input = { guest: 'guest', network: 'network', runId: 'run', fingerprint: 'same', attempts: 2, now: Date.UTC(2026, 9, 18) }
  await admission.reserve(input)
  await store.transaction(['day-2026-10-18'], () => ({ value: undefined, writes: { 'day-2026-10-18': undefined } }))
  await expect(admission.reserve({ ...input, guest: 'other', runId: 'other' })).rejects.toThrow('accounting-unavailable')
  await store.transaction(['control'], () => ({ value: undefined, writes: { control: undefined } }))
  await expect(admission.reserve({ ...input, guest: 'third', runId: 'third' })).rejects.toThrow('accounting-unavailable')
})
