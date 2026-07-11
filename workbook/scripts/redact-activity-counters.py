import fitz
import os

# Redact the built-in CSS footer counter (single digit "1" or "2") from each
# activity page. The counter sits in the bottom margin center; we redact a
# narrow strip across the bottom margin so the glyph is removed from both the
# visual layer and the text layer.

ACTIVITY_DIR = os.path.join(os.path.dirname(__file__), '..', 'output')
REDACT_HEIGHT = 40  # points from bottom of page
REDACT_WIDTH = 80   # points wide, centered

for i in range(1, 13):
    pdf_path = os.path.join(ACTIVITY_DIR, f'activity-{i:02d}.pdf')
    doc = fitz.open(pdf_path)
    for page_num in range(doc.page_count):
        page = doc.load_page(page_num)
        rect = page.rect
        # Counter is centered near the bottom of the page (in the margin).
        redact_rect = fitz.Rect(
            (rect.width - REDACT_WIDTH) / 2,
            rect.height - REDACT_HEIGHT,
            (rect.width + REDACT_WIDTH) / 2,
            rect.height
        )
        page.add_redact_annot(redact_rect)
        page.apply_redactions()
    tmp_path = pdf_path + '.tmp'
    doc.save(tmp_path, deflate=True, garbage=4)
    doc.close()
    os.replace(tmp_path, pdf_path)
    print(f'Redacted footer counter(s) in {os.path.basename(pdf_path)}')

print('Done.')
