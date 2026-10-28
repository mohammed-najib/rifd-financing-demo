import { useEffect, useState } from 'react'
import type { PDFDocumentLoadingTask, PDFDocumentProxy, RenderTask } from 'pdfjs-dist'
import type { Language } from '../../domain/model'
import type { EvidenceRun, EvidenceSource } from '../../evidence-assistance/contract'
import { restoreRegion } from '../../evidence-assistance/preparation/restore'
import { assistanceText } from './evidence-assistance-copy'
import { DocumentPreviewContent } from '../shared/preview'

// Ordinary inspection is independent of the analysis page limits and coverage.
export function SourcePages({ source, file, language, run, focus }: { source: EvidenceSource; file: { url: string; mime: string; name: string }; language: Language; run?: EvidenceRun | null; focus?: { page: number; target: string; serial: number } | null }) {
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null)
  const [page, setPage] = useState(1), [image, setImage] = useState<{ url: string; page: number } | null>(null)
  const [failed, setFailed] = useState(false)
  const t = (key: keyof typeof assistanceText) => assistanceText[key][language]
  const [verified, setVerified] = useState<{ key: string; url: string } | null>(null)
  const [suppressed, setSuppressed] = useState(false)
  const location = run?.locations?.find(location => location.page === page && location.target === focus?.target)
  const regionKey = JSON.stringify([source.hash, run?.id, page, focus?.target])
  useEffect(() => { if (focus) setPage(focus.page) }, [focus])
  useEffect(() => {
    setVerified(null); setSuppressed(false)
    if (!run || run.stale || !focus || location?.status !== 'shown') return
    const cancellation = new AbortController()
    let url: string | null = null
    void restoreRegion(source, run, page, focus.target, cancellation.signal).then(prepared => {
      if (cancellation.signal.aborted) return
      if (!prepared) { setSuppressed(true); return }
      url = URL.createObjectURL(new Blob([prepared.bytes], { type: 'image/png' }))
      setVerified({ key: regionKey, url })
    }).catch(() => { if (!cancellation.signal.aborted) setSuppressed(true) })
    return () => { cancellation.abort(); if (url) URL.revokeObjectURL(url) }
  }, [source, run, page, focus, regionKey, location?.status])
  const ready = verified?.key === regionKey && !run?.stale
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
    {ready && location?.box && <div className="relative" dir="ltr">
      <img data-evidence-raster className="block h-auto w-full" src={verified.url} alt={`${t('sourcePage')} ${page}`} />
      <span data-evidence-highlight={location.target} role="img" aria-label={t('highlight')} className="pointer-events-none absolute box-border border-2 border-solid border-accent bg-accent/10" style={{ left: `${location.box.left * 100}%`, top: `${location.box.top * 100}%`, width: `${(location.box.right - location.box.left) * 100}%`, height: `${(location.box.bottom - location.box.top) * 100}%` }} />
    </div>}
    {suppressed && <p role="status">{t('highlightSuppressed')}</p>}
    {!ready && isPdf && (image?.page === page ? <img className="block h-auto w-full" dir="ltr" src={image.url} alt={`${t('sourcePage')} ${image.page}`} /> : !failed && <p role="status">{t('loadingSource')}</p>)}
    {failed && <p role="status">{t('sourceFailed')}</p>}
    <DocumentPreviewContent file={file} language={language} renderFailed={isPdf || failed || ready} onRenderError={() => setFailed(true)} />
  </>
}
