# CS Unplugged Workbook — Project Log

## What This Project Is

A print-ready HTML/CSS-to-PDF pipeline for a **26-page children's educational workbook** that teaches computer science concepts through unplugged (no-computer) activities. Target audience: kids ages 8-12.

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
