# CS Unplugged Workbook — Project Log

## What This Project Is

A print-ready HTML/CSS-to-PDF pipeline for a **37-page children's educational workbook** that teaches computer science concepts through unplugged (no-computer) activities. Target audience: kids ages 8-12.

Each activity is a self-contained 2-page spread:
- **Page 1:** Activity header + kid instructions + vocabulary callout + "How It Works" explainer + two-column Basic/Challenge exercises
- **Page 2:** Self-check checklist + reflection question + bonus activity + teacher/parent note

The final output is a US Letter (8.5" × 11") PDF with exact color rendering, embedded fonts, and automatic page numbering.

---

## System Architecture

```
workbook/
├── content/           # Activity HTML files (the source of truth for each page)
│   ├── activity-08.html
│   ├── activity-09.html
│   └── ...
├── styles/            # Shared CSS design system
│   ├── colors.css     # Kid-friendly warm palette (coral, teal, sunny, navy, cream)
│   ├── typography.css # Fredoka (headings) + Nunito (body) with @font-face
│   ├── components.css # Reusable widgets: sort-rows, checkboxes, pills, writing lines, etc.
│   └── print.css      # @page rules, page-break controls, print-color-adjust
├── templates/         # Base HTML templates (Nunjucks-style blocks)
│   ├── base.html
│   ├── activity.html
│   └── ...
├── scripts/
│   └── generate-pdf.js   # Playwright headless Chromium → PDF converter
└── output/            # Generated PDFs
```

### PDF Generation Pipeline

1. **Write activity HTML** as a standalone file referencing shared CSS via relative paths (`../styles/...`)
2. **Run `node scripts/generate-pdf.js content/activity-XX.html`**
3. Playwright loads the HTML in headless Chromium, waits for Google Fonts to settle
4. Chromium prints to PDF with `printBackground: true` and `preferCSSPageSize: true`
5. Output lands in `output/activity-XX.pdf`

---

## Design System

### Color Palette
| Token | Hex | Usage |
|-------|-----|-------|
| Coral | `#FF6B6B` | Headers, difficulty badges, part subtitles |
| Teal | `#4ECDC4` | Teacher notes, secondary accents |
| Sunny | `#FFE66D` | Vocabulary callouts, highlights |
| Navy | `#2D3047` | Body text, borders |
| Cream | `#FFF8F0` | Page background, sort box fills |

### Reusable Components Built So Far

| Component | Class | Description |
|-----------|-------|-------------|
| Activity Header | `.activity-header` + `.activity-number` + `.activity-title` + `.difficulty-badge` | Coral strip with circular number badge |
| Kid Instructions | `.kid-box` | White box with coral border and floating label |
| Vocabulary Callout | `.vocab-callout` + `.vocab-word` + `.vocab-def` | Yellow left-border strip with word badge |
| Sort Row (filled) | `.sort-row.filled` + `.sort-box` | Cream-filled numbered boxes for start states |
| Sort Row (empty) | `.sort-row.empty` + `.sort-box` | White empty boxes for kid answers |
| Sort Row (swap indicator) | `.sort-row.swap-indicator` + `.sort-box.highlight` | Coral-highlighted boxes for compared pairs |
| Sort Row (locked) | `.sort-box.locked` / `.sort-row.locked` | Gray-filled boxes with ✓ checkmark for "done" positions |
| Algorithm Pill | `.pill-coral` / `.pill-teal` | Rounded full pills for Bubble Sort / Selection Sort labels |
| Circle Choice | `.circle-choice` + `.circle` | Empty circles with text labels (YES/NO, algorithm names) |
| Writing Lines | `.writing-lines` + `.line` | Horizontal ruled lines for open-ended answers |
| Blank Fill | `.blank-fill-line` + `.blank-short` / `.blank-long` | Underlined blanks for short answers |
| Code Example | `.code-example` | Teal left-border monospace block for pseudocode |
| Reflection Box | `.reflection-box` | Full-width question + writing lines |
| Follow-up Box | `.followup-box` | Small dashed-teal box for bonus reflections |
| Teacher Note | `.teacher-note` | Teal dashed box pushed to bottom of page 2 |
| Self-Check | `.kid-checklist` + `.checkbox` | Checkbox list with 8px+ comfortable spacing |

