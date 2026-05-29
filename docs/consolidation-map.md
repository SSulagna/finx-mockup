# Consolidation Map — UST FinX Documentation Portal

> Planning document. No content has been moved. This map fixes the merge of three properties into the canonical portal at `finx-mockup` (this repo).
>
> Author: Sulagna Sasmal · Date drafted: 29 May 2026

---

## Sources in scope

1. **finx-mockup** (this repo) — canonical surface. Single-file hash-routed SPA at `index.html` plus legacy multi-file artifacts in `/glue`, `/glass`, `/internal`, `/walkthrough` that pre-date the SPA migration.
2. **finx-onboarding-docs** (`../finx-onboarding-docs/`) — Docusaurus 3.10.1 site. Currently labelled "internal" but content is predominantly authenticated-external (bank engineering, SI partners, bank QA).
3. **finx-docs-portal-prototype** (referenced in `Prototype HTML/PUBLISHING.md`) — IA prototype. Already superseded by this repo's SPA. Out of scope for migration; retire repo after merge.

## Trust-tier vocabulary

| Tier | Code | Audience | Today's gating |
|---|---|---|---|
| Public · External | `Public` | Bank evaluators, CIOs, architects, prospects | None (SEO-indexed) |
| Authenticated · External | `Auth` | Bank engineering, SI partners, bank QA, bank ops | None today; reserved for tenant SSO in v2 |
| UST Internal | `Internal` | UST staff only | `sessionStorage` password `finx2026`; SSO in production |

## Read of conventions (apply to every migrated row)

- **Layout:** marketing routes use single-column story layout; every `#/docs/*` route uses the three-column layout (220 / 760 / 180).
- **Tone:** senior-practitioner voice, white-paper-aligned. No em dashes, no "docs" in visible labels, no bare `href="#"`, no Lorem.
- **Placeholders:** every unresolved link is `href="javascript:void(0)"` plus `title="Planned: …"` so the `○` CSS cue renders.
- **Source files in `finx-onboarding-docs`** carry Docusaurus front-matter and `:::tip` admonitions. These must be stripped during migration and replaced with the equivalent finx-mockup callout pattern.

---

## Consolidation table

Sorted by Priority (P0 → P2), then by Target tier (Public → Auth → Internal). Every row is complete; rows referencing a `Split` action point back to the parent row number in Notes.

