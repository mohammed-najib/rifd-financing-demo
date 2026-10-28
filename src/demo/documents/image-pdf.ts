// The demo needs only fixed-size pages containing our own RGB JPEG canvases.
// Keep this writer limited to that format; it is not a general PDF editor.
export function imagePdf(pages: { bytes: ArrayBuffer; width: number; height: number }[]): ArrayBuffer {
  const encoder = new TextEncoder()
  const chunks: Uint8Array[] = []
  const offsets = [0]
  let length = 0
  const append = (value: string | Uint8Array) => {
    const bytes = typeof value === 'string' ? encoder.encode(value) : value
    chunks.push(bytes); length += bytes.length
  }
  const object = (id: number, body: string, stream?: Uint8Array) => {
    offsets[id] = length
    append(`${id} 0 obj\n${body}`)
    if (stream) { append('\nstream\n'); append(stream); append('\nendstream') }
    append('\nendobj\n')
  }
  append('%PDF-1.4\n')
  object(1, '<< /Type /Catalog /Pages 2 0 R >>')
  object(2, `<< /Type /Pages /Count ${pages.length} /Kids [${pages.map((_, index) => `${3 + index * 3} 0 R`).join(' ')}] >>`)
  pages.forEach((page, index) => {
    const id = 3 + index * 3
    const image = new Uint8Array(page.bytes)
    const content = encoder.encode('q\n500 0 0 660 0 0 cm\n/Image Do\nQ\n')
    object(id, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 500 660] /Resources << /XObject << /Image ${id + 1} 0 R >> >> /Contents ${id + 2} 0 R >>`)
    object(id + 1, `<< /Type /XObject /Subtype /Image /Width ${page.width} /Height ${page.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.length} >>`, image)
    object(id + 2, `<< /Length ${content.length} >>`, content)
  })
  const xref = length
  append(`xref\n0 ${offsets.length}\n0000000000 65535 f \n`)
  for (const offset of offsets.slice(1)) append(`${String(offset).padStart(10, '0')} 00000 n \n`)
  append(`trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`)
  const result = new Uint8Array(length)
  let position = 0
  for (const chunk of chunks) { result.set(chunk, position); position += chunk.length }
  return result.buffer
}
