# FenceBound System Atlas

Version 0.2 | Current platform map | July 29, 2026

This is the current continuation of `FenceBound_System_Atlas_v0.1.docx`. The v0.1 DOCX is retained as historical evidence; this file preserves the Atlas role rather than creating a second authority.

## 1. Atlas control

The Engineering Bible governs doctrine and accepted direction. Repository source/tests govern implemented behavior. The Atlas governs module placement, responsibility, ownership, interfaces, dependencies, and maturity. Conflicts are recorded rather than silently resolved.

Evidence labels: **VERIFIED**, **PROVISIONAL**, **TARGET**, **CANDIDATE**, and **RETIRED** retain the definitions established in v0.1.

## 2. Current tool map

| Module | Current role | Maturity | Primary risk |
| --- | --- | --- | --- |
| FenceboundCAD | Geometry, specifications, quantities, local project persistence, pricing, validation, and documents in one runtime | PROVISIONAL release candidate | Responsibilities remain bundled; integrity/business truth not fully certified |
| Fencebound Rate Card | Pricing-data and client-price administration | PROVISIONAL | Duplicated pricing/type logic and unsettled boundaries |
| FenceScraper | Opportunity discovery and bid evidence | VERIFIED for accepted connectors/tests; TARGET for Project Model integration | Opportunity-to-project contract incomplete |
| DT-001 | Fixture-bounded material vocabulary and evidence | VERIFIED within declared slice | Definitions/prices remain provisional where labeled |

Target ownership remains: Project Model for project facts; Geometry/Specification/Quantity/Pricing/Validation/Documentation/Export services for their respective responsibilities. Current bundled implementation does not redefine that target.

## 3. AT-002 — FenceboundCAD module card and trust audit

**Classification:** User-facing drawing/estimating workspace backed by currently embedded logic; TARGET is a workspace consuming shared platform services.

**Purpose:** Author fence geometry and run/gate specifications, derive quantities, preserve project state, validate readiness, and generate working/client documents.

**Users:** Owner, estimator, field measurer, and project-preparation staff.

**Authoritative inputs:** Project/customer/site metadata; user-authored geometry; run specifications; gate placement; project pricing snapshot; company pricing inputs; document options.

**Authoritative outputs:** Current implementation emits geometry, run/gate ownership, derived footage/BOM, validation results, project snapshots, plan PDF, client estimate PDF, and price-file exports. Under target doctrine, only geometry/specification intent and measured quantity-driving facts belong to CAD.

**Data owner:** VERIFIED current state is the in-memory `S` project state plus local-storage/project-file representations in `index.html`. TARGET ownership is the Project Model and specialized services.

**Dependencies:** Browser canvas/local storage/File APIs; embedded fence/gate/specification and quantity definitions; embedded pricing objects; jsPDF CDN dependency; Playwright acceptance environment.

**Forbidden responsibilities:** Under governing target architecture, CAD must not own company cost defaults, labor doctrine, overhead, markup, market-benchmark interpretation, proposal terms, or canonical BOM review. Current source still contains several of these responsibilities; that is implementation drift, not amended doctrine.

**Current implementation:** Canonical `index.html`, `APP_VERSION='5.3.8-release-validation'`, schema 3. Frozen `FenceboundCAD v5.3.4-embedded-project-index.html` is forensic only.

**Maturity:** **PROVISIONAL** release candidate. Core Phase One ownership and exercised persistence paths are verified; business-rule truth, full persistence boundaries, and broader platforms remain incomplete.

**Verified capabilities:**

- Persistent run IDs; run-owned cloned specifications and spacing.
- Selected-run editing and isolated new-run defaults.
- Gate parent ownership, owner inheritance/context, migration, and zero-run blocking.
- Per-run BOM calculation followed by consolidation; mixed-system and gate evidence in acceptance tests.
- Schema 3 `snapshotState()`/`applyState()` paths for autosave, portable files, and internal Saved Jobs field completeness.
- Validation error/warning reporting and fatal client-estimate blocking.
- Nine accepted Playwright tests covering the current release-validation scope.

**Known defects:**

- Internal Saved Jobs retain shared references after Load because `applyState()` directly assigns stored arrays; working edits can mutate the in-memory saved snapshot.
- Undo/redo uses raw JSON element snapshots and direct restoration; run-spec `Set` hydration may fail and needs reproduction.
- Only client estimate PDF is fatal-validation-gated; plan PDF and project JSON export remain unblocked.
- Project historical pricing and company-default restoration/isolation need explicit tests.
- Current CAD still owns pricing, quantity, persistence, validation, and document responsibilities that target doctrine assigns to services.
- July 17 governance prohibits post-v5.3.4 prototype continuation, while later accepted history merged v5.3.8 into `index.html`; owner ratification is unresolved.

**Unresolved tests:**

- Mixed-system round trips across internal Saved Jobs, portable file, autosave, and undo/redo.
- Deep-reference mutation checks for every saved/restored collection and object.
- Legacy schema/ownership fixtures including orphaned gates.
- Company-default pricing versus historical project pricing boundary.
- Line-item contractor/business-rule certification and other browser/device coverage.

**Entry criteria:** Start from synchronized clean `main`; read authority/orientation/CAD index; reproduce the exact persistence risk; preserve schema migration and pricing doctrine; prohibit architecture expansion and pricing-value changes.

**Exit criteria:** All persistence paths preserve expected project fields and reference isolation; mixed systems and legacy data round-trip; every difference is reported; relevant tests pass; documentation/log/handoff are current; no release candidate is promoted before integrity passes.

**Next decision:** Does a complete mixed-system persistence matrix prove v5.3.8 integrity, or does evidence require a narrow v5.3.9 repair? Separately, the owner must ratify whether accepted `index.html` continuation superseded the July 17 prohibition.

## 4. AT-002 historical finding disposition

| Earlier concern | Current classification |
| --- | --- |
| Internal Saved Jobs partial snapshot/direct load/shared references | Partially resolved: canonical functions fix completeness, but shared references remain; supplied candidate retains all three defects |
| Mixed-system ownership and BOM contamination | Partially resolved; ownership/isolation tests pass, business-rule truth remains provisional |
| Global BOM logic | Superseded by per-run calculation plus consolidation for current branches; remaining global assumptions require review |
| Pricing boundaries | Still present architecturally and requires persistence-boundary tests |
| Document truthfulness | Partially resolved by validation and estimate blocking; other outputs remain unblocked |
| Round-trip integrity | Partially resolved for portable/autosave/internal jobs; undo/redo and broader matrix remain |

## 5. Atlas punch list

| ID | Deliverable | Status |
| --- | --- | --- |
| AT-001 | Ratify Atlas role and evidence labels | Retained from v0.1; role used by repository |
| AT-002 | Complete CAD module card and trust audit | Complete for source evidence; runtime matrix remains |
| AT-003 | Complete Rate Card module card and pricing-doctrine issue list | Queued |
| AT-004 | Complete FenceScraper module card and create-project payload | Queued |
| AT-005–AT-009 | Lifecycle, vocabulary, Project Model, and diagrams | Queued |
| AT-010 | Select first safe implementation slice | Blocked by owner direction and prerequisite evidence |
