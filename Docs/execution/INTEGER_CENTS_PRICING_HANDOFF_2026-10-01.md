# FenceBound integer-cents pricing handoff

Read `SOURCE_OF_TRUTH.md` first. Branch `fix/integer-cents-pricing` integrates an
inbound external proposal (integer-cents money math, a truss-rod connector cost
seed, and an add-material row in the cost editor) and repairs two defects found
while evaluating it.

## Outcome

- Objective: evaluate and integrate the owner-supplied proposal
  `fencebound-proposal-files.zip`, then open a pull request (owner direction,
  2026-10-01).
- Classification/status: candidate on a feature branch, pending owner review.
  Not merged and not a release candidate.
- Start and end commits: `1c88660` (main) → `a6bb2fb` (proposal as delivered)
  → `c271e98` (defect repairs). The documentation closeout commit follows.
- Inbound file identification:
  - `fencebound-proposal-files.zip`: SHA-256
    `4d8f4c59f7399e444fc2bbd200b1a581ebd0769fda47f829093738d6b15f4070`,
    85,810 bytes.
  - `index.html`: `7306872286da009306db20a7510a6956ce1447c13a7c86fda03bd686539d8211`.
  - `tests/persistence-integrity.spec.js`:
    `5ff7dee5ae44cfdff884d5d45e9d049c4217b86612c62b4e2a1ebb3aedfd0760`.
  - `tests/pricing-cents.spec.js`:
    `f79d8e46647948441058e02fcea8368c1401a95689789b101dcc94723fb49e78`.
  - `PROPOSAL_NOTES.md`:
    `5f2955b1f56ff00785cb94c0ca2eff768f84cc95c2d4a67ef008921590dcad82`.
    It was not committed; its substance is recorded here.
  - The inbound `index.html` diff against main `1c88660` contained only the
    described changes.
- Confirmed defects and repairs:
  1. **MISSING_COST for the truss-rod connector.** On main, chain-link with
     a mid rail and truss rod emits `Truss Rod Connector (turnbuckle-style,
     threaded)`. No `lookupCost` route resolves it, so the job can never be
     final-ready. The proposal adds the `'truss rod connector'` key to
     `DEFAULT_COST_DB`. Saved rate cards merge over the defaults, so existing
     users also get the key.
  2. **Float money.** `computePricing()` returned unrounded binary-float
     dollars (R15 `386.195`). Money is now integer cents, rounded half-up per
     line. Dollar fields keep their names, and a `cents` block carries the
     canonical integers. Client material price is now the sum of per-line
     client extensions instead of markup × summed cost. R15 moves from
     `386.195` to `386.22` (38622 cents).
  3. **No way to add a material in the cost editor.** The proposal adds an
     "Add a material" row.
  4. **Defect found in the proposal: demo cost dropped from the client
     price.** The cents rewrite summed only BOM-line extensions into
     `matPriceC`. Demo/haul cost has no BOM line, so it lost its markup and
     its place in the client price: −$243.00 on a 60 LF job. It is now
     added at material markup. Test C4 was red on the proposal and is green
     after the repair.
  5. **Defect found in the proposal: Add bypassed Cancel.** Add wrote
     straight into the live `COST_DB`, even though the toast says the
     material "joins your rate card on Save". Additions are now staged and
     applied on Save, and the row label is escaped. C5 was red on the
     proposal and is green after the repair. C3 now asserts staging, Save
     and persistence.
- Deferred work and owner decisions:
  - **Owner decision: the `$2.50/ea` truss-rod connector seed is a
    provisional placeholder from the proposal, not field or supplier data.**
    It is a new seed value; no existing value changed. Either ratify it or
    replace it with a supplier cost.
  - **Owner decision: ratify R15 = `386.22`.** It replaces the earlier
    owner-ratified `386.195`. The change comes only from rounding; the
    quantities are unchanged.
  - Field question, not decided here: whether `truss rod w tightener` plus a
    separate connector double-counts hardware. This BOM line predates this
    branch.
  - The add-material row is feature work. It is included under the owner's
    instruction to integrate this proposal; it is not a general feature
    authorization.
- Scope explicitly not changed: takeoff quantities, existing seed prices,
  labor rates, markups, persistence formats, saved-job schema, CSV/JSON
  formats, retail reference, FenceScraper. `CURRENT_STATE.json` and
  `Docs/CURRENT_HANDOFF.md` still describe main; update them at merge.

## Verification

Verification was run in a cloud container. Playwright's pinned Chromium
(1091) is absent there, so tests used the preinstalled Chromium 1194 through
a scratch config outside the working tree. cdnjs was blocked (HTTP 403), so
every test that waits on `window.jspdf` times out. Those tests are classified
as environmental by comparing the failure set against unmodified main in the
same environment.

```bash
npx playwright test                         # scratch config, executablePath override
node scripts/cad-persistence-matrix.js      # launch executablePath preload
node --check <extracted index.html scripts>
node --check tests/pricing-cents.spec.js tests/persistence-integrity.spec.js
git diff --check
```

Expected and observed totals:

- Baseline on main `1c88660`: 42 passed and 29 failed. All 29 are
  jsPDF/cdnjs timeouts.
- Branch at `c271e98`: 47 passed and 29 failed (76 tests, 5 new). The
  failure set matches main by test name. All 29 are
  `page.waitForFunction` jsPDF timeouts, so no regression was found.
- New defect tests:
  - On main, C1–C5 are all red. C1 reports `unknown: ["Truss Rod Connector
    (turnbuckle-style, threaded)"]`.
  - On the proposal as delivered, C4 is red (expected 24300, received 0).
    C5 is red (the cancelled key stays in `COST_DB`), and the revised C3 is
    red.
  - After the repair, C1–C5 are green.
- Persistence matrix: 12/12 pass.
- Syntax checks and `git diff --check` pass.
- Worktree status: clean after commit.

**Owner action:** run `npm test` on a machine with cdnjs access to cover the
29 PDF-path tests before merging.

## Cold-review package

- `git log --oneline origin/main..fix/integer-cents-pricing`
- `git diff origin/main..fix/integer-cents-pricing`

Review priorities:

- the `computePricing()` cents block: every cost component reaches both
  `internalCost` and `clientTotal`;
- the per-line versus aggregate markup convention;
- the `unavailableExportPricing()` shape;
- the cost editor's staged additions on the Save, Cancel, Reset and Import
  paths.
