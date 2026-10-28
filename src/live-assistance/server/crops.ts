import { Worker } from 'node:worker_threads'
import { bounds, type CropBinding, type PreparedCrop, type PreparedPage } from '../../evidence-assistance/contract'
import { LiveStop } from './admission'
import { supervise } from './supervision'

export async function serverCrops(image: PreparedPage, regions: Omit<CropBinding, 'cropHash'>[], signal: AbortSignal): Promise<PreparedCrop[]> {
  const scope = supervise(signal, bounds.pageMilliseconds)
  scope.check()
  if (image.manifest.width * image.manifest.height + regions.reduce((sum, region) => sum + region.width * region.height, 0) > bounds.combinedPixels) { scope.dispose(); throw new LiveStop('prepared-limit') }
  const worker = new Worker(new URL('./crop-worker.mjs', import.meta.url), { workerData: { image, regions }, resourceLimits: { maxOldGenerationSizeMb: 96 } })
  try {
    const crops = await scope.wait(() => new Promise<PreparedCrop[]>((resolve, reject) => {
      worker.once('message', resolve); worker.once('error', reject)
      worker.once('exit', code => { if (code) reject(new LiveStop('prepared-limit')) })
    }))
    if (crops.some(crop => crop.bytes.byteLength > bounds.imageBytes)) throw new LiveStop('prepared-limit')
    return crops
  } finally { scope.dispose(); await worker.terminate() }
}
