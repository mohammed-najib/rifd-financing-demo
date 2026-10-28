import { z } from 'zod';
import { versions, type StageRequest } from '../contract';

export const bridgeSchema = z
  .object({
    requestedModel: z.literal(versions.model),
    dispatchedAt: z.iso.datetime(),
    answeredAt: z.iso.datetime(),
    mapped: z.record(z.string(), z.json()),
    invalidAnswers: z.array(z.string()).max(64),
    state: z.json().transform(value => value as StageRequest['state']),
  })
  .strict();
