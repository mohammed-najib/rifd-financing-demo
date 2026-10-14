import { createDemo } from '../../src/demo'
import type { Demo } from '../../src/demo'

declare global { interface Window { demo: Demo } }
window.demo = createDemo()
