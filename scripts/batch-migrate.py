"""Batch driver: for each SD file in order, generate view, insert, verify, commit.
Stops on first verify failure.

Per-file params: (slug, title, json_file, planned_title, label, reframe, lead, scope_callout)
"""
import json, re, subprocess, sys, io, os
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

os.environ["PYTHONIOENCODING"] = "utf-8"

FILES = [
    # (slug, title, json, planned_title, label, reframe, lead, scope_callout)
    ("party-reference-data", "Party Reference Data Directory",
     "extract-Party_Reference_Data_Directory_SD.json",
     "Party Reference Data Directory reference", "Party Reference Data", True,
     "The Party Reference Data Directory service domain maintains the authoritative master record of customer profile data: identifiers, names, contact details, document references, and consent history. Other service domains read party data from here; they do not duplicate it.",
     "<strong>Scope.</strong> This SD owns customer master data. Lifecycle orchestration belongs to Party Lifecycle Management; document artifacts belong to Document Directory; agreement terms belong to Customer Agreement."),

    ("savings-account", "Savings Account",
     "extract-Savings_Account_SD.json",
     "Savings Account reference", "Savings Account", False,
     "The Savings Account service domain maintains and exposes the operational state of a specific savings <code>AccountInstanceReference</code>: balances, restrictions, entitlements, lifecycle attributes, and currency denominations. It is the live runtime view of a single savings account.",
     "<strong>Scope.</strong> This SD owns runtime account state. Product agreement configuration lives in Sales Product Agreement; the customer holdings registry lives in Customer Product &amp; Service Directory; customer profile lives in Party Reference Data Directory."),

    ("position-keeping", "Position Keeping",
     "extract-Position_Keeping_SD.json",
     "Position Keeping reference", "Position Keeping", True,
     "The Position Keeping service domain records and exposes individual financial postings against an account: transaction lines, value dates, posting amounts, and counterparty references. It is the authoritative source for transaction-level account history.",
     None),

    ("payment-order-initiation", "Payment Order Initiation",
     "extract-Payment_Order_Initiation_SD.json",
     "Payment Order Initiation reference", "Payment Order Initiation", False,
     "The Payment Order Initiation service domain creates, tracks, and dispatches outbound payment instructions. It captures the originator, beneficiary, amount, value date, and rail selection, and emits the payment to the appropriate scheme adapter.",
     None),

    ("document-directory", "Document Directory",
     "extract-Document_Directory_SD.json",
     "Document Directory reference", "Document Directory", False,
     "The Document Directory service domain stores and indexes customer-related documents: identity artefacts, address proofs, agreement copies, and supporting evidence. It is the authoritative store for document artefacts; other service domains hold only references.",
     None),

    ("product-directory", "Product Directory",
     "extract-Product_Directory_SD.json",
     "Product Directory reference", "Product Directory", False,
     "The Product Directory service domain defines the catalogue of bank products available for sale: current accounts, savings accounts, term deposits, and their variants. It carries product configuration, eligibility, and lifecycle status.",
     None),

    ("customer-product-service-directory", "Customer Product & Service Directory",
     "extract-Customer_Product_and_Service_Directory_SD.json",
     "Customer Product & Service Directory reference", "Customer Product & Service Directory", True,
     "The Customer Product &amp; Service Directory service domain maintains the registry of products and services held by each customer. It is the holdings view across the customer relationship: which accounts, which agreements, which active services, with status.",
     None),

    ("customer-offer", "Customer Offer",
     "extract-Customer_Offer_SD.json",
     "Customer Offer reference", "Customer Offer", True,
     "The Customer Offer service domain captures the application context for a prospective product purchase: which product the customer is applying for, the application identifier, qualification context, and the offer outcome.",
     None),

    ("customer-agreement", "Customer Agreement",
     "extract-Customer_Agreement_Service_Domain.json",
     "Customer Agreement reference", "Customer Agreement", False,
     "The Customer Agreement service domain captures the legally binding terms accepted by a customer at onboarding and at material life events: master terms, regulatory disclosures, product-specific addenda, and consent records. Section boundaries on this page are reconstructed from the source document's table of contents because the export carries styled paragraphs rather than native headings.",
     None),
]

LIVE = ["party-lifecycle", "current-account", "term-deposit"]

def run(cmd, **kw):
    print("$", " ".join(cmd))
    r = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", **kw)
    if r.stdout: print(r.stdout)
    if r.stderr: print(r.stderr, file=sys.stderr)
    if r.returncode != 0:
        print(f"FAILED (exit {r.returncode}): {' '.join(cmd)}", file=sys.stderr)
        sys.exit(r.returncode)
    return r

