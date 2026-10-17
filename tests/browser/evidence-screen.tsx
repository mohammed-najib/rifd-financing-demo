import { createRoot } from 'react-dom/client'
import { useState } from 'react'
import { createDemo } from '../../src/demo'
import type { Language } from '../../src/domain/model'
import type { ApplicationStep } from '../../src/domain'
import { DraftEditor } from '../../src/ui/draft'

const demo = createDemo({ evidenceTransport: {
  async evaluate(request, signal) {
    const response = await fetch('/fake-provider/systemone', { method: 'POST', headers: { Authorization: 'Bearer dummy-test-key', 'Content-Type': 'application/json' }, signal, body: JSON.stringify({ ...request, image: { ...request.image, bytes: Array.from(new Uint8Array(request.image.bytes)) } }) })
    if (!response.ok) throw new Error('unavailable')
    return response.json()
  },
} })
window.demo = demo
const context = await demo.startup(); await demo.signIn('mariam')
const view = await demo.readApplication('RIFD-2026-001')
if (!context.ok || !view.ok) throw new Error('fixture')
const initialContext = context.value, initialView = view.value
function Screen() {
  const [language, setLanguage] = useState<Language>('ar'), [step, setStep] = useState<ApplicationStep>('documents'), [view, setView] = useState(initialView)
  return <div className="mx-auto max-w-[1200px] p-4" dir={language === 'ar' ? 'rtl' : 'ltr'}><h1>Browser test fixture</h1><button onClick={() => { const next = language === 'ar' ? 'en' : 'ar'; setLanguage(next); document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr' }}>{language === 'ar' ? 'English' : 'العربية'}</button>
    <DraftEditor demo={demo} view={view} context={initialContext} language={language} step={step} changeStep={setStep} remember={() => {}} departure={() => {}} savedView={setView} />
  </div>
}
createRoot(document.getElementById('root')!).render(<Screen />)