---

## Activity Layout Contract (Locked-In Pattern)

Every activity follows the same 2-page template:

**Page 1 (top to bottom):**
1. Activity header strip — number badge + title + age badge
2. Mascot placeholder + kid instructions box
3. Vocabulary callout
4. **How It Works** section (compact, ~25-30% of page height)
   - Subsection header (teal pill)
   - 5-rule numbered list
   - Worked example with inline sort rows or compact text
5. Two-column section
   - **Left:** Basic Version (simpler exercise)
   - **Right:** Challenge Version (harder exercise, often 2 parts)

**Page 2 (top to bottom):**
1. Self-Check (4 items, comfortable spacing)
2. Reflection Box (question + 3 lines)
3. Bonus activity (hands-on or competitive)
4. Teacher/Parent Note (teal dashed, pushed to bottom via flex)

**Critical constraints:**
- Exactly **2 pages total** — no spill to page 3
- `page-break-after: always` on the page-1 wrapper div
- `.page-activity` flex column on page 2 pushes teacher note to bottom
- `page-break-inside: avoid` on `.two-col` means the entire two-column block must fit on page 1

---

## Activities Rendered So Far

### Activity 8 — Sorting: Bubble Sort Unplugged
- **New component:** `.sort-row` system (3 variants: filled, empty, swap-indicator)
- **How It Works:** Compact bubble sort rules + worked example showing 3 passes with inline text summaries
- **Basic:** Sort [5, 2, 8, 3] with 3 empty pass rows
- **Challenge Part A:** Sort 5 heights [140, 125, 150, 130, 145] with 4 empty pass rows
- **Challenge Part B:** Nested loops explanation with pseudocode block + 3 writing lines
- **Bonus:** "Sort Real Things" hands-on activity

### Activity 9 — Sorting: Selection Sort
- **New component:** `.sort-row.locked` (gray fill + ✓ checkmark) + `.pill-coral` / `.pill-teal`
- **How It Works:** Selection sort rules + worked example with inline locked/filled sort rows
- **Basic:** Sort [6, 3, 9, 1] with 3 empty selection rows
- **Challenge Part A:** Side-by-side Bubble Sort vs Selection Sort on [8, 3, 5, 1, 4]
  - Bubble grid: Start + Pass 1-3 (Pass 4 dropped as last-resort overflow fix)
  - Selection grid: Start + After Selection 1-4
- **Challenge Part B:** Algorithm comparison questions (Q1 + Q2, 2 lines each)
- **Bonus:** "Algorithm Race!" competitive hands-on activity with circle choices

**Overflow handling lessons learned:**
- Activity 9 is the densest page in the workbook. The Challenge column has 10 sort rows + Part B.
- When `.two-col` has `page-break-inside: avoid` (set globally in `print.css`), the ENTIRE two-column block gets pushed to page 2 if it doesn't fit on page 1 — leaving page 1 half-empty.
- To fit: progressively compress — smaller sort boxes (22×22px for 5-box rows), tighter margins, inline sort rows in worked examples, and as last resort drop a pass row.
- A single stray extra `</div>` can break the flex layout and scatter column content across pages.

---

## How to Render a New Activity

1. **Read the JSON content spec** for the activity
2. **Add any new component variants** to `styles/components.css` (follow the numbered section pattern)
3. **Create `content/activity-XX.html`** as a standalone file:
   - Extend the locked-in 2-page pattern
   - Reference shared CSS: `../styles/colors.css`, `../styles/typography.css`, `../styles/components.css`, `../styles/print.css`
   - Use page-specific `<style>` overrides for density tuning (font sizes, margins, box dimensions)
   - Page 1 wrapper: `<div class="page-1" style="page-break-after: always;">`
   - Page 2 wrapper: `<div class="page-activity page-2">` (flex column)