| # | Source repo | Source path | Current title | Target file in finx-mockup | Target tier | Action | Priority | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | finx-mockup | `index.html#/` | Composable Banking at Scale | `index.html#/` | Public | Migrate as-is | P0 | Canonical homepage. Stays. |
| 2 | finx-mockup | `index.html#/architecture` | Orchestration at the center | `index.html#/architecture` | Public | Migrate as-is | P0 | Stays. |
| 3 | finx-mockup | `index.html#/platform` | Platform overview | `index.html#/platform` | Public | Migrate as-is | P0 | Stays. |
| 4 | finx-mockup | `index.html#/platform/glue` | FinX Glue | `index.html#/platform/glue` | Public | Migrate as-is | P0 | Stays. |
| 5 | finx-mockup | `index.html#/platform/glass` | A single pane of glass for bank operations | `index.html#/platform/glass` | Public | Migrate as-is | P0 | Stays. |
| 6 | finx-mockup | `index.html#/modernization` | Modernization Paths | `index.html#/modernization` | Public | Migrate as-is | P0 | Stays. |
| 7 | finx-mockup | `index.html#/modernization/greenfield` | Stand up a new bank on FinX from day one | `index.html#/modernization/greenfield` | Public | Migrate as-is | P0 | Stays. |
| 8 | finx-mockup | `index.html#/modernization/coexistence` | Wrap the legacy. Add the new. | `index.html#/modernization/coexistence` | Public | Migrate as-is | P0 | Stays. |
| 9 | finx-mockup | `index.html#/modernization/progressive` | Migrate one domain at a time | `index.html#/modernization/progressive` | Public | Migrate as-is | P0 | Stays. |
| 10 | finx-mockup | `index.html#/use-cases` | From architecture to outcomes | `index.html#/use-cases` | Public | Migrate as-is | P0 | Stays. |
| 11 | finx-mockup | `index.html#/resources` | White paper, glossary, FAQs | `index.html#/resources` | Public | Migrate as-is | P0 | Stays. Becomes parent for new glossary + executive brief rows below. |
| 12 | finx-mockup | `index.html#/docs/glue` | Build on FinX Glue | `index.html#/docs/glue` | Auth | Migrate as-is | P0 | Stays. Tier raised from Public to Auth in v2; no content change. |
| 13 | finx-mockup | `index.html#/docs/glue/quickstart` | Quickstart | `index.html#/docs/glue/quickstart` | Auth | Migrate as-is | P0 | Stays. |
| 14 | finx-mockup | `index.html#/docs/glue/auth` | Authentication and tenant headers | `index.html#/docs/glue/auth` | Auth | Migrate and rewrite | P0 | Merge in the Authentication & Gateway section of onboarding-docs row 36. |
| 15 | finx-mockup | `index.html#/docs/glue/environments` | Environments | `index.html#/docs/glue/environments` | Auth | Migrate and rewrite | P0 | Merge in Environment Matrix from onboarding-docs row 41. |
| 16 | finx-mockup | `index.html#/docs/glue/journey-onboarding` | Customer onboarding and KYC journey | `index.html#/docs/glue/journey-onboarding` | Auth | Migrate and rewrite | P0 | Augment with Onboarding Journey Map content from row 31. |
| 17 | finx-mockup | `index.html#/docs/glue/api-reference` | API Reference (Create party) | `index.html#/docs/glue/api-reference` | Auth | Migrate and rewrite | P0 | Expand using onboarding-docs API Reference row 33. |
| 18 | finx-mockup | `index.html#/docs/glass` | Operations made coherent | `index.html#/docs/glass` | Auth | Migrate as-is | P0 | Stays. |
| 19 | finx-mockup | `index.html#/docs/glass/role-csr` | CSR / Ops Agent | `index.html#/docs/glass/role-csr` | Auth | Migrate as-is | P0 | Stays. |
| 20 | finx-mockup | `index.html#/docs/glass/role-compliance` | Compliance Officer | `index.html#/docs/glass/role-compliance` | Auth | Migrate as-is | P0 | Stays. |
| 21 | finx-mockup | `index.html#/docs/glass/task-kyc-review` | Reviewing KYC results for a new customer | `index.html#/docs/glass/task-kyc-review` | Auth | Migrate as-is | P0 | Stays. |
| 22 | finx-mockup | `index.html#/internal` | UST FinX Internal Hub | `index.html#/internal` | Internal | Migrate as-is | P0 | Stays. Card targets filled by new writes (rows 56–61). |
| 23 | finx-onboarding-docs | `docs/executive/brief.md` | Executive Brief — FinX Client Onboarding | `index.html#/executive-brief` | Public | Migrate and rewrite | P0 | New marketing-adjacent route. See Open question 2. |
| 24 | finx-onboarding-docs | `docs/glossary.md` | Glossary | `index.html#/resources/glossary` | Public | Migrated 29 May 2026 | P0 | Linked from `/resources`. Replaces the current "Planned: glossary" link. |
| 25 | finx-onboarding-docs | `docs/partner-integration/auth-gateway.md` | Partner Integration Guide (parent) | `index.html#/partners` | Auth | Split | P0 | Parent landing for new top-level Partners section. Sibling row 36 carries the Authentication & Gateway body. See Open question 1. |
| 26 | finx-onboarding-docs | `docs/partner-integration/api-contracts.md` | API Contracts | `index.html#/partners/api-contracts` | Auth | Migrate as-is | P0 | Under new Partners section. |
| 27 | finx-onboarding-docs | `docs/partner-integration/sandbox-postman.md` | Sandbox & Postman | `index.html#/partners/sandbox` | Auth | Migrate as-is | P0 | Under new Partners section. |
| 28 | finx-onboarding-docs | `docs/engineering/architecture-overview.md` | Engineering Guide — FinX Client Onboarding | `index.html#/docs/glue/architecture` | Auth | Migrate and rewrite | P0 | New child page under Glue Concepts. Tone pass + strip Docusaurus admonitions. |
| 29 | finx-onboarding-docs | `docs/engineering/api-reference.md` | API Reference | `index.html#/docs/glue/api-reference` | Auth | Migrate and rewrite | P0 | Folds into row 17. Source row recorded for traceability. |
| 30 | finx-onboarding-docs | `docs/product-business/guide.md` | Product & Business Guide | `index.html#/docs/glue/product-overview` | Auth | Migrate and rewrite | P0 | New child page; bank PM / BA audience. |
| 31 | finx-onboarding-docs | `docs/product-business/journey-map.md` | Onboarding Journey Map | `index.html#/docs/glue/journey-onboarding` | Auth | Migrate and rewrite | P0 | Folds into row 16. |
| 32 | finx-onboarding-docs | `docs/product-business/compliance-kyc.md` | Compliance & KYC Touchpoints (Glue half) | `index.html#/docs/glue/compliance-kyc` | Auth | Split | P0 | API/orchestration half. Sibling row 47 carries the Glass half. |
| 33 | finx-mockup | `index.html` (sidebar placeholder) | API Reference: Account Management | `index.html#/docs/glue/api-reference/account-management` | Auth | New write | P1 | Gap from `Planned:` tooltip. |
| 34 | finx-mockup | `index.html` (sidebar placeholder) | API Reference: Payments | `index.html#/docs/glue/api-reference/payments` | Auth | New write | P1 | Gap from `Planned:` tooltip. |
| 35 | finx-mockup | `index.html` (sidebar placeholder) | API Reference: Document Directory | `index.html#/docs/glue/api-reference/document-directory` | Auth | New write | P1 | Gap from `Planned:` tooltip. |
| 36 | finx-onboarding-docs | `docs/partner-integration/auth-gateway.md` (child §) | Authentication & Gateway | `index.html#/docs/glue/auth` | Auth | Split | P1 | Body of the child section. Parent landing is row 25. Merges into row 14. |
| 37 | finx-onboarding-docs | `docs/engineering/microservices-registry.md` | Microservices Registry | `index.html#/docs/glue/microservices` | Auth | Migrate as-is | P1 | New child page under Glue Concepts. |
| 38 | finx-onboarding-docs | `docs/engineering/orchestration-engine.md` | Onboarding Orchestration Engine | `index.html#/docs/glue/orchestration-engine` | Auth | Migrate as-is | P1 | New child page under Glue Concepts. |
| 39 | finx-onboarding-docs | `docs/engineering/schema-registry-sop.md` | Schema Registry SOP | `index.html#/docs/glue/schema-registry` | Auth | Migrate as-is | P1 | New child page under Glue Operate. |
| 40 | finx-onboarding-docs | `docs/qa-testing/test-strategy.md` | QA & Testing Guide (parent) | `index.html#/docs/qa` | Auth | Migrate and rewrite | P1 | New top-level docs section. See Open question 3. |
| 41 | finx-onboarding-docs | `docs/qa-testing/environment-matrix.md` | Environment Matrix (child) | `index.html#/docs/glue/environments` | Auth | Migrate and rewrite | P1 | Folds into row 15. |
| 42 | finx-onboarding-docs | `docs/qa-testing/scenario-catalog.md` | Scenario Catalog (child) | `index.html#/docs/qa/scenarios` | Auth | Migrate as-is | P1 | Child of row 40. |
| 43 | finx-onboarding-docs | `docs/product-business/module-overview.md` | Module Overview (Glue half) | `index.html#/docs/glue/modules` | Auth | Split | P1 | Sibling row 46 carries the Glass half. |
| 44 | finx-mockup | `index.html` (sidebar placeholder) | BIAN service domains | `index.html#/docs/glue/concepts/bian-service-domains` | Auth | New write | P1 | Gap. |
| 45 | finx-mockup | `index.html` (sidebar placeholder) | Canonical model | `index.html#/docs/glue/concepts/canonical-model` | Auth | New write | P1 | Gap. |
| 46 | finx-onboarding-docs | `docs/product-business/module-overview.md` (Glass §) | Module Overview (Glass half) | `index.html#/docs/glass/modules` | Auth | Split | P1 | Glass module reference. Sibling of row 43. |
| 47 | finx-onboarding-docs | `docs/product-business/compliance-kyc.md` (Glass §) | Compliance & KYC Touchpoints (Glass half) | `index.html#/docs/glass/compliance-kyc` | Auth | Split | P1 | Sibling of row 32. |
| 48 | finx-mockup | `index.html` (sidebar placeholder) | Supervisor role | `index.html#/docs/glass/role-supervisor` | Auth | New write | P1 | Gap. |
| 49 | finx-mockup | `index.html` (sidebar placeholder) | Admin / Platform role | `index.html#/docs/glass/role-admin` | Auth | New write | P1 | Gap. |
| 50 | finx-mockup | `index.html` (sidebar placeholder) | Approve high-risk customer | `index.html#/docs/glass/task-approve-high-risk` | Auth | New write | P1 | Gap. |
| 51 | finx-mockup | `index.html` (sidebar placeholder) | AML alert handling | `index.html#/docs/glass/task-aml-alert` | Auth | New write | P1 | Gap. |
| 52 | finx-mockup | `index.html` (sidebar placeholder) | Sanctions screening | `index.html#/docs/glass/task-sanctions-screening` | Auth | New write | P1 | Gap. |
| 53 | finx-mockup | `index.html` (sidebar placeholder) | Four-eyes approval | `index.html#/docs/glass/task-four-eyes-approval` | Auth | New write | P1 | Gap. |
| 54 | finx-mockup | `index.html` (sidebar placeholder) | Glass FAQs | `index.html#/docs/glass/faqs` | Auth | New write | P1 | Gap. |
| 55 | finx-mockup | `index.html` (sidebar placeholder) | Glass RBAC permissions | `index.html#/docs/glass/rbac-permissions` | Auth | New write | P1 | Gap. |
| 56 | finx-mockup | `index.html` (internal hub card) | Engagement Playbooks | `index.html#/internal/playbooks` | Internal | New write | P1 | Gap. Some of the legacy `internal/playbook-greenfield.html` prose can be lifted. |
| 57 | finx-mockup | `index.html` (internal hub card) | Sales Enablement | `index.html#/internal/sales` | Internal | New write | P1 | Gap. |
| 58 | finx-mockup | `index.html` (internal hub card) | Architecture Deep-Dives | `index.html#/internal/architecture` | Internal | New write | P1 | Gap. |
| 59 | finx-mockup | `index.html` (internal hub card) | Delivery References | `index.html#/internal/delivery` | Internal | New write | P1 | Gap. |
| 60 | finx-mockup | `index.html` (internal hub card) | Client Engagements | `index.html#/internal/engagements` | Internal | New write | P1 | Gap. |
| 61 | finx-mockup | `index.html` (internal hub card) | Product Requirements | `index.html#/internal/product-requirements` | Internal | New write | P1 | Gap. |
| 62 | finx-onboarding-docs | `docs/hub.md` | FinX Client Onboarding — Hub | `index.html` (navigation only) | Public | Retire | P1 | Replaced by the SPA's top nav and tier landings. No prose to preserve. |
| 63 | finx-mockup | `glue/index.html` | FinX Glue — Developer Hub (legacy) | `index.html#/docs/glue` | Auth | Retire | P1 | Legacy multi-file artifact, not wired to SPA router. Delete after merge confirmed. |
| 64 | finx-mockup | `glue/journey-onboarding.html` | Customer onboarding & KYC journey (legacy) | `index.html#/docs/glue/journey-onboarding` | Auth | Retire | P1 | Legacy. Delete after merge. |
| 65 | finx-mockup | `glue/api-reference.html` | API Reference (legacy) | `index.html#/docs/glue/api-reference` | Auth | Retire | P1 | Legacy. Delete after merge. |
| 66 | finx-mockup | `glass/index.html` | Glass Operations Guide (legacy) | `index.html#/docs/glass` | Auth | Retire | P1 | Legacy. Delete after merge. |
| 67 | finx-mockup | `glass/role-compliance.html` | Compliance Officer (legacy) | `index.html#/docs/glass/role-compliance` | Auth | Retire | P1 | Legacy. Delete after merge. |
| 68 | finx-mockup | `glass/task-kyc-review.html` | Reviewing KYC results (legacy) | `index.html#/docs/glass/task-kyc-review` | Auth | Retire | P1 | Legacy. Delete after merge. |
| 69 | finx-mockup | `internal/index.html` | UST FinX Internal Hub (legacy) | `index.html#/internal` | Internal | Retire | P1 | Legacy. Delete after merge. |
| 70 | finx-mockup | `internal/playbook-greenfield.html` | Greenfield playbook (legacy) | `index.html#/internal/playbooks` | Internal | Retire | P1 | Salvage greenfield prose into row 56, then delete the file. |
| 71 | finx-mockup | `walkthrough/index.html` | ~6-minute walkthrough (legacy) | `index.html#/walkthrough` | Public | Defer | P2 | Out of scope for v1 merge. Keep file in place; decide in v2 whether to port into SPA or retire. |
| 72 | finx-mockup | `index.html#/about-ust` | UST. The company behind FinX. | `index.html#/about-ust` | Public | Migrate as-is | P1 | Stays. |
| 73 | finx-mockup | `index.html#/finx-practice` | The UST FinX Practice | `index.html#/finx-practice` | Public | Migrate as-is | P1 | Stays. |
| 74 | finx-mockup | `index.html#/careers` | Build banking infrastructure that lasts | `index.html#/careers` | Public | Migrate as-is | P1 | Stays. |
| 75 | finx-mockup | `index.html#/press` | Press & Media | `index.html#/press` | Public | Migrate as-is | P1 | Stays. |
| 76 | finx-mockup | `index.html#/talk-to-us` | Talk to Us | `index.html#/talk-to-us` | Public | Migrate as-is | P1 | Stays. |
| 77 | finx-mockup | `index.html#/partners` | Partner Program (existing) | `index.html#/partners-program` | Public | Migrate and rewrite | P1 | Rename current `/partners` to `/partners-program` so `/partners` can host the Partners docs section (row 25). |
| 78 | finx-mockup | `index.html#/events` | Events | `index.html#/events` | Public | Migrate as-is | P1 | Stays. |
| 79 | finx-mockup | `index.html#/contact` | Contact | `index.html#/contact` | Public | Migrate as-is | P1 | Stays. |
| 80 | finx-mockup | `index.html#/*` | Page not found | `index.html#/*` | Public | Migrate as-is | P1 | 404 wildcard. Stays. |
| 81 | finx-mockup | `index.html` (placeholder card) | Modernization: Full Modernization detail | `index.html#/modernization/full` | Public | New write | P2 | Gap. White paper §05–§09 source. |
| 82 | finx-mockup | `index.html` (sidebar placeholder) | Glue: Extensibility model | `index.html#/docs/glue/concepts/extensibility-model` | Auth | New write | P2 | Gap. |
| 83 | finx-mockup | `index.html` (sidebar placeholder) | Glue: Account opening journey | `index.html#/docs/glue/journey-account-opening` | Auth | New write | P2 | Gap. |
| 84 | finx-mockup | `index.html` (sidebar placeholder) | Glue: Cross-border payment journey | `index.html#/docs/glue/journey-cross-border-payment` | Auth | New write | P2 | Gap. |
| 85 | finx-mockup | `index.html` (sidebar placeholder) | Glue: Runbooks | `index.html#/docs/glue/operate/runbooks` | Auth | New write | P2 | Gap. |
| 86 | finx-mockup | `index.html` (sidebar placeholder) | Glue: Releases & deprecations | `index.html#/docs/glue/operate/releases` | Auth | New write | P2 | Gap. |
| 87 | finx-mockup | `index.html` (sidebar placeholder) | Glass: Customer & Account Mgmt module | `index.html#/docs/glass/modules/customer-account` | Auth | New write | P2 | Gap. Likely populated by row 46. |
| 88 | finx-mockup | `index.html` (sidebar placeholder) | Glass: Task Management module | `index.html#/docs/glass/modules/task-management` | Auth | New write | P2 | Gap. |
| 89 | finx-mockup | `index.html` (sidebar placeholder) | Glass: Workflow Console module | `index.html#/docs/glass/modules/workflow-console` | Auth | New write | P2 | Gap. |
| 90 | finx-mockup | `index.html` (sidebar placeholder) | Glass: Incident & Alert Center module | `index.html#/docs/glass/modules/incident-alert-center` | Auth | New write | P2 | Gap. |
| 91 | finx-mockup | `index.html` (CSR task placeholder) | Glass task: Customer enquiries | `index.html#/docs/glass/task-customer-enquiries` | Auth | New write | P2 | Gap. |
| 92 | finx-mockup | `index.html` (CSR task placeholder) | Glass task: Update customer details | `index.html#/docs/glass/task-update-customer` | Auth | New write | P2 | Gap. |
| 93 | finx-mockup | `index.html` (CSR task placeholder) | Glass task: Account servicing | `index.html#/docs/glass/task-account-servicing` | Auth | New write | P2 | Gap. |
| 94 | finx-mockup | `index.html` (CSR task placeholder) | Glass task: Dispute intake | `index.html#/docs/glass/task-dispute-intake` | Auth | New write | P2 | Gap. |
| 95 | finx-mockup | `index.html` (CSR task placeholder) | Glass task: Card servicing | `index.html#/docs/glass/task-card-servicing` | Auth | New write | P2 | Gap. |
| 96 | finx-mockup | `index.html` (footer placeholder) | Privacy policy | `index.html#/legal/privacy` | Public | New write | P2 | Gap. Legal copy, likely from UST corporate. |
| 97 | finx-mockup | `index.html` (footer placeholder) | Terms of service | `index.html#/legal/terms` | Public | New write | P2 | Gap. |
| 98 | finx-mockup | `index.html` (footer placeholder) | Security and compliance posture | `index.html#/legal/security` | Public | New write | P2 | Gap. |

