# HANDOFF — audit-repairs r1

Start branch: `audit/v540-launch-review` (from `main` @ `82a148f`). Push to the same branch; open a PR per fix.

## Current state

- **Done (2026-10-29, Claude Code, docs only):** a launch-readiness, UI, bug and market audit of `index.html`
  v5.4.0. The only code change is this file plus a developer-log entry.
- **Gate observed on `main` @ `82a148f`:** `npm test` 95/96; `node scripts/cad-persistence-matrix.js` 12/12.
  The failure was `persistence-integrity.spec.js:605` `R9 all exports survive imported null start`
  (`Cannot read properties of null (reading 'x')`) during estimate export. It passed 3/3 when re-run alone,
  so it is intermittent. It is new since the Oct 3 gate (96/96).
- **Open:** nothing has been fixed yet. The owner wants as many findings fixed as possible, and each one
  sorted into **fix** or **redo**.
- **Launch readiness (audit estimate):** ~75% for the owner's own crew, ~35% for a paid outside beta,
  ~20% for a general launch.
- **Market fit:** 4/10 today; about 6.5/10 if positioned as a precision chain-link/commercial takeoff and
  bid tool (with the NCDOT connector) rather than a general fence CRM.

## Read first

- `CLAUDE.md` working rules: red-before tests, no pricing **value** changes, and a defect record before any
  pricing **behavior** change.
- `index.html:595`: labor hint markup (finding F2).
- `index.html:1488-1515`: post and gate accounting (F5, F6).
- `index.html:1700-1712`: gate materials-list lines.
- `index.html:3430-3440` and `:3500-3505`: `isFinalReady` and the badge (F3).
- `index.html:3985-3995`: estimate validation (F4).
- `tests/persistence-integrity.spec.js:600-645`: R9 test (F1).
- The `CURRENT_STATE.json` `knownDefects` list.

## Remaining steps — FIX (small, defect-shaped; one PR each)

1. **F2 labor hint shows a literal `$${''}`** (`index.html:595`, static HTML). Replace it with `$`.
   Done when a test asserts the hint text contains `$55/hr`, fails before the fix and passes after.
2. **F1 intermittent null-start crash.** Capture the page-error stack (`page.on('pageerror', e => e.stack)`),
   find the unguarded `.start.x` read, then sanitize non-point `start`/`end` at import.
   Done when R9 passes with `--repeat-each=20` inside the full suite.
3. **F3 FINAL-READY badge appears with 4 validation errors and placeholder pricing**
   (`index.html:3436`, `:3503`). Require validation to pass and non-placeholder pricing; otherwise show
   "Pricing complete · not verified". Done when a red-before test passes.
4. **F4 a customer estimate PDF exports on the shipped placeholder baseline with no warning.** This is a
   pricing-**behavior** change, so record a defect first, then block the export or stamp the PDF the same
   way the NOT FULLY VERIFIED path does. Done when the PDF strings test shows the stamp.
5. **F7 cosmetics:** currency formatting differs (`$1,541` in the app, `$1559` on the PDF); two `0'` origin
   labels overlap; the plan legend lists types the job doesn't use; the validation modal shows raw codes
   (`PROJECT_NAME`). Done when a screenshot check confirms each.
6. **F5/F6 need an owner field ruling before any code:**
   - Gate posts always add +2 with no de-duplication against a coincident fence end post.
   - The plan PDF post summary omits gate posts while the materials list includes them.
   - A gate drawn off the fence line still subtracted 3 ft of fabric (38 LF on 41 LF).
   Ask the owner, record the ruling in the developer log, then write red-before tests.

## Remaining steps — REDO (redesign scope; needs explicit owner feature authorization)

- **Drawing interaction:** drag-per-segment with no hint. Add click-to-chain polylines with double-click to
  finish.
- **Mobile and tablet layout:** at 390 px the canvas is about 85 px wide and the panel covers two-thirds of
  the screen. Needs a responsive rebuild (bottom sheet).
- **Visual system:** 9-11 px grey-on-charcoal text, unlabeled header icons, "Clear" next to "PDF", PNG as the
  primary call to action. Needs a high-contrast or light field theme and an action-hierarchy pass.
- **Plan PDF:** black background, branded "FenceBound" instead of the contractor, no scale bar. Rebuild it
  light-themed and contractor-branded.
- **Estimate PDF:** thin (no scope, drawing or terms). Rebuild it as a real customer quote.
- **Platform:** aerial or parcel underlay, accounts and cloud save (O-5/v6.0), e-signature. This is
  v6.0-level work.

Evidence (screenshots, PDFs, logs) was in the audit session's scratchpad and is not in the repo. Reproduce
it with Playwright, drawing by **drag**: mouse down, move, mouse up.
