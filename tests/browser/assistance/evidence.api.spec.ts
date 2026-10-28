import { expect, test } from '@playwright/test'
import { PDFDocument } from 'pdf-lib'
import { writeFile } from 'node:fs/promises'

test('prepared business and financial PDFs retain two printable image pages after reload', async ({ page }, info) => {
  await page.goto('/tests/browser/support/api.html')
  await page.waitForFunction(() => window.demo)
  expect(await page.evaluate(() => window.demo.startup())).toMatchObject({ ok: true })
  expect(await page.evaluate(() => window.demo.signIn('mariam'))).toMatchObject({ ok: true })
  await page.reload()
  await page.waitForFunction(() => window.demo)
  const files = await page.evaluate(async () => {
    await window.demo.startup()
    const result = await window.demo.readApplication('RIFD-2026-001')
    if (!result.ok) throw new Error('Draft unavailable')
    return Promise.all(result.value.documents.filter(document => document.file?.mime === 'application/pdf').map(async document => {
      const file = await window.demo.readFile(result.value.id, document.file!.id)
      if (!file.ok) throw new Error('Saved PDF unavailable')
      return { name: file.value.name, bytes: [...new Uint8Array(file.value.bytes)] }
    }))
  })
  expect(files).toHaveLength(2)
  for (const file of files) {
    const pdf = await PDFDocument.load(new Uint8Array(file.bytes))
    expect(pdf.getPageCount(), file.name).toBe(2)
    expect(pdf.getPages().map(page => page.getSize())).toEqual([{ width: 500, height: 660 }, { width: 500, height: 660 }])
    await writeFile(info.outputPath(file.name), new Uint8Array(file.bytes))
  }
})