4. **Generate PDF:** `node scripts/generate-pdf.js content/activity-XX.html`
5. **Verify:** Check page count (must be exactly 2) and visual layout via screenshot or rendered PDF pages
6. **Do NOT render the answer key** in the activity PDF

---

## Dependencies

- **Node.js** + **Playwright** (Chromium) for PDF generation
- **Python + PyMuPDF** (optional) for quick page-count verification and PDF-to-image conversion
- No build step — plain HTML/CSS files

---

## Print Settings

- **Paper:** US Letter (8.5" × 11")
- **Margins:** 0.5" all sides
- **Fonts:** Fredoka (headings) + Nunito (body) loaded from Google Fonts CDN
- **Colors:** `print-color-adjust: exact` ensures backgrounds and tints render correctly
- **Page numbers:** Auto-injected via CSS `@bottom-center` counter (except cover/certificate)

## Back Matter Batch 1 — Vocabulary Review + Mini Quiz

Generated two single-page back-matter PDFs:
- `output/vocabulary-review.pdf`
- `output/mini-quiz.pdf`

### New reusable components (`styles/components.css`)
- `.page-back-matter` + `@page back-matter` in `styles/print.css` (suppresses page numbers for final merge)
- `.back-matter-intro`, `.back-section`, `.back-section-header`, `.back-section-instruction`
- `.matching-table` + `.match-dot` (connectable dots for line-drawing)
- `.wordsearch-wrap`, `.wordsearch-grid`, `.wordsearch-words`, `.wordsearch-answer-key`
- `.scoring-callout` (reward-tier chart)
- `.quiz-columns`, `.quiz-question`, `.quiz-option`, `.quiz-write-line`, `.quiz-truefalse`, `.quiz-answer-key`, `.quiz-closing-callout`

### Implementation notes
- Vocabulary word search grid is generated programmatically in-page by `content/vocabulary-review.html`:
  - 12×12 grid, horizontal / vertical / diagonal placement
  - Overlap allowed only on matching letters
  - Random-fill collision detection prevents accidental duplicate words
  - Answer key reflects the actual generated layout
- Matching definitions are rendered in the exact shuffled order from `content/back-matter-batch-1.json`
- Mini quiz uses a two-column layout (Q1–Q5 left, Q6–Q10 right) with compact separators
- Both pages verified as exactly 1 page via `pdf-lib` page count and full-page screenshot

## Back Matter Batch 2 — Reflection Page + Teacher/Parent Guide

Generated two more single-page back-matter PDFs:
- `output/reflection-page.pdf`
- `output/teacher-parent-guide.pdf`

### New reusable components (`styles/components.css`)
- Reflection page: `.reflection-section`, `.reflection-prompt`, `.reflection-write-line`, `.drawing-box-tall`, `.reflection-options`, `.author-note-box`
- Teacher/Parent Guide: `.teacher-guide-section`, `.teacher-guide-table`, `.standards-list`, `.tips-list`, `.extensions-grid`, `.extension-card`, `.teacher-guide-closing`

### Implementation notes
- Reflection page uses warm, personal tone with coral emphasis words, inline blanks for activity numbers, arrow-prefixed writing lines, circle checkboxes, and a signed letter box.
- Teacher/Parent Guide renders a real HTML `<table>` for activity objectives, a definition list for CSTA standards, bulleted tips, and a 2-column extension grid.
- Both pages share the `.front-matter-header` pattern and use `@page back-matter` to suppress page numbers.
- Density was tuned until each page measured under the 10in content limit at print width (720px viewport); the reflection drawing box was reduced from 9cm to ~4.8cm to keep all required content on one page while preserving readability.
- No emojis used anywhere.

