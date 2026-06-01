"""Generate a Glue API-reference view block from an extracted SD JSON.

Usage:
  python scripts/build-sd-view.py scripts/extract-<File>.json \
      --slug term-deposit --title "Term Deposit" --active-key term-deposit \
      [--reframe-proposed]

Writes the view block (just the <section>...</section>) to stdout in UTF-8.
The view follows the Current Account pilot template exactly.
"""
import argparse, json, re, sys, io, html
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

# Footer leakage patterns we strip wholesale.
FOOTER_PATTERNS = [
    re.compile(r"\bFINXPR-\d+", re.I),
    re.compile(r"USTFinX Confluence", re.I),
    re.compile(r"\bLink to (Jira|Adapter)\b", re.I),
    re.compile(r"\bBIAN published yaml\b", re.I),
    re.compile(r"\bBIAN Portal\b", re.I),
    re.compile(r"^Link to .* Story\s*$", re.I),
    re.compile(r"^Link to .* Adapter\s*$", re.I),
    re.compile(r"^Link to .* Portal\s*$", re.I),
]

# Sidebar groups: key -> (label, route or None for planned, title attr if planned)
SIDEBAR = [
    ("party-and-customer", "Party & Customer", [
        ("party-lifecycle",        "Party Lifecycle",                 "/docs/glue/api-reference",                       None),
        ("party-reference-data",   "Party Reference Data",            "/docs/glue/api-reference/party-reference-data",  "Party Reference Data Directory reference"),
    ]),
    ("accounts-and-deposits", "Accounts & Deposits", [
        ("current-account",        "Current Account",                 "/docs/glue/api-reference/current-account",       "Current Account reference"),
        ("savings-account",        "Savings Account",                 "/docs/glue/api-reference/savings-account",       "Savings Account reference"),
        ("term-deposit",           "Term Deposit",                    "/docs/glue/api-reference/term-deposit",          "Term Deposit reference"),
    ]),
    ("products-and-agreements", "Products & Agreements", [
        ("product-directory",      "Product Directory",               "/docs/glue/api-reference/product-directory",     "Product Directory reference"),
        ("customer-product-service-directory", "Customer Product & Service Directory", "/docs/glue/api-reference/customer-product-service-directory", "Customer Product & Service Directory reference"),
        ("customer-offer",         "Customer Offer",                  "/docs/glue/api-reference/customer-offer",        "Customer Offer reference"),
        ("customer-agreement",     "Customer Agreement",              "/docs/glue/api-reference/customer-agreement",    "Customer Agreement reference"),
    ]),
    ("operations", "Operations", [
        ("position-keeping",       "Position Keeping",                "/docs/glue/api-reference/position-keeping",      "Position Keeping reference"),
        ("payment-order-initiation","Payment Order Initiation",       "/docs/glue/api-reference/payment-order-initiation","Payment Order Initiation reference"),
        ("document-directory",     "Document Directory",              "/docs/glue/api-reference/document-directory",    "Document Directory reference"),
    ]),
]

# Migration state: which keys are live. Update as commits land.
LIVE_KEYS = {
    "party-lifecycle",
    "current-account",
}

