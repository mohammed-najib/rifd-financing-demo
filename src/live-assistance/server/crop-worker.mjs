import { parentPort, workerData } from 'node:worker_threads'
import { inflateSync } from 'node:zlib'
import { createHash } from 'node:crypto'
import { cropPng } from '../../evidence-assistance/preparation/crop-png.mjs'

// Input PNGs have already passed CRC, dimension, format and inflation admission.
// Pixel work runs off the request thread so cancellation can terminate it.
const { image, regions } = workerData
const png = Buffer.from(image.bytes), { width, height } = image.manifest
const channels = png[25] === 6 ? 4 : 3, stride = width * channels
const parts = []
for (let offset = 8; offset < png.length;) {
  const size = png.readUInt32BE(offset)
  if (png.toString('ascii', offset + 4, offset + 8) === 'IDAT') parts.push(png.subarray(offset + 8, offset + 8 + size))
  offset += size + 12
}
const filtered = inflateSync(Buffer.concat(parts), { maxOutputLength: (stride + 1) * height })
const pixels = Buffer.alloc(stride * height)
const paeth = (a, b, c) => {
  const p = a + b - c, da = Math.abs(p - a), db = Math.abs(p - b), dc = Math.abs(p - c)
  return da <= db && da <= dc ? a : db <= dc ? b : c
}
for (let y = 0; y < height; y++) {
  const filter = filtered[y * (stride + 1)]
  for (let x = 0; x < stride; x++) {
    const left = x >= channels ? pixels[y * stride + x - channels] : 0
    const up = y ? pixels[(y - 1) * stride + x] : 0
    const corner = y && x >= channels ? pixels[(y - 1) * stride + x - channels] : 0
    const predictor = [0, left, up, Math.floor((left + up) / 2), paeth(left, up, corner)][filter]
    pixels[y * stride + x] = (filtered[y * (stride + 1) + 1 + x] + predictor) & 255
  }
}
const crops = regions.map(binding => {
  const { width: w, height: h, enclosure: e, padding: p } = binding
  const rows = Buffer.alloc(w * 4 * h, 255)
  for (let y = e.top; y < e.bottom; y++) for (let x = e.left; x < e.right; x++) {
    const source = y * stride + x * channels
    const target = ((y - e.top + p.top) * w + x - e.left + p.left) * 4
    const alpha = channels === 4 ? pixels[source + 3] / 255 : 1
    for (let channel = 0; channel < 3; channel++) rows[target + channel] = Math.round(pixels[source + channel] * alpha + 255 * (1 - alpha))
  }
  const bytes = cropPng(w, h, rows)
  return { bytes, binding: { ...binding, cropHash: createHash('sha256').update(new Uint8Array(bytes)).digest('hex') } }
})
parentPort.postMessage(crops, crops.map(crop => crop.bytes))