### Verification
- Page counts verified with `pdf-lib`: both PDFs are exactly **1 page**.
- Full-page screenshots reviewed for layout completeness before cleanup.

### Pre-Merge Content Fixes
- `output/reflection-page.pdf`:
  - Author signoff changed from placeholder "— The Workbook Author" to **"— Yusuf Ahmed"**.
  - Removed the italic gray placeholder note "(Signed by [your name] — placeholder in current version)" from both the JSON and the rendered HTML/PDF.
- `output/teacher-parent-guide.pdf`:
  - Closing contact info replaced with real email and LinkedIn.
  - Email styled as coral underlined link: **yusufahmed.sdet@gmail.com**.
  - LinkedIn displayed as **linkedin.com/in/md-yusuf-ahmed** and linked to full URL **https://www.linkedin.com/in/md-yusuf-ahmed/**.
  - Added clickable URI annotations via `scripts/add-teacher-links.js` + `pdf-lib`.
  - Re-tuned density (smaller table/tips/extension fonts and tighter spacing) so the longer closing text still fits on one page.

### Back Matter Batch 2 — Fix (Teacher/Parent Guide)

Fixed `output/teacher-parent-guide.pdf`:
- Ensured the 5 "How to Use This Workbook" tips render immediately under their section header (coral bullets, ~10pt navy text, compact spacing).
- Rendered the 4 extension ideas as a 2×2 grid with cream cards, coral left border, and roughly equal block heights.
- Tuned densities so the page remains exactly 1 page after the layout fixes.

## Back Matter Batch 3 — Pacing Guides + Full Answer Key

Generated three final single-page back-matter PDFs:
- `output/pacing-guides.pdf`
- `output/answer-key-1-6.pdf`
- `output/answer-key-7-12.pdf`

### New reusable components (`styles/components.css`)
No new global components were added; page-specific classes live inline in each generated HTML file:
- Pacing Guides: `.pg-section`, `.pg-blocks-grid`, `.pg-day-block`, `.pg-week-block`, `.pg-table`, `.pg-closing`
- Answer Keys: `.ak-columns`, `.ak-block`, `.ak-section-label`, `.ak-bonus`

### Implementation notes
- Added `content/back-matter-batch-3.json` as the single source of truth for all three pages.
- Added `scripts/generate-back-matter-3.js` to render the JSON into standalone HTML files.
- Pacing Guides page:
  - Three schedule sections (1-Week, 4-Week, 12-Week) with coral / teal / yellow accent bars.
  - Day-by-day and week-by-week blocks rendered in compact 2-column grids.
  - 12-week plan rendered as an actual HTML `<table>` with zebra-striped rows.
  - Closing reminder callout with light coral background.
- Answer Key pages:
  - Two-column CSS-column layout that balances content density automatically.
  - Each activity block has cream background, coral left border, BASIC / CHALLENGE sections, and a teal BONUS grading note.
  - Markdown-style `**bold**` in the JSON is converted to `<strong>` during generation.
  - `answer-key-1-6.pdf` includes the intro paragraph; `answer-key-7-12.pdf` ends with "End of Answer Key."
- All pages suppress page numbers via `@page back-matter` for final merge renumbering.
- No emojis used anywhere.

### Verification
- Page counts verified with `pdf-lib`: all three PDFs are exactly **1 page**.
- Full-page PDF screenshots reviewed for layout completeness.
- Overflow tuning applied: reduced block/table font sizes and padding until each page fit without splitting content.

## Final Workbook Merge

Created `scripts/merge-workbook.js` to concatenate all 25 source PDFs into a single `output/workbook.pdf`.