def render_sidebar(active_key, extra_live=None):
    live = set(LIVE_KEYS)
    if extra_live:
        live |= set(extra_live)
    live.add(active_key)
    out = []
    out.append('    <aside class="docs-sidebar"><div class="docs-nav">')
    out.append('      <div class="docs-nav-title">FinX Glue</div>')
    out.append('      <a href="#/docs/glue" class="docs-nav-link">Overview</a>')
    out.append('')
    out.append('      <div class="docs-nav-group">Get started</div>')
    out.append('      <a href="#/docs/glue/quickstart" class="docs-nav-link">Quickstart</a>')
    out.append('      <a href="#/docs/glue/auth" class="docs-nav-link">Auth &amp; tenant headers</a>')
    out.append('      <a href="#/docs/glue/environments" class="docs-nav-link">Environments</a>')
    out.append('')
    out.append('      <div class="docs-nav-group">Concepts</div>')
    out.append('      <a href="#/docs/glue" class="docs-nav-link" title="Planned: Concept page on BIAN service domains in Glue">BIAN service domains</a>')
    out.append('      <a href="#/docs/glue" class="docs-nav-link" title="Planned: Concept page on the canonical data model">Canonical model</a>')
    out.append('      <a href="#/docs/glue" class="docs-nav-link" title="Planned: How to extend the canonical model with namespaced fields">Extensibility model</a>')
    out.append('')
    out.append('      <div class="docs-nav-group">API Reference</div>')
    for _, sublabel, items in SIDEBAR:
        out.append(f'      <div class="docs-nav-sub">{html.escape(sublabel)}</div>')
        for key, label, route, planned_title in items:
            label_html = html.escape(label).replace("&amp;","&amp;")
            active_cls = " is-active" if key == active_key else ""
            if key in live:
                out.append(f'      <a href="#{route}" class="docs-nav-link{active_cls}">{label_html}</a>')
            else:
                out.append(f'      <a href="javascript:void(0)" class="docs-nav-link" title="Planned: {planned_title}">{label_html}</a>')
    out.append('')
    out.append('      <div class="docs-nav-group">Journey Guides</div>')
    out.append('      <a href="#/docs/glue/journey-onboarding" class="docs-nav-link">Customer onboarding &amp; KYC</a>')
    out.append('      <a href="#/docs/glue" class="docs-nav-link" title="Planned: Account opening journey guide">Account opening</a>')
    out.append('      <a href="#/docs/glue" class="docs-nav-link" title="Planned: Cross-border payment journey guide">Cross-border payment</a>')
    out.append('')
    out.append('      <div class="docs-nav-group">Operate</div>')
    out.append('      <a href="#/docs/glue" class="docs-nav-link" title="Planned: Operational runbooks for production deployments">Runbooks</a>')
    out.append('      <a href="#/docs/glue" class="docs-nav-link" title="Planned: Release notes and deprecation policy">Releases &amp; deprecations</a>')
    out.append('    </div></aside>')
    return "\n".join(out)

# ---- text cleanup ----
def clean_text(s):
    # Em dash -> comma (most common semantic). Em + space -> ", ".
    s = s.replace(" — ", ", ").replace("—", ",")
    # En dash narrow ranges -> hyphen
    s = s.replace("–", "-")
    # Footer prose tokens scrub (defense in depth).
    for p in FOOTER_PATTERNS:
        s = p.sub("", s)
    # Drop USTFinX Confluence ghost spaces.
    s = re.sub(r"\s{2,}", " ", s).strip()
    return s

def is_footer_event(ev):
    if ev["type"] == "p":
        t = ev["text"]
        for p in FOOTER_PATTERNS:
            if p.search(t):
                return True
        # Whole-line patterns
        if re.match(r"^Link to\b", t.strip(), re.I):
            return True
    if ev["type"] == "h":
        t = ev["text"]
        if re.match(r"^Link to\b", t.strip(), re.I):
            return True
        if re.search(r"BIAN published yaml|BIAN Portal", t, re.I):
            return True
    return False

def strip_numeric_prefix(t):
    return re.sub(r"^\d+(\.\d+)*\.?\s*", "", t).strip()

def slugify_heading(t):
    s = strip_numeric_prefix(t).lower()
    s = re.sub(r"[^\w\s-]", "", s)
    s = re.sub(r"\s+", "-", s)
    return s[:48] or "section"

def reframe_proposed(text):
    """Reframe 'Proposed Changes/Enhancements to BIAN Specification' -> 'Implementation notes on BIAN 14.0'."""
    if re.search(r"Proposed (Changes|Enhancements)", text, re.I) or re.search(r"Enhancements? to BIAN", text, re.I):
        return "Implementation notes on BIAN 14.0"
    return text

