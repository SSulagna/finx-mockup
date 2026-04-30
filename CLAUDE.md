# UST FinX Documentation Portal — Project Brief for AI Assistants

> Read this file in full before making any changes to this repository.
> Confirm understanding by summarising in 5 bullet points before starting work.

---

## PROJECT IDENTITY

- **Project name:** UST FinX Documentation Portal
- **Live URL:** https://finx-mockup.vercel.app
- **Repository:** github.com/SSulagna/finx-mockup (branch: main)
- **Author:** Sulagna Sasmal, Consultant I, UST FinX, Bengaluru
- **Status:** Stakeholder review mockup. Not a production system.

---

## WHAT UST FINX IS

UST FinX is UST's product venture: a BIAN-aligned composable banking platform. FinX helps banks modernise their technology without large-scale transformation programmes. It does this through two products:

**FINX GLUE**
The orchestration and integration layer. Sits between legacy systems and new capabilities. Exposes BIAN-aligned APIs. Manages workflow, security, streaming, and connectors. The technical surface for bank developers and architects.

**FINX GLASS**
The operations console for bank staff. Built on Modyo. A single interface through which compliance officers, CSRs, supervisors, and admins manage customers, accounts, tasks, and compliance workflows. Ver 1 go-live targeted 11 July 2026.

The white paper source of truth is titled "Composable Banking at Scale: A BIAN-Aligned Approach to Progressive Modernisation." It has 11 sections:
- 01 Moving Beyond Transformation as a One-Time Event
- 02 Why BIAN Provides the Right Framework
- 03 From Architecture to Delivery: The FinX Approach
- 04 An Evolving Composable Banking Platform
- 05 Enabling Coexistence and Reducing Transformation Risk
- 06 Delivering Value Through Iterative Modernisation
- 07 Innovation Within a Structured Environment
- 08 Data and AI: Building on a Structured Foundation
- 09 Why This Approach Differs from Traditional Alternatives
- 10 Comparative View: Approaches to Modernisation
- 11 From Transformation to Continuous Evolution

---

## WHAT THE SITE IS

A single HTML file (`index.html`) with CSS (`main.css`) and JavaScript (`main.js`) that uses hash-based routing to simulate a multi-page site. Each route has a corresponding `<div class="view">` container. JavaScript shows the matching view and hides all others when the hash changes.

The site has three tiers of content:

**TIER 1 — Fully public marketing layer**
No login required. SEO-indexed. For bank evaluators, CIOs, architects, prospects.
Routes: `#/`, `#/architecture`, `#/platform`, `#/platform/glue`, `#/platform/glass`, `#/modernization`, `#/modernization/greenfield`, `#/modernization/coexistence`, `#/modernization/progressive`, `#/use-cases`, `#/resources`

**TIER 2 — Fully public documentation layer**
No login required. For bank developers (Glue) and bank operations staff (Glass).
Routes built: `#/docs/glue`, `#/docs/glue/quickstart`, `#/docs/glue/auth`, `#/docs/glue/environments`, `#/docs/glue/journey-onboarding`, `#/docs/glue/api-reference`, `#/docs/glass`, `#/docs/glass/role-compliance`, `#/docs/glass/role-csr`, `#/docs/glass/task-kyc-review`
Routes that are placeholder (sidebar links with `title="Planned: ..."` attributes): ~22 additional pages

**TIER 3 — UST internal hub**
Gated by demo password `finx2026` via sessionStorage. For UST employees only.
Route: `#/internal`
After sign-in, nav pill changes to "UST Internal ✓" in purple (`#B493F4`).
Six category cards: Engagement Playbooks, Sales Enablement, Architecture Deep-Dives, Delivery References, Client Engagements, Product Requirements. All six cards are placeholders with `title="Planned: ..."` attributes.

---

## VISUAL IDENTITY

Strictly matched to the UST FinX white paper. Do not deviate from this.

| Token | Value |
|---|---|
| Primary background | `#062229` (deep teal-near-black) |
| Secondary background | `#0A3540` (mid teal) |
| Card surface | `#0F4555` |
| Primary accent | `#00D4D4` (cyan) |
| Accent hover | `#2EE6E6` |
| Accent dim | `#008B99` |
| Internal layer accent | `#B493F4` (purple) |
| Text primary | `#E8F4F6` |
| Text secondary | `#A8C4CC` |
| Text muted | `#6B8A93` |
| Border | `rgba(168, 196, 204, 0.12)` |
| Font (UI) | Inter |
| Font (code) | JetBrains Mono |

