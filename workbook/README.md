# CS Unplugged Workbook

A print-ready HTML/CSS template system for a 26-page children's educational workbook that teaches computer science concepts through unplugged (no-computer) activities. Designed for kids ages 8-12.

---

## What's Inside

```
workbook/
  templates/
    base.html          # Shared layout (fonts, meta, blocks)
    cover.html         # Front cover page
    activity.html      # Main reusable activity template
    answer-key.html    # Answer key page
    certificate.html   # Completion certificate
  styles/
    colors.css         # CSS custom properties for the palette
    typography.css     # Fredoka + Nunito font setup
    components.css     # Reusable workbook widgets
    print.css          # @page rules, breaks, print optimisation
  content/
    sample-activity.json   # Content schema example
    sample-activity.html   # Fully rendered test page
  scripts/
    generate-pdf.js    # Playwright HTML-to-PDF converter
  output/              # Generated PDFs land here
  package.json
  README.md
```

## Quick Start

### 1. Install dependencies

```bash
cd workbook
npm install
```

This installs Playwright and downloads the Chromium browser used for headless PDF generation.

### 2. Generate the sample activity PDF

```bash
npm run pdf:sample
```

Or manually:

```bash
node scripts/generate-pdf.js content/sample-activity.html
```

The PDF is saved to `output/sample-activity.pdf`.

### 3. Generate other pages

```bash
npm run pdf:cover       # Cover page
npm run pdf:cert        # Certificate page
```

Or pass any HTML file:

```bash
node scripts/generate-pdf.js path/to/your/page.html
```

---

## Design System

### Fonts
- **Headings:** Fredoka (friendly, rounded display face)
- **Body:** Nunito (humanist sans, excellent readability)

### Color Palette
| Token | Hex | Usage |
|-------|-----|-------|
| Coral | `#FF6B6B` | Primary accents, headers, badges |
| Teal | `#4ECDC4` | Teacher notes, secondary elements |
| Sunny Yellow | `#FFE66D` | Vocabulary callouts, highlights |
| Deep Navy | `#2D3047` | Body text (not pure black) |
| Warm Cream | `#FFF8F0` | Page background tint |

All colors have lighter tints and darker shades defined in `colors.css` for flexible use.

---

## How to Add a New Activity Page

### Option A: Hand-write a standalone HTML page (simplest)

1. Copy `content/sample-activity.html` to a new file, e.g. `content/activity-02.html`.
2. Update the `<title>`, activity number, title, and body content.
3. Run `node scripts/generate-pdf.js content/activity-02.html`.

### Option B: Use the template + JSON data (scalable)

1. Add a new JSON file in `content/` following the schema in `sample-activity.json`.
2. Render the template with your preferred engine (Jinja2, Nunjucks, Handlebars, etc.) or a simple Node script.
3. Save the rendered HTML and pass it to `generate-pdf.js`.

The JSON schema supports:
- `number` — activity number (shown in the circle badge)
- `title` — activity title
- `difficulty` / `difficulty_label` — controls badge colour and text
- `intro` — HTML snippet for the kid-instructions box
- `vocabulary` — word + definition callout
- `has_split` — enables the two-column Basic / Challenge layout
- `basic_version` / `challenge_version` — content for each column
- `teacher_note` — text for the dashed teacher/parent box at the bottom
- `body` — freeform HTML for extra components (grids, checklists, flowcharts, etc.)

### Reusable Components

All components live in `styles/components.css`. Reference them with plain HTML classes:

| Component | CSS Class |
|-----------|-----------|
| Activity header strip | `.activity-header` + `.activity-number` + `.activity-title` + `.difficulty-badge` |
| Kid instructions box | `.kid-box` |
| Teacher note | `.teacher-note` |
| Vocabulary callout | `.vocab-callout` + `.vocab-word` + `.vocab-def` |
| Writing lines (single) | `.write-line` |
| Writing lines (paragraph) | `.write-lines` + `.line` |
| Writing box (big) | `.write-box` |
| Cut-and-paste pieces | `.cut-piece` or `.cut-zone` |
| Yes/No flowchart blocks | `.flow-block` + `.flow-yes` / `.flow-no` / `.flow-start` |
| 5x5 treasure grid | `.grid-5x5` + `.cell` |
| Checkbox list | `.kid-checklist` + `.checkbox` |
| Two-column split | `.two-col` + `.col-basic` / `.col-challenge` |
| Mascot placeholder | `.mascot-box` |

---

## Print Optimisations

- `@page` rules set **US Letter (8.5" x 11")** with **0.5" margins** on all sides.
- `print-color-adjust: exact` forces backgrounds and tints to render in the PDF.
- `page-break-inside: avoid` protects activity boxes, grids, and checklists from being sliced across pages.
- Page numbers are injected automatically via CSS counters in the footer (except cover and certificate pages).
- Fonts are declared with `@font-face` so Playwright embeds them correctly.

---

## Testing in a Browser

You can open any template or content file directly in Chrome/Edge/Firefox to preview layout before generating the PDF. Because files use relative paths (`../styles/...`), open them through a local server or use the `file://` protocol from the project root.

```bash
# Quick Python server (Python 3)
cd workbook
python -m http.server 8080
# Then browse to http://localhost:8080/content/sample-activity.html
```

---

## Adding Mascot Art

Mascot illustrations are not included. Search for `.mascot-box` elements in the HTML and replace the placeholder text with `<img>` tags or inline SVG when your artwork is ready:

```html
<div class="mascot-box">
  <img src="../assets/mascot-explaining.png" alt="Mascot" style="width:100%;height:100%;object-fit:contain;">
</div>
```

---

## License

MIT