def render_table(rows, sub_label=None):
    if not rows:
        return ""
    out = ['      <table class="docs-table">']
    head = rows[0]
    out.append('        <thead><tr>' + ''.join(f'<th>{html.escape(clean_text(c))}</th>' for c in head) + '</tr></thead>')
    out.append('        <tbody>')
    if sub_label:
        out.append(f'          <tr class="sub-row"><td colspan="{len(head)}">{html.escape(sub_label)}</td></tr>')
    for row in rows[1:]:
        # Pad short rows.
        cells = list(row) + [""] * (len(head) - len(row))
        out.append('          <tr>' + ''.join(f'<td>{html.escape(clean_text(c))}</td>' for c in cells[:len(head)]) + '</tr>')
    out.append('        </tbody>')
    out.append('      </table>')
    return "\n".join(out)

def render_list(kind, items):
    tag = "ol" if kind == "ol" else "ul"
    out = [f'      <{tag}>']
    for it in items:
        out.append(f'        <li>{html.escape(clean_text(it))}</li>')
    out.append(f'      </{tag}>')
    return "\n".join(out)

def render_p(text):
    return f'      <p>{html.escape(clean_text(text))}</p>'

def build_view(extract, slug, title, active_key, reframe=False, extra_live=None, lead_override=None, scope_callout=None):
    events = list(extract["events"])
    # Drop footer events from the tail (and any leaked anywhere).
    events = [e for e in events if not is_footer_event(e)]

    # First H1 is the doc title. Skip duplicates.
    # Find first prose paragraph for the lead.
    lead = lead_override
    body_events = []
    saw_first_h = False
    for ev in events:
        if ev["type"] == "h" and not saw_first_h:
            saw_first_h = True
            continue
        if lead is None and ev["type"] == "p":
            lead = clean_text(ev["text"])
            continue
        body_events.append(ev)

    if lead is None:
        lead = f"This page documents the {title} service domain as implemented in FinX Glue."

    # Merge consecutive list events of the same kind (Confluence emits each <li> in its own <ul>).
    merged = []
    for ev in body_events:
        if (ev["type"] == "list" and merged and merged[-1]["type"] == "list"
                and merged[-1]["kind"] == ev["kind"]):
            merged[-1]["items"].extend(ev["items"])
        else:
            merged.append(dict(ev))
    body_events = merged

    # Drop trailing stub paragraphs that orphan after a YAML/section we couldn't capture.
    STUB_TAIL = re.compile(r"^(Revised YAML|YAML(\s+update)?|Updated YAML|Reference YAML)\b", re.I)
    while body_events and body_events[-1]["type"] == "p" and STUB_TAIL.search(body_events[-1]["text"]):
        body_events.pop()

    # Build sections from headings.
    sections = []  # list of {"level":int,"text":str,"anchor":str,"events":[...]}
    current = None
    used_anchors = set()
    for ev in body_events:
        if ev["type"] == "h":
            heading_text = clean_text(ev["text"])
            if reframe:
                heading_text = reframe_proposed(heading_text)
            base_anchor = slugify_heading(heading_text)
            anchor = base_anchor
            i = 2
            while anchor in used_anchors:
                anchor = f"{base_anchor}-{i}"; i += 1
            used_anchors.add(anchor)
            current = {"level": ev["level"], "text": heading_text, "anchor": anchor, "events": []}
            sections.append(current)
        else:
            if current is None:
                current = {"level": 2, "text": "Overview", "anchor": "overview", "events": []}
                used_anchors.add("overview")
                sections.append(current)
            current["events"].append(ev)

    # Render main body.
    main = []
    for sec in sections:
        display_text = strip_numeric_prefix(sec["text"])
        if sec["level"] <= 2:
            main.append(f'      <h2 class="h3" id="{sec["anchor"]}">{html.escape(display_text)}</h2>')
        else:
            main.append(f'      <h3 id="{sec["anchor"]}" style="font-size:16px;color:var(--text-primary);margin-top:20px;">{html.escape(display_text)}</h3>')
        for ev in sec["events"]:
            if ev["type"] == "p":
                main.append(render_p(ev["text"]))
            elif ev["type"] == "table":
                main.append(render_table(ev["rows"]))
            elif ev["type"] == "list":
                main.append(render_list(ev["kind"], ev["items"]))

    # TOC: one entry per top-level (level<=2) section.
    toc_items = [s for s in sections if s["level"] <= 2]
    toc = []
    for s in toc_items:
        label = strip_numeric_prefix(s["text"])
        toc.append(f'      <a href="#{s["anchor"]}" class="toc-link">{html.escape(label)}</a>')

    sidebar = render_sidebar(active_key, extra_live=extra_live)

    # Optional scope callout right after lead.
    callout_html = ""
    if scope_callout:
        callout_html = f'\n      <div class="callout callout--info">{scope_callout}</div>\n'

    view = f"""  <!-- DOCS: API reference ({title}) -->
  <section class="view" data-route="/docs/glue/api-reference/{slug}" data-tier="external" data-layout="docs" data-section="glue" data-title="{html.escape(title)} · API Reference · UST FinX">
{sidebar}
    <main class="docs-main">
      <a href="#/docs/glue/api-reference" class="back-link">← Back to API Reference</a>
      <nav class="breadcrumb" aria-label="Breadcrumb"><a href="#/">Home</a><span class="sep">/</span><a href="#/docs/glue">Glue Developer Hub</a><span class="sep">/</span><a href="#/docs/glue/api-reference">API Reference</a><span class="sep">/</span><span>{html.escape(title)}</span></nav>
      <span class="eyebrow">FinX Glue · API Reference · BIAN 14.0</span>
      <h1 class="page-title">{html.escape(title)}</h1>
      <p class="page-lead">{html.escape(lead)}</p>{callout_html}
{chr(10).join(main)}

      <div class="callout callout--info"><strong>BIAN mapping.</strong> This page implements the BIAN <em>{html.escape(title)}</em> service domain in version 14.0. Operational state is sourced live from the Thought Machine core through the platform adapter layer.</div>
    </main>
    <aside class="docs-toc"><div class="toc-title">On this page</div>
{chr(10).join(toc)}
    </aside>
    <aside class="related-pages"><div class="container"><div class="related-title">Continue reading</div><div class="grid-3">
      <a href="#/docs/glue/api-reference" class="card card--link"><h3 class="card-title">Party Lifecycle (Create party) →</h3><p class="card-text">The Party reference for customer ownership.</p></a>
      <a href="#/docs/glue/journey-onboarding" class="card card--link"><h3 class="card-title">Customer onboarding journey →</h3><p class="card-text">End-to-end onboarding flow.</p></a>
      <a href="#/docs/glue" class="card card--link"><h3 class="card-title">Glue Developer Hub →</h3><p class="card-text">Auth, environments, and the rest of the API surfaces.</p></a>
    </div></div></aside>
  </section>"""
    return view, len(sections), sum(1 for e in events if e["type"]=="table")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("json_path")
    ap.add_argument("--slug", required=True)
    ap.add_argument("--title", required=True)
    ap.add_argument("--active-key", required=True)
    ap.add_argument("--reframe-proposed", action="store_true")
    ap.add_argument("--extra-live", default="", help="comma-separated extra live keys")
    ap.add_argument("--lead", default=None)
    ap.add_argument("--scope-callout", default=None)
    args = ap.parse_args()

    extract = json.loads(Path(args.json_path).read_text(encoding="utf-8"))
    extra = [k.strip() for k in args.extra_live.split(",") if k.strip()]
    view, n_sec, n_tab = build_view(
        extract, args.slug, args.title, args.active_key,
        reframe=args.reframe_proposed, extra_live=extra,
        lead_override=args.lead, scope_callout=args.scope_callout,
    )
    print(view)
    print(f"\n<!-- generator: sections={n_sec} tables={n_tab} -->", file=sys.stderr)

if __name__ == "__main__":
    main()
