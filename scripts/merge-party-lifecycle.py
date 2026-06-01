"""One-shot Party Lifecycle merge: take the generated SD view, fix the route,
splice in the existing Create Party endpoint detail as a subsection, then
replace the existing #/docs/glue/api-reference view block in index.html.
"""
import re, sys, io
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

view = Path("scripts/view-party-lifecycle-full.html").read_text(encoding="utf-8")
idx = Path("index.html").read_text(encoding="utf-8")

# 1. Fix the route to the canonical api-reference root.
view = view.replace(
    'data-route="/docs/glue/api-reference/api-reference"',
    'data-route="/docs/glue/api-reference"'
)
view = view.replace(
    '<!-- DOCS: API reference (Party Lifecycle Management) -->',
    '<!-- DOCS: API reference (Party Lifecycle Management, full SD) -->'
)

# 2. Change back-link to Glue Developer Hub since this IS the API Reference root.
view = view.replace(
    '<a href="#/docs/glue/api-reference" class="back-link">← Back to API Reference</a>',
    '<a href="#/docs/glue" class="back-link">← Back to Glue Developer Hub</a>'
)

# 3. Build the Create endpoint reference section from the existing Create Party detail.
create_section = '''      <h2 class="h3" id="create-endpoint">Create endpoint reference</h2>
      <p>The Initiate operation in the lifecycle flow above is exposed at the path below. Field-level detail for this single endpoint is preserved here for caller integration.</p>
      <div class="endpoint-row"><span class="method method--post">POST</span><code>/v1/parties/initiate</code></div>

      <h3 id="create-parameters" style="font-size:16px;color:var(--text-primary);margin-top:20px;">Parameters</h3>
      <div class="params">
        <div class="params-row">
          <div>
            <div class="params-name">type</div>
            <div class="params-meta"><span class="params-type">string</span><span class="params-req params-req--required">Required</span></div>
          </div>
          <div class="params-desc">One of <code>individual</code> or <code>organization</code>. Determines which downstream attribute set is validated.</div>
        </div>
        <div class="params-row">
          <div>
            <div class="params-name">givenName</div>
            <div class="params-meta"><span class="params-type">string</span><span class="params-req params-req--required">Required</span></div>
          </div>
          <div class="params-desc">Given name as it appears on the primary identity document. Required for <code>individual</code>.</div>
        </div>
        <div class="params-row">
          <div>
            <div class="params-name">familyName</div>
            <div class="params-meta"><span class="params-type">string</span><span class="params-req params-req--required">Required</span></div>
          </div>
          <div class="params-desc">Family name as it appears on the primary identity document.</div>
        </div>
        <div class="params-row">
          <div>
            <div class="params-name">dateOfBirth</div>
            <div class="params-meta"><span class="params-type">date (ISO-8601)</span><span class="params-req params-req--required">Required</span></div>
          </div>
          <div class="params-desc">Date of birth in <code>YYYY-MM-DD</code> form. Used by IDV and AML screening.</div>
        </div>
        <div class="params-row">
          <div>
            <div class="params-name">residency</div>
            <div class="params-meta"><span class="params-type">string (ISO-3166-1)</span><span class="params-req params-req--required">Required</span></div>
          </div>
          <div class="params-desc">Country of residency, two-letter code. Drives jurisdictional rule selection.</div>
        </div>
        <div class="params-row">
          <div>
            <div class="params-name">externalRef</div>
            <div class="params-meta"><span class="params-type">string</span><span class="params-req params-req--optional">Optional</span></div>
          </div>
          <div class="params-desc">Caller-supplied reference for cross-system correlation. Indexed but not validated.</div>
        </div>
      </div>

      <h3 id="create-request" style="font-size:16px;color:var(--text-primary);margin-top:20px;">Request</h3>
      <div class="code-panel">
        <div class="code-bar">
          <div class="code-dots"><span></span><span></span><span></span></div>
          <div class="code-language">JSON</div>
          <button class="code-copy" type="button">Copy</button>
        </div>
        <pre><code>{
  "type": "individual",
  "givenName": "Sample",
  "familyName": "Customer",
  "dateOfBirth": "1990-04-12",
  "residency": "GB",
  "externalRef": "crm-7741-22"
}</code></pre>
      </div>

      <h3 id="create-responses" style="font-size:16px;color:var(--text-primary);margin-top:20px;">Responses</h3>
      <div class="resp-tabs">
        <button class="resp-tab active" type="button" data-resp="201">201 Created</button>
        <button class="resp-tab" type="button" data-resp="400">400 Bad Request</button>
        <button class="resp-tab" type="button" data-resp="409">409 Conflict</button>
      </div>
      <div class="resp-panel active" data-resp="201">
        <div class="code-panel">
          <div class="code-bar">
            <div class="code-dots"><span></span><span></span><span></span></div>
            <div class="code-language">JSON · 201</div>
            <button class="code-copy" type="button">Copy</button>
          </div>
          <pre><code>{
  "partyId": "ptr_01HK9X4ZQ8M2VYNB3R7W5C8D2K",
  "type": "individual",
  "lifecycleState": "pending_kyc",
  "createdAt": "2026-04-29T10:14:22Z"
}</code></pre>
        </div>
      </div>
      <div class="resp-panel" data-resp="400">
        <div class="code-panel">
          <div class="code-bar">
            <div class="code-dots"><span></span><span></span><span></span></div>
            <div class="code-language">JSON · 400</div>
            <button class="code-copy" type="button">Copy</button>
          </div>
          <pre><code>{
  "error": "validation_failed",
  "message": "dateOfBirth is required for type=individual",
  "field": "dateOfBirth"
}</code></pre>
        </div>
      </div>
      <div class="resp-panel" data-resp="409">
        <div class="code-panel">
          <div class="code-bar">
            <div class="code-dots"><span></span><span></span><span></span></div>
            <div class="code-language">JSON · 409</div>
            <button class="code-copy" type="button">Copy</button>
          </div>
          <pre><code>{
  "error": "duplicate_party",
  "message": "A party with this externalRef already exists.",
  "existingPartyId": "ptr_01HK7T1V4R8KF6QWA2N9XBJ0YZ"
}</code></pre>
        </div>
      </div>
'''

