import { useEffect, useState } from 'react'
import type { PDFDocumentLoadingTask, PDFDocumentProxy, RenderTask } from 'pdfjs-dist'
import type { Language } from '../domain/model'
import type { EvidenceSource } from '../evidence-assistance/contract'
import { assistanceText } from './evidence-assistance-copy'
import { DocumentPreviewContent } from './preview'

// Ordinary inspection is independent of the analysis page limits and coverage.
export function SourcePages({ source, file, language }: { source: EvidenceSource; file: { url: string; mime: string; name: string }; language: Language }) {
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null)
  const [page, setPage] = useState(1), [image, setImage] = useState<{ url: string; page: number } | null>(null)
  const [failed, setFailed] = useState(false)
  const t = (key: keyof typeof assistanceText) => assistanceText[key][language]
  const isPdf = source.mime === 'application/pdf'
  useEffect(() => {
    if (!isPdf) return
    let active = true, task: PDFDocumentLoadingTask | undefined
    void (async () => {
      const [{ getDocument, GlobalWorkerOptions }, { default: worker }] = await Promise.all([import('pdfjs-dist'), import('pdfjs-dist/build/pdf.worker.min.mjs?url')])
      if (!active) return
      GlobalWorkerOptions.workerSrc = worker
      task = getDocument({ data: source.bytes.slice(0), stopAtErrors: true, isEvalSupported: false, enableXfa: false,
        maxImageSize: 20_000_000, cMapUrl: '/pdfjs/5.4.296/cmaps/', cMapPacked: true,
        standardFontDataUrl: '/pdfjs/5.4.296/standard_fonts/', wasmUrl: '/pdfjs/5.4.296/wasm/',
      })
      task.onPassword = () => { if (active) setFailed(true); void task?.destroy() }
      const document = await task.promise
      if (active) setPdf(document)
    })().catch(() => { if (active) setFailed(true) })
    return () => { active = false; void task?.destroy() }
  }, [source, isPdf])
  useEffect(() => {
    if (!pdf) return
    let active = true, render: RenderTask | undefined, url: string | null = null
    setImage(null); setFailed(false)
    void (async () => {
      const original = await pdf.getPage(page)
      if (!active) return
      const size = original.getViewport({ scale: 1 })
      const viewport = original.getViewport({ scale: Math.min(2, 1568 / Math.max(size.width, size.height)) })
      const canvas = document.createElement('canvas')
      canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height)
      render = original.render({ canvas, viewport })
      await render.promise
      if (!active) return
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('render'))))
      if (!active) return
      url = URL.createObjectURL(blob); setImage({ url, page })
    })().catch(() => { if (active) setFailed(true) })
    return () => { active = false; render?.cancel(); if (url) URL.revokeObjectURL(url) }
  }, [pdf, page])
  return <>
    <div className="actions"><button className="secondary" disabled={!pdf || page === 1} onClick={() => setPage(value => value - 1)}>{t('previousPage')}</button>
      <span role="status" aria-live="polite">{t('page')} {page} / {isPdf ? pdf?.numPages ?? t('unknown') : 1}</span>
      <button className="secondary" disabled={!pdf || page === pdf.numPages} onClick={() => setPage(value => value + 1)}>{t('nextPage')}</button></div>
    {isPdf && (image?.page === page ? <img className="block h-auto w-full" dir="ltr" src={image.url} alt={`${t('sourcePage')} ${image.page}`} /> : !failed && <p role="status">{t('loadingSource')}</p>)}
    {failed && <p role="status">{t('sourceFailed')}</p>}
    <DocumentPreviewContent file={file} language={language} renderFailed={isPdf || failed} onRenderError={() => setFailed(true)} />
  </>
}
