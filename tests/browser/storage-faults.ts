// Passed to page.evaluate: install a one-shot fault at the browser storage boundary.
export function loseNextWriteCompletion() {
  const transaction = IDBDatabase.prototype.transaction
  IDBDatabase.prototype.transaction = function (...args: Parameters<IDBDatabase['transaction']>) {
    const tx = transaction.apply(this, args)
    if (args[1] === 'readwrite') {
      IDBDatabase.prototype.transaction = transaction
      Object.defineProperty(tx, 'oncomplete', { configurable: true, set() { /* Lost completion observation. */ } })
    }
    return tx
  }
}
