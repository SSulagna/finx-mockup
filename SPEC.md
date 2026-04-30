# UST FinX Documentation Portal — Build Specification

> A complete, exhaustive specification for building the FinX documentation portal mockup as a multi-page static site. Hand this to GitHub Copilot, Cursor, or any frontend engineer and they should be able to produce the full deliverable.

---

## 0. How to use this document

This document is structured for use with AI coding assistants (Copilot, Cursor, Claude Code) and human engineers alike.

**With Copilot or Cursor:**

1. Save this file as `SPEC.md` at the root of your repo
2. Open the repo in VS Code or Cursor
3. For every prompt, reference the spec: `@SPEC.md build the homepage at index.html following sections 5.1 and 6.1`
4. Iterate page by page

**With a human engineer:**

Send this file plus the white paper PDF and the ecosystem diagram screenshot. Ask them to deliver pages 5.1 through 5.8 as a deployable static site.

The spec is opinionated. Where it specifies a value (color, font size, spacing), use that value. Where it specifies behavior, implement that behavior. Deviation should be deliberate, not incidental.

---

## 1. Project overview

### 1.1 What we are building

A multi-page static site that serves as a high-fidelity mockup of the proposed UST FinX documentation portal. The mockup demonstrates the look, feel, navigation, and content structure of three connected surfaces:

1. **Public marketing site** — for bank evaluators, prospects, partners
2. **Public documentation portals** — for developers (Glue) and bank operators (Glass)
3. **Internal hub** — gated by simple password, for UST staff only

The mockup is for stakeholder review, not production deployment. It does not need a backend, real authentication, or a real search index. It does need to feel like a real product when you click through.

### 1.2 Goals

- Communicate the visual identity of the proposed FinX documentation surface
- Demonstrate the information architecture across personas
- Show consistency between the public marketing site and the deeper documentation
- Provide a reference for the production build that follows
- Be deployable to Vercel, Netlify, or Cloudflare Pages with one drag-and-drop

### 1.3 Non-goals

- Not a production system. No backend. No real search. No real authentication.
- Not a CMS. Content is hardcoded in HTML for the mockup.
- Not responsive-perfect on mobile. Optimized for desktop demo, gracefully degrades on mobile.
- Not exhaustive in content. Each page has enough realistic content to feel real, no more.

### 1.4 Success criteria

A senior UST stakeholder (Veselina) should open the deployed link, click through every page, and have a clear, accurate understanding of what the production portal will look and behave like. She should be able to greenlight the design direction without needing additional explanation from the author.

---

## 2. Tech stack

### 2.1 What to use

- **HTML5, CSS3, vanilla JavaScript.** No framework. No build step required.
- **Google Fonts** for typography (Inter, JetBrains Mono).
- **Inline SVG** for icons. No icon library dependency.
- **One shared CSS file** (`assets/css/main.css`) imported by every page.
- **One shared JavaScript file** (`assets/js/main.js`) imported by every page.

### 2.2 Why no framework

The mockup needs to be deployable as a static folder of files. No build step, no `npm install`, no Node.js. A non-engineer should be able to drag the folder onto Vercel and see a live URL within two minutes. Frameworks add deployment friction without adding mockup value.

### 2.3 Why no JS framework

Every interaction in the mockup is trivial: tab switches, modal open/close, a fake password gate, smooth scroll. Vanilla JS handles all of this in under 100 lines.

### 2.4 What to avoid

- No React, Vue, Svelte, or any component framework
- No CSS preprocessor (Sass, Less). Plain CSS only.
- No CSS framework (Tailwind, Bootstrap). Custom CSS following the design tokens in section 4.
- No bundler (Webpack, Vite, Rollup)
- No third-party search libraries. The search input is decorative for the mockup.

---

## 3. File structure

```
finx-portal-mockup/
├── index.html                          # Public homepage
├── glue/
│   ├── index.html                      # Glue Developer Hub landing
│   ├── journey-onboarding.html         # Example journey guide
│   └── api-reference.html              # Example API reference page
├── glass/
│   ├── index.html                      # Glass Operations Guide landing
│   ├── role-compliance.html            # Compliance Officer role landing
│   └── task-kyc-review.html            # Example task walkthrough
├── internal/
│   ├── index.html                      # UST Internal Hub (password gated)
│   └── playbook-greenfield.html        # Example internal playbook
├── assets/
│   ├── css/
│   │   └── main.css                    # All styles
│   ├── js/
│   │   └── main.js                     # All interactivity
│   └── img/
│       └── (any small images, prefer inline SVG)
├── README.md                           # Deployment instructions
└── SPEC.md                             # This file
```

Total expected pages: 9. Total expected size: under 500 KB including all assets.

---

## 4. Design system

This section defines every visual decision. Implement these as CSS custom properties at the top of `main.css`.

### 4.1 Color palette

Source: matched to the UST FinX white paper visual identity.