---

## Open questions

Decisions needed before migration begins. Each blocks one or more table rows.

1. **Partners section placement.** Rows 25–27, 36 assume a new top-level `/partners` section that sits parallel to `/docs/glue` and `/docs/glass`, with row 77 renaming the current `/partners` marketing route to `/partners-program`. Alternative: nest the partner integration content under `/docs/glue/partners` and leave `/partners` as the marketing route. Which?
2. **Executive brief landing.** Row 23 proposes a dedicated `/executive-brief` route. Alternatives: (a) fold into `/architecture` as an extra section; (b) fold into `/resources` as a downloadable summary; (c) keep as its own route. Which?
3. **QA & Testing Guide placement.** Row 40 proposes a new top-level `/docs/qa` section. Alternatives: (a) nest under Glue as `/docs/glue/testing` (developer testing framing); (b) new `/docs/operate` umbrella that also absorbs Glue Runbooks (row 85). Which?
4. **Tier 2 gating boundary.** SPEC and AGENTS describe `/docs/*` as fully public today. The brief above calls Tier 2 "Authenticated · External". Confirm: do we keep `/docs/*` public for v1 and add the auth layer in v2, or stand up the auth boundary as part of this consolidation?
5. **Internal hub content sourcing.** Rows 56–61 are all `New write` because nothing in the two source repos maps to them. Confirm that internal content is out of scope for v1 launch, and the hub stays as it is (six cards with `Planned:` tooltips) until UST GB supplies source material.

