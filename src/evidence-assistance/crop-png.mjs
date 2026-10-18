import { zlibSync } from 'fflate'

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let value = index
  for (let bit = 0; bit < 8; bit++) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1
  return value >>> 0
})
const chunk = (name, data) => {
  const bytes = new Uint8Array(data.length + 12), view = new DataView(bytes.buffer)
  view.setUint32(0, data.length)
  bytes.set(Array.from(name, character => character.charCodeAt(0)), 4); bytes.set(data, 8)
  let crc = 0xffffffff
  for (const byte of bytes.subarray(4, -4)) crc = crcTable[(crc ^ byte) & 255] ^ (crc >>> 8)
  view.setUint32(bytes.length - 4, (crc ^ 0xffffffff) >>> 0)
  return bytes
}

// Both workers encode identical RGBA pixels with the same pinned compressor.
// Native canvas PNG encoding varies across browsers and cannot bind a crop hash.
export function cropPng(width, height, rgba) {
  const rows = new Uint8Array((width * 4 + 1) * height)
  for (let y = 0; y < height; y++) rows.set(rgba.subarray(y * width * 4, (y + 1) * width * 4), y * (width * 4 + 1) + 1)
  const header = new Uint8Array(13), view = new DataView(header.buffer)
  view.setUint32(0, width); view.setUint32(4, height); header[8] = 8; header[9] = 6
  const parts = [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', header), chunk('IDAT', zlibSync(rows, { level: 6 })), chunk('IEND', new Uint8Array(0))]
  const png = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0))
  let offset = 0
  for (const part of parts) { png.set(part, offset); offset += part.length }
  return png.buffer
}
