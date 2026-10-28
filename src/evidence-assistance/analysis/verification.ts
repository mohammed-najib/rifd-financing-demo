import { bounds, locationTargets, type PreparedCrop, type PageAnalysis, type StageRequest, type PreparedPage, type NativeCapture } from '../contract'
import { boundChecks } from '../preparation/locations'
import { envelope } from './policy'

export function makeVerificationRequest(page: PageAnalysis, image: PreparedPage, crops: PreparedCrop[]): StageRequest {
  const questions: StageRequest['questions'] = {}, dependencies: StageRequest['dependencies'] = {}
  const state = page.request.state
  const targets = locationTargets(state.declaredFinancial ? 'financial' : state.declaredBusiness ? 'business' : state.declaredPurchase ? 'purchase' : 'identity')
  const policy = 'regions[i] gives the named target and exact parent-pixel originalBoundary; cropImages[i] is its lossless crop. Inspect unchanged page too. Clipping means glyphs cross that original edge, never enclosure or padding. Association means correct field and expected financial period where applicable. CompetingValue means another value or ambiguous association. Padding restores no glyphs. ' + crops.map(crop => `${crop.binding.target}: ${targets.find(target => target.id === crop.binding.target)?.name ?? ''}`).join('; ')

  crops.forEach((crop, index) => {
    for (const check of boundChecks) {
      const key = `${crop.binding.target}${check}`
      questions[key] = { type: 'noul', instructions: `${check} for \`regions[${index}]\`?` }
      dependencies[key] = ['state', 'versions', `regions[${index}]`]
    }
  })
  const request: StageRequest = { ...page.request, stage: 'bound-verification', image, crops, state: { ...page.request.state, regions: crops.map(crop => crop.binding), cropImages: crops.map(crop => `bound-crop-${crop.binding.target}`), verificationPolicy: policy }, questions, dependencies }
  checkVerificationResources(request)
  return request
}

export function checkVerificationResources(request: StageRequest) {
  const crops = request.crops ?? [], assets = [request.image, ...crops]
  if (!crops.length || crops.length > 9 || assets.length > 10 || Object.keys(request.questions).length > 54 || Object.keys(request.questions).length > 64) throw new Error('context-limit')
  const pixels = request.image.manifest.width * request.image.manifest.height + crops.reduce((sum, crop) => sum + crop.binding.width * crop.binding.height, 0)
  const bytes = assets.reduce((sum, image) => sum + image.bytes.byteLength, 0)
  const metadata = new TextEncoder().encode(JSON.stringify({ ...request, image: undefined, images: undefined, crops: undefined })).byteLength
  if (pixels > bounds.combinedPixels || bytes > bounds.combinedBytes || crops.some(crop => crop.bytes.byteLength > bounds.imageBytes) || metadata > bounds.contextBytes || metadata + assets.reduce((sum, image) => sum + Math.ceil(image.bytes.byteLength / 3) * 4, 0) > bounds.bodyBytes) throw new Error('context-limit')
}

export function interpretVerification(raw: unknown): NativeCapture {
  const parsed = envelope.safeParse(raw)
  if (!parsed.success) throw new Error('invalid-response')
  return { ...parsed.data, receivedAnswers: parsed.data.answers, answers: {} }
}
