import type { DocumentSlot, Fields, Language, ProductId } from '../../domain/model'
import type { PreparedAttachment } from '../types'
import index from './data/index.json'
import arFinancial from './data/ar-financial-01.json'
import business from './data/en-business-02.json'
import purchase from './data/en-purchase-03.json'
import identity from './data/en-identity-10.json'
import enFinancial from './data/en-financial-10.json'

export type SavedCapture = typeof arFinancial | typeof business | typeof purchase | typeof identity | typeof enFinancial
export type SavedBasis = { model: string; questions: string; preparation: string; display: string; selection: string }
export type SavedSelection = {
  exampleId: string;
  current?: {
    applicationId: string; slot: DocumentSlot; language: Language;
    fileId?: string | null; attachment?: PreparedAttachment; fields?: Fields; product?: ProductId;
    selectedPages?: number[]; versions?: SavedBasis;
  };
}
export type SavedExample = { id: string; slot: DocumentSlot; language: Language }
export type SavedDocument = { bytes: ArrayBuffer; name: string; mime: string; hash: string }
export type OpenedSavedDemonstration = {
  provenance: 'saved-demonstration'; attachment: 'example' | 'current-document';
  capture: SavedCapture; source: SavedDocument;
  pages: { page: number; width: number; height: number; bytes: ArrayBuffer; hash: string }[];
}
const captures: SavedCapture[] = [arFinancial, business, purchase, identity, enFinancial]
// Eager inline imports make every original and recorded raster available after load,
// including examples the visitor has not opened before going offline.
const assets = import.meta.glob<string>('./assets/**/*', { eager: true, query: '?inline', import: 'default' })
export const savedExamples = (): SavedExample[] => index.examples.map(({ id, slot, language }) => ({ id, slot: slot as DocumentSlot, language: language as Language }))
export const savedBasis = (capture: SavedCapture): SavedBasis => ({ model: capture.model, questions: capture.questionVersion, preparation: capture.preparationVersion, display: capture.candidateDisplayPolicy, selection: capture.staticSelectionVersion })
export const hashBytes = async (bytes: ArrayBuffer) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), byte => byte.toString(16).padStart(2, '0')).join('')
const equal = (left: unknown, right: unknown): boolean => {
  if (left === right) return true
  if (!left || !right || typeof left !== 'object' || typeof right !== 'object') return false
  const a = Object.entries(left), b = Object.entries(right)
  return a.length === b.length && a.every(([key, value]) => Object.hasOwn(right, key) && equal(value, (right as Record<string, unknown>)[key]))
}
export async function openSavedExample(id: string): Promise<OpenedSavedDemonstration | null> {
  const original = captures.find(capture => capture.sourceFamily === id)
  if (!original) return null
  const capture = structuredClone(original)
  const bytesFor = async (path: string, hash: string) => {
    const url = assets[`./assets/${path}`]
    if (!url?.startsWith('data:')) throw new Error('Missing bundled evidence')
    const bytes = Uint8Array.from(atob(url.slice(url.indexOf(',') + 1)), char => char.charCodeAt(0)).buffer
    if (await hashBytes(bytes) !== hash) throw new Error('Bundled evidence hash mismatch')
    return bytes
  }
  const source = { bytes: await bytesFor(capture.source.path, capture.source.sha256), hash: capture.source.sha256, name: `${id}.${capture.source.path.endsWith('.pdf') ? 'pdf' : 'png'}`, mime: capture.source.path.endsWith('.pdf') ? 'application/pdf' : 'image/png' }
  const pages = []
  for (const page of capture.pages) pages.push({ page: page.page, width: page.width, height: page.height, hash: page.sha256, bytes: await bytesFor(page.path, page.sha256) })
  return { provenance: 'saved-demonstration', attachment: 'example', capture, source, pages }
}

// The static preparation path uses only the recorded, hash-checked full-page
// rasters. It never re-renders a source or applies the provisional live policy.
export function matchesSavedContext(capture: SavedCapture, current: NonNullable<SavedSelection['current']>, fields: Fields, product: ProductId, months: string[], initialMonth: string): boolean {
  const ar = current.language === 'ar'
  const currency = (value: string) => `${value} ${ar ? 'ريال' : 'YER'}`
  const monthName = (month: string) => new Intl.DateTimeFormat(ar ? 'ar' : 'en', { month: 'long', timeZone: 'UTC' }).format(new Date(`${month}-01T00:00:00Z`))
  const year = months[0]?.slice(0, 4)
  const period = months.length === 3 ? `${monthName(months[0])}${ar ? ' إلى ' : ' to '}${monthName(months[2])} ${ar ? year.replace(/\d/g, digit => '٠١٢٣٤٥٦٧٨٩'[Number(digit)]) : year}` : ''
  const comparisons: Record<string, string> = capture.slot === 'identity' ? { name: fields.fullName }
    : capture.slot === 'business' ? { businessName: fields.businessName, address: fields.address, startMonth: fields.operatingSince }
      : capture.slot === 'purchase' ? { description: fields.explanation, budget: currency(fields.budget) }
        : { period, averageRevenue: currency(fields.revenue), averageExpenses: currency(fields.expenses) }
  return current.slot === capture.slot && equal(current.selectedPages ?? capture.pages.map(page => page.page), capture.pages.map(page => page.page))
    && equal(current.versions ?? savedBasis(capture), savedBasis(capture))
    && equal({ slot: current.slot, language: current.language, product: capture.slot === 'purchase' ? product : null, initialSubmissionMonth: initialMonth, expectedCompletedMonths: capture.slot === 'financial' ? months : null, comparisons }, capture.context)
}
