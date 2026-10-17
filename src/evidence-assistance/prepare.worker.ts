import { getDocument, GlobalWorkerOptions, version } from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { JpegImage } from 'pdfjs-dist/image_decoders/pdf.image_decoders.mjs'
import { bounds, versions, type EvidenceSource, type PreparedPage, type RasterManifest } from './contract'

GlobalWorkerOptions.workerSrc = pdfWorker
// PDF.js may recover by omitting an image/font/operator. Such a raster cannot
// support complete-source claims. Keep diagnostics local and reject that page.
let incomplete = false
let parsingJpeg = false
const originalLog = console.log
const captureDiagnostic = (...values: unknown[]) => {
  if (typeof values[0] === 'string' && values[0].startsWith('Warning:')) {
    if (values[0] !== 'Warning: Setting up fake worker.') {
      incomplete = true
      if (parsingJpeg) throw new Error('invalid-source')
    }
    return
  }
  originalLog(...values)
}
console.log = captureDiagnostic
console.warn = captureDiagnostic
const hash = async (bytes: ArrayBuffer) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), byte => byte.toString(16).padStart(2, '0')).join('')
const rejectSource = () => { throw new Error('invalid-source') }

function imageHeader(bytes: ArrayBuffer, mime: string): { width: number; height: number; orientation: number } {
  const data = new Uint8Array(bytes), view = new DataView(bytes)
  if (mime === 'image/png') {
    if (data.length < 45 || [137, 80, 78, 71, 13, 10, 26, 10].some((value, i) => data[i] !== value) || view.getUint32(8) !== 13 || view.getUint32(12) !== 0x49484452 || view.getUint32(data.length - 8) !== 0x49454e44) return rejectSource()
    return { width: view.getUint32(16), height: view.getUint32(20), orientation: 1 }
  }
  if (mime !== 'image/jpeg' || data.length < 6 || view.getUint16(0) !== 0xffd8 || view.getUint16(data.length - 2) !== 0xffd9) return rejectSource()
  let offset = 2, width = 0, height = 0, orientation = 1
  while (offset + 4 <= data.length) {
    if (data[offset++] !== 0xff) return rejectSource()
    while (data[offset] === 0xff) offset++
    const marker = data[offset++]
    if (marker === 0xda || marker === 0xd9) break
    const length = view.getUint16(offset)
    if (length < 2 || offset + length > data.length) return rejectSource()
    if ([0xc0, 0xc1, 0xc2].includes(marker)) { height = view.getUint16(offset + 3); width = view.getUint16(offset + 5) }
    if (marker === 0xe1 && length >= 16 && view.getUint32(offset + 2) === 0x45786966 && view.getUint16(offset + 6) === 0) {
      const tiff = offset + 8, end = offset + length
      const little = view.getUint16(tiff) === 0x4949
      if (!little && view.getUint16(tiff) !== 0x4d4d || view.getUint16(tiff + 2, little) !== 42) return rejectSource()
      const directory = tiff + view.getUint32(tiff + 4, little)
      if (directory < tiff || directory + 2 > end) return rejectSource()
      const entries = view.getUint16(directory, little)
      for (let i = 0; i < entries; i++) {
        const entry = directory + 2 + 12 * i
        if (entry + 12 > end) return rejectSource()
        if (view.getUint16(entry, little) === 0x0112) {
          if (view.getUint16(entry + 2, little) !== 3 || view.getUint32(entry + 4, little) !== 1) return rejectSource()
          orientation = view.getUint16(entry + 8, little)
        }
      }
    }
    offset += length
  }
  if (orientation < 1 || orientation > 8) return rejectSource()
  return { width, height, orientation }
}

function canvasFor(width: number, height: number) {
  const canvas = new OffscreenCanvas(width, height)
  const context = canvas.getContext('2d')
  if (!context) throw new Error('invalid-source')
  context.fillStyle = '#fff'; context.fillRect(0, 0, width, height)
  return { canvas, context }
}

