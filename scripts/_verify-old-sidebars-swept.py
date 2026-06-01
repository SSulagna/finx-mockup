import re
s = open('index.html', encoding='utf-8').read()
routes = [
    '/docs/glue',
    '/docs/glue/quickstart',
    '/docs/glue/auth',
    '/docs/glue/environments',
    '/docs/glue/journey-onboarding',
]
slugs = [
    'current-account', 'savings-account', 'term-deposit',
    'party-reference-data', 'product-directory',
    'customer-product-service-directory', 'customer-offer',
    'customer-agreement', 'position-keeping',
    'payment-order-initiation', 'document-directory',
]
fail = 0
for r in routes:
    m = re.search(r'<section class="view" data-route="' + re.escape(r) + r'"[^>]*>(.*?)</aside>', s, re.S)
    if not m:
        print(r, 'NO SIDEBAR'); fail += 1; continue
    side = m.group(1)
    api_m = re.search(r'API Reference</div>(.*?)<div class="docs-nav-group">', side, re.S)
    if not api_m:
        print(r, 'NO API REF GROUP'); fail += 1; continue
    block = api_m.group(1)
    void = len(re.findall(r'javascript:void\(0\)', block))
    planned = len(re.findall(r'title="Planned:', block))
    active = len(re.findall(r'is-active', block))
    # Party Lifecycle has bare /api-reference path (no slug); check separately
    party_count = len(re.findall(r'href="#/docs/glue/api-reference"', block))
    slug_status = []
    for sl in slugs:
        c = len(re.findall(r'/api-reference/' + sl + r'"', block))
        slug_status.append((sl, c))
    all_one = all(c == 1 for _, c in slug_status) and party_count == 1
    status = 'PASS' if (void == 0 and planned == 0 and active == 0 and all_one) else 'FAIL'
    if status == 'FAIL':
        fail += 1
        for sl, c in slug_status:
            if c != 1:
                print(f'  bad slug {sl}: {c}')
        if party_count != 1:
            print(f'  party-lifecycle count: {party_count}')
    print(f'{r:35s} void={void} planned={planned} active={active} party={party_count} slugs_ok={all_one} {status}')
print('TOTAL FAIL:', fail)
