#!/usr/bin/env node
/**
 * add-teacher-links.js
 * --------------------
 * Adds clickable hyperlink annotations to the contact info in
 * output/teacher-parent-guide.pdf.
 */

const { PDFDocument, PDFName, PDFArray, PDFString } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

const INPUT_PATH = path.resolve(__dirname, '..', 'output', 'teacher-parent-guide.pdf');
const OUTPUT_PATH = INPUT_PATH;

function createLinkAnnotation(doc, page, rect, uri) {
  const { width, height } = page.getSize();

  // Convert rect if needed; here rect is already in PDF bottom-left coords.
  const annotation = doc.context.obj({
    Type: 'Annot',
    Subtype: 'Link',
    F: 4,
    Rect: rect,
    Border: [0, 0, 0],
    C: [1, 0.42, 0.42], // coral-ish RGB for the highlight
    A: {
      Type: 'Action',
      S: 'URI',
      URI: PDFString.of(uri),
    },
  });

  const annotRef = doc.context.register(annotation);

  const annots = page.node.lookup(PDFName.of('Annots'));
  if (annots instanceof PDFArray) {
    annots.push(annotRef);
  } else {
    page.node.set(PDFName.of('Annots'), doc.context.obj([annotRef]));
  }
}

async function main() {
  const bytes = fs.readFileSync(INPUT_PATH);
  const doc = await PDFDocument.load(bytes);
  const page = doc.getPage(0);

  // Clear any previously-added link annotations to avoid duplicates.
  page.node.set(PDFName.of('Annots'), doc.context.obj([]));

  // Link rectangles are in PDF points (bottom-left origin) and aligned to the
  // actual email / LinkedIn text in the closing paragraph.
  createLinkAnnotation(doc, page, [255, 175, 375, 186], 'mailto:yusufahmed.sdet@gmail.com');
  createLinkAnnotation(doc, page, [166, 160, 306, 173], 'https://www.linkedin.com/in/md-yusuf-ahmed/');

  const pdfBytes = await doc.save();
  fs.writeFileSync(OUTPUT_PATH, pdfBytes);
  console.log('Added contact link annotations to output/teacher-parent-guide.pdf');
}

main().catch(err => {
  console.error('Failed to add links:', err);
  process.exit(1);
});
