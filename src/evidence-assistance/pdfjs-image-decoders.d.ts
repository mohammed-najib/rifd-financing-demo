// Narrow declarations for the exported decoder in our pinned PDF.js 5.4.296.
declare module 'pdfjs-dist/image_decoders/pdf.image_decoders.mjs' {
  export class JpegImage {
    width: number
    height: number
    parse(data: Uint8Array): void
  }
}
