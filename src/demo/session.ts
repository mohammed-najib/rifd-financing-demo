import { z } from 'zod';
import { actorIdSchema } from '../domain/model';
import type { Session } from './types';
import { DemoError } from './storage';

export const sessionKey = 'rifd.session.v1';
export const inactivity = 15 * 60 * 1000;

const sessionSchema = z.object({
  identity: actorIdSchema,
  datasetId: z.string().uuid(),
  sessionId: z.string().uuid(),
  lastActivity: z.number(),
  expiresAt: z.number(),
});

export function readStoredSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(sessionKey);
    const probe = `rifd.session.probe.${crypto.randomUUID()}`;
    sessionStorage.setItem(probe, '');
    sessionStorage.removeItem(probe);
    if (!raw) return null;
    const parsed = sessionSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch (error) {
    if (error instanceof SyntaxError) return null;
    throw new DemoError('storage');
  }
}

export function persistSession(next: Session | null): void {
  if (next) sessionStorage.setItem(sessionKey, JSON.stringify(next));
  else sessionStorage.removeItem(sessionKey);
}
