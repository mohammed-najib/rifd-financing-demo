import { createDemo } from '../../../src/demo'
import type { Demo, SaveDraftOperation, SubmitOperation } from '../../../src/demo/types'

declare global { interface Window { demo: Demo; draftCommand: SaveDraftOperation; submitCommand: SubmitOperation } }
window.demo = createDemo()