```css
:root {
  /* Backgrounds — deep, dark, navy-teal */
  --bg-deep: #062229;          /* Primary page background */
  --bg-mid: #0A3540;           /* Section alternates */
  --bg-card: #0F4555;          /* Card surfaces */
  --bg-card-hover: #145264;    /* Card hover state */
  --bg-soft: #F5F7F8;          /* Light surfaces (rarely used) */

  /* Cyan — the primary accent */
  --cyan: #00D4D4;             /* Primary accent */
  --cyan-bright: #2EE6E6;      /* Hover state */
  --cyan-dim: #008B99;         /* Subdued accent, borders */
  --cyan-soft: rgba(0, 212, 212, 0.12); /* Tinted backgrounds */

  /* Text on dark backgrounds */
  --text-primary: #E8F4F6;     /* Body text */
  --text-secondary: #A8C4CC;   /* Supporting text */
  --text-muted: #6B8A93;       /* De-emphasized text */
  --text-dim: #4A6670;         /* Very subtle text */

  /* Internal layer — purple, distinct from public */
  --internal-primary: #B493F4;
  --internal-bg: rgba(180, 147, 244, 0.12);
  --internal-border: rgba(180, 147, 244, 0.3);

  /* Borders */
  --border-dark: rgba(168, 196, 204, 0.12);
  --border-medium: rgba(168, 196, 204, 0.2);

  /* Gradients */
  --gradient-hero: linear-gradient(180deg, #062229 0%, #0A3540 100%);
  --gradient-card: linear-gradient(135deg, #0F4555 0%, #0A3540 100%);
}
```

**Usage rules:**

- Page background: always `--bg-deep`
- Section alternates: `--bg-mid` for every other section
- Card surfaces: `--bg-card`
- All accents (links, buttons, highlighted text): `--cyan`
- Internal hub uses `--internal-primary` instead of `--cyan` for distinction

### 4.2 Typography

```css
:root {
  --font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-mono: "JetBrains Mono", "SF Mono", Monaco, "Cascadia Mono", monospace;
}
```

Load both fonts from Google Fonts in every page's `<head>`:

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

**Type scale:**

| Use | Size | Weight | Line height | Letter spacing |
|---|---|---|---|---|
| Hero title | 64px (44px on mobile) | 600 | 1.05 | -0.025em |
| H1 page title | 38px | 600 | 1.15 | -0.02em |
| H2 section title | 42px | 600 | 1.15 | -0.02em |
| H3 subsection | 24px | 600 | 1.3 | -0.01em |
| Body large | 17–19px | 300 | 1.65 | normal |
| Body | 14–15px | 400 | 1.6 | normal |
| Body small | 12.5–13.5px | 400 | 1.6 | normal |
| Caption / meta | 11–12px | 500 | 1.5 | 0.5–1px |
| Eyebrow | 11px | 600 | 1 | 2px (uppercase) |
| Code | 11.5–13px | 400 (mono) | 1.5 | normal |

**Eyebrow text** is the small uppercase label that introduces sections. Cyan colored. Used above every section title.

### 4.3 Spacing

Use a 4px base unit. Common values:

- 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 80, 100 px

**Section padding:** 100px top and bottom on desktop, 60px on mobile.

**Container max width:** 1280px, centered, with 32px horizontal padding.

### 4.4 Border radius

```css
:root {
  --radius-sm: 4px;    /* Tags, small buttons */
  --radius-md: 8px;    /* Inputs, default buttons, cards */
  --radius-lg: 14px;   /* Card surfaces, panels */
  --radius-xl: 20px;   /* Hero panels, ecosystem diagram */
}
```

### 4.5 Shadows

```css
:root {
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.2);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.3);
  --shadow-lg: 0 12px 32px rgba(0,0,0,0.4);
  --shadow-cyan: 0 0 60px rgba(0, 212, 212, 0.15);
}
```

### 4.6 Transitions