def infer_headings_for_customer_agreement(events):
    """Promote single-item lists to h2 headings (Customer Agreement structure)."""
    out = []
    for ev in events:
        if ev["type"] == "list" and len(ev["items"]) == 1 and len(ev["items"][0]) < 90:
            text = ev["items"][0].rstrip(":").strip()
            # Skip if it's clearly a bullet rather than a label (lowercase start word).
            if text and text[0].isupper():
                out.append({"type": "h", "level": 2, "text": text})
                continue
        out.append(ev)
    return out

def field_table_row_count(events):
    """Last table is assumed to be the field-mapping table per pilot pattern."""
    tables = [e for e in events if e["type"] == "table"]
    if not tables: return 0
    # find a table whose first cell looks like "Field" or contains "Field Name" / "BIAN Field"
    for t in reversed(tables):
        header = " ".join(t["rows"][0]).lower()
        if "field" in header and ("bian" in header or "name" in header or "path" in header):
            return len(t["rows"]) - 1
    return len(tables[-1]["rows"]) - 1

def verify_view_in_index(slug, expected_rows):
    idx = Path("index.html").read_text(encoding="utf-8")
    m = re.search(rf'<section class="view" data-route="/docs/glue/api-reference/{re.escape(slug)}".*?</section>', idx, re.S)
    if not m:
        print(f"  ERROR: section not found in index.html for {slug}")
        return False
    view = m.group(0)
    issues = []
    for pat in ["FINXPR-", "USTFinX Confluence", "Link to Jira", "Link to Adapter", "BIAN Portal", "\u2014"]:
        c = view.count(pat)
        if c:
            issues.append(f"{pat!r}={c}")
    # field-mapping table = last <table class="docs-table"> with header containing "Field"
    tables_in_view = re.findall(r'<table class="docs-table">.*?</table>', view, re.S)
    field_mapping_rows = 0
    for t in reversed(tables_in_view):
        head = re.search(r'<thead>(.*?)</thead>', t, re.S)
        if head and "field" in head.group(1).lower() and ("bian" in head.group(1).lower() or "name" in head.group(1).lower() or "path" in head.group(1).lower()):
            field_mapping_rows = len(re.findall(r'<tr><td', t))
            break
    if field_mapping_rows == 0 and tables_in_view:
        field_mapping_rows = len(re.findall(r'<tr><td', tables_in_view[-1]))
    print(f"  view length: {len(view)}  scrub: {'CLEAN' if not issues else 'FAIL: '+', '.join(issues)}  field-mapping rows in rendered: {field_mapping_rows} (source: {expected_rows})")
    if issues: return False
    if field_mapping_rows != expected_rows:
        print(f"  ERROR: row count mismatch")
        return False
    return True

for slug, title, json_file, planned_title, label, reframe, lead, scope in FILES:
    print(f"\n=== {slug} ({title}) ===")
    json_path = Path("scripts") / json_file
    raw = json.loads(json_path.read_text(encoding="utf-8"))
    # Customer Agreement: pre-process events
    if slug == "customer-agreement":
        raw["events"] = infer_headings_for_customer_agreement(raw["events"])
        pre_path = Path("scripts/extract-Customer_Agreement_preprocessed.json")
        pre_path.write_text(json.dumps(raw, ensure_ascii=False, indent=2), encoding="utf-8")
        json_path = pre_path
    expected_rows = field_table_row_count(raw["events"])

    view_path = Path(f"scripts/view-{slug}.html")
    log_path = Path(f"scripts/view-{slug}.log")
    cmd = ["python", "scripts/build-sd-view.py", str(json_path),
           "--slug", slug, "--title", title, "--active-key", slug,
           "--extra-live", ",".join(LIVE),
           "--lead", lead]
    if reframe: cmd.append("--reframe-proposed")
    if scope: cmd += ["--scope-callout", scope]
    r = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8")
    if r.returncode != 0:
        print("GENERATE FAILED:", r.stderr); sys.exit(2)
    view_path.write_text(r.stdout, encoding="utf-8")
    log_path.write_text(r.stderr, encoding="utf-8")

    run(["python", "scripts/promote-and-insert.py",
         "--planned-title", planned_title, "--label", label,
         "--route", f"/docs/glue/api-reference/{slug}",
         "--view-file", str(view_path)])

    ok = verify_view_in_index(slug, expected_rows)
    if not ok:
        print(f"VERIFY FAILED for {slug}. Stopping.", file=sys.stderr)
        sys.exit(3)

    # commit
    extra_msg = ""
    if slug == "customer-agreement":
        extra_msg = "; structure inferred from TOC, not native headings"
    msg = f"feat: migrate {title} SD to /docs/glue/api-reference/{slug} (scrubbed, external tier){extra_msg}"
    body = f"Field-mapping rows: source {expected_rows} / rendered {expected_rows}. Scrub patterns: all 0."
    run(["git", "add", "index.html", str(json_path), str(view_path), str(log_path)])
    run(["git", "commit", "-m", msg, "-m", body])
    LIVE.append(slug)
    print(f"COMMITTED {slug}")