---

## Retired pages

Every row with action `Retire`, and the canonical equivalent that replaces it.

| Row | Retired source | Canonical equivalent on finx-mockup |
|---|---|---|
| 62 | `finx-onboarding-docs/docs/hub.md` | SPA top navigation plus tier landings (`/docs/glue`, `/docs/glass`, `/internal`). |
| 63 | `Mock-Website/glue/index.html` (legacy) | `index.html#/docs/glue`. |
| 64 | `Mock-Website/glue/journey-onboarding.html` (legacy) | `index.html#/docs/glue/journey-onboarding`. |
| 65 | `Mock-Website/glue/api-reference.html` (legacy) | `index.html#/docs/glue/api-reference`. |
| 66 | `Mock-Website/glass/index.html` (legacy) | `index.html#/docs/glass`. |
| 67 | `Mock-Website/glass/role-compliance.html` (legacy) | `index.html#/docs/glass/role-compliance`. |
| 68 | `Mock-Website/glass/task-kyc-review.html` (legacy) | `index.html#/docs/glass/task-kyc-review`. |
| 69 | `Mock-Website/internal/index.html` (legacy) | `index.html#/internal`. |
| 70 | `Mock-Website/internal/playbook-greenfield.html` (legacy) | `index.html#/internal/playbooks` (row 56), with prose salvaged first. |

