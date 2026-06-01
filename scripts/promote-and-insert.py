"""Promote a sidebar entry from Planned to active across index.html, and insert
a new view block right before the Glass Operations Guide section.

Usage:
  python scripts/promote-and-insert.py --slug term-deposit \
      --planned-title "Term Deposit reference" \
      --label "Term Deposit" \
      --route /docs/glue/api-reference/term-deposit \
      --view-file scripts/view-term-deposit.html
"""
import argparse, re, sys, io
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

INDEX = Path("index.html")
ANCHOR = "<!-- DOCS: Glass Operations Guide landing -->"

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--planned-title", required=True, help='value of title="Planned: ..." attribute')
    ap.add_argument("--label", required=True)
    ap.add_argument("--route", required=True)
    ap.add_argument("--view-file", required=True)
    args = ap.parse_args()

    text = INDEX.read_text(encoding="utf-8")

    # Promote: replace every <a href="javascript:void(0)" class="docs-nav-link" title="Planned: X">LABEL</a>
    # with the live link form.
    # Escape label for HTML attribute (we expect plain text already).
    label_esc = args.label.replace("&", "&amp;")
    old_pattern = re.compile(
        r'<a href="javascript:void\(0\)" class="docs-nav-link" title="Planned: '
        + re.escape(args.planned_title)
        + r'">'
        + re.escape(label_esc)
        + r'</a>'
    )
    replacement = f'<a href="#{args.route}" class="docs-nav-link">{label_esc}</a>'
    new_text, n = old_pattern.subn(replacement, text)
    print(f"promoted {n} sidebar entries", file=sys.stderr)
    if n == 0:
        print("ERROR: no Planned entries matched. Check --planned-title / --label.", file=sys.stderr)
        sys.exit(2)

    # Insert new view block before the Glass anchor.
    view_block = Path(args.view_file).read_text(encoding="utf-8").rstrip() + "\n\n"
    if ANCHOR not in new_text:
        print(f"ERROR: anchor not found: {ANCHOR}", file=sys.stderr)
        sys.exit(3)
    new_text = new_text.replace(ANCHOR, view_block + "  " + ANCHOR)

    INDEX.write_text(new_text, encoding="utf-8")
    print(f"inserted view block before Glass anchor", file=sys.stderr)

if __name__ == "__main__":
    main()