```css
:root {
  --transition: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 320ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

All interactive elements (buttons, cards, links) have a `transition: all var(--transition)` on the root, so hover states animate smoothly.

### 4.7 Iconography

- All icons are inline SVG, 16-20px viewBox, currentColor stroke
- No icon library. Hand-write SVG paths or use simple shapes
- Common icons needed: arrow-right, search, lock, check, chevron-down, x (close)

### 4.8 Visual signature elements

These are non-negotiable visual moments that anchor the brand:

**The X watermark.** A massive (600-720px) `X` letter behind the hero and CTA sections, in `rgba(0, 212, 212, 0.04)`, position absolute, pointer-events none, mask-image to soften edges. Sits in the background, never interactive.

**The grid background on the hero.** Subtle 60x60px grid lines in `rgba(0, 212, 212, 0.03)`, masked with a radial gradient so the edges fade out. Creates the technical, architectural feel.

**The cyan glow on the Glue cube.** The center of the ecosystem diagram has `box-shadow: 0 0 60px rgba(0, 212, 212, 0.15)`. On hover it intensifies. The cube is the visual anchor of the platform.

**The gradient border on cards.** Featured cards (the Glue cube, the recommended option) have a subtle gradient border using the `mask-composite` technique: `padding: 1.5px; background: linear-gradient(135deg, var(--cyan), transparent 60%); -webkit-mask: ...`.

---

## 5. Page specifications

### 5.1 `index.html` — Public Homepage

**Purpose:** The first thing every external visitor sees. Marketing-aligned story flow that walks bank evaluators from problem to solution.

**Sections in order:**

1. **Top navigation** (sticky)
   - Brand logo on left: "UST FinX™" with the X in cyan
   - Nav links: Approach, Platform, Products, Modernization, Use cases
   - Search input (decorative) and "Talk to us" CTA on the right
   - Sticky on scroll, with `backdrop-filter: blur(20px)` and semi-transparent background

2. **Hero section**
   - Background: `var(--gradient-hero)` plus the X watermark plus the grid pattern
   - Eyebrow: "Composable Banking at Scale"
   - Title: "Modernize the bank.<br>Without the bang." — second line in cyan
   - Subtitle: One paragraph from the white paper introduction
   - Two CTAs: primary cyan "Explore the platform →", secondary "Read the white paper"
   - Metrics row at the bottom: 6-9 months to first value · 33,000+ UST employees · $2B+ revenue · BIAN aligned

3. **Problem section** (background `--bg-mid`)
   - Eyebrow: "The Problem"
   - Title: "Modernization has been broken for too long."
   - Lead paragraph from the white paper
   - Two cards side by side: "Big-bang transformation" and "Point solutions" with explanatory text from the white paper

4. **Approach section** (background `--bg-deep`)
   - Eyebrow: "The FinX Approach"
   - Title: "A different model. Continuous evolution, not episodic transformation."
   - Three cards: Architecture (BIAN), Delivery (iterative value), Coexistence (managed legacy)

5. **Platform / Ecosystem section** (background `--bg-mid`)
   - Eyebrow: "The Platform"
   - Title: "FinX Glue at the center.<br>Everything else composable around it."
   - The ecosystem diagram (see section 6.2 for the full spec of this component)

6. **Products section** (background `--bg-deep`)
   - Eyebrow: "Products"
   - Title: "Two products. One platform. Built to work together."
   - Tab switcher: Glue / Glass
   - Each tab shows a two-column layout: text on the left (tagline, name, description, features list, CTA), browser-window-style preview on the right showing what that product's docs look like
   - Glue tab CTA: "Open Glue Developer Hub →" links to `glue/index.html`
   - Glass tab CTA: "Open Glass Operations Guide →" links to `glass/index.html`

7. **Modernization Paths section** (background `--bg-mid`)
   - Eyebrow: "Modernization Paths"
   - Title: "Choose how to start. Evolve from there."
   - Four cards: Greenfield, Coexistence, Progressive, Full Modernization
   - Each card has tag, name, description, time-to-value meta line

8. **Comparison section** (background `--bg-deep`)
   - Eyebrow: "Comparative View"
   - Title: "No single dimension tells the full story."
   - Comparison table with five columns: Dimension, Core Upgrade, Fintech Stack, New Core Platform, FinX Approach (highlighted in cyan)
   - Rows: Architectural Model, Time to Value, Transformation Risk, Integration Complexity, Coexistence Capability, Innovation Model, Long-Term Flexibility
   - The FinX column has a tinted cyan background and primary text color so it visually wins

9. **Use Cases section** (background `--bg-mid`)
   - Eyebrow: "Use Cases"
   - Title: "From architecture to outcomes."
   - Six cards in a 3x2 grid: Customer 360, Digital Lending, Multi-Core Coexistence, AI-Powered Onboarding, Operational Governance, Data & AI Enablement

10. **CTA section** (background `--gradient-hero`)
    - Eyebrow: "Get Started"
    - Title: "Ready to evolve continuously?" — "continuously" in cyan
    - Subtitle and two CTAs
    - Big X watermark in the background

11. **Footer**
    - Five columns: Brand block (logo + tagline), Platform, Resources, Company, Engage
    - Bottom bar with copyright, Privacy/Terms/Security links, and a small "UST staff sign in" link in the bottom right that opens the password modal

**Interactions:**
- Smooth scroll between sections when nav links are clicked
- Tab switch on Products section without page reload
- Card hover states (lift + border color change)
- Sign-in modal opens when "UST staff sign in" link clicked

### 5.2 `glue/index.html` — Glue Developer Hub Landing

**Purpose:** Landing page for the Glue developer documentation. The destination after clicking "Open Glue Developer Hub" on the homepage.

**Layout:** Same top nav as homepage but with a sub-navigation row showing "Glue / Get Started / Concepts / API Reference / Journey Guides / Operate." Sub-nav has a back link "← Back to FinX" on the left.

**Sections:**

1. **Hero** (smaller than homepage hero)
   - Eyebrow: "FinX Glue"
   - Title: "Build on the orchestration layer."
   - Subtitle: One paragraph describing what Glue is for developers
   - Two CTAs: "Quickstart →" and "API Reference"

2. **Quickstart cards** — three cards: Auth & tenant headers, Environments, First API call

3. **Concepts overview** — three cards: BIAN Service Domains, Canonical Model, Extensibility Model. Each card links to a deeper page (these can be stub pages or just have hover state).

4. **API Reference list** — list of API surfaces: Party Lifecycle Management, Account Management, Payments, Document Directory, IDV/AML connectors. Each entry shows method count badge.

5. **Journey Guides** — list of journey guides with brief descriptions. The "Customer onboarding & KYC" entry links to `journey-onboarding.html`. Others can be placeholders.

6. **Operate section** — runbooks, releases, deprecations.

7. **Footer** — same as homepage.

### 5.3 `glue/journey-onboarding.html` — Example Journey Guide

**Purpose:** Show what an actual Glue documentation page looks like. This is the most important detail page in the mockup.

**Layout:** Three-column

- **Left sidebar (220px):** Full Glue navigation tree, with "Customer onboarding & KYC" highlighted as active under "Journey guides"
- **Main content (flex-1):** The journey guide content
- **Right sidebar (180px):** "On this page" anchor list + "Edit on GitHub" link

**Main content structure:**

1. Breadcrumb: "Journey guides / Customer onboarding & KYC"
2. Title: "Customer onboarding and KYC journey"
3. Tags row: "6 API calls", "~3 min", "PLM · IDV · AML"
4. Lead paragraph
5. **API Sequence card** — formatted box showing the six-step sequence:
   ```
   POST /v1/parties/initiate          PLM · BIAN
   POST /v1/documents                  Document Directory
   POST /v1/idv/initiate               Jumio
   GET  /v1/idv/{id}/result            Poll until complete
   POST /v1/aml/screen                 ComplyAdvantage
   PATCH /v1/parties/{id}/lifecycle    Update to active
   ```
6. **Polling guidance callout** — amber-tinted box explaining the polling pattern
7. **Code sample** — actual cURL example wrapped in a dark panel with copy button (decorative)
8. **Related guides section** — three small cards linking to other guides

### 5.4 `glue/api-reference.html` — Example API Reference Page

**Purpose:** Show what an OpenAPI-style reference page looks like in the FinX visual language.

**Layout:** Same three-column as journey-onboarding.

**Main content structure:**

1. Breadcrumb: "API Reference / Party Lifecycle Management / Create party"
2. Method badge (POST, in green) and endpoint (`/v1/parties/initiate`) at the top
3. Title: "Create party"
4. Lead paragraph describing what the endpoint does
5. **Parameters section** — table-like layout listing each parameter: name (mono), type, required/optional badge, description
6. **Request example** — dark code panel with JSON request body
7. **Response examples** — tabs for 201, 400, 409 responses, each showing JSON
8. **BIAN mapping callout** — blue-tinted box explaining how this endpoint maps to BIAN service domain operations

### 5.5 `glass/index.html` — Glass Operations Guide Landing

**Purpose:** Landing page for the Glass operations documentation.

**Layout:** Same top nav with sub-navigation: "Glass / By Role / Modules / Reference."

**Sections:**

1. **Hero** — eyebrow "FinX Glass", title "Operations made coherent." subtitle, two CTAs

2. **Choose your role section** — four cards: CSR / Ops Agent, Compliance Officer, Supervisor, Admin / Platform. Each card has a colored dot, role name, brief description of what they do, list of common tasks. The Compliance Officer card links to `role-compliance.html`.

3. **Modules section** — six cards: Customer & Account Management, Task Management, Workflow Console, Incident & Alert Center, Service Orchestration Console, Fintech Connector SPAs. Each describes what the module does.

4. **Reference section** — RBAC permissions, FAQs, troubleshooting.

5. **Footer.**

### 5.6 `glass/role-compliance.html` — Compliance Officer Role Landing

**Purpose:** Show how role-based content navigation works.

**Layout:** Three-column with left sidebar showing the role filter active and the compliance task list expanded.

**Main content structure:**

1. Breadcrumb: "By Role / Compliance Officer"
2. Title: "Compliance Officer"
3. Brief intro: who this role is, what they do in Glass, what tasks they perform
4. **Common tasks list** — cards or list items for: Review KYC results (links to `task-kyc-review.html`), Approve high-risk customer, AML alert handling, Sanctions screening, Four-eyes approval
5. **Required permissions section** — list of RBAC permissions the role typically has
6. **Module access section** — which Glass modules this role can see and use

### 5.7 `glass/task-kyc-review.html` — Example Task Walkthrough

**Purpose:** The most important Glass page in the mockup. Shows how task-based documentation reads.

**Layout:** Three-column with sidebar showing role + task hierarchy.

**Main content structure:**

1. Breadcrumb: "Compliance Officer / Compliance tasks / Review KYC results"
2. Title: "Reviewing KYC results for a new customer"
3. Tags: "5 min read", "Module: Customer & Account Mgmt"
4. Lead paragraph
5. **Numbered step list** — three steps minimum:
   - Step 1: Open the Task Management console (with screen reference)
   - Step 2: Review the customer profile (with screen reference)
   - Step 3: Make your decision (with options listed)
6. **Permission required callout** — blue-tinted box explaining RBAC needs
7. **Related tasks section** — three small cards linking to other compliance tasks

### 5.8 `internal/index.html` — UST Internal Hub

**Purpose:** Gated by simple password. Shows what UST staff see after sign-in.

**Layout:** Top banner stripe in purple saying "UST Internal · Confidential". Same nav structure but with internal links.

**Sections:**

1. **Hero** — internal tag pill, title "UST FinX Internal Hub", description
2. **Internal cards grid** — six cards in a 2x3 grid:
   - Engagement Playbooks (links to `playbook-greenfield.html`)
   - Sales Enablement
   - Architecture Deep-Dives
   - Delivery References
   - Client Engagements
   - Product Requirements
3. Each card has icon, title, description, and a small meta line ("12 playbooks · Last updated 22 Apr")

**Sign-in gate:** A modal-like overlay covers the page until a password is entered. Demo password: `finx2026`. Use `sessionStorage` to remember unlock for the session. If the user navigates to `/internal/` without unlocking, redirect to the homepage with the modal opened.

### 5.9 `internal/playbook-greenfield.html` — Example Internal Playbook

**Purpose:** Show what an internal engagement playbook looks like in this design language.

**Layout:** Three-column similar to docs pages, but in the purple internal palette.

**Main content structure:**

1. Breadcrumb: "Engagement Playbooks / Greenfield Bank Launch"
2. Title: "Greenfield Bank Launch (6-month playbook)"
3. Confidentiality callout at the top: "UST Internal · Do not share externally"
4. Overview, Phases, Team Composition, Reusable Artefacts sections
5. Phase timeline visual
6. References to past engagements: "Used at Bank A (2024) and Bank C (2025)"

---

## 6. Component specifications

These components are reused across multiple pages. Implement once, use everywhere.

### 6.1 Top navigation

```html
<nav class="nav">
  <div class="nav-inner">
    <div class="nav-brand">
      <div class="nav-logo">
        <span class="ust">UST</span>&nbsp;<span class="fin">Fin</span><span class="x">X</span><sup>™</sup>
      </div>
    </div>
    <div class="nav-links">
      <!-- nav links -->
    </div>
    <div class="nav-actions">
      <input class="search-input" placeholder="Search documentation">
      <button class="nav-cta">Talk to us</button>
    </div>
  </div>