CSS custom properties are defined in `:root` in `main.css`.

**Signature visual elements (do not remove):**
- The X watermark in hero and CTA sections (huge background letter, `rgba(0,212,212,0.04)`)
- The grid background on the hero (60px grid, fades at edges)
- The cyan glow on the FinX Glue cube (`box-shadow: 0 0 60px rgba(0,212,212,0.15)`)
- The gradient border on featured cards

---

## WRITING RULES — APPLY TO ALL CONTENT

These rules are non-negotiable. Apply them to every string you write or modify.

**1. NO EM DASHES. Ever.** Use commas, colons, periods, or restructure the sentence.
- Wrong: `"FinX Glue — the orchestration layer"`
- Right: `"FinX Glue, the orchestration layer"`
- Right: `"FinX Glue: the orchestration layer"`

**2. NO "DOCS" in visible text.** Use "Documentation", "Glue Developer Hub", or "Glass Operations Guide" depending on context. URL paths (`#/docs/glue`) can stay as-is.

**3. NO DEAD LINKS.** Every `<a>` element must either:
- a) Navigate to a real view that exists in the HTML, OR
- b) Have `href="javascript:void(0)"` plus `title="Planned: [description]"` attribute

**4. NO BARE `href="#"`.** A bare hash scrolls the user to the top of the page, which is confusing. Replace with `javascript:void(0)` for non-functional links.

**5. PLACEHOLDER VISUAL CUE.** Any link with `title^="Planned:"` must show:
- A small `○` superscript marker via CSS `::after`
- Dotted underline on hover
- `cursor: help`
This CSS rule already exists in `main.css`. Do not remove it.

**6. NO LOREM IPSUM.** All content must be drawn from or aligned with the white paper. Do not invent claims.

**7. NO PARTNER LOGOS.** Use text labels in styled boxes for partner names. Text-only. No image assets.

---

## TECHNICAL RULES

**1. SINGLE FILE ARCHITECTURE.** Everything lives in `index.html`, `main.css`, and `main.js`. No build step. No framework. No npm. Must deploy as a static folder.

**2. ROUTING.** Hash-based. `window.location.hash` drives everything. The router in `main.js` reads the hash, finds the matching view div, shows it, hides all others, updates `document.title`, updates the active state in the top nav.

**3. AUTHENTICATION.** The internal hub uses sessionStorage only. Key: `finx-internal-unlocked`. Value: `1`. The demo password is `finx2026`. No real authentication exists.

**4. SIGN-IN ENTRY POINTS.** Two exist:
- Top nav: `<a class="nav-staff-link" data-action="signin">` shows "UST staff ↗" when locked, "UST Internal ✓" in purple when unlocked
- Footer: two-line block "UST employees / Sign in to Internal Hub →"
Both trigger the same modal via `data-action="signin"` handler in `main.js`.

**5. THREE-COLUMN DOCUMENTATION LAYOUT.** Used on all `#/docs/*` pages.
- Left sidebar: 220px, navigation tree
- Main content: flex-1, max-width 760px, padding 32px 40px
- Right sidebar: 180px, "On this page" anchors, sticky

**6. DEPLOYMENT.** GitHub repo `SSulagna/finx-mockup` main branch. Vercel auto-deploys on push. No manual deploy step needed.

---

## HOMEPAGE SECTION ORDER

The homepage (`#/`) has these sections in this exact order. Do not reorder them.

1. Top navigation (sticky)
2. Hero (title, subtitle, two CTAs, metrics row)
3. Problem section (two cards: big-bang transformation, point solutions)
4. Approach section (three cards: Architecture, Delivery, Coexistence)
5. Innovation section (four cards: Speed, Consistency, Ecosystem, Resilience) — from white paper Section 07
6. Why UST section (three cards + stats row) — from white paper Section 03
7. Platform / Ecosystem diagram (FinX Glue at centre)
8. Products section (Glue / Glass tab switcher)
9. Modernization Paths (four cards)
10. Comparison table (five columns: Core Upgrade, Fintech Stack, New Core Platform, FinX Approach highlighted)
11. Use Cases (six cards)
12. Closing CTA (two-column: What you gain / Next steps) — from white paper Section 11
13. Footer (five columns + newsletter + bottom bar with UST staff sign in)