# 4. Splice the create section into the body just before the closing BIAN-mapping callout.
marker = '<div class="callout callout--info"><strong>BIAN mapping.</strong>'
if marker not in view:
    print("ERROR: BIAN mapping callout not found in generated view", file=sys.stderr)
    sys.exit(2)
view = view.replace(marker, create_section + "\n      " + marker, 1)

# 5. Add the new TOC anchor for Create endpoint, inserted after Onboarding Lifecycle Flow.
view = view.replace(
    '      <a href="#bian-field-mapping" class="toc-link">BIAN Field Mapping</a>',
    '      <a href="#create-endpoint" class="toc-link">Create endpoint reference</a>\n      <a href="#bian-field-mapping" class="toc-link">BIAN Field Mapping</a>'
)

# 6. Locate the existing api-reference view block in index.html and replace it.
pattern = re.compile(
    r'  <!-- DOCS: API reference \(Party Lifecycle / Create Party\)[^\n]*-->.*?  </section>\n',
    re.S
)
m = pattern.search(idx)
if not m:
    # fall back to matching by data-route
    pattern2 = re.compile(
        r'(  <!--[^\n]*-->\n)?  <section class="view" data-route="/docs/glue/api-reference" data-tier="external"[^>]*>.*?  </section>\n',
        re.S
    )
    m = pattern2.search(idx)
if not m:
    print("ERROR: existing api-reference view block not found in index.html", file=sys.stderr)
    sys.exit(3)

print(f"replacing existing block: span {m.start()}..{m.end()} ({m.end()-m.start()} chars)", file=sys.stderr)

idx_new = idx[:m.start()] + view.rstrip() + "\n\n" + idx[m.end():]
Path("index.html").write_text(idx_new, encoding="utf-8")
print(f"wrote index.html (delta {len(idx_new) - len(idx):+d} chars)", file=sys.stderr)
