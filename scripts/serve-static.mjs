import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, resolve, sep } from 'node:path'

const root = resolve('dist/client')
const shell = await readFile(resolve(root, '_shell.html'))
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.ttf': 'font/ttf', '.txt': 'text/plain' }
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
    const path = resolve(root, `.${pathname}`)
    if (path !== root && !path.startsWith(root + sep)) { response.writeHead(403); response.end(); return }
    const exists = await stat(path).then(info => info.isFile()).catch(() => false)
    const body = exists ? await readFile(path) : shell
    response.writeHead(200, { 'content-type': exists ? mime[extname(path)] ?? 'application/octet-stream' : 'text/html; charset=utf-8', 'cache-control': 'no-store' })
    response.end(body)
  } catch { response.writeHead(400); response.end() }
})
server.listen(4173, '127.0.0.1', () => console.log(`Static SPA: http://127.0.0.1:4173 (${root})`))