</nav>
```

**Behavior:**
- Sticky positioning with `position: sticky; top: 0`
- Backdrop blur: `backdrop-filter: blur(20px); background: rgba(6, 34, 41, 0.85)`
- Active link is cyan with a 2px cyan underline
- The X in the logo is always cyan, even on hover

### 6.2 Ecosystem diagram

The most complex component. Reference the mockup HTML I built previously for the exact structure. Key points:

- CSS Grid: 220px / 1fr / 220px columns, 4 rows
- Center column row 2-3: the Glue cube (280x280px, dark gradient, cyan border, inner facets in 2x2 grid)
- Top row spanning all columns: Digital Channels, FinX Glass, ecosystem partners as pills
- Left column rows 2-3: connector boxes (Microsoft Dynamics 365, Zoot, ComplyAdvantage, Document Management, Jumio, Thirdstream)
- Right column rows 2-3: connector boxes (Microsoft Fabric, Wolters Kluwer, Oracle NetSuite, Artificial Intelligence (dashed border = roadmap), Formpipe, FinX Data Lake pill)
- Bottom row spanning columns 2: cores (Customer Information File as bank-provided gray, Thought Machine Vault Core as cyan, Thought Machine Vault Payments as cyan)
- Networks row spanning all columns: three groups (Schemes & Networks, Agent Banks, Third Party Integrations) with small pill labels for each

**Color rules:**
- FinX provided: solid cyan background (`--cyan`), dark text
- Bank provided: gray surface, muted text
- Ecosystem: transparent background, cyan border
- Roadmap: transparent background, dashed cyan border, dimmer text

**The Glue cube specifics:**
- Background: linear gradient `135deg, #0A3540 0%, #062229 100%`
- Border: `1.5px solid var(--cyan)`
- Box-shadow: `0 0 60px rgba(0, 212, 212, 0.15)` baseline, intensifies on hover
- Inner content: "FinX Glue" label in cyan (28px, weight 700), "Orchestration layer" sublabel uppercase muted, then four facets in 2x2 grid (Workflow, Streaming APIs, Security, BIAN APIs)

