import { isIP } from 'node:net'

// No caller header is accepted as a trusted address by itself. Activation must
// pin and verify the platform-appended proxy suffix on BOTH endpoint routes.
// Until that evidence exists, an unset suffix makes live work unavailable.
export function trustedNetwork(forwarded: string | undefined, trustedProxySuffix: string[]): string | null {
  if (!forwarded || !trustedProxySuffix.length || trustedProxySuffix.some(ip => !isIP(ip))) return null
  const chain = forwarded.split(',').map(value => value.trim())
  const clientIndex = chain.length - trustedProxySuffix.length - 1
  if (clientIndex < 0 || trustedProxySuffix.some((ip, i) => chain[clientIndex + i + 1] !== ip)) return null
  const client = chain[clientIndex]
  if (!isIP(client)) return null
  // Normalize textual IPv6 and IPv4-mapped IPv6 before daily keyed hashing.
  if (isIP(client) === 4) return client
  const normalized = new URL(`http://[${client}]/`).hostname.slice(1, -1)
  return normalized.startsWith('::ffff:') && isIP(normalized.slice(7)) === 4 ? normalized.slice(7) : normalized
}