---

## ECOSYSTEM DIAGRAM PARTNERS

The ecosystem diagram on the homepage and platform pages reflects the FinX sales deck. Use these exact names:

**Top layer (digital channels + operations):**
Digital Channels (bank-provided), FinX Glass (FinX-provided), Axxiome (ecosystem), SaltEdge (ecosystem)

**Left connectors (FinX ecosystem, orange border):**
Microsoft Dynamics 365, Zoot, ComplyAdvantage, Document Management, Jumio, Thirdstream

**Center:**
FinX Glue (dark teal cube with four facets: Workflow, Streaming APIs, Security, BIAN APIs)

**Right connectors:**
Microsoft Fabric, Wolters Kluwer, Oracle NetSuite, Artificial Intelligence (roadmap, dashed border), Formpipe, FinX Data Lake (FinX-provided)

**Bottom cores:**
Customer Information File (bank-provided, grey), Thought Machine Vault Core (FinX-provided, cyan), Thought Machine Vault Payments (FinX-provided, cyan)

**Networks row (three groups):**
- Schemes & Networks: Visa, Mastercard, Fedwire, FedNow, ADX
- Agent Banks: Correspondent, Settlement
- Third Party Integrations: Mastercard, IDEMIA

---

## KEY PEOPLE

- **Sulagna Sasmal** — Author, Senior Technical Writer / Consultant I at UST FinX, Bengaluru
- **Veselina Kostadinova** — Manager, UST GB. Primary stakeholder for this mockup. She/her.

The mockup is being built to share with Veselina for her review and to present to FinX leadership.

---

## CURRENT STATE OF THE SITE

**Working correctly:**
- All 11 homepage sections present in correct order
- Hash routing with browser back/forward
- Top nav "UST staff ↗" pill visible, opens modal, turns purple on sign-in
- Footer sign-in block works
- Sign-in modal: demo password `finx2026`, sessionStorage gating
- Direct navigation to `#/internal` without auth: modal appears, URL stays at `#/internal`
- All four modernization cards show two-metric format
- Coexistence card shows 9 months consistently across landing, detail page, and FAQ
- Zero em dashes in visible content
- "Documentation" in top nav (not "Docs")
- `○` placeholder cue CSS working
- All bare `href="#"` links replaced with `javascript:void(0)`

**Built pages (real content, not placeholders):**
- Tier 1: `#/`, `#/architecture`, `#/platform`, `#/platform/glue`, `#/platform/glass`, `#/modernization`, `#/modernization/greenfield`, `#/modernization/coexistence`, `#/modernization/progressive`, `#/use-cases`, `#/resources`
- Tier 2: `#/docs/glue`, `#/docs/glue/quickstart`, `#/docs/glue/auth`, `#/docs/glue/environments`, `#/docs/glue/journey-onboarding`, `#/docs/glue/api-reference`, `#/docs/glass`, `#/docs/glass/role-compliance`, `#/docs/glass/role-csr`, `#/docs/glass/task-kyc-review`
- Tier 3: `#/internal`

**Known placeholder pages (sidebar links with `○` cues):**
- Glue: BIAN service domains, Canonical model, Extensibility model, Account opening journey, Cross-border payment journey, Account Management API, Payments API, Document Directory API, Runbooks, Releases & deprecations
- Glass: Supervisor role, Admin/Platform role, Approve high-risk customer, AML alert handling, Sanctions screening, Four-eyes approval, Customer & Account Mgmt module, Task Management module, Workflow Console module, Incident & Alert Centre module, RBAC permissions, Glass FAQs
- Internal hub: all 6 category cards

---

## HOW TO RESPOND TO TASKS

When given a task:

1. Read the relevant section of `index.html` first before writing any code.
2. Apply all writing rules (no em dashes, no "docs", no bare `#` links).
3. Match the visual identity exactly (colors, spacing, typography from the design tokens above).
4. If building a new page, use the three-column documentation layout for `#/docs/*` routes and the single-column story layout for marketing routes.
5. After any change, list: what you changed, what file, what line range.
6. If a task requires content, draw from the white paper sections listed above.
7. If a task requires a partner name, use the exact names from the ecosystem diagram section above.
8. Never add em dashes. Not even once.