### 6.3 Documentation three-column layout

Used on `glue/journey-onboarding.html`, `glue/api-reference.html`, `glass/role-compliance.html`, `glass/task-kyc-review.html`, `internal/playbook-greenfield.html`.

```
┌─────────────────────────────────────────────────────┐
│                    Top Nav (60px)                    │
├─────────┬───────────────────────────────┬───────────┤
│         │                               │           │
│  Left   │       Main content            │   Right   │
│ sidebar │          (flex-1)             │  sidebar  │
│ (220px) │                               │  (180px)  │
│         │                               │           │
└─────────┴───────────────────────────────┴───────────┘
```

- Left sidebar: navigation tree, scrolls independently
- Main content: max-width 760px, padding 32px 40px
- Right sidebar: "On this page" anchor list, sticky, scrolls with content

### 6.4 Cards

Three card variants:

**Standard card** (problem cards, approach cards, persona cards on homepage):
- Background `--bg-card` or gradient
- Border 1px `--border-dark`
- Border radius `--radius-lg` (14px)
- Padding 28px to 32px
- Hover: translate-y -2px, border color shifts to cyan-dim, slight shadow

**Path card** (modernization paths):
- Same as standard but with a 3px cyan top border
- Smaller padding (24px 22px)

**Use case card:**
- Same as standard, plus an icon block at the top in cyan-tinted background

### 6.5 Buttons

```css
.btn-primary {
  background: var(--cyan);
  color: var(--bg-deep);
  border: none;
  padding: 13px 24px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 600;
}
.btn-primary:hover {
  background: var(--cyan-bright);
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(0, 212, 212, 0.25);
}

.btn-secondary {
  background: rgba(168, 196, 204, 0.06);
  color: var(--text-primary);
  border: 1px solid var(--border-dark);
  /* same dimensions as primary */
}
```

### 6.6 Code block panel

```html
<div class="code-panel">
  <div class="code-bar">
    <div class="code-dots">
      <span></span><span></span><span></span>
    </div>
    <div class="code-language">cURL</div>
    <button class="code-copy">Copy</button>
  </div>
  <pre><code>...</code></pre>
</div>
```

