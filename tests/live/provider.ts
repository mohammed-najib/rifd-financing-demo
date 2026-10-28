import type { FixedQuestion } from '../../src/evidence-assistance/contract';

export type ProviderRequest = {
  model: string;
  state: Record<string, unknown>;
  questions: Record<string, FixedQuestion>;
  assets: Record<string, { type: string; part: string }>;
};
export async function providerRequest(init?: RequestInit): Promise<ProviderRequest> {
  const form = await new Response(init?.body, { headers: init?.headers }).formData();
  return JSON.parse(form.get('request') as string);
}

export const locatedIdentity = () => ({
  fullNameBox: {
    type: 'box',
    box: { left: 0.1015, top: 0.2005, right: 0.3005, bottom: 0.2505 },
    confidence: null,
  },
  fullNameMultiplicity: {
    type: 'choice',
    choice: 'single',
    confidence: 0.1,
    probabilities: { absent: 0, single: 0.99, repeated: 0.01, uncertain: 0 },
  },
});
export function verifiedBounds(request: ProviderRequest) {
  return {
    model: 'jev-1.14.0',
    answers: Object.fromEntries(
      Object.keys(request.questions).map(key => [
        key,
        { type: 'noul', noul: key.endsWith('Association') ? 0.99 : 0.01 },
      ]),
    ),
    usage: { input_tokens: 500, output_tokens: 60 },
  };
}
