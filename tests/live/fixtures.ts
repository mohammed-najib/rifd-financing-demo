import { deflateSync, crc32 } from 'node:zlib'
import type { MetadataStore } from '../../src/live-assistance/admission'
import type { ValidatedRequest } from '../../src/live-assistance/request'
import type { PreparedPage, SelectedEvidence } from '../../src/evidence-assistance/contract'
import { makeRequest, attemptPlan } from '../../src/evidence-assistance/policy'

// Serializable local service, shared by independent controllers/revisions.
export function memoryStore(): MetadataStore {
  const records = new Map<string, unknown>([['control', { enabled: true, slots: [] }]])
  let pending = Promise.resolve()
  return {
    transaction(keys, update) {
      const result = pending.then(() => {
        const next = update(Object.fromEntries(keys.map(key => [key, structuredClone(records.get(key))])))
        for (const [key, value] of Object.entries(next.writes)) records.set(key, structuredClone(value))
        return next.value
      })
      pending = result.then(() => undefined, () => undefined)
      return result
    },
  }
}

export function png(width = 280, height = 280) {
  const chunk = (type: string, data: Buffer) => {
    const head = Buffer.alloc(8); head.writeUInt32BE(data.length); head.write(type, 4)
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([Buffer.from(type), data])))
    return Buffer.concat([head, data, crc])
  }
  const header = Buffer.alloc(13); header.writeUInt32BE(width); header.writeUInt32BE(height, 4); header[8] = 8; header[9] = 6
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', header), chunk('IDAT', deflateSync(Buffer.alloc((width * 4 + 1) * height))), chunk('IEND', Buffer.alloc(0))])
}
export const input = () => ({ runId: `${new Date().toISOString().slice(0, 10)}.4a135590-4c7a-4998-8754-fde5f3dc2cf2`, slot: 'identity', audience: 'applicant', context: 'draft', totalPages: 1, selectedPages: [1], declaration: { fullName: 'Fictional Person', status: 'valid' }, pages: [{ page: 1, png: png().toString('base64') }] })

export function stageRequest(request: ValidatedRequest, page = request.pages[0]) {
  const image: PreparedPage = { bytes: Uint8Array.from(page.bytes).buffer, totalPages: request.totalPages, manifest: {
    page: page.page, sourceHash: 'a'.repeat(64), rasterHash: 'b'.repeat(64), width: page.width, height: page.height,
    sourceWidth: page.width, sourceHeight: page.height, uprightWidth: page.width, uprightHeight: page.height,
    orientation: 1, rotation: 0, scale: 1, padding: { left: 0, top: 0, right: 0, bottom: 0 },
    viewport: [1, 0, 0, 1, 0, 0], orientationTransform: [1, 0, 0, 1, 0, 0], transform: [1, 0, 0, 1, 0, 0],
    renderer: 'test', worker: 'test', resources: 'test', preparation: 'full-page-pdfjs-5.4.296-v1',
  } }
  const selection: SelectedEvidence = { source: { id: 'local', name: 'local', mime: 'image/png', hash: 'a'.repeat(64), bytes: image.bytes }, declaration: request.declaration, correction: request.correction,
    binding: { datasetId: 'local', applicationId: 'local', slot: request.slot, audience: request.audience, context: request.context, contextId: 'local', roundId: null, authorityGeneration: 0, sharedRevision: 0, workspaceRevision: 0, dependencyKey: 'local', durable: false } }
  return makeRequest(selection, image, request.runId, attemptPlan(request.totalPages, request.selectedPages))
}
export const native = { model: 'jev-1.14.0', answers: { namePresence: { type: 'noul', noul: 0.999 } }, usage: { input_tokens: 100, output_tokens: 10 } }