- Bar background: `var(--bg-card)`
- Three dots in `rgba(168, 196, 204, 0.2)` for visual distinction (decorative, like a terminal window)
- Code area: dark background slightly darker than card (`#031319`), monospace font, syntax highlight via plain colored spans

### 6.7 Sign-in modal

Floating overlay, dim backdrop with backdrop-filter blur, centered modal card.

```html
<div id="signin-modal" class="modal-overlay">
  <div class="modal">
    <button class="modal-close">×</button>
    <div class="modal-header">
      <div class="modal-title">UST Staff Sign In</div>
      <div class="modal-sub">Access internal engagement playbooks, sales enablement, and architecture references</div>
    </div>
    <div class="modal-body">
      <input type="email" class="modal-input" placeholder="UST email address">
      <input type="password" class="modal-input" placeholder="Password">
      <button class="modal-btn">Continue with UST SSO</button>
      <div class="modal-error"></div>
    </div>
    <div class="modal-footer">
      For UST employees only · Demo password: <strong>finx2026</strong>
    </div>
  </div>
</div>
```

**Behavior:**
- Hidden by default, shown when `.modal-overlay.active` class is added
- Password check is purely client-side: if input matches `finx2026`, set `sessionStorage.setItem('finx-internal-unlocked', '1')` and navigate to `/internal/`
- If not matching, show error message
- ESC key closes modal
- Click outside modal closes it

### 6.8 Tab switcher

For the Glue/Glass tabs on the homepage Products section:

```html
<div class="product-tabs">
  <button class="product-tab active" data-tab="glue">FinX Glue</button>
  <button class="product-tab" data-tab="glass">FinX Glass</button>
</div>
```

- Tab container has subtle background (`rgba(168, 196, 204, 0.05)`) and 4px padding
- Active tab is cyan background, dark text
- Inactive tabs are transparent with secondary text color
- Clicking switches content visibility, no page reload

### 6.9 Browser-window preview

Used on the homepage Products section to show what each documentation portal looks like:

```html
<div class="product-preview">
  <div class="preview-bar">
    <div class="preview-dots">
      <span></span><span></span><span></span>
    </div>
    <div class="preview-url">docs.ustfinx.com/glue/journeys/onboarding</div>
  </div>
  <div class="preview-content">
    <!-- truncated documentation page content -->
  </div>
</div>
```

This component visually frames the docs preview as a browser window, signaling "this is what the actual page looks like" without needing to actually navigate there.

### 6.10 State indicator (debug-only)

A small floating indicator in the bottom-right corner that shows the current state for the demo:

- "Public view (no sign-in)" with cyan dot when not signed in
- "Signed in as UST staff" with purple dot when signed in

This helps the stakeholder during the demo. Production would not have this.

### 6.11 Draft tag (top-right)

A small "Mockup · Not live" pill in the top-right corner of every page. Cyan-tinted background, cyan-bright text, persistent reminder this is not production.

---

## 7. Content

### 7.1 Source material

All copy on the public pages should be drawn from or aligned with the UST FinX white paper *Composable Banking at Scale: A BIAN-Aligned Approach to Progressive Modernization*. The white paper provides:

- The problem framing (Section 01)
- The BIAN argument (Section 02)
- The FinX delivery model (Section 03)
- The platform structure (Section 04)
- The coexistence story (Section 05)
- The iterative value proposition (Section 06)
- The innovation story (Section 07)
- The data and AI story (Section 08)
- The differentiation argument (Section 09)
- The comparison table (Section 10)
- The conclusion and next steps (Section 11)

When in doubt, paraphrase the white paper. Do not invent claims that aren't in the source material.

### 7.2 Internal placeholder content

For internal pages, use realistic but generic placeholders:

- Engagement Playbooks: Greenfield Bank Launch, Coexistence Engagement, Progressive Modernization
- Sales Enablement: Battle cards, ROI calculator, proposal templates
- Architecture: Internal ADRs, design decisions
- Delivery: Implementation patterns, integration recipes

Use placeholder client names like "Bank A", "Bank C" rather than real names.

### 7.3 API and code samples

Use realistic but synthetic data:

- Customer IDs: `cust_8a2f`, `cust_7b3e`
- Account IDs: `acc_3df1`, `acc_9e2c`
- Endpoints: `/v1/parties/initiate`, `/v1/idv/initiate`, etc.
- Currencies, dates, all plausible but never real

Never include real partner credentials, real bank names, real PII, or anything that could be mistaken for production data.

### 7.4 Partner logo handling

Do not use real partner logos in the mockup. Use text labels in styled boxes instead. The labels should match how the white paper and ecosystem diagram present the partners:

- Microsoft Dynamics 365, Zoot, ComplyAdvantage, Document Management, Jumio, Thirdstream
- Microsoft Fabric, Wolters Kluwer, Oracle NetSuite, Artificial Intelligence, Formpipe
- Thought Machine Vault Core, Thought Machine Vault Payments
- Visa, Mastercard, Fedwire, FedNow, ADX
- Mastercard, IDEMIA

When the production version is built, marketing handles trademark approval for actual logo usage.

---

## 8. Interaction specifications

### 8.1 Smooth scroll

All anchor links within the homepage use `behavior: 'smooth'`. The top navigation links scroll to the corresponding section.

### 8.2 Hover states

Every interactive element has a hover state. Cards lift, buttons brighten, links change color. Hover states use the standard `var(--transition)` timing.

### 8.3 Click behaviors

