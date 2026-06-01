p = 'index.html'
s = open(p, encoding='utf-8').read()
old = '''      <div class="docs-nav-group">API Reference</div>
      <a href="#/docs/glue/api-reference" class="docs-nav-link">Party Lifecycle</a>
      <a href="#/docs/glue/api-reference" class="docs-nav-link" title="Planned: Account Management API reference">Account Management</a>
      <a href="#/docs/glue/api-reference" class="docs-nav-link" title="Planned: Payments API reference">Payments</a>
      <a href="#/docs/glue/api-reference" class="docs-nav-link" title="Planned: Document Directory API reference">Document Directory</a>'''
new = '''      <div class="docs-nav-group">API Reference</div>
      <div class="docs-nav-sub">Party &amp; Customer</div>
      <a href="#/docs/glue/api-reference" class="docs-nav-link">Party Lifecycle</a>
      <a href="#/docs/glue/api-reference/party-reference-data" class="docs-nav-link">Party Reference Data</a>
      <div class="docs-nav-sub">Accounts &amp; Deposits</div>
      <a href="#/docs/glue/api-reference/current-account" class="docs-nav-link">Current Account</a>
      <a href="#/docs/glue/api-reference/savings-account" class="docs-nav-link">Savings Account</a>
      <a href="#/docs/glue/api-reference/term-deposit" class="docs-nav-link">Term Deposit</a>
      <div class="docs-nav-sub">Products &amp; Agreements</div>
      <a href="#/docs/glue/api-reference/product-directory" class="docs-nav-link">Product Directory</a>
      <a href="#/docs/glue/api-reference/customer-product-service-directory" class="docs-nav-link">Customer Product &amp; Service Directory</a>
      <a href="#/docs/glue/api-reference/customer-offer" class="docs-nav-link">Customer Offer</a>
      <a href="#/docs/glue/api-reference/customer-agreement" class="docs-nav-link">Customer Agreement</a>
      <div class="docs-nav-sub">Operations</div>
      <a href="#/docs/glue/api-reference/position-keeping" class="docs-nav-link">Position Keeping</a>
      <a href="#/docs/glue/api-reference/payment-order-initiation" class="docs-nav-link">Payment Order Initiation</a>
      <a href="#/docs/glue/api-reference/document-directory" class="docs-nav-link">Document Directory</a>'''
n = s.count(old)
print('found', n, 'occurrences')
assert n == 5, f'expected 5, got {n}'
s2 = s.replace(old, new)
open(p, 'w', encoding='utf-8').write(s2)
print('written. delta', len(s2) - len(s))
