import { createHmac } from 'node:crypto';
import { z } from 'zod';

export interface MetadataStore {
  transaction<T>(
    keys: string[],
    update: (records: Record<string, unknown>) => { value: T; writes: Record<string, unknown> },
  ): Promise<T>;
}
export class LiveStop extends Error {}
const stop = (reason: string): never => {
  throw new LiveStop(reason);
};
const dayMs = 86_400_000;
const count = z.number().int().nonnegative();
const counter = z
  .object({
    attempts: count,
    expiresAt: count,
    subjects: z.array(z.string().max(128)).max(5000).optional(),
  })
  .strict();
const slot = z.object({ id: z.string(), until: count }).strict();
const controlSchema = z
  .object({
    enabled: z.boolean(),
    slots: z.array(slot).max(2),
    day: z.string().optional(),
    month: z.string().optional(),
    pendingUsage: z.array(z.string()).max(2).optional(),
    accountingBlocked: z.boolean().optional(),
  })
  .strict();
const guestSchema = z
  .object({
    day: z.string(),
    attempts: count,
    lastStart: count,
    active: z.string().nullable(),
    lease: count,
    expiresAt: count,
  })
  .strict();
const runSchema = z
  .object({
    fingerprint: z.string(),
    guest: z.string(),
    network: z.string(),
    day: z.string(),
    month: z.string(),
    planned: count.max(9),
    dispatched: z.array(count).max(9),
    released: count,
    lease: count,
    status: z.enum(['active', 'completed', 'stopped']),
    expiresAt: count,
  })
  .strict();
type Run = z.infer<typeof runSchema>;
export type Reservation = {
  key: string;
  keys: string[];
  duplicate: boolean;
  status: Run['status'];
};

