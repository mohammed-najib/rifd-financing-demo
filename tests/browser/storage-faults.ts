// Passed to page.evaluate: install a one-shot fault at the browser storage boundary.
export function loseNextWriteCompletion() {
  const transaction = IDBDatabase.prototype.transaction
  IDBDatabase.prototype.transaction = function (...args: Parameters<IDBDatabase['transaction']>) {
    const tx = transaction.apply(this, args)
    if (this.name === 'rifd-demo' && args[1] === 'readwrite') {
      IDBDatabase.prototype.transaction = transaction
      Object.defineProperty(tx, 'oncomplete', { configurable: true, set() { /* Lost completion observation. */ } })
    }
    return tx
  }
}

// Change notices are best effort. Refuse both browser transports and a local
// observer while assertions continue through Demo's public reads and receipts.
export function refuseCommitNotices() {
  BroadcastChannel.prototype.postMessage = () => { throw new Error('Unavailable broadcast') }
  const setItem = Storage.prototype.setItem
  Storage.prototype.setItem = function (key: string, value: string) {
    if (key === 'rifd.commit.v1') throw new Error('Unavailable storage notice')
    setItem.call(this, key, value)
  }
  window.demo.subscribe(() => { throw new Error('Unavailable observer') })
}
