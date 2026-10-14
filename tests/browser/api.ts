import { createDemo } from '../../src/demo'
import type { Demo, SaveDraftOperation } from '../../src/demo'

declare global { interface Window { demo: Demo; draftCommand: SaveDraftOperation } }
window.demo = createDemo()
