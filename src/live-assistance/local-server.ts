import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto'
import { createServer, type IncomingMessage } from 'node:http'
import { z } from 'zod'
import { bounds } from '../evidence-assistance/contract'
import { createAdmission, LiveStop } from './admission'
import { createJevWorkflow } from './jev'
import { localMetadata } from './local-store'
import { createLiveService, liveResponseHeaders } from './service'

const sessionSchema = z.object({ guest: z.string().uuid(), expiresAt: z.number().int().positive() }).strict()
const cookieName = 'rifd_local_jev'
type Event = { event: 'provider-response' | 'analysis-response'; status: number; milliseconds?: number; stages?: number }

// This listener is started only by dev:jev, never by the hosted function. The
// browser uses a signed local session instead of creating a Firebase account.
export async function startLocalJev(options: {
  apiKey: string; origin: string; statePath: string
  fetch?: typeof fetch; onEvent?: (event: Event) => void
}) {
  if (!/^http:\/\/127\.0\.0\.1:\d+$/.test(options.origin) || !options.apiKey.trim()) throw Error('Invalid local Jev configuration')
  const metadata = localMetadata(options.statePath)
  const sign = (payload: string) => createHmac('sha256', metadata.secret).update('local-session\0').update(payload).digest('base64url')
  const verify = (token: string | undefined) => {
    if (!token || token.length > 512) return null
    const [payload, signature, extra] = token.split('.')
    if (!payload || !signature || extra || !/^[A-Za-z0-9_-]+$/.test(signature)) return null
    const actual = Buffer.from(signature), expected = Buffer.from(sign(payload))
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null
    try {
      const session = sessionSchema.safeParse(JSON.parse(Buffer.from(payload, 'base64url').toString()))
      return session.success && session.data.expiresAt > Date.now() ? session.data : null
    } catch { return null }
  }
  const invoke = options.fetch ?? fetch
  const service = createLiveService({
    admission: createAdmission(metadata.store, metadata.secret),
    authorize: async (auth, app) => {
      const session = verify(auth?.startsWith('Bearer ') ? auth.slice(7) : undefined)
      if (!session || app !== 'local-development') throw new LiveStop('access-denied')
      return session.guest
    },
    execute: createJevWorkflow({ apiKey: options.apiKey, fetch: async (url, init) => {
      const start = performance.now(), response = await invoke(url, init)
      options.onEvent?.({ event: 'provider-response', status: response.status, milliseconds: Math.round(performance.now() - start) })
      return response
    } }),
  })
  async function body(request: IncomingMessage) {
    const chunks: Buffer[] = []
    let length = 0
    for await (const chunk of request.iterator({ destroyOnReturn: false })) {
      length += chunk.length
      if (length > bounds.bodyBytes) { request.resume(); throw new LiveStop('body-limit') }
      chunks.push(Buffer.from(chunk))
    }
    return Buffer.concat(chunks)
  }
  const server = createServer(async (request, response) => {
    response.setTimeout(55_000, () => response.destroy())
    const abort = new AbortController()
    response.on('close', () => { if (!response.writableEnded) abort.abort() })
    const send = (status: number, value: unknown) => {
      if (!response.destroyed) { response.writeHead(status, liveResponseHeaders); response.end(JSON.stringify(value)) }
    }
    const peer = request.socket.remoteAddress
    const expectedHost = new URL(options.origin).host
    if (!['127.0.0.1', '::ffff:127.0.0.1'].includes(peer ?? '') || request.headers.host !== expectedHost || request.headers.origin !== options.origin || request.headers['sec-fetch-site'] && request.headers['sec-fetch-site'] !== 'same-origin') {
      send(401, { status: 'unavailable', reason: 'access-denied' }); return
    }
    if (!['/api/evidence-analysis', '/api/local-evidence-session'].includes(request.url ?? '')) { send(404, { status: 'unavailable', reason: 'service-unavailable' }); return }
    if (request.method !== 'POST' || request.headers['content-type']?.split(';')[0].trim() !== 'application/json' || request.headers['content-encoding']) { send(400, { status: 'unavailable', reason: 'invalid-request' }); return }
    try {
      const bytes = await body(request)
      if (request.url === '/api/local-evidence-session') {
        if (bytes.toString().trim() !== '{}') { send(400, { status: 'unavailable', reason: 'invalid-request' }); return }
        let token = request.headers.cookie?.split(';').map(value => value.trim()).find(value => value.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1)
        if (!verify(token)) {
          const payload = Buffer.from(JSON.stringify({ guest: randomUUID(), expiresAt: Date.now() + 7 * 86_400_000 })).toString('base64url')
          token = `${payload}.${sign(payload)}`
        }
        response.setHeader('Set-Cookie', `${cookieName}=${token}; HttpOnly; SameSite=Strict; Path=/api; Max-Age=604800`)
        send(200, { authorization: `Bearer ${token}`, appCheck: 'local-development' }); return
      }
      const result = await service({ body: bytes, authorization: request.headers.authorization, appCheck: request.headers['x-firebase-appcheck'] as string | undefined, network: 'loopback', signal: abort.signal })
      options.onEvent?.({ event: 'analysis-response', status: result.status, stages: result.body.status === 'completed' ? result.body.stages.length : 0 })
      send(result.status, result.body)
    } catch (error) { send(error instanceof LiveStop && error.message === 'body-limit' ? 413 : 503, { status: 'unavailable', reason: error instanceof LiveStop && error.message === 'body-limit' ? 'body-limit' : 'service-unavailable' }) }
  })
  server.requestTimeout = 55_000
  try { await new Promise<void>((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve) }) }
  catch (error) { metadata.close(); throw error }
  const address = server.address()
  if (!address || typeof address === 'string') throw Error('Local Jev listener unavailable')
  return { target: `http://127.0.0.1:${address.port}`, close: () => new Promise<void>((resolve, reject) => server.close(error => { metadata.close(); if (error) reject(error); else resolve() })) }
}
