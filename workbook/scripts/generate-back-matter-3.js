#!/usr/bin/env node
/**
 * generate-back-matter-3.js
 * -------------------------
 * Renders content/back-matter-batch-3.json into three standalone HTML pages:
 *   - content/pacing-guides.html
 *   - content/answer-key-1-6.html
 *   - content/answer-key-7-12.html
 *
 * Each page follows the existing workbook design system and is tuned to fit
 * exactly one US Letter page when printed via scripts/generate-pdf.js.
 */

const fs = require('fs');
const path = require('path');

const INPUT_PATH = path.resolve(__dirname, '..', 'content', 'back-matter-batch-3.json');
const OUTPUT_DIR = path.resolve(__dirname, '..', 'content');

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function mdBold(str) {
  return escapeHtml(str).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

function commonHead(title) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">

  <!-- Workbook styles -->
  <link rel="stylesheet" href="../styles/colors.css">
  <link rel="stylesheet" href="../styles/typography.css">
  <link rel="stylesheet" href="../styles/components.css">
  <link rel="stylesheet" href="../styles/print.css">
`;
}

function renderItem(item) {
  const type = item.type || 'activity';
  const text = mdBold(item.text);
  if (type === 'activity') {
    return `<li class="pg-item activity"><span class="pg-bullet"></span><span class="pg-item-text">${text}</span></li>`;
  }
  const label = type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return `<li class="pg-item"><span class="pg-bullet teal"></span><span class="pg-item-text"><em>${label}:</em> ${text}</span></li>`;
}

function renderScheduleBlock(block, accent) {
  const title = mdBold(block.title);
  const summary = block.summary ? `<p class="pg-summary">${escapeHtml(block.summary)}</p>` : '';
  let inner = '';

  if (block.schedule_type === 'day_by_day' && block.days) {
    inner = `<div class="pg-blocks-grid">
      ${block.days.map(d => `
        <div class="pg-day-block ${accent}">
          <div class="pg-block-header">DAY ${d.day} — ${escapeHtml(d.theme)}</div>
          <ul class="pg-block-list">${d.items.map(renderItem).join('')}</ul>
        </div>
      `).join('')}
    </div>`;
  } else if (block.schedule_type === 'week_by_week' && block.weeks) {
    inner = `<div class="pg-blocks-grid">
      ${block.weeks.map(w => `
        <div class="pg-week-block ${accent}">
          <div class="pg-block-header">WEEK ${w.week} — ${escapeHtml(w.theme)}</div>
          <ul class="pg-block-list">${w.items.map(renderItem).join('')}</ul>
        </div>
      `).join('')}
    </div>`;
  } else if (block.schedule_type === 'table' && block.table) {
    const thead = `<thead><tr>${block.table.columns.map(c => `<th>${escapeHtml(c)}</th>`).join('')}</tr></thead>`;
    const tbody = `<tbody>${block.table.rows.map((row, idx) => `
      <tr class="${idx % 2 === 0 ? 'even' : 'odd'}">
        <td class="col-week">${row[0]}</td>
        <td class="col-activity">${escapeHtml(row[1])}</td>
        <td class="col-focus">${escapeHtml(row[2])}</td>
      </tr>
    `).join('')}</tbody>`;
    inner = `<table class="pg-table ${accent}">${thead}${tbody}</table>`;
  }

  return `
    <section class="pg-section ${accent}">
      <h2 class="pg-section-title">${title}</h2>
      <div class="pg-section-accent-bar"></div>
      ${summary}
      ${inner}
    </section>
  `;
}

function renderPacingGuides(page) {
  const sections = page.sections.map(s => renderScheduleBlock(s, s.accent_color)).join('');

  return `${commonHead(page.header)}
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; padding: 0; }

    .page-back-matter { padding: 0.03rem 0; page: back-matter; }
    .front-matter-header { margin-bottom: 0.1rem; }
    .front-matter-header h1 { font-size: 1.5rem; }

    .pg-intro {
      font-size: 9pt;
      color: var(--navy);
      text-align: center;
      max-width: 82%;
      margin: 0 auto 0.12rem;
      line-height: 1.25;
    }

    .pg-section { margin-bottom: 0.12rem; }
    .pg-section:last-child { margin-bottom: 0.08rem; }

    .pg-section-title {
      font-family: 'Fredoka', sans-serif;
      font-size: 13pt;
      font-weight: 700;
      margin: 0 0 0.04rem 0;
    }
    .pg-section.coral .pg-section-title { color: var(--coral); }
    .pg-section.teal .pg-section-title { color: var(--teal-dark); }
    .pg-section.yellow .pg-section-title { color: var(--sunny-dark); }

    .pg-section-accent-bar {
      width: 100%;
      height: 2px;
      border-radius: 1px;
      margin-bottom: 0.05rem;
    }
    .pg-section.coral .pg-section-accent-bar { background: var(--coral); }
    .pg-section.teal .pg-section-accent-bar { background: var(--teal); }
    .pg-section.yellow .pg-section-accent-bar { background: var(--sunny); }

    .pg-summary {
      font-size: 8.5pt;
      font-style: italic;
      color: var(--navy-muted);
      margin: 0 0 0.05rem 0;
      line-height: 1.2;
    }

    .pg-blocks-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3px 6px;
    }

    .pg-day-block, .pg-week-block {
      background: var(--white);
      border-left: 2px solid var(--coral);
      border-radius: 0 3px 3px 0;
      padding: 2px 4px;
      page-break-inside: avoid;
    }
    .pg-day-block.coral, .pg-week-block.coral { border-left-color: var(--coral); }
    .pg-day-block.teal, .pg-week-block.teal { border-left-color: var(--teal); }

    .pg-block-header {
      font-family: 'Nunito', sans-serif;
      font-weight: 700;
      font-size: 8.5pt;
      color: var(--navy);
      margin-bottom: 0.02rem;
      line-height: 1.1;
    }

    .pg-block-list {
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .pg-item {
      display: flex;
      align-items: flex-start;
      gap: 3px;
      font-size: 7.5pt;
      color: var(--navy);
      line-height: 1.15;
      margin-bottom: 0;
    }

    .pg-bullet {
      width: 3px;
      height: 3px;
      border-radius: 50%;
      background: var(--coral);
      flex-shrink: 0;
      margin-top: 3px;
    }
    .pg-bullet.teal { background: var(--teal); }

    .pg-item-text em {
      color: var(--teal-dark);
      font-style: italic;
      font-weight: 600;
    }

    .pg-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 7.5pt;
      color: var(--navy);
      page-break-inside: avoid;
    }
    .pg-table th, .pg-table td {
      padding: 1px 4px;
      text-align: left;
      border-bottom: 1px solid var(--gray-mid);
      vertical-align: top;
    }
    .pg-table th {
      background: var(--cream);
      font-weight: 700;
      font-size: 8pt;
    }
    .pg-table tr.even td { background: rgba(255, 248, 240, 0.6); }
    .pg-table tr.odd td { background: var(--white); }
    .pg-table .col-week {
      width: 10%;
      font-weight: 700;
      color: var(--coral);
      text-align: center;
    }
    .pg-table .col-activity { width: 65%; }
    .pg-table .col-focus { width: 25%; }

    .pg-closing {
      background: var(--coral-light);
      border: 1px solid var(--coral);
      border-radius: 4px;
      padding: 3px 8px;
      text-align: center;
      font-style: italic;
      font-size: 8.5pt;
      color: var(--navy);
      line-height: 1.2;
      page-break-inside: avoid;
    }
    .pg-closing p { margin: 0; }
  </style>
