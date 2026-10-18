import { randomBytes } from 'node:crypto'
import { chmodSync, closeSync, existsSync, mkdirSync, openSync } from 'node:fs'
import { dirname } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import type { MetadataStore } from './admission'

// Local development only. SQLite commits reservations and dispatch marks before
// transport, shares them across processes, and never stores document content.
export function localMetadata(path: string) {
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 })
  const existing = existsSync(path)
  closeSync(openSync(path, 'a', 0o600)); chmodSync(path, 0o600)
  const db = new DatabaseSync(path)
  db.exec('PRAGMA busy_timeout = 5000; PRAGMA synchronous = FULL; CREATE TABLE IF NOT EXISTS metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL); CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)')
  db.exec('BEGIN IMMEDIATE')
  try {
    if (!db.prepare('SELECT value FROM settings WHERE key = ?').get('accounting-key')) {
      if (existing) throw Error('Missing local accounting state')
      db.prepare('INSERT INTO settings VALUES (?, ?)').run('accounting-key', randomBytes(32).toString('hex'))
      db.prepare('INSERT INTO metadata VALUES (?, ?)').run('control', JSON.stringify({ enabled: true, slots: [] }))
    }
    if (!db.prepare('SELECT value FROM metadata WHERE key = ?').get('control')) throw Error('Missing local admission control')
    db.exec('COMMIT')
  } catch (error) { db.exec('ROLLBACK'); db.close(); throw error }
  const secret = db.prepare('SELECT value FROM settings WHERE key = ?').get('accounting-key')?.value
  if (typeof secret !== 'string' || !/^[a-f0-9]{64}$/.test(secret)) { db.close(); throw Error('Invalid local accounting state') }
  db.prepare("DELETE FROM metadata WHERE key != 'control' AND json_extract(value, '$.expiresAt') <= ?").run(Date.now())
  const read = db.prepare('SELECT value FROM metadata WHERE key = ?')
  const write = db.prepare('INSERT INTO metadata VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
  const store: MetadataStore = {
    async transaction(keys, update) {
      db.exec('BEGIN IMMEDIATE')
      try {
        const records = Object.fromEntries(keys.map(key => {
          const value = read.get(key)?.value
          return [key, typeof value === 'string' ? JSON.parse(value) : undefined]
        }))
        const result = update(records)
        for (const [key, value] of Object.entries(result.writes)) write.run(key, JSON.stringify(value))
        db.exec('COMMIT')
        return result.value
      } catch (error) { db.exec('ROLLBACK'); throw error }
    },
  }
  return { store, secret, close: () => db.close() }
}