### Source order
1. `cover.pdf`
2. Front matter: `welcome.pdf`, `how-to-use.pdf`, `meet-your-guides.pdf`, `what-youll-learn.pdf`
3. Activities: `activity-01.pdf` through `activity-12.pdf`
4. Back matter: `vocabulary-review.pdf`, `mini-quiz.pdf`, `reflection-page.pdf`, `teacher-parent-guide.pdf`, `pacing-guides.pdf`, `answer-key-1-6.pdf`, `answer-key-7-12.pdf`
5. `certificate.pdf`

### Merge details
- Total pages: **37**
- Page numbers added uniformly at bottom center in muted gray via `pdf-lib`.
- Existing per-activity CSS footer numbers are covered with a small white rectangle before drawing the merged page number, preventing duplicate/conflicting numbers.
- Clickable contact link annotations in `teacher-parent-guide.pdf` are preserved in the merged output.

### Verification
- `pdf-lib` page count: **37 pages**.
- Spot-checked pages 1 (cover), 2 (welcome), 19 (Activity 7 page 2), 30 (Vocabulary Review), and 37 (certificate) for correct merged page numbers.
- Page map printed by the merge script (see console output).

## Phase 3 — Footer Glyph Bug Fix

### Problem
After the initial merge, many pages (especially activity pages) showed a stray, smaller digit directly beneath the merged page number — for example page 6 displayed a large **6** with a tiny **1** under it, page 7 showed **7** over **2**, page 20 showed **20** over **1**, and page 27 showed **27** over **2**.

### Root cause
Each 2-page activity PDF was rendered with `styles/print.css` `@bottom-center { content: counter(page); }`, so page 1 of an activity had an internal **1** and page 2 had an internal **2**. The merge script already drew a white rectangle over this region before stamping the global page number, but the rectangle was too small and left the original per-activity digit peeking out just below the new number.

### Fix
Updated `scripts/merge-workbook.js`:
- Enlarged the white cover rectangle around the footer number so it fully masks the original CSS `counter(page)` glyph (and any surrounding descenders).
- Adjusted rectangle dimensions to `x - 14`, `y - 14`, `width + 28`, `height + 18` while staying within the bottom margin and avoiding content overlap.
- Changed the output path from `output/workbook.pdf` to `output/workbook-v1.0.1.pdf` so the final artifact is versioned.

### Re-render & verification
- Re-ran `node scripts/merge-workbook.js`.
- Confirmed total page count remains **37 pages**.
- Rendered footer regions for pages 6, 7, 8, 9, 12, 13, 16, 17, 20, 27, 28, 29, 30, 35, and 37.
- All checked pages now show only the single, clean global page number with no stray digits underneath.
- Copied the fixed output back to `output/workbook.pdf` so the unversioned file also reflects the fix.

### Final artifacts
- `output/workbook-v1.0.1.pdf` — versioned final workbook, 37 pages, clean footers.
- `output/workbook.pdf` — same content, kept as the current latest build.

## v1.0.2 — Answer-Key Note Fix + Footer Counter Removal

### Phase 1 — Restore Activity 2 BASIC Acceptance Note

#### Problem
The Activity 2 BASIC answer key listed the 8-step morning routine but was missing the acceptance-variation note, which would cause strict graders to mark reasonable kid answers wrong. The note existed in `content/back-matter-batch-3.json`, but `scripts/generate-back-matter-3.js` did not render `part.note` fields for BASIC/CHALLENGE blocks.

#### Fix
- Updated `content/back-matter-batch-3.json` so the Activity 2 BASIC note reads:
  > (Accept reasonable variations: wash face / brush teeth may swap; eat breakfast may come before get dressed. "Wake up" must be first; "Go to school" must be last.)
- Updated `scripts/generate-back-matter-3.js`:
  - `renderAnswerPart()` now emits a `<p class="ak-part-note">` when `part.note` is present.
  - Added `.ak-part-note` styling (italic, 7.5pt, navy) to match the parenthetical acceptance notes used elsewhere on the page.
- Regenerated `content/answer-key-1-6.html` and `output/answer-key-1-6.pdf`.

