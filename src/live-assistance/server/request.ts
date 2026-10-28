import { crc32, inflate } from 'node:zlib'
import { promisify } from 'node:util'
import { createHash } from 'node:crypto'
import { bounds, versions, type RasterManifest } from '../../evidence-assistance/contract'
import { attemptPlan } from '../../evidence-assistance/analysis/policy'
import { liveRequestSchema } from '../wire'
import { LiveStop } from './admission'
import { completedFinancialMonths } from '../../evidence-assistance/analysis/financial'

const unzip = promisify(inflate)
function fail(reason = 'invalid-request'): never { throw new LiveStop(reason) }
async function readPng(bytes: Buffer, signal: AbortSignal) {
  if (bytes.length > bounds.imageBytes) fail('prepared-limit')
  if (!bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) fail()
  let offset = 8, width = 0, height = 0, channels = 0, ended = false
  const data: Buffer[] = []
  while (offset + 12 <= bytes.length) {
    signal.throwIfAborted()
    const size = bytes.readUInt32BE(offset), type = bytes.toString('ascii', offset + 4, offset + 8)
    if (offset + 12 + size > bytes.length || crc32(bytes.subarray(offset + 4, offset + 8 + size)) !== bytes.readUInt32BE(offset + 8 + size)) fail()
    const body = bytes.subarray(offset + 8, offset + 8 + size)
    if (offset === 8 && type !== 'IHDR') fail()
    if (type === 'IHDR') {
      if (offset !== 8 || size !== 13) fail()
      width = body.readUInt32BE(0); height = body.readUInt32BE(4)
      if (width < bounds.minimumSide || height < bounds.minimumSide || width > bounds.maximumSide || height > bounds.maximumSide) fail('prepared-limit')
      if (body[8] !== 8 || ![2, 6].includes(body[9]) || body[10] || body[11] || body[12]) fail()
      channels = body[9] === 6 ? 4 : 3
    } else if (type === 'IDAT') data.push(body)
    else if (type === 'IEND') { if (size) fail(); ended = true; offset += 12; break }
    else if (!['sRGB', 'gAMA', 'cHRM', 'pHYs'].includes(type)) fail()
    offset += size + 12
  }
  if (!ended || offset !== bytes.length || !data.length) fail()
  const stride = width * channels + 1, length = stride * height
  let decoded: Buffer
  try { decoded = await unzip(Buffer.concat(data), { maxOutputLength: length }) } catch { return fail() }
  signal.throwIfAborted()
  if (decoded.length !== length) fail()
  for (let row = 0; row < height; row++) if (decoded[row * stride] > 4) fail()
  return { width, height }
}

export async function validateRequest(body: Buffer, signal: AbortSignal) {
  signal.throwIfAborted()
  if (body.length > bounds.bodyBytes) fail('body-limit')
  let value: unknown
  try { value = JSON.parse(body.toString('utf8')) } catch { return fail() }
  const parsed = liveRequestSchema.safeParse(value)
  if (!parsed.success) fail()
  const request = parsed.data
  if (request.slot === 'financial' && JSON.stringify(request.declaration.financial.expectedMonths) !== JSON.stringify(completedFinancialMonths(request.declaration.financial.initialSubmissionMonth))) fail()
  const { pages, ...metadata } = request
  if (Buffer.byteLength(JSON.stringify({ ...metadata, pages: pages.map(({ page, manifest }) => ({ page, manifest })) })) > bounds.contextBytes) fail('context-limit')
  if (new Set(request.selectedPages).size !== request.selectedPages.length || request.selectedPages.some((page, i, all) => page > request.totalPages || i > 0 && page <= all[i - 1])) fail()
  if (pages.some((page, i) => !request.selectedPages.includes(page.page) || i > 0 && page.page <= pages[i - 1].page)) fail()
  if ((request.context === 'correction-workspace') !== !!request.correction || request.audience === 'reviewer' && request.context !== 'submitted' || request.audience === 'applicant' && request.context === 'submitted') fail()
  let pixels = 0, size = 0
  const decoded = []
  for (const page of pages) {
    signal.throwIfAborted()
    const bytes = Buffer.from(page.png, 'base64')
    const dimensions = await readPng(bytes, signal)
    pixels += dimensions.width * dimensions.height; size += bytes.length
    if (pixels > bounds.combinedPixels || size > bounds.combinedBytes) fail('prepared-limit')
    const rasterHash = createHash('sha256').update(bytes).digest('hex')
    const manifest: RasterManifest = page.manifest ?? {
      page: page.page, sourceHash: rasterHash, rasterHash, ...dimensions, sourceWidth: dimensions.width, sourceHeight: dimensions.height,
      uprightWidth: dimensions.width, uprightHeight: dimensions.height, orientation: 1, rotation: 0, scale: 1,
      padding: { left: 0, top: 0, right: 0, bottom: 0 }, viewport: [1, 0, 0, 1, 0, 0], orientationTransform: [1, 0, 0, 1, 0, 0], transform: [1, 0, 0, 1, 0, 0],
      renderer: 'received-png', worker: 'received-png', resources: 'received-png', preparation: versions.preparation,
    }
    if (manifest.page !== page.page || manifest.rasterHash !== rasterHash || manifest.width !== dimensions.width || manifest.height !== dimensions.height || Object.values(manifest.padding).some(value => !Number.isInteger(value) || value < 0) || manifest.padding.left + manifest.padding.right >= manifest.width || manifest.padding.top + manifest.padding.bottom >= manifest.height) fail()
    decoded.push({ page: page.page, bytes, ...dimensions, manifest })
  }
  return { ...metadata, pages: decoded, maximumAttempts: attemptPlan(request.totalPages, request.selectedPages).maximumAttempts }
}
export type ValidatedRequest = Awaited<ReturnType<typeof validateRequest>>
