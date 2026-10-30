from pathlib import Path
import fitz

ROOT = Path(__file__).resolve().parents[2]
REPORT = ROOT / "docs" / "reports" / "MeeSeva_DQMS_Academic_Project_Report.pdf"
doc = fitz.open(str(REPORT))
print('Generated PDF Page Count:', len(doc))

for i in range(len(doc)):
    p = doc[i]
    first_line = ''
    for b in p.get_text('dict')['blocks']:
        if 'lines' in b:
            first_line = ''.join([s['text'] for s in b['lines'][0]['spans']]).strip()
            if first_line:
                break
    drawings_count = len(p.get_drawings())
    images_count = len(p.get_images())
    safe_text = first_line[:40].encode('ascii', 'ignore').decode()
    print(f'Page {i+1}: drawings={drawings_count}, images={images_count}, first_text="{safe_text}"')
