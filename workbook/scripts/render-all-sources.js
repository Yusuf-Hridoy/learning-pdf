#!/usr/bin/env node
const { execSync } = require('child_process');

console.log('Regenerating back-matter batch 3 HTML...');
execSync('node scripts/generate-back-matter-3.js', { stdio: 'inherit' });

const files = [
  { html: 'templates/cover.html', pdf: 'output/cover.pdf' },
  { html: 'content/welcome.html', pdf: 'output/welcome.pdf' },
  { html: 'content/how-to-use.html', pdf: 'output/how-to-use.pdf' },
  { html: 'content/meet-your-guides.html', pdf: 'output/meet-your-guides.pdf' },
  { html: 'content/what-youll-learn.html', pdf: 'output/what-youll-learn.pdf' },
  { html: 'content/sample-activity.html', pdf: 'output/activity-01.pdf' },
  { html: 'content/activity-02.html', pdf: 'output/activity-02.pdf' },
  { html: 'content/activity-03.html', pdf: 'output/activity-03.pdf' },
  { html: 'content/activity-04.html', pdf: 'output/activity-04.pdf' },
  { html: 'content/activity-05.html', pdf: 'output/activity-05.pdf' },
  { html: 'content/activity-06.html', pdf: 'output/activity-06.pdf' },
  { html: 'content/activity-07.html', pdf: 'output/activity-07.pdf' },
  { html: 'content/activity-08.html', pdf: 'output/activity-08.pdf' },
  { html: 'content/activity-09.html', pdf: 'output/activity-09.pdf' },
  { html: 'content/activity-10.html', pdf: 'output/activity-10.pdf' },
  { html: 'content/activity-11.html', pdf: 'output/activity-11.pdf' },
  { html: 'content/activity-12.html', pdf: 'output/activity-12.pdf' },
  { html: 'content/vocabulary-review.html', pdf: 'output/vocabulary-review.pdf' },
  { html: 'content/mini-quiz.html', pdf: 'output/mini-quiz.pdf' },
  { html: 'content/reflection-page.html', pdf: 'output/reflection-page.pdf' },
  { html: 'content/teacher-parent-guide.html', pdf: 'output/teacher-parent-guide.pdf' },
  { html: 'content/pacing-guides.html', pdf: 'output/pacing-guides.pdf' },
  { html: 'content/answer-key-1-6.html', pdf: 'output/answer-key-1-6.pdf' },
  { html: 'content/answer-key-7-12.html', pdf: 'output/answer-key-7-12.pdf' },
  { html: 'templates/certificate.html', pdf: 'output/certificate.pdf' },
];

for (const { html, pdf } of files) {
  const tmpPdf = html.replace(/^templates\//, 'output/').replace(/^content\//, 'output/').replace('.html', '.pdf');
  console.log(`Rendering ${html}...`);
  execSync(`node scripts/generate-pdf.js ${html}`, { stdio: 'inherit' });
  if (tmpPdf !== pdf) {
    console.log(`Renaming ${tmpPdf} -> ${pdf}`);
    execSync(`mv ${tmpPdf} ${pdf}`, { stdio: 'inherit' });
  }
}

console.log('\nAdding clickable links to teacher-parent-guide.pdf...');
execSync('node scripts/add-teacher-links.js', { stdio: 'inherit' });

console.log('\nAll source PDFs rendered.');
