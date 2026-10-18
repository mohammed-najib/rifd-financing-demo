import { createRoot } from 'react-dom/client'
import { useState } from 'react'
import { createDemo } from '../../src/demo'
import type { Language } from '../../src/domain/model'
import type { ApplicationStep } from '../../src/domain'
import { DraftEditor } from '../../src/ui/draft'
import { ReviewWorkspace } from '../../src/ui/review'
import { correctionApplicationId, requestIdentityCorrection, correctionCommand, prepareCorrectionIdentity } from './correction-evidence-fixtures'
import { pdfFile } from './evidence-fixtures'
import { requestBusinessCorrection } from './business-evidence-fixtures'
import { requestPurchaseCorrection } from './purchase-evidence-fixtures'
import { browserLiveTransport } from '../../src/live-assistance/client'

const demo = createDemo({ evidenceTransport: new URLSearchParams(location.search).has('live') ? browserLiveTransport(async () => {
  const response = await fetch('/fake-guest-session')
  return response.json()
}) : {
  async evaluate(request, signal) {
    const response = await fetch('/fake-provider/systemone', { method: 'POST', headers: { Authorization: 'Bearer dummy-test-key', 'Content-Type': 'application/json' }, signal, body: JSON.stringify({ ...request, image: { ...request.image, bytes: Array.from(new Uint8Array(request.image.bytes)) }, ...(request.images ? { images: request.images.map(image => ({ ...image, bytes: Array.from(new Uint8Array(image.bytes)) })) } : {}) }) })
    if (!response.ok) throw new Error('unavailable')
    return response.json()
  },
} })
window.demo = demo
const context = await demo.startup(); await demo.signIn('mariam')
const correctionMode = new URLSearchParams(location.search).get('corrections')
const reviewerMode = new URLSearchParams(location.search).has('reviewer')
if (reviewerMode && new URLSearchParams(location.search).get('reviewer') === 'pdf') {
  const initial = await demo.readApplication(correctionApplicationId)
  if (initial.ok && initial.value.status === 'underReview' && !initial.value.rounds.length) {
    await requestIdentityCorrection(demo)
    const attachment = await prepareCorrectionIdentity(demo, await pdfFile(2))
    const published = await demo.execute(await correctionCommand(demo, {}, attachment, 'resubmit'))
    if (!published.ok) throw new Error(published.error.kind)
  }
}
if (reviewerMode) await demo.signIn('salma')
let view = await demo.readApplication(correctionMode || reviewerMode ? correctionApplicationId : 'RIFD-2026-001')
if (correctionMode && view.ok && view.value.status === 'underReview') {
  if (correctionMode === 'purchase') await requestPurchaseCorrection(demo)
  else if (correctionMode === 'business') await requestBusinessCorrection(demo)
  else await requestIdentityCorrection(demo, correctionMode === 'name' ? [{ kind: 'field', field: 'fullName', reason: { ar: 'صحح الاسم المعلن.', en: 'Correct the declared name.' } }] : [])
  view = await demo.readApplication(correctionApplicationId)
}
if (new URLSearchParams(location.search).has('new-draft')) view = await demo.newDraft('inventory')
if (!context.ok || !view.ok) throw new Error('fixture')
if (new URLSearchParams(location.search).has('samples-fail-once')) {
  const listSamples = demo.listSamples
  let failed = false
  demo.listSamples = id => {
    if (failed) return listSamples(id)
    failed = true
    return Promise.resolve({ ok: false, error: { kind: 'sessionExpired', key: 'error.sessionExpired' } })
  }
}
const initialContext = context.value, initialView = view.value
function Screen() {
  const [language, setLanguage] = useState<Language>('ar'), [step, setStep] = useState<ApplicationStep>('documents'), [view, setView] = useState(initialView)
  return <div className="mx-auto max-w-[1200px] p-4" dir={language === 'ar' ? 'rtl' : 'ltr'}><h1>Browser test fixture</h1><button onClick={() => { const next = language === 'ar' ? 'en' : 'ar'; setLanguage(next); document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr' }}>{language === 'ar' ? 'English' : 'العربية'}</button>
    {view.role === 'reviewer' ? <ReviewWorkspace demo={demo} datasetId={initialContext.datasetId} view={view} language={language} remember={() => {}} changed={setView} departure={() => {}} /> : view.status === 'draft' || view.status === 'correctionsRequested' ? <DraftEditor demo={demo} view={view} context={initialContext} language={language} step={step} changeStep={setStep} remember={() => {}} departure={() => {}} savedView={setView} /> : <h2>{view.status === 'submitted' ? language === 'ar' ? 'قُدم الطلب.' : 'Application submitted.' : language === 'ar' ? 'أُعيد تقديم التصحيحات.' : 'Corrections resubmitted.'}</h2>}
  </div>
}
createRoot(document.getElementById('root')!).render(<Screen />)