export function createAdmission(store: MetadataStore, secret: string) {
  if (Buffer.byteLength(secret) < 32) stop('service-unavailable');
  const keyed = (kind: string, value: string) =>
    createHmac('sha256', secret).update(kind).update('\0').update(value).digest('hex');
  const read = <T>(schema: z.ZodType<T>, value: unknown): T => {
    const result = schema.safeParse(value);
    return result.success ? result.data : stop('accounting-unavailable');
  };
  const control = (records: Record<string, unknown>, now: number) => {
    const state = read(controlSchema, records.control);
    if (
      state.accountingBlocked ||
      state.pendingUsage?.some(id => !state.slots.some(slot => slot.id === id && slot.until > now))
    )
      stop('accounting-unavailable');
    if (!state.enabled) stop('service-disabled');
    return state;
  };
  const liveRun = (records: Record<string, unknown>, ticket: Reservation, now: number) => {
    control(records, now);
    const run = read(runSchema, records[ticket.key]);
    if (run.expiresAt <= now || run.status !== 'active' || run.lease <= now) stop('run-stopped');
    if (run.day !== `day-${new Date(now).toISOString().slice(0, 10)}`) stop('run-stopped');
    for (const key of [run.day, run.month, run.network]) {
      const value = read(counter, records[key]);
      if (value.expiresAt <= now || value.attempts < run.planned - run.released)
        stop('accounting-unavailable');
    }
    const guest = read(guestSchema, records[run.guest]);
    if (guest.active !== ticket.key || guest.expiresAt <= now) stop('accounting-unavailable');
    return run;
  };
  return {
    keyed,
    async reserve(input: {
      guest: string;
      network: string;
      runId: string;
      fingerprint: string;
      attempts: number;
      now: number;
    }): Promise<Reservation> {
      const { now, attempts } = input;
      if (!Number.isInteger(attempts) || attempts < 1 || attempts > 9) stop('invalid-request');
      const date = new Date(now),
        day = date.toISOString().slice(0, 10),
        month = day.slice(0, 7);
      const expiry = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 2);
      const monthlyExpiry = Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1) + 35 * dayMs;
      const guestKey = `guest-${keyed('guest', input.guest)}`;
      const networkKey = `network-${day}-${keyed('network', `${day}\0${input.network}`)}`;
      const key = `run-${keyed('run', `${input.guest}\0${input.runId}`)}`;
      const dayKey = `day-${day}`,
        monthKey = `month-${month}`;
      const previousDayKey = `day-${new Date(now - dayMs).toISOString().slice(0, 10)}`;
      const keys = ['control', key, guestKey, networkKey, dayKey, monthKey, previousDayKey];
      return store.transaction<Reservation>(keys, records => {
        const state = control(records, now);
        const daily = records[dayKey] === undefined ? undefined : read(counter, records[dayKey]);
        const previous =
          records[previousDayKey] === undefined
            ? undefined
            : read(counter, records[previousDayKey]);
        if (daily && !daily.subjects) stop('accounting-unavailable');
        const known = new Set(daily?.subjects ?? []);
        for (const id of [key, guestKey, networkKey]) {
          if (
            records[id] === undefined &&
            (known.has(id) || (id === guestKey && previous?.subjects?.includes(id)))
          )
            stop('accounting-unavailable');
        }
        if (records[key] !== undefined) {
          const run = read(runSchema, records[key]);
          // Expired run IDs are terminal, never permission to dispatch again.
          if (run.expiresAt <= now) stop('run-expired');
          if (run.fingerprint !== input.fingerprint) stop('run-conflict');
          return { value: { key, keys, duplicate: true, status: run.status }, writes: {} };
        }
        let guest =
          records[guestKey] === undefined
            ? { day, attempts: 0, lastStart: 0, active: null, lease: 0, expiresAt: expiry }
            : read(guestSchema, records[guestKey]);
        if (guest.expiresAt <= now)
          guest = { day, attempts: 0, lastStart: 0, active: null, lease: 0, expiresAt: expiry };
        if (guest.active && guest.lease > now) stop('guest-active');
        if (guest.lastStart && now - guest.lastStart < 60_000) stop('guest-rate');
        if ((guest.day === day ? guest.attempts : 0) + attempts > 20) stop('guest-allowance');
        const writes: Record<string, unknown> = {};
        for (const [id, limit, expiresAt] of [
          [networkKey, 60, expiry],
          [dayKey, 100, expiry],
          [monthKey, 1000, monthlyExpiry],
        ] as const) {
          if (
            records[id] === undefined &&
            ((id === dayKey && state.day === day) || (id === monthKey && state.month === month))
          )
            stop('accounting-unavailable');
          const existing =
            records[id] === undefined ? { attempts: 0, expiresAt } : read(counter, records[id]);
          const used = existing.expiresAt <= now ? 0 : existing.attempts;
          if (used + attempts > limit)
            stop(
              id === networkKey
                ? 'network-allowance'
                : id === dayKey
                  ? 'daily-allowance'
                  : 'monthly-allowance',
            );
          writes[id] = { attempts: used + attempts, expiresAt };
        }
        const subjects = [...new Set([...known, key, guestKey, networkKey])];
        if (subjects.length > 5000) stop('accounting-unavailable');
        writes[dayKey] = { ...(writes[dayKey] as object), subjects };
        writes.control = { ...state, day, month };
        writes[guestKey] = {
          day,
          attempts: (guest.day === day ? guest.attempts : 0) + attempts,
          lastStart: now,
          active: key,
          lease: now + 60_000,
          expiresAt: expiry,
        };
        writes[key] = {
          fingerprint: input.fingerprint,
          guest: guestKey,
          network: networkKey,
          day: dayKey,
          month: monthKey,
          planned: attempts,
          dispatched: [],
          released: 0,
          lease: now + 60_000,
          status: 'active',
          expiresAt: expiry,
        } satisfies Run;
        return { value: { key, keys, duplicate: false, status: 'active' as const }, writes };
      });
    },
    async mark(ticket: Reservation, attempt: number, now: number) {
      if (ticket.duplicate) stop('run-stopped');
      return store.transaction(ticket.keys, records => {
        const run = liveRun(records, ticket, now);
        if (
          !Number.isInteger(attempt) ||
          attempt < 0 ||
          attempt >= run.planned ||
          run.dispatched.includes(attempt)
        )
          stop('run-stopped');
        const state = control(records, now);
        state.slots = state.slots.filter(connection => connection.until > now);
        if (state.slots.length >= 2) stop('service-busy');
        const connection = `${ticket.key}:${attempt}`;
        state.slots.push({ id: connection, until: now + 60_000 });
        // Reconciliation survives worker loss and connection-lease expiry.
        // Only an accounted response may remove this entry.
        state.pendingUsage = [...(state.pendingUsage ?? []), connection];
        run.dispatched.push(attempt);
        return { value: connection, writes: { control: state, [ticket.key]: run } };
      });
    },
    async recheck(ticket: Reservation, now: number) {
      await store.transaction(ticket.keys, records => {
        liveRun(records, ticket, now);
        return { value: undefined, writes: {} };
      });
    },
    async disconnect(connection: string) {
      await store.transaction(['control'], records => {
        const state = read(controlSchema, records.control);
        state.slots = state.slots.filter(slot => slot.id !== connection);
        state.pendingUsage = state.pendingUsage?.filter(id => id !== connection);
        return { value: undefined, writes: { control: state } };
      });
    },
    async blockAccounting() {
      await store.transaction(['control'], records => {
        const state = read(controlSchema, records.control);
        return { value: undefined, writes: { control: { ...state, accountingBlocked: true } } };
      });
    },
    async finish(ticket: Reservation, status: 'completed' | 'stopped', now: number) {
      if (ticket.duplicate) return;
      await store.transaction(ticket.keys, records => {
        const run = read(runSchema, records[ticket.key]);
        if (run.status !== 'active') return { value: undefined, writes: {} };
        // Only entries never durably marked are definitely unsent. Ambiguous
        // marking, dispatch failures and lease expiry never cause a refund.
        const refund = run.planned - run.dispatched.length - run.released;
        const writes: Record<string, unknown> = {};
        for (const id of [run.day, run.month, run.network]) {
          const value = read(counter, records[id]);
          if (value.expiresAt <= now || value.attempts < refund) stop('accounting-unavailable');
          writes[id] = { ...value, attempts: value.attempts - refund };
        }
        const guest = read(guestSchema, records[run.guest]);
        if (guest.active === ticket.key)
          writes[run.guest] = { ...guest, attempts: guest.attempts - refund, active: null };
        run.status = status;
        run.released += refund;
        writes[ticket.key] = run;
        return { value: undefined, writes };
      });
    },
  };
}
export type Admission = ReturnType<typeof createAdmission>;

export async function pruneExpiredConnections(store: MetadataStore, now: number) {
  await store.transaction(['control'], records => {
    const state = controlSchema.safeParse(records.control);
    if (!state.success) return { value: undefined, writes: {} };
    const slots = state.data.slots.filter(slot => slot.until > now);
    return { value: undefined, writes: { control: { ...state.data, slots } } };
  });
}