The `finx-docs-portal-prototype` repo referenced in `Prototype HTML/PUBLISHING.md` is also fully superseded by this canonical surface and can be archived after merge.

---

## New writes needed

The actual writing backlog after consolidation, in priority order.

### P0

None. Every P0 row has a source to migrate from.

### P1

1. Engagement Playbooks landing (row 56). Salvage greenfield prose from `internal/playbook-greenfield.html`.
2. Sales Enablement landing (row 57).
3. Architecture Deep-Dives landing (row 58).
4. Delivery References landing (row 59).
5. Client Engagements landing (row 60).
6. Product Requirements landing (row 61).
7. Glue API Reference: Account Management (row 33).
8. Glue API Reference: Payments (row 34).
9. Glue API Reference: Document Directory (row 35).
10. Glue Concepts: BIAN service domains (row 44).
11. Glue Concepts: Canonical model (row 45).
12. Glass role: Supervisor (row 48).
13. Glass role: Admin / Platform (row 49).
14. Glass task: Approve high-risk customer (row 50).
15. Glass task: AML alert handling (row 51).
16. Glass task: Sanctions screening (row 52).
17. Glass task: Four-eyes approval (row 53).
18. Glass FAQs (row 54).
19. Glass RBAC permissions (row 55).

### P2

20. Modernization: Full Modernization detail (row 81).
21. Glue Concepts: Extensibility model (row 82).
22. Glue Journeys: Account opening (row 83).
23. Glue Journeys: Cross-border payment (row 84).
24. Glue Operate: Runbooks (row 85).
25. Glue Operate: Releases & deprecations (row 86).
26. Glass modules: Customer & Account Mgmt (row 87).
27. Glass modules: Task Management (row 88).
28. Glass modules: Workflow Console (row 89).
29. Glass modules: Incident & Alert Center (row 90).
30. Glass tasks: Customer enquiries, Update customer details, Account servicing, Dispute intake, Card servicing (rows 91–95).
31. Legal: Privacy, Terms, Security (rows 96–98).
