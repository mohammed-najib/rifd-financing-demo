import { PDFDocument } from 'pdf-lib'
import type { DocumentSlot, Fields, ProductId, StoredFile } from '../domain/model'

const labels: Record<DocumentSlot, string> = {
  identity: 'Applicant identity evidence / إثبات هوية المتقدم',
  business: 'Business evidence / إثبات النشاط التجاري',
  financial: 'Revenue and expense summary / ملخص الإيرادات والمصروفات',
  purchase: 'Purchase evidence / مستند الشراء',
}

let fontsReady: Promise<void> | null = null

export function prepareFonts(): Promise<void> {
  fontsReady ??= loadFonts().catch(error => { fontsReady = null; throw error })
  return fontsReady
}

async function loadFonts(): Promise<void> {
  // A missing resource must fail startup, even when FontFaceSet would silently use a fallback.
  for (const [family, path] of [['Noto Sans', '/fonts/NotoSans-Regular.ttf'], ['Noto Sans Arabic', '/fonts/NotoSansArabic-Regular.ttf']]) {
    const response = await fetch(path)
    if (!response.ok) throw new Error('resources')
    const face = new FontFace(family, await response.arrayBuffer())
    document.fonts.add(await face.load())
  }
}

function evidenceLines(fields: Fields, slot: DocumentSlot, product: ProductId, months: string[], young: boolean): string[] {
  const lines = [fields.fullName, fields.businessName]
  switch (slot) {
    case 'identity': return [...lines, fields.mobile, fields.city, fields.email]
    case 'business': return [...lines, fields.address, `Operating since / بداية النشاط: ${fields.operatingSince}`, `Activity / النشاط: ${fields.activity}`]
    case 'financial': return [...lines,
      'Month / الشهر    Revenue / الإيرادات    Expenses / المصروفات',
      ...months.map((month, i) => `${month}    ${young ? i === 0 ? '0    0' : '900,000    600,000' : `${fields.revenue}    ${fields.expenses}`} YER`),
      `Average revenue / متوسط الإيرادات: ${fields.revenue} YER`,
      `Average expenses / متوسط المصروفات: ${fields.expenses} YER`,
      'Expenses exclude illustrated repayments / المصروفات لا تشمل السداد التوضيحي',
    ]
    case 'purchase': return [...lines,
      product === 'inventory' ? 'Stock purchase plan / خطة شراء المخزون' : 'Supplier quotation / عرض سعر المعدات',
      fields.explanation || 'شراء مخزون من المستلزمات المنزلية لتجديد البضائع في المتجر.',
      `Purchase budget / تكلفة الشراء: ${fields.budget} YER`,
      `Requested financing / مبلغ التمويل: ${fields.amount} YER`,
    ]
  }
}

function renderPage(title: string, lines: string[], unreadable: boolean, pageNumber: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 1000
  canvas.height = 1320
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('resources')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#0b6458'
  ctx.fillRect(0, 0, 1000, 150)
  ctx.fillStyle = '#ffffff'
  ctx.font = '32px "Noto Sans Arabic", "Noto Sans"'
  ctx.fillText('RIFD · DEMO / تجريبي', 50, 85)
  ctx.fillStyle = '#192f2c'
  ctx.font = '24px "Noto Sans Arabic", "Noto Sans"'
  ctx.fillText(title, 50, 205, 900)
  ctx.font = '23px "Noto Sans Arabic", "Noto Sans"'
  let y = 290
  for (const line of lines) {
    ctx.direction = /[\u0600-\u06ff]/.test(line) ? 'rtl' : 'ltr'
    ctx.textAlign = ctx.direction === 'rtl' ? 'right' : 'left'
    if (unreadable) {
      ctx.fillStyle = '#c5ceca'
      ctx.fillRect(50, y - 20, 700 + y % 110, 27)
    } else {
      ctx.fillStyle = '#192f2c'
      ctx.fillText(line, ctx.direction === 'rtl' ? 950 : 50, y, 900)
    }
    y += 75
  }
  ctx.direction = 'ltr'
  ctx.textAlign = 'left'
  ctx.font = '21px "Noto Sans Arabic", "Noto Sans"'
  ctx.fillStyle = '#0b6458'
  ctx.fillText(unreadable ? 'Unreadable prepared example / مثال غير مقروء' : 'Fictional evidence. No bank document. / مستند افتراضي', 50, 1170, 900)
  ctx.fillText(`DEMO / تجريبي · ${pageNumber}`, 50, 1250)
  return canvas
}

async function canvasBytes(canvas: HTMLCanvasElement, mime: string): Promise<ArrayBuffer> {
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('resources')), mime, 0.9))
  return blob.arrayBuffer()
}

export async function makeFile(
  applicationId: string, slot: DocumentSlot, fields: Fields, product: ProductId,
  months: string[], variant: 'original' | 'replacement', unreadable: boolean, young: boolean,
): Promise<StoredFile> {
  const title = labels[slot]
  const lines = evidenceLines(fields, slot, product, months, young)
  if (variant === 'replacement') lines.push('Readable replacement / نسخة بديلة مقروءة')
  const canvas = renderPage(title, lines, unreadable, 1)
  const mime = slot === 'identity' ? 'image/png' : slot === 'purchase' ? 'image/jpeg' : 'application/pdf'
  let bytes: ArrayBuffer
  if (mime === 'application/pdf') {
    const pdf = await PDFDocument.create()
    pdf.setTitle(`DEMO RIFD ${title}`)
    for (const pageCanvas of [canvas, renderPage(title, ['DEMO / تجريبي', fields.fullName, fields.businessName, 'All information is fictional / جميع البيانات افتراضية', ...lines.slice(-3)], unreadable, 2)]) {
      const image = await pdf.embedPng(await canvasBytes(pageCanvas, 'image/png'))
      const page = pdf.addPage([500, 660])
      page.drawImage(image, { x: 0, y: 0, width: 500, height: 660 })
    }
    bytes = new Uint8Array(await pdf.save()).buffer
  } else bytes = await canvasBytes(canvas, mime)
  const extension = mime === 'application/pdf' ? 'pdf' : mime === 'image/jpeg' ? 'jpg' : 'png'
  return fileFromBytes(`${applicationId}-${slot}-${variant}`, applicationId, slot, `DEMO-${applicationId}-${slot}-${variant}.${extension}`, mime, bytes)
}

export async function fileFromBytes(id: string, applicationId: string, slot: DocumentSlot, name: string, mime: string, bytes: ArrayBuffer): Promise<StoredFile> {
  const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), byte => byte.toString(16).padStart(2, '0')).join('')
  return { id, applicationId, slot, name, mime, size: bytes.byteLength, hash, bytes }
}