</head>
<body class="page-back-matter">

  <header class="front-matter-header">
    <h1>${escapeHtml(page.header)}</h1>
    <div class="accent-bar"></div>
  </header>

  <p class="pg-intro">${escapeHtml(page.intro)}</p>

  ${sections}

  <div class="pg-closing">
    <p>${escapeHtml(page.closing_reminder)}</p>
  </div>

</body>
</html>`;
}

function renderAnswerPart(part) {
  if (!part) return '';
  let html = '';
  // Label is already shown inline with BASIC / CHALLENGE section label.
  if (part.content) {
    html += `<p class="ak-part-content">${mdBold(part.content)}</p>`;
  }
  if (part.items && part.items.length) {
    html += `<ul class="ak-part-list">${part.items.map(i => `<li><span class="ak-bullet"></span><span>${mdBold(i)}</span></li>`).join('')}</ul>`;
  }
  if (part.note) {
    html += `<p class="ak-part-note">${mdBold(part.note)}</p>`;
  }
  return html;
}

function renderBonus(bonus, fallbackNote) {
  if (!bonus && !fallbackNote) return '';
  if (!bonus) {
    return `
      <div class="ak-bonus">
        <span class="ak-bonus-label">BONUS Grading Note:</span>
        <span class="ak-bonus-text">${escapeHtml(fallbackNote)}</span>
      </div>
    `;
  }

  const label = bonus.label
    ? `<span class="ak-bonus-label">BONUS ${escapeHtml(bonus.label)}</span>`
    : `<span class="ak-bonus-label">BONUS Grading Note:</span>`;

  let itemsHtml = '';
  if (bonus.items && bonus.items.length) {
    itemsHtml = `<ol class="ak-bonus-list">${bonus.items.map(i => `<li>${mdBold(i)}</li>`).join('')}</ol>`;
  }

  const noteHtml = bonus.note
    ? `<div class="ak-bonus-note">${mdBold(bonus.note)}</div>`
    : '';

  return `
    <div class="ak-bonus">
      ${label}
      ${itemsHtml}
      ${noteHtml}
    </div>
  `;
}

function renderAnswerKeyPage(page, includeIntro, includeFooter) {
  const intro = includeIntro && page.intro
    ? `<p class="ak-intro">${escapeHtml(page.intro)}</p>`
    : '';

  const activities = page.activities.map(a => `
    <div class="ak-block">
      <div class="ak-block-title">Activity ${a.number}: ${escapeHtml(a.title)}</div>
      <div class="ak-part">
        <div class="ak-section-label">BASIC ${a.basic && a.basic.label ? `<span class="ak-section-sublabel">— ${escapeHtml(a.basic.label)}</span>` : ''}</div>
        ${renderAnswerPart(a.basic)}
      </div>
      <div class="ak-part">
        <div class="ak-section-label">CHALLENGE ${a.challenge && a.challenge.label ? `<span class="ak-section-sublabel">— ${escapeHtml(a.challenge.label)}</span>` : ''}</div>
        ${renderAnswerPart(a.challenge)}
      </div>
      ${renderBonus(a.bonus, a.bonus_note)}
    </div>
  `).join('');

  const footer = includeFooter && page.closing_footer
    ? `<div class="ak-footer">${escapeHtml(page.closing_footer)}</div>`
    : '';

  return `${commonHead(page.header)}
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; padding: 0; }

    .page-back-matter { padding: 0.05rem 0; page: back-matter; }
    .front-matter-header { margin-bottom: 0.15rem; }
    .front-matter-header h1 { font-size: 1.6rem; }

    .ak-intro {
      font-size: 9pt;
      font-style: italic;
      color: var(--navy);
      text-align: center;
      max-width: 92%;
      margin: 0 auto 0.2rem;
      line-height: 1.3;
    }

    .ak-columns {
      column-count: 2;
      column-gap: 8px;
    }

    .ak-block {
      background: #FFFCF8;
      border-left: 3px solid var(--coral);
      border-radius: 4px;
      padding: 4px 6px;
      margin-bottom: 5px;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .ak-block-title {
      font-family: 'Fredoka', sans-serif;
      font-size: 10pt;
      font-weight: 700;
      color: var(--navy);
      margin-bottom: 0.06rem;
      line-height: 1.1;
    }

    .ak-part { margin-bottom: 0.08rem; }
    .ak-part:last-of-type { margin-bottom: 0.05rem; }

    .ak-section-label {
      font-size: 7.5pt;
      font-weight: 700;
      color: var(--coral);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 0.02rem;
      line-height: 1.1;
    }

    .ak-section-sublabel {
      font-weight: 400;
      font-style: italic;
      color: var(--navy-muted);
      text-transform: none;
      letter-spacing: normal;
    }

    .ak-part-content {
      font-size: 7.5pt;
      color: var(--navy);
      line-height: 1.2;
      margin: 0 0 0.04rem 0;
    }

    .ak-part-list {
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .ak-part-list li {
      display: flex;
      align-items: flex-start;
      gap: 3px;
      font-size: 7.5pt;
      color: var(--navy);
      line-height: 1.2;
      margin-bottom: 0.01rem;
    }

    .ak-bullet {
      width: 3px;
      height: 3px;
      border-radius: 50%;
      background: var(--coral);
      flex-shrink: 0;
      margin-top: 3px;
    }

    .ak-part-note {
      font-size: 7.5pt;
      font-style: italic;
      color: var(--navy);
      line-height: 1.2;
      margin: 0.02rem 0 0.04rem 0;
    }

    .ak-bonus {
      font-size: 7.5pt;
      color: var(--navy);
      line-height: 1.15;
      border-top: 1px dashed var(--teal);
      padding-top: 0.04rem;
      margin-top: 0.04rem;
    }

    .ak-bonus-label {
      font-style: italic;
      color: var(--teal-dark);
      font-weight: 600;
      font-size: 7pt;
    }

    .ak-bonus-text {
      font-style: italic;
    }

    .ak-bonus-list {
      margin: 0.03rem 0 0.03rem 0.85rem;
      padding: 0;
      font-size: 7.5pt;
      color: var(--navy);
      line-height: 1.15;
    }

    .ak-bonus-list li {
      margin-bottom: 0.01rem;
      padding-left: 0.1rem;
    }

    .ak-bonus-note {
      font-style: italic;
      font-size: 7pt;
      color: var(--navy-muted);
      margin-top: 0.03rem;
    }

    .ak-footer {
      text-align: center;
      font-size: 8.5pt;
      font-style: italic;
      color: var(--navy-muted);
      margin-top: 0.08rem;
      page-break-inside: avoid;
    }
  </style>
</head>
<body class="page-back-matter">

  <header class="front-matter-header">
    <h1>${escapeHtml(page.header)}</h1>
    <div class="accent-bar"></div>
  </header>

  ${intro}

  <div class="ak-columns">
    ${activities}
  </div>

  ${footer}

</body>
</html>`;
}

function main() {
  const data = JSON.parse(fs.readFileSync(INPUT_PATH, 'utf8'));

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Page 0: Pacing Guides
  const pacingPage = data.pages[0];
  const pacingHtml = renderPacingGuides(pacingPage);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'pacing-guides.html'), pacingHtml, 'utf8');
  console.log('Wrote content/pacing-guides.html');

  // Page 1: Answer Key 1-6
  const ak1Page = data.pages[1];
  const ak1Html = renderAnswerKeyPage(ak1Page, true, false);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'answer-key-1-6.html'), ak1Html, 'utf8');
  console.log('Wrote content/answer-key-1-6.html');

  // Page 2: Answer Key 7-12
  const ak2Page = data.pages[2];
  const ak2Html = renderAnswerKeyPage(ak2Page, false, true);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'answer-key-7-12.html'), ak2Html, 'utf8');
  console.log('Wrote content/answer-key-7-12.html');
}

main();
