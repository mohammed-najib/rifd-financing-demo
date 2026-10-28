import { LiveStop } from './admission';

// Supervision starts before decoding, hashing or provider preprocessing. Every
// awaited operation is raced, including collaborators that ignore AbortSignal.
export function supervise(parent: AbortSignal | undefined, milliseconds: number) {
  const abort = new AbortController(),
    deadline = performance.now() + milliseconds;
  const cancel = () =>
    abort.abort(parent?.reason instanceof LiveStop ? parent.reason : new LiveStop('run-stopped'));
  parent?.addEventListener('abort', cancel, { once: true });
  if (parent?.aborted) cancel();
  const timer = setTimeout(() => abort.abort(new LiveStop('deadline')), milliseconds);
  const check = (remaining = 0) => {
    abort.signal.throwIfAborted();
    if (performance.now() + remaining >= deadline) {
      abort.abort(new LiveStop('deadline'));
      abort.signal.throwIfAborted();
    }
  };
  return {
    signal: abort.signal,
    check,
    async wait<T>(operation: () => Promise<T>): Promise<T> {
      check();
      let rejectAbort: () => void = () => undefined;
      const cancelled = new Promise<never>((_, reject) => {
        rejectAbort = () => reject(abort.signal.reason);
        abort.signal.addEventListener('abort', rejectAbort, { once: true });
      });
      try {
        const value = await Promise.race([operation(), cancelled]);
        check();
        return value;
      } finally {
        abort.signal.removeEventListener('abort', rejectAbort);
      }
    },
    dispose() {
      clearTimeout(timer);
      parent?.removeEventListener('abort', cancel);
      abort.abort(new LiveStop('run-stopped'));
    },
  };
}