- Nav links: smooth scroll within homepage, navigate between pages on documentation pages
- Tab switches: change visible content without page reload, update active tab styling
- Card clicks: navigate to relevant page (cards are `<a>` tags or have `onclick` handlers)
- Sign-in link in footer: open modal
- Modal sign-in: validate password, set sessionStorage, navigate to internal hub
- Close modal: click X, click outside modal, or press ESC

### 8.4 Keyboard support

- Tab through interactive elements in document order
- Enter on buttons triggers click
- Enter on password input triggers sign-in
- ESC closes modal
- Visible focus indicators (cyan outline on focused elements)

### 8.5 No JavaScript required for primary content

All page content is in HTML and visible without JS. JavaScript adds interactivity but does not gate access to information. This ensures the mockup degrades gracefully and is accessible.

---

## 9. Build and deployment

### 9.1 Local preview

The site uses no build step. To preview locally:

```bash
# From the project root
python3 -m http.server 8000
# OR
npx serve .
# OR
# Just open index.html in a browser (some features may not work due to CORS on file://)
```

Visit `http://localhost:8000` in a browser.

### 9.2 Deployment to Vercel

1. Sign up at vercel.com (free, no credit card required)
2. Install Vercel CLI: `npm i -g vercel`
3. From project root: `vercel`
4. Follow prompts. Choose default settings. Confirm deployment.
5. Vercel returns a URL like `finx-portal-mockup-abc123.vercel.app`
6. To enable password protection:
   - Go to project settings on vercel.com
   - Enable "Deployment Protection" (paid feature) OR
   - Use the simple Edge Function approach: add a `middleware.js` at root that checks for a query parameter or cookie

For a simple password gate on Vercel free tier, add this to `middleware.js`:

```javascript
export const config = { matcher: '/((?!_next/static|_next/image|favicon.ico).*)' };

export default function middleware(req) {
  const auth = req.cookies.get('mockup-auth')?.value;
  const url = new URL(req.url);

  if (auth === 'finx2026') return;

  if (url.searchParams.get('p') === 'finx2026') {
    const res = Response.redirect(url.origin + url.pathname, 302);
    res.headers.set('Set-Cookie', 'mockup-auth=finx2026; Path=/; HttpOnly; SameSite=Lax');
    return res;
  }

  return new Response('Password required: append ?p=finx2026 to the URL', { status: 401 });
}
```

This is a soft gate — anyone with the URL and password sees everything. Adequate for a mockup. Not adequate for production.

### 9.3 Deployment to Netlify

1. Sign up at netlify.com
2. Drag the project folder onto the Netlify dashboard
3. Get a URL like `finx-portal-mockup.netlify.app`
4. Free tier supports password protection via "Site settings → Visitor access → Password protection"

### 9.4 Deployment to Cloudflare Pages

1. Sign up at pages.cloudflare.com
2. Either connect a GitHub repo or upload the folder via the dashboard
3. Cloudflare returns a `pages.dev` URL
4. Password protection requires a paid Workers plan, so use Vercel or Netlify if password is critical

### 9.5 Recommended path

For Sulagna's specific situation (sharing with Veselina, internal-only), the recommended path is:

1. Build the site locally
2. Test locally via `python3 -m http.server`
3. Deploy to Vercel
4. Enable simple password gate via middleware (as shown above)
5. Share URL + password with Veselina via Slack or email

Total time from build complete to shareable URL: under 15 minutes.

---

## 10. Accessibility

The mockup must meet WCAG 2.1 AA standards even though it is a mockup. Specifically:

- All interactive elements must be reachable by keyboard
- Color contrast must meet AA on body text against backgrounds (the cyan on dark navy passes)
- All images must have `alt` attributes
- Form inputs must have associated labels
- Focus indicators must be visible
- Heading hierarchy must be logical (one h1 per page, no skipped levels)

---

## 11. README.md content

Create a `README.md` at the project root with the following content:

```markdown
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
```

---

## 12. Quality checklist

Before considering the mockup complete, verify:

- [ ] All 9 pages render correctly without JavaScript errors in console
- [ ] Top navigation is consistent across all pages
- [ ] Footer is consistent across all pages
- [ ] All internal links work (homepage → Glue hub → journey page → back, etc.)
- [ ] Sign-in modal opens, accepts `finx2026`, navigates to internal hub
- [ ] Internal hub is genuinely gated (visiting `/internal/` directly without unlock should redirect or block)
- [ ] Sign out from internal hub returns to homepage and clears the unlock
- [ ] Tab switcher on homepage Products section works without page reload
- [ ] Smooth scroll works on homepage navigation
- [ ] Cards have visible hover states
- [ ] Color contrast passes WCAG AA on body text
- [ ] Page loads in under 2 seconds on first visit
- [ ] Total bundle size under 500 KB
- [ ] Renders correctly on Chrome, Safari, Firefox latest versions
- [ ] Renders acceptably on a 768px-wide viewport
- [ ] No real partner logos used (all are text labels)
- [ ] No real bank names or PII used
- [ ] "Mockup · Not live" tag is visible on every page
- [ ] State indicator (bottom right) shows current sign-in state

---

## 13. Suggested prompt sequence for GitHub Copilot

If using Copilot or a similar AI assistant, prompt in this order:

**Prompt 1: Project setup and shared assets**

