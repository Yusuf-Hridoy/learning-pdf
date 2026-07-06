#!/usr/bin/env node
/**
 * generate-pdf.js
 * ----------------
 * Playwright script that converts a single HTML file to a print-ready PDF.
 *
 * Usage:
 *   node scripts/generate-pdf.js <path-to-html-file>
 *
 * Example:
 *   node scripts/generate-pdf.js content/sample-activity.html
 *
 * The resulting PDF is written to workbook/output/[filename].pdf
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function generatePdf(inputPath) {
  // --- Resolve paths ---
  const resolvedInput = path.resolve(inputPath);
  if (!fs.existsSync(resolvedInput)) {
    console.error(`Error: File not found: ${resolvedInput}`);
    process.exit(1);
  }

  const filename = path.basename(resolvedInput, '.html');
  const outputDir = path.resolve(__dirname, '..', 'output');
  const outputPath = path.join(outputDir, `${filename}.pdf`);

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`Loading: ${resolvedInput}`);

  // --- Launch browser ---
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Load the HTML file using a file:// URL so relative CSS paths resolve correctly
  const fileUrl = 'file:///' + resolvedInput.replace(/\\/g, '/');
  await page.goto(fileUrl, { waitUntil: 'networkidle' });

  // Wait for Google Fonts to finish loading before printing
  await page.evaluate(() => document.fonts.ready);

  // Small extra pause to ensure layout stabilises (images, webfonts, etc.)
  await page.waitForTimeout(500);

  console.log('Fonts loaded. Generating PDF...');

  // --- Generate PDF ---
  await page.pdf({
    format: 'Letter',           // 8.5in x 11in
    printBackground: true,      // essential for colored boxes & tints
    margin: {
      top: '0.5in',
      bottom: '0.5in',
      left: '0.5in',
      right: '0.5in'
    },
    preferCSSPageSize: true     // respect @page rules in CSS
  });

  // Playwright's page.pdf() writes to a buffer when path is omitted,
  // but passing a path directly is cleaner. Re-run with path:
  await page.pdf({
    path: outputPath,
    format: 'Letter',
    printBackground: true,
    margin: {
      top: '0.5in',
      bottom: '0.5in',
      left: '0.5in',
      right: '0.5in'
    },
    preferCSSPageSize: true
  });

  await browser.close();

  // --- Report ---
  const stats = fs.statSync(outputPath);
  const sizeKB = (stats.size / 1024).toFixed(1);
  console.log(`Success: ${outputPath}`);
  console.log(`File size: ${sizeKB} KB`);
}

// --- CLI entry point ---
const inputFile = process.argv[2];
if (!inputFile) {
  console.error('Usage: node scripts/generate-pdf.js <path-to-html-file>');
  console.error('Example: node scripts/generate-pdf.js content/sample-activity.html');
  process.exit(1);
}

generatePdf(inputFile).catch(err => {
  console.error('PDF generation failed:', err);
  process.exit(1);
});
