declare global {
  interface Window {
    releaseSlowRequest(): void;
  }
}

export function holdSlowRequest() {
  const timer = window.setTimeout;
  Object.defineProperty(window, 'setTimeout', {
    configurable: true,
    writable: true,
    value(callback: TimerHandler, milliseconds?: number, ...args: unknown[]) {
      if (milliseconds === 1500 && typeof callback === 'function') {
        window.setTimeout = timer;
        const id = timer(() => {}, 60_000);
        window.releaseSlowRequest = () => {
          clearTimeout(id);
          callback(...args);
        };
        return id;
      }
      return timer(callback, milliseconds, ...args);
    },
  });
}

// Unsupported schema fixture, preserving the stored dataset.
export function addUnknownStore(): Promise<void> {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open('rifd-demo', 2);
    open.onupgradeneeded = () =>
      open.result.createObjectStore('legacy').put('Preserve until commit', 'record');
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      open.result.close();
      resolve();
    };
  });
}

export function addLegacyValues(): Promise<void> {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open('rifd-demo', 2);
    open.onupgradeneeded = () => {
      const store = open.result.createObjectStore('legacy');
      store.put(
        {
          bytes: new Uint8Array([7, 14, 21]),
          view: new DataView(new Uint8Array([3, 6]).buffer),
          map: new Map([['legacy', new Set([1, 2])]]),
          expression: /legacy/gi,
          blob: new Blob(['Legacy bytes'], { type: 'text/plain' }),
          file: new File(['Legacy file'], 'legacy.txt', { type: 'text/plain', lastModified: 100 }),
          error: new Error('Legacy failure'),
          invalidDate: new Date(NaN),
        },
        new Uint8Array([1, 2, 3]),
      );
    };
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      open.result.close();
      resolve();
    };
  });
}
