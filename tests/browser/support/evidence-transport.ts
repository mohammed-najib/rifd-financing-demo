import type { EvidenceTransport, StageRequest } from '../../../src/evidence-assistance/contract'

export const nativeIdentity = () => ({
  model: 'jev-1.14.0',
  answers: {
    category: { type: 'choice', choice: 'identity', confidence: 0.999, probabilities: { identity: 0.999, business: 0.001, financial: 0, stock: 0, equipment: 0, other: 0, mixed: 0, uncertain: 0 } },
    readability: { type: 'score', score: 1.995, confidence: 0.998, probabilities: { '0': 0, '1': 0.005, '2': 0.995 }, legend: { '0': 'Relevant text unreadable', '1': 'Partly readable with obscured details', '2': 'Relevant text and digits clearly readable' } },
    namePresence: { type: 'noul', noul: 0.999 },
    nameSupport: { type: 'choice', choice: 'different', confidence: 0.999, probabilities: { consistent: 0.001, different: 0.999, not_found: 0, conflict: 0, uncertain: 0 } },
  },
  usage: { input_tokens: 2500, output_tokens: 40 },
})

export const nativeBusiness = () => ({
  ...nativeIdentity(),
  answers: {
    category: { type: 'choice', choice: 'business', confidence: 0.999, probabilities: { identity: 0, business: 1, financial: 0, stock: 0, equipment: 0, other: 0, mixed: 0, uncertain: 0 } },
    readability: nativeIdentity().answers.readability,
    businessNamePresence: { type: 'noul', noul: 0.999 },
    addressPresence: { type: 'noul', noul: 0.999 },
    operatingSincePresence: { type: 'noul', noul: 0.999 },
    businessNameSupport: { type: 'choice', choice: 'different', confidence: 0.999, probabilities: { consistent: 0, different: 1, not_found: 0, conflict: 0, uncertain: 0 } },
    addressSupport: { type: 'choice', choice: 'conflict', confidence: 0.999, probabilities: { consistent: 0, different: 0, not_found: 0, conflict: 1, uncertain: 0 } },
    operatingSinceSupport: { type: 'choice', choice: 'consistent', confidence: 0.999, probabilities: { consistent: 1, different: 0, not_found: 0, conflict: 0, uncertain: 0 } },
  },
})

// This transport exists only in the browser test entry points. No runtime fake mode.
export function fakeEvidenceTransport(requests: StageRequest[] = [], respond = nativeIdentity): EvidenceTransport {
  return { async evaluate(request) { requests.push(request); return respond() } }
}

export const nativePurchase = (product: 'inventory' | 'equipment' = 'inventory') => ({
  ...nativeIdentity(),
  answers: {
    category: { type: 'choice', choice: product === 'inventory' ? 'stock' : 'equipment', confidence: 0.999, probabilities: { identity: 0, business: 0, financial: 0, stock: product === 'inventory' ? 1 : 0, equipment: product === 'equipment' ? 1 : 0, other: 0, mixed: 0, uncertain: 0 } },
    readability: nativeIdentity().answers.readability,
    descriptionPresence: { type: 'noul', noul: 0.999 }, budgetPresence: { type: 'noul', noul: 0.999 },
    descriptionSupport: { type: 'choice', choice: 'consistent', confidence: 0.999, probabilities: { consistent: 1, different: 0, not_found: 0, conflict: 0, uncertain: 0 } },
    budgetSupport: { type: 'choice', choice: 'different', confidence: 0.999, probabilities: { consistent: 0, different: 1, not_found: 0, conflict: 0, uncertain: 0 } },
  },
})

export function nativeLocatedIdentity(request: StageRequest): unknown {
  if (request.stage === 'bound-verification') return { model: 'jev-1.14.0', answers: Object.fromEntries(Object.keys(request.questions).map(key => [key, { type: 'noul', noul: key.endsWith('Association') ? 0.99 : 0.01 }])), usage: { input_tokens: 500, output_tokens: 60 } }
  return { ...nativeIdentity(), answers: { ...nativeIdentity().answers, fullNameBox: { type: 'box', box: { left: 0.1015, top: 0.2005, right: 0.3005, bottom: 0.2505 }, confidence: null }, fullNameMultiplicity: { type: 'choice', choice: 'single', confidence: 0.1, probabilities: { absent: 0, single: 0.99, repeated: 0.01, uncertain: 0 } } } }
}
