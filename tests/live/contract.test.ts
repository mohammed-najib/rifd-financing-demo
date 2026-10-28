import { expect, test } from 'vitest'
import { validateRequest } from '../../src/live-assistance/server/request'
import { input, png } from './fixtures'
import { bounds } from '../../src/evidence-assistance/contract'

test('the fixed request accepts actual bounded PNGs and rejects arbitrary provider work', async () => {
  const signal = new AbortController().signal
  await expect(validateRequest(Buffer.from(JSON.stringify(input())), signal)).resolves.toMatchObject({ maximumAttempts: 2, pages: [{ width: 280, height: 280 }] })
  await expect(validateRequest(Buffer.from(JSON.stringify({ ...input(), questions: { arbitrary: 'hello' } })), signal)).rejects.toThrow('invalid-request')
})

test('preparation failures retain the complete selected run reservation', async () => {
  const body = { ...input(), totalPages: 4, selectedPages: [1, 2, 3, 4], pages: input().pages }
  await expect(validateRequest(Buffer.from(JSON.stringify(body)), new AbortController().signal)).resolves.toMatchObject({ maximumAttempts: 9, selectedPages: [1, 2, 3, 4], pages: [{ page: 1 }] })
})

test('the request rejects remote images, forged dimensions, corrupt PNGs and oversized metadata/body', async () => {
  const signal = new AbortController().signal
  const corrupt = png(); corrupt[corrupt.length - 1] ^= 1
  for (const pages of [[{ page: 1, png: 'https://example.com/image.png' }], [{ page: 1, png: png(1569).toString('base64') }], [{ page: 1, png: corrupt.toString('base64') }]]) {
    await expect(validateRequest(Buffer.from(JSON.stringify({ ...input(), pages })), signal)).rejects.toThrow()
  }
  await expect(validateRequest(Buffer.alloc(bounds.bodyBytes + 1), signal)).rejects.toThrow('body-limit')
  const correction = { initialSubmissionMonth: '2026-06', targets: Array.from({ length: 4 }, () => ({ kind: 'document', slot: 'identity', reason: { ar: 'a'.repeat(3000), en: 'b'.repeat(3000) } })) }
  await expect(validateRequest(Buffer.from(JSON.stringify({ ...input(), context: 'correction-workspace', correction })), signal)).rejects.toThrow('context-limit')
})
