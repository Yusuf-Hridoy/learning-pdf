#!/usr/bin/env node
/**
 * merge-workbook.js
 * -----------------
 * Merges all individual workbook PDFs into a single output/workbook.pdf.
 *
 * Source order:
 *   cover
 *   welcome, how-to-use, meet-your-guides, what-youll-learn
 *   activity-01 .. activity-12
 *   vocabulary-review, mini-quiz, reflection-page, teacher-parent-guide,
 *   pacing-guides, answer-key-1-6, answer-key-7-12
 *   certificate
 *
 * Adds consistent page numbers at the bottom center of every page in the
 * merged document, plus prints a page map to the console.
 */

const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.resolve(__dirname, '..', 'output');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'workbook-v1.0.2.pdf');

const sources = [
  { file: 'cover.pdf', label: 'Cover' },
  { file: 'welcome.pdf', label: 'Welcome' },
  { file: 'how-to-use.pdf', label: 'How to Use' },
  { file: 'meet-your-guides.pdf', label: 'Meet Your Guides' },
  { file: 'what-youll-learn.pdf', label: "What You'll Learn" },
  ...Array.from({ length: 12 }, (_, i) => ({
    file: `activity-${String(i + 1).padStart(2, '0')}.pdf`,
    label: `Activity ${i + 1}`
  })),
  { file: 'vocabulary-review.pdf', label: 'Vocabulary Review' },
  { file: 'mini-quiz.pdf', label: 'Mini Quiz' },
  { file: 'reflection-page.pdf', label: 'Reflection Page' },
  { file: 'teacher-parent-guide.pdf', label: 'Teacher & Parent Guide' },
  { file: 'pacing-guides.pdf', label: 'Pacing Guides' },
  { file: 'answer-key-1-6.pdf', label: 'Answer Key Activities 1-6' },
  { file: 'answer-key-7-12.pdf', label: 'Answer Key Activities 7-12' },
  { file: 'certificate.pdf', label: 'Certificate' },
];

async function merge() {
  const merged = await PDFDocument.create();
  const helvetica = await merged.embedFont(StandardFonts.Helvetica);
  const pageMap = [];
  let currentPage = 1;

  for (const src of sources) {
    const filePath = path.join(OUTPUT_DIR, src.file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Missing source PDF: ${filePath}`);
    }

    const bytes = fs.readFileSync(filePath);
    const doc = await PDFDocument.load(bytes);
    const copiedPages = await merged.copyPages(doc, doc.getPageIndices());

    const startPage = currentPage;
    for (const page of copiedPages) {
      merged.addPage(page);
      currentPage++;
    }
    const endPage = currentPage - 1;

    pageMap.push({
      source: src.file,
      label: src.label,
      startPage,
      endPage,
      pageCount: copiedPages.length
    });
  }

  const totalPages = merged.getPageCount();
  const footerColor = rgb(0.42, 0.44, 0.55); // muted navy-gray
  const coverColor = rgb(1, 1, 1);

  for (let i = 0; i < totalPages; i++) {
    const page = merged.getPage(i);
    const { width, height } = page.getSize();
    const pageNum = i + 1;

    const text = String(pageNum);
    const fontSize = 10;
    const textWidth = helvetica.widthOfTextAtSize(text, fontSize);
    const x = (width - textWidth) / 2;
    const y = 22; // ~0.3in from bottom

    // Cover any existing CSS page-number region with a white strip to prevent
    // stray footer glyphs (e.g. the original CSS counter digit) from showing
    // through beneath the merged page number.
    page.drawRectangle({
      x: x - 14,
      y: y - 14,
      width: textWidth + 28,
      height: fontSize + 18,
      color: coverColor,
    });

    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font: helvetica,
      color: footerColor,
    });
  }

  const pdfBytes = await merged.save();
  fs.writeFileSync(OUTPUT_FILE, pdfBytes);

  console.log('\n=================================');
  console.log('Workbook merge complete');
  console.log('=================================');
  console.log(`Total pages: ${totalPages}`);
  console.log(`Output: ${OUTPUT_FILE}\n`);

  console.log('Page map:');
  console.log('---------------------------------');
  for (const entry of pageMap) {
    const range = entry.startPage === entry.endPage
      ? `page ${entry.startPage}`
      : `pages ${entry.startPage}-${entry.endPage}`;
    console.log(`${entry.source.padEnd(28)} => ${range.padEnd(18)} | ${entry.label}`);
  }
  console.log('---------------------------------\n');
}

merge().catch(err => {
  console.error('Merge failed:', err);
  process.exit(1);
});
