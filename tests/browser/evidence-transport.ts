import type { EvidenceTransport, StageRequest } from '../../src/evidence-assistance/contract'

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

// This transport exists only in the browser test entry points. No runtime fake mode.
export function fakeEvidenceTransport(requests: StageRequest[] = [], respond = nativeIdentity): EvidenceTransport {
  return { async evaluate(request) { requests.push(request); return respond() } }
}
