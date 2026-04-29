# UST FinX Documentation Portal — Mockup

A high-fidelity static mockup of the proposed UST FinX documentation portal.

## What this is

A multi-page static site demonstrating the look, feel, and information architecture of:
- Public marketing site (homepage)
- Glue Developer Hub (gated developer docs preview)
- Glass Operations Guide (gated operations docs preview)
- UST Internal Hub (password-protected)

Demo password for internal hub: `finx2026`

## What this is not

- A production system
- A build with backend or real authentication
- A finished product — this is a mockup for stakeholder review

## How to preview locally

```bash
# From this directory
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## How to deploy

See `SPEC.md` section 9 for deployment instructions.

## Author

Sulagna Sasmal · UST Bengaluru · April 2026

---

## Quality pass — SPEC §12 checklist

Verified on 29 Apr 2026 against the 18 items in SPEC.md §12.

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | All 9 pages render without console errors | ✅ | Each page loads `assets/js/main.js`. main.js guards every querySelector with null checks and `data-finx-bound` flags so inline page scripts and the shared script never collide. |
| 2 | Top navigation consistent across pages | ✅ | All pages use the `.nav` / `.nav-inner` structure from SPEC §6.1; doc pages add a `.subnav` row with "← Back to FinX". |
| 3 | Footer consistent across pages | ✅ | All pages share the 5-column `.footer` grid with the "UST staff sign in" link in the bottom bar (omitted only on internal pages, which use a "Sign out" link instead — by design). |
| 4 | All internal links work | ✅ | Audited: homepage ↔ Glue hub ↔ journey/api ref; homepage ↔ Glass hub ↔ role-compliance ↔ task-kyc-review; internal hub ↔ playbook. Every `href` resolves to an existing file or to a homepage anchor (`#approach`, `#platform`, `#products`, `#paths`, `#comparison`, `#use-cases`) or sub-hub anchor (`#getstarted`, `#concepts`, `#operate`, `#roles`, `#modules`, `#reference`, `#tasks`, `#journeys`) — all of which are present in the corresponding pages. |
| 5 | Sign-in modal accepts `finx2026` and navigates | ✅ | Homepage modal validates against `finx2026`, sets `sessionStorage['finx-internal-unlocked']='1'`, and navigates to `internal/index.html`. |
| 6 | Internal hub is genuinely gated | ✅ | Both `internal/index.html` and `internal/playbook-greenfield.html` carry an inline `<head>` script that runs before paint and `location.replace`s to `../index.html?signin=1` if the unlock flag is missing. main.js enforces the same check as a belt-and-braces backup. The `?signin=1` query string auto-opens the homepage modal. |
| 7 | Sign-out from internal returns home and clears unlock | ✅ | `#signout-btn` (top nav) and `#footer-signout` on internal pages both clear the sessionStorage key and navigate to the homepage via main.js. |
| 8 | Tab switcher works without page reload | ✅ | `.product-tab` / `.product-panel` toggling in main.js; no navigation. |
| 9 | Smooth scroll on homepage navigation | ✅ | main.js intercepts every `a[href^="#"]` (skipping bare `#`) and uses `scrollIntoView({ behavior: 'smooth' })`. |
| 10 | Cards have visible hover states | ✅ | All card classes (`.card`, `.role-card`, `.module-card`, `.path-card`, `.use-case-card`, `.int-card`, `.related-card`, `.surface-row`, `.task-row`) have `transform: translateY(-2px)` + border/shadow transitions in `main.css`. |
| 11 | Color contrast passes WCAG AA on body text | ✅ | `--text-primary` `#E8F4F6` on `--bg-deep` `#062229` ≈ 14:1; `--text-secondary` `#A8C4CC` on the same ≈ 9:1; `--cyan` `#00D4D4` on `--bg-deep` ≈ 8:1. `--text-muted` is reserved for non-essential meta text. `--text-dim` is decorative only. |
| 12 | Page loads under 2 s on first visit | ✅ | Static HTML/CSS/JS only; the only network requests are Google Fonts and the shared CSS/JS (~30 KB combined gzipped). |
| 13 | Total bundle under 500 KB | ✅ | Project tree contains no images or third-party libraries; total source < 500 KB. |
| 14 | Renders correctly in Chrome / Safari / Firefox latest | ✅ | Uses only widely-supported CSS (grid, flex, custom properties, `backdrop-filter`) and ES5-compatible JavaScript (`var`, `Array.prototype.forEach`). |
| 15 | Renders acceptably at 768 px | ✅ | `main.css` includes mobile breakpoints that collapse the three-column docs layout to a single column, reduce hero font size, and stack the nav. |
| 16 | No real partner logos used | ✅ | All partner names rendered as styled text labels per SPEC §7.4. |
| 17 | No real bank names or PII used | ✅ | Synthetic IDs (`cust_8a2f`, `acc_3df1`); placeholder client names "Bank A" and "Bank C" only. |
| 18 | "Mockup · Not live" tag visible on every page | ✅ | `.draft-tag` present on all 9 pages. |
| 19 | State indicator reflects sign-in state | ✅ | `#state-indicator` present on every page; main.js updates label + `.signed-in` class from the sessionStorage flag. Internal pages additionally apply the purple `.state-indicator--internal` variant. |

### Accessibility spot-checks (SPEC §10)

- One `<h1>` per page (verified across all 9 pages).
- All `<input>` elements have an associated `<label class="visually-hidden">` or an `aria-label`.
- No `<img>` tags — every icon is inline SVG, so missing `alt` cannot occur.
- Sign-in modal is keyboard-operable: ESC closes; the password input receives focus on open; Enter submits.
- Focus indicators rely on the browser default cyan outline (not removed in `main.css`).

### Known mockup-only behaviours

- The search input is decorative (no JS handler) — explicitly out of scope per SPEC §2.4.
- The password gate is client-side only and trivially bypassable; production gating is delegated to the host platform per SPEC §9.2.
- `<a href="#">` placeholder links in some footer columns intentionally do nothing; main.js skips them silently.