class CanvasFactory {
  create(width: number, height: number) { return canvasFor(width, height) }
  reset(target: { canvas: OffscreenCanvas }, width: number, height: number) { target.canvas.width = width; target.canvas.height = height }
  destroy(target: { canvas: OffscreenCanvas | null; context: OffscreenCanvasRenderingContext2D | null }) { if (target.canvas) { target.canvas.width = 0; target.canvas.height = 0 }; target.canvas = null; target.context = null }
}

class ResourceFactory {
  constructor(private options: { baseUrl: string }) {}
  async fetch({ filename }: { filename: string }) {
    try {
      const response = await fetch(new URL(this.options.baseUrl + filename, self.location.origin))
      if (!response.ok || response.headers.get('content-type')?.includes('text/html')) throw new Error('invalid-source')
      const data = new Uint8Array(await response.arrayBuffer())
      if (!data.length) throw new Error('invalid-source')
      return data
    } catch (error) { incomplete = true; throw error }
  }
}
class CMapFactory {
  constructor(private options: { baseUrl: string }) {}
  async fetch({ name }: { name: string }) {
    return { cMapData: await new ResourceFactory(this.options).fetch({ filename: `${name}.bcmap` }), compressionType: 1 }
  }
}

async function prepare(source: EvidenceSource): Promise<PreparedPage> {
  const sourceHash = await hash(source.bytes)
  if (sourceHash !== source.hash) return rejectSource()
  let width: number, height: number, orientation = 1, rotation = 0, totalPages = 1
  let originalWidth: number | undefined, originalHeight: number | undefined
  let viewport: number[] = [], transform: number[] = []
  let bitmap: ImageBitmap | undefined
  let pdf: Awaited<ReturnType<typeof getDocument>['promise']> | undefined
  let task: ReturnType<typeof getDocument> | undefined
  let canvas: OffscreenCanvas | undefined
  try {
    if (source.mime === 'application/pdf') {
      const text = new TextDecoder('latin1').decode(source.bytes)
      if (!text.startsWith('%PDF-') || !/%%EOF\s*$/.test(text)) return rejectSource()
      if (version !== '5.4.296') return rejectSource()
      task = getDocument({ data: source.bytes, stopAtErrors: true, isEvalSupported: false, enableXfa: false,
        disableFontFace: true, useSystemFonts: false, useWorkerFetch: false, isOffscreenCanvasSupported: true,
        maxImageSize: bounds.sourcePixels, canvasMaxAreaInBytes: -1,
        cMapUrl: '/pdfjs/5.4.296/cmaps/', cMapPacked: true, standardFontDataUrl: '/pdfjs/5.4.296/standard_fonts/', wasmUrl: '/pdfjs/5.4.296/wasm/',
        CanvasFactory: CanvasFactory as never, StandardFontDataFactory: ResourceFactory, CMapReaderFactory: CMapFactory, WasmFactory: ResourceFactory,
      })
      // Even PDFs with an empty password are rejected as encrypted.
      task.onPassword = () => { void task?.destroy() }
      pdf = await task.promise
      if (await pdf.getPermissions() !== null) return rejectSource()
      totalPages = pdf.numPages
      if (totalPages > bounds.pdfPages) throw Object.assign(new Error('source-limit'), { totalPages })
      if (totalPages !== 1) throw Object.assign(new Error('multipage'), { totalPages })
      const page = await pdf.getPage(1)
      const base = page.getViewport({ scale: 1 })
      width = base.width; height = base.height; rotation = page.rotate
      originalWidth = page.view[2] - page.view[0]; originalHeight = page.view[3] - page.view[1]
    } else {
      const header = imageHeader(source.bytes, source.mime)
      width = header.width; height = header.height; orientation = header.orientation
      if (!width || !height || width > bounds.decodedSide || height > bounds.decodedSide || width * height > bounds.sourcePixels) throw new Error('source-limit')
      if (source.mime === 'image/jpeg') {
        // Browser decoders can silently fill a truncated scan. Validate all MCU
        // data with the pinned decoder first, rejecting its recovery warnings.
        const decoded = new JpegImage()
        parsingJpeg = true
        try { decoded.parse(new Uint8Array(source.bytes)) } finally { parsingJpeg = false }
        if (incomplete || decoded.width !== width || decoded.height !== height) return rejectSource()
      }
      bitmap = await createImageBitmap(new Blob([source.bytes], { type: source.mime }), { imageOrientation: 'from-image' })
      const swapped = orientation >= 5
      if (bitmap.width !== (swapped ? height : width) || bitmap.height !== (swapped ? width : height)) return rejectSource()
    }
    const uprightWidth = bitmap?.width ?? width, uprightHeight = bitmap?.height ?? height
    if (![width, height, uprightWidth, uprightHeight].every(value => Number.isFinite(value) && value > 0)) return rejectSource()
    const scale = Math.min(1, bounds.maximumSide / Math.max(uprightWidth, uprightHeight))
    const contentWidth = Math.max(1, Math.min(bounds.maximumSide, Math.ceil(uprightWidth * scale))), contentHeight = Math.max(1, Math.min(bounds.maximumSide, Math.ceil(uprightHeight * scale)))
    const preparedWidth = Math.max(bounds.minimumSide, contentWidth), preparedHeight = Math.max(bounds.minimumSide, contentHeight)
    const left = Math.floor((preparedWidth - contentWidth) / 2), top = Math.floor((preparedHeight - contentHeight) / 2)
    const target = canvasFor(preparedWidth, preparedHeight); canvas = target.canvas
    if (bitmap) {
      target.context.drawImage(bitmap, left, top, contentWidth, contentHeight)
      // Orientation has already been applied exactly once by createImageBitmap.
      transform = [contentWidth / uprightWidth, 0, 0, contentHeight / uprightHeight, left, top]
      viewport = [0, 0, uprightWidth, uprightHeight]
    } else {
      const page = await pdf!.getPage(1)
      const rendered = page.getViewport({ scale, offsetX: left, offsetY: top })
      viewport = page.view; transform = rendered.transform
      await page.render({ canvas: canvas as never, canvasContext: target.context as never, viewport: rendered, background: '#fff' }).promise
      if (incomplete) return rejectSource()
      page.cleanup()
    }
    const bytes = await (await canvas.convertToBlob({ type: 'image/png' })).arrayBuffer()
    if (bytes.byteLength > bounds.imageBytes || bytes.byteLength > bounds.combinedBytes || preparedWidth * preparedHeight > bounds.combinedPixels) throw new Error('prepared-limit')
    const manifest: RasterManifest = {
      page: 1, sourceHash, rasterHash: await hash(bytes), width: preparedWidth, height: preparedHeight,
      sourceWidth: originalWidth ?? width, sourceHeight: originalHeight ?? height, uprightWidth, uprightHeight, orientation, rotation, scale,
      padding: { left, top, right: preparedWidth - contentWidth - left, bottom: preparedHeight - contentHeight - top }, viewport,
      orientationTransform: [[], [1, 0, 0, 1, 0, 0], [-1, 0, 0, 1, width, 0], [-1, 0, 0, -1, width, height], [1, 0, 0, -1, 0, height], [0, 1, 1, 0, 0, 0], [0, 1, -1, 0, height, 0], [0, -1, -1, 0, height, width], [0, -1, 1, 0, 0, width]][orientation], transform,
      renderer: source.mime === 'application/pdf' ? `pdfjs-${version}` : 'createImageBitmap-from-image-v1', worker: `pdfjs-${version}`, resources: `pdfjs-${version}`, preparation: versions.preparation,
    }
    return { bytes, manifest, totalPages }
  } finally {
    bitmap?.close()
    if (canvas) { canvas.width = 0; canvas.height = 0 }
    if (task) await task.destroy()
  }
}

self.onmessage = async (event: MessageEvent<EvidenceSource>) => {
  try { const page = await prepare(event.data); self.postMessage({ kind: 'prepared-evidence', page }, { transfer: [page.bytes] }) }
  catch (error) {
    const reason = error instanceof Error && ['source-limit', 'multipage', 'prepared-limit'].includes(error.message) ? error.message : 'invalid-source'
    self.postMessage({ kind: 'prepared-evidence', reason, totalPages: error && typeof error === 'object' && 'totalPages' in error ? error.totalPages : undefined })
  }
}