#### Verification
- `output/answer-key-1-6.pdf` is exactly **1 page**.
- The note appears directly under the 8-step list on page 35.
- The 8 steps themselves are unchanged.
- All other answer-key blocks are visually/content-wise identical.

### Phase 2 — Remove Stray Counter Element from Activity Pages

#### Problem
The v1.0.1 footer fix hid the stray per-activity page digit visually, but the digit still existed in the PDF text layer. Extracted text for activity pages showed an orphan **1** or **2** before the activity heading — e.g. page 6 showed `1\n1\nWhat is an Algorithm?` instead of `1\nWhat is an Algorithm?`.

#### Root cause
The source activity pages were rendered with `styles/print.css` `@bottom-center { content: counter(page); }`. Because no named `@page` rule suppressed it on activity wrappers, the default footer counter was generated for every activity page. Chromium emitted that footer text near the top of the content stream, so text extraction surfaced it before the heading. The v1.0.1 merge script only covered it with a white rectangle, leaving the glyph in the text layer.

#### Fix
- Updated `styles/print.css`:
  - Removed the built-in `@bottom-center { content: counter(page); }` from the default `@page` rule and set `@bottom-center { content: none; }`. This eliminates the source counter entirely (not just hiding it) so it cannot leak into the PDF text layer. Cover, certificate, front-matter, and back-matter pages already had their own `@bottom-center { content: none; }` rules, so they are unaffected.
- Updated `styles/typography.css`:
  - Reduced base `html { font-size: 16px; }` to `15px` to compensate for Windows Chromium font-metrics differences that caused `activity-03.pdf` to reflow to 3 pages when re-rendered.
- Regenerated **all** source PDFs (cover, front matter, activities 1–12, back matter batches 1–3, certificate) so the entire workbook is rendered with the same CSS.
- Re-ran `scripts/add-teacher-links.js` to restore clickable email/LinkedIn annotations on `output/teacher-parent-guide.pdf`.
- Updated `scripts/merge-workbook.js` output path to `output/workbook-v1.0.2.pdf`.

#### Verification
- Re-ran `node scripts/merge-workbook.js`.
- Total page count: **37 pages**.
- Text-layer extraction for pages 6, 7, 18, 22, 28 shows **no orphan internal page-counter "1" or "2"** digit. The single leading digit on page 6/18/22/28 is the activity number badge, not a footer leak.
- Spot-checked dense pages 22 (Activity 9 page 1), 26 (Activity 11 page 1), and 35 (Answer Key 1–6) — no reflow or overflow.
- Footer regions for pages 6, 7, 20, 27, 35, 37 show only the merged global page number.
- Teacher/Parent Guide clickable links verified in the merged PDF on page 33 (`mailto:yusufahmed.sdet@gmail.com` and `https://www.linkedin.com/in/md-yusuf-ahmed/`).

### Final artifacts
- `output/workbook-v1.0.2.pdf` — versioned final workbook, 37 pages, clean footers, clean text layer, Activity 2 acceptance note restored.
- `output/workbook.pdf` — same content, kept as the current latest build.

### Post-log fix — Teacher/Parent Guide link annotations
- Fixed `scripts/add-teacher-links.js`:
  - Use `PDFString.of(uri)` instead of `doc.context.obj(uri)` so URI action values are PDF strings, not PDF names.
  - Added `F: 4` flag to each link annotation.
  - Clear the page’s existing `/Annots` array before adding links to avoid duplicates.
  - Updated link rectangles to match the actual closing-paragraph text positions:
    - Email: `[255, 175, 375, 186]`
    - LinkedIn: `[166, 160, 306, 173]`
- Re-ran the script on `output/teacher-parent-guide.pdf` and re-merged the workbook.
- Verified the merged PDF contains both clickable links on page 33, positioned over `yusufahmed.sdet@gmail.com` and `linkedin.com/in/md-yusuf-ahmed`.
