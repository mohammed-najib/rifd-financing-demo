import { createDemo } from '../../../src/demo';
import type { EvidenceInput, EvidenceTransport } from '../../../src/evidence-assistance/contract';
import type { PreparedAttachment } from '../../../src/demo';
import { fakeEvidenceTransport } from './evidence-transport';

export const identityInput: EvidenceInput = {
  action: 'check-document',
  applicationId: 'RIFD-2026-001',
  slot: 'identity',
  audience: 'applicant',
  context: 'draft',
};

export async function identityDemo(transport: EvidenceTransport = fakeEvidenceTransport()) {
  window.demo.dispose();
  const demo = createDemo({
    evidenceTransport: transport,
    latency: 50,
    verifyStoredFiles: false,
    loadFonts: false,
    includeOversizedSample: false,
    compactEvidence: true,
  });
  window.demo = demo;
  const startup = await demo.startup();
  if (!startup.ok) throw new Error(startup.error.kind);
  const signIn = await demo.signIn('mariam');
  if (!signIn.ok) throw new Error(signIn.error.kind);
  return { demo, datasetId: startup.value.datasetId };
}

export async function attachIdentity(file: File): Promise<PreparedAttachment> {
  const context = await window.demo.context();
  if (!context.ok) throw new Error('context');
  const attachment = await window.demo.prepareAttachment({
    datasetId: context.value.datasetId,
    applicationId: identityInput.applicationId,
    slot: 'identity',
    selectionId: crypto.randomUUID(),
    source: { kind: 'local', file },
  });
  if (!attachment.ok) throw new Error(attachment.error.kind);
  return attachment.value;
}

export async function imageFile(
  mime: 'image/png' | 'image/jpeg',
  width = 640,
  height = 960,
  orientation?: number,
) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d')!;
  context.fillStyle = '#fff';
  context.fillRect(0, 0, width, height);
  context.fillStyle = '#000';
  context.font = '25px sans-serif';
  context.fillText('Fictional Applicant Name', 20, 50);
  const blob = await new Promise<Blob>(resolve => canvas.toBlob(blob => resolve(blob!), mime));
  const bytes = new Uint8Array(await blob.arrayBuffer());
  if (orientation) {
    const exif = new Uint8Array([
      255,
      225,
      0,
      34,
      69,
      120,
      105,
      102,
      0,
      0,
      73,
      73,
      42,
      0,
      8,
      0,
      0,
      0,
      1,
      0,
      18,
      1,
      3,
      0,
      1,
      0,
      0,
      0,
      orientation,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
    ]);
    return new File([bytes.slice(0, 2), exif, bytes.slice(2)], 'rotated.jpg', { type: mime });
  }
  return new File([bytes], mime === 'image/png' ? 'fictional.png' : 'fictional.jpg', {
    type: mime,
  });
}

export async function pdfFile(pages: number, rotate = 0) {
  const { PDFDocument, degrees } = await import('pdf-lib');
  const pdf = await PDFDocument.create();
  for (let i = 0; i < pages; i++) {
    const page = pdf.addPage([500, 700]);
    page.setRotation(degrees(rotate));
    page.drawText('Fictional Applicant Name', { x: 40, y: 600 });
  }
  return new File([new Uint8Array(await pdf.save())], 'fictional.pdf', { type: 'application/pdf' });
}
