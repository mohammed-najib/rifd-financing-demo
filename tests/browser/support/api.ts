import { createDemo } from '../../../src/demo'
import type { Demo, SaveDraftOperation, SubmitOperation } from '../../../src/demo/types'

declare global { interface Window { demo: Demo; draftCommand: SaveDraftOperation; submitCommand: SubmitOperation } }
const params = new URLSearchParams(location.search)
const strict = params.has('strict')
window.demo = createDemo({
  latency: strict ? 400 : 0,
  verifyStoredFiles: strict,
  loadFonts: strict || params.has('fonts'),
  includeOversizedSample: params.has('full'),
  compactEvidence: !params.has('full'),
})
