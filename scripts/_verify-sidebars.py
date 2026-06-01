import re
s = open('index.html', encoding='utf-8').read()
routes = [
    '/docs/glue/api-reference',
    '/docs/glue/api-reference/current-account',
    '/docs/glue/api-reference/term-deposit',
    '/docs/glue/api-reference/party-reference-data',
    '/docs/glue/api-reference/savings-account',
    '/docs/glue/api-reference/position-keeping',
    '/docs/glue/api-reference/payment-order-initiation',
    '/docs/glue/api-reference/document-directory',
    '/docs/glue/api-reference/product-directory',
    '/docs/glue/api-reference/customer-product-service-directory',
    '/docs/glue/api-reference/customer-offer',
    '/docs/glue/api-reference/customer-agreement',
]
total_fail = 0
for r in routes:
    m = re.search(r'<section class="view" data-route="' + re.escape(r) + r'"[^>]*>(.*?)</aside>', s, re.S)
    if not m:
        print(r, 'NO SIDEBAR'); total_fail += 1; continue
    side = m.group(1)
    api_m = re.search(r'API Reference</div>(.*?)(?:<div class="docs-nav-group">|</div></aside>)', side, re.S)
    if not api_m:
        print(r, 'NO API REF GROUP'); total_fail += 1; continue
    block = api_m.group(1)
    planned = len(re.findall(r'title="Planned:', block))
    void = len(re.findall(r'javascript:void\(0\)', block))
    active = len(re.findall(r'is-active', block))
    # count SD entries (anchors)
    links = len(re.findall(r'<a href="#/docs/glue/api-reference', block))
    status = 'PASS' if (planned == 0 and void == 0 and active == 1 and links == 12) else 'FAIL'
    if status == 'FAIL':
        total_fail += 1
    print(f'{r:62s} links={links:2d} planned={planned} void={void} active={active} {status}')
print('TOTAL FAIL:', total_fail)
