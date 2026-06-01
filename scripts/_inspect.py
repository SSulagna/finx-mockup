import re, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
v = open('scripts/view-party-lifecycle-full.html', encoding='utf-8').read()
m = re.search(r'<h2[^>]*id="bian-field-mapping"[^>]*>.*?</table>', v, re.S)
print('section snippet len:', len(m.group(0)) if m else 'NOT FOUND')
if m:
    rows = re.findall(r'<tr><td', m.group(0))
    print('data rows in field-mapping section (first table):', len(rows))
all_tables = re.findall(r'<table class="docs-table">.*?</table>', v, re.S)
print('total docs-tables in view file:', len(all_tables))
for i,t in enumerate(all_tables):
    rows = re.findall(r'<tr><td', t)
    print(f'  table {i}: {len(rows)} data rows')
