import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, resolve, sep } from 'node:path'

const root = resolve(process.env.RIFD_STATIC_ROOT ?? 'dist/client')
const port = Number(process.env.RIFD_STATIC_PORT ?? 4173)
const shell = await readFile(resolve(root, process.env.RIFD_STATIC_SHELL ?? '_shell.html')).catch(() => null)
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.txt': 'text/plain' }
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
    const path = resolve(root, `.${pathname}`)
    if (path !== root && !path.startsWith(root + sep)) { response.writeHead(403); response.end(); return }
    const exists = await stat(path).then(info => info.isFile()).catch(() => false)
    const body = exists ? await readFile(path) : shell
    if (!body) { response.writeHead(404); response.end(); return }
    response.writeHead(200, { 'content-type': exists ? mime[extname(path)] ?? 'application/octet-stream' : 'text/html; charset=utf-8', 'cache-control': 'no-store' })
    response.end(body)
  } catch { response.writeHead(400); response.end() }
})
server.listen(port, '127.0.0.1', () => console.log(`Static SPA: http://127.0.0.1:${port} (${root})`))