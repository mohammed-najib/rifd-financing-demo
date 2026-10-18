import { bounds, type PreparedPage, type PreparedCrop, type CropBinding } from './contract'
import { cropGeometry, same } from './locations'
import { cropPng } from './crop-png.mjs'

const hash = async (bytes: ArrayBuffer) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), byte => byte.toString(16).padStart(2, '0')).join('')
self.onmessage = async (event: MessageEvent<{ page: PreparedPage; regions: Omit<CropBinding, 'cropHash'>[] }>) => {
  let bitmap: ImageBitmap | undefined, canvas: OffscreenCanvas | undefined
  try {
    const { page, regions } = event.data
    if (regions.length > 9 || await hash(page.bytes) !== page.manifest.rasterHash) throw new Error('invalid-source')
    bitmap = await createImageBitmap(new Blob([page.bytes], { type: 'image/png' }))
    if (bitmap.width !== page.manifest.width || bitmap.height !== page.manifest.height) throw new Error('invalid-source')
    const crops: PreparedCrop[] = []
    let bytes = page.bytes.byteLength, pixels = bitmap.width * bitmap.height
    for (const region of regions) {
      const { target, ...geometry } = region
      if (!same(cropGeometry(region.box, page.manifest), geometry)) throw new Error('invalid-source')
      canvas = new OffscreenCanvas(region.width, region.height)
      const context = canvas.getContext('2d')!
      context.fillStyle = '#fff'; context.fillRect(0, 0, region.width, region.height)
      context.imageSmoothingEnabled = false
      const e = region.enclosure, w = e.right - e.left, h = e.bottom - e.top
      context.drawImage(bitmap, e.left, e.top, w, h, region.padding.left, region.padding.top, w, h)
      const crop = cropPng(region.width, region.height, context.getImageData(0, 0, region.width, region.height).data)
      bytes += crop.byteLength; pixels += region.width * region.height
      if (crop.byteLength > bounds.imageBytes || bytes > bounds.combinedBytes || pixels > bounds.combinedPixels) throw new Error('prepared-limit')
      crops.push({ bytes: crop, binding: { ...geometry, target, cropHash: await hash(crop) } })
      canvas.width = 0; canvas.height = 0
    }
    self.postMessage({ crops }, { transfer: crops.map(crop => crop.bytes) })
  } catch (error) { self.postMessage({ reason: error instanceof Error ? error.message : 'invalid-source' }) }
  finally { bitmap?.close(); if (canvas) { canvas.width = 0; canvas.height = 0 } }
}