```
@SPEC.md

Following sections 3 (file structure), 4 (design system), and 9 (build setup):

1. Create the file structure shown in section 3
2. Create assets/css/main.css with all design tokens from section 4 (colors, typography, spacing, radius, shadows, transitions)
3. Create assets/js/main.js as an empty file with a brief header comment
4. Create README.md per section 11

Do not create the HTML pages yet.
```

**Prompt 2: Homepage**

```
@SPEC.md

Following section 5.1 (homepage spec) and section 6 (component specs):

Create index.html as the public homepage. Include all 11 sections in order. Use components from section 6 where applicable (top nav 6.1, ecosystem diagram 6.2, cards 6.4, buttons 6.5, tab switcher 6.8, browser-window preview 6.9, sign-in modal 6.7, draft tag 6.11, state indicator 6.10).

Use white paper content from section 7.1. Do not use real partner logos.

Inline only the styles that are unique to this page; use main.css for shared styles.
```

**Prompt 3: Glue pages**

```
@SPEC.md

Following sections 5.2, 5.3, 5.4 and section 6.3 (three-column layout):

Create:
1. glue/index.html — Glue Developer Hub landing
2. glue/journey-onboarding.html — Journey guide example
3. glue/api-reference.html — API reference example

All three use the three-column documentation layout from section 6.3. The journey guide on glue/journey-onboarding.html is the most important page; ensure the API sequence card is well designed.
```

**Prompt 4: Glass pages**

```
@SPEC.md

Following sections 5.5, 5.6, 5.7:

Create:
1. glass/index.html — Glass Operations Guide landing with role cards and module cards
2. glass/role-compliance.html — Compliance Officer role landing
3. glass/task-kyc-review.html — KYC review task walkthrough with numbered steps

Use the same three-column layout as the Glue pages. Visual distinction: Glass uses the cyan accent the same way; the difference is in content structure (role-task hierarchy versus API-journey hierarchy).
```

**Prompt 5: Internal pages**

```
@SPEC.md

Following sections 5.8, 5.9 and section 6.7 (sign-in modal):

Create:
1. internal/index.html — UST Internal Hub with password gate
2. internal/playbook-greenfield.html — Example internal playbook

The internal pages use the purple internal palette (--internal-primary, --internal-bg, --internal-border) instead of cyan as the primary accent.

Implement the password gate using sessionStorage as described in section 6.7. Visiting /internal/ directly without unlock should redirect to homepage with the modal open.
```

**Prompt 6: JavaScript interactivity**

```
@SPEC.md

Following section 8 (interaction specifications):

Update assets/js/main.js to implement:
1. Smooth scroll for homepage navigation
2. Tab switcher for Products section on homepage
3. Sign-in modal open/close (triggered by footer link)
4. Password validation against 'finx2026', store in sessionStorage as 'finx-internal-unlocked'
5. Internal pages check sessionStorage on load, redirect if not unlocked
6. ESC key closes modal
7. Click outside modal closes modal
8. Sign-out button clears sessionStorage and returns to homepage
9. State indicator updates to show current sign-in state

Pure vanilla JavaScript. No framework. No external dependencies.
```

**Prompt 7: Quality pass**

```
@SPEC.md

Run through the quality checklist in section 12. For each item:
- If passing, leave a comment in the code or note in README
- If failing, fix it

Pay particular attention to:
- Internal links between pages all work
- Sign-in flow end-to-end works
- No console errors on any page
- Color contrast and accessibility
```

---

## 14. Common questions and answers

**Q: Can I use Tailwind?**
A: No. The spec calls for plain CSS to keep the deployment trivial and to give the engineer practice expressing the design system in raw CSS. If you must use Tailwind, the design tokens in section 4 translate cleanly into a Tailwind config.

**Q: Can I use a static site generator (Astro, Eleventy, Hugo)?**
A: Yes if you prefer, but the deliverable must still be a folder of static HTML/CSS/JS files that can be deployed without a build step on the receiving end. If using a generator, commit the generated output too.

**Q: Can I add real search?**
A: Not for this mockup. The search input is decorative. If demo feedback requests search, that's a follow-up scope.

**Q: Can I add animations beyond what's specified?**
A: Use restraint. Animations must be subtle, fast (200-320ms), and serve a purpose. No bouncing, no parallax, no scroll-triggered reveal cascades. The goal is a serious, professional product, not a portfolio site.

**Q: How polished does this need to be?**
A: Best in market. The benchmark is Stripe Docs, Plaid, Linear, Vercel. If a stakeholder cannot tell whether this is a mockup or a real product, the mockup has succeeded.

**Q: What if the spec contradicts itself?**
A: Flag it back to the spec author. Section numbers help: "Section 5.1 says X, Section 6.4 says Y, which is correct?" The author will resolve.

**Q: What if I want to use a different color scheme?**
A: Don't. The color palette is locked to the white paper visual identity. Visual cohesion with existing FinX marketing materials is a non-negotiable requirement.

---

## 15. Author and contact

This specification was authored by Sulagna Sasmal, Senior Technical Writer at UST FinX, in April 2026, as part of the proposed external documentation strategy.

Questions about the spec, content corrections, or scope clarifications: sulagna.sasmal@ust.com (placeholder until UST address is provisioned).

---

*End of specification. Total length: ~12,000 words. Estimated implementation time: 3-5 days for a single frontend engineer with strong CSS skills, or 1-2 days with AI coding assistant collaboration.*
