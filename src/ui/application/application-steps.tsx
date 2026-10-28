import { applicationSteps, type ApplicationStep } from '../../domain'
import type { Language } from '../../domain/model'
import { applicationText } from './application-copy'

export function ApplicationSteps({ current, language, changeStep }: { current: ApplicationStep; language: Language; changeStep: (step: ApplicationStep) => void }) {
  return <nav className="application-steps actions" aria-label={applicationText.steps[language]}>{applicationSteps.map((step, index) => <a className="button secondary" key={step} href={`?step=${step}`} aria-current={current === step ? 'step' : undefined} onClick={event => { event.preventDefault(); changeStep(step) }}>{index + 1}. {applicationText[step][language]}</a>)}</nav>
}
