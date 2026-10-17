# FenceBound market readiness and completion estimate

Assessment date: 2026-10-15. Runtime examined: `index.html`, application 5.4.0,
schema 3, commit `424750b06ef876b826a26329d0fc3f13bd583435` on `codex/counting-c0`.
Classification: research and proposed execution plan, not a release certification or
an amendment to owner field rules. No runtime, prices, dependencies or tests changed.

FenceBound is approximately **60% of the way to a bounded contractor pilot**, **50%
to a defensible release covering all 14 current fence types**, and **40% to the wider
CAD, estimating and documentation scope recorded in the repository**. These are
engineering judgments against the acceptance criteria below, with about ±10 percentage
points of uncertainty for the pilot and ±15 for the wider targets. They are not
percentages of code written, test pass rates, or measured development velocity.

The first release remains blocked by reproduced pricing and data-integrity failures.
The existing application and regression suite are substantial foundations. A complete
rewrite is not necessary to repair the immediate failures, and would add migration risk.

## Product and release boundaries

The owner selected a contractor pilot first: reliable CAD, quantities, contractor-entered
prices, estimates and exports, with manual onboarding. The longer-term goal is the
repository's full applicable product scope. The owner also confirmed that AI is used to
build the software; the delivered program must run independently of AI and API pulls.

The [ratified port authority](../authoritative/FenceBound_Engineering_Bible_v5.4.0_Port_Authority_2026-08-28.md)
defines a self-contained HTML application, a perpetual license, and optional paid major
upgrades. Accounts, subscriptions, license checks, servers and cloud synchronization
are excluded. FenceScraper is a separate product. The estimates do not add a SaaS platform.

The pilot estimate assumes a **declared, limited set of documented assemblies**, with
residential chain link and limited walk/double gate variants as the proposed first set.
The exact supported set has not been selected. A pilot promising all 14 generic types
must use the larger all-types estimate. Unsupported configurations must remain visibly
unverified; reducing the supported set does not complete the broader product.

The wider target includes applicable Engineering Bible goals, current deferred CAD and
estimating capabilities, and durable quote/revision/document behavior. Research proposals
are not automatically ratified requirements. Aerial tracing, richer labor/policy models,
and a v6 engine structure need explicit scope acceptance before implementation. This
assessment budgets a bounded version of those capabilities, not every possible future
idea in the repository or commercial feature parity with every competitor.

## Completion rubric

Scores estimate how much of each release capability is implemented and credibly verified.
Weights reflect the cost of wrong orders, wrong money and lost jobs. They are proposed
planning weights, not measured probabilities. A critical defect blocks release even when
the weighted score is high.

| Capability | Weight | Limited pilot | All 14 current types | Wider repository goal |
|---|---:|---:|---:|---:|
| CAD, ownership, parameter propagation and autofill | 20% | 80% | 70% | 55% |
| Supported assemblies and independently justified quantities | 25% | 55% | 35% | 30% |
| Price units, extensions, variants and quote correctness | 20% | 65% | 55% | 35% |
| Job persistence, company data, import and recovery | 10% | 65% | 65% | 45% |
| Purchasable quantities and consistent customer/installer outputs | 15% | 50% | 45% | 30% |
| Standalone packaging, onboarding and release acceptance | 10% | 30% | 30% | 25% |
| Weighted score | 100% | 59.75% | 50% | 37% |

Report these as approximately **60%, 50%, and 40%**, not as decimal precision. Wider
scope reduces the denominator coverage: saved input snapshots, for example, are useful
pilot functionality but do not fulfill the broader requirement for reproducible issued
quotes across engine changes. No historical throughput baseline supports a credible
percentage-completed-per-week claim yet. Re-estimate after five focused implementation
days using completed acceptance cases and remaining work, not commits or lines of code.

## Current experimental evidence

- Full `npm test`: **172/172 passed in 6.7 minutes** in this session, including PDF tests,
  using the ordinary repository configuration over HTTP.
- `node scripts/cad-persistence-matrix.js`: 12/12 passed in this session.
- Additional deterministic matrix: **140 cases, 700 checks, zero failures** across all
  14 fence types, five lengths (24, 42.25, 100, 168 and 501.5 LF), with/without a walk
  gate. Checked finite nonnegative quantities, integer cents, repeated calculation,
  save/apply round trips and the profit identity. This tests consistency, not whether
  the selected materials form a valid installation.
- Four targeted HTTP browser probes reproduced the money/state failures below.
- A parameter probe confirmed a 24 LF vinyl run retains three panel units when spacing
  changes from 8 ft to 6 ft, although the drawing gains a fourth bay. Pricing reports
  FINAL-READY and project validation emits no warning for this combination. The generic
  panel model lacks a compatibility check or explicit cut/assembly interpretation.
- A fresh-default type-switch probe confirmed vinyl split rail inherits 48-inch height
  after chain link and 96-inch height after eight-foot vinyl privacy. No product-specific
  default was selected. This is a parameter ambiguity, not proof which height is correct.
- `npm run session:init`: existing drift; actual branch/head differ from recorded state.
  Changes between recorded `ea67c4e` and current HEAD are documentation only. No current
  GitHub pull requests were open at the read-only status check.

Scratch evidence remains outside the repository under `/tmp/fencebound-readiness-*` and
`/tmp/fencebound-market-readiness-*`. The essential repro inputs and observed outputs
are recorded below because scratch files are not durable evidence archives. No external
services, accounts or customer data were modified.

## Release blockers and existing foundations

| Finding | Current evidence | Required result |
|---|---|---|
| Automatic quantities accept mismatched price units | In an isolated HTTP context, a 100 LF chain-link run with CSV fabric price $160/roll becomes $16,000 of fabric cost, with no unit warning and `isFinalReady=true`. CSV normalizes roll to coil. `computePricing`, `index.html:3799`, restricts the unit guard to manual items. | Apply unit validation to every line. Convert only with an explicit product/pack relationship; otherwise mark the quote unverified. Without a roll length, no correct converted total can be inferred. |
| JSON price import contaminates the company rate card | Company fabric price 222, loaded historical job price 111; JSON containing only markup persists fabric at 111, clears provenance, and asks for no confirmation. Import handler at `index.html:4479`. | Import against the intended company/project object, retain provenance, confirm replacement where required, and roll back failed persistence. |
| Failed portable import partially replaces the job | Incoming `specs.addons={}` produces an import-failed message after replacing the current project name with the incoming name. `applyState` starts at `index.html:947`; import applies it before later failure at `3348`. | Validate/stage the incoming job before replacement; failure preserves the complete old job and pricing state. |
| Sub-cent hardware costs are silently rounded too early | Manual item 1,000 ea at $0.014/ea extends to $10 rather than $14, with `isFinalReady=true`. `centsOf` at `index.html:3735` rounds the unit first. | Define supported precision, extend before final cent rounding, or explicitly reject unsupported precision. No supplier price values need to change. |
| Different material variants share one price identity | 48-inch and 72-inch fabric use the same cost key; generic posts and gate kits similarly collapse physical variants. See `calcAutoMaterials`, `DEFAULT_COST_DB`, `GATE_COST_KEYS`. | Preserve explicit product/variant identity through quantities, editor, imports, saved jobs and outputs. |
| Generic gates are treated as complete for every material | `index.html:2026` emits opaque gate kits and pipe-style posts/concrete across materials. All-type goldens lock this current output. | Select supported gate assemblies with known width/height limits and kit contents; unresolved assemblies remain unverified. |
| Editable parameters can produce incompatible quantities | 24 LF vinyl spacing probe above; vinyl ranch types also lack an explicit default height. Some diameter controls do not change depth-table concrete quantities. | Every control must have a defined effect or an explicit restriction; changed drawing dimensions must agree with assembly counts. |
| Purchasing is incomplete | C1–C3 in `HANDOFF.md` remain unfinished: pack sizes, waste and material-order output. Current BOM quantities are not necessarily purchasable units. | Show needed and ordered quantities, preserve price units, and export exactly the order displayed. |
| Quotes are recomputed across software changes | Saved jobs store inputs/prices, not frozen calculated lines and engine version. PDF issue/expiry dates derive from export time. | Preserve issued quote evidence and revisions; separate a recalculation from reproducing an issued quote. |
| Standalone release and recovery need hardening | jsPDF loads from cdnjs at `index.html:3629`; job deletion at `2884` lacks the ratified confirmation; autosave storage failures at `1004` are silent. | Offline PDF capability, safe destructive actions, visible storage failure and tested backup/upgrade recovery. |

The first four are reproduced behavior. Other entries combine direct source evidence,
the parameter experiment and explicit missing capabilities; they are not all independently
reproduced failures. Line numbers identify the examined commit and may move after edits.

Existing foundations should be preserved: exact-key matching, input guards, gate/run
ownership, post rebuilding, undo regressions, per-job prices and upcharges, company
profile, CSV preview/import, backups, integer-cent totals, and section/PDF reconciliation.
The old audit's roughly 55 bugs is not a current open-bug count: many were repaired.

The hardware reference contains 142 golden BOM rows: 20 matches, 21 owner choices,
three conditional source mismatches and 98 unverified rows. This is an evidence coverage
inventory, not 98 independent software defects. Repeated missing product definitions
account for many rows. A current-output golden is not independent proof of correctness.

## Finishing without more owner field knowledge

The four reproduced software defects, deterministic quantity/price contracts, parameter
isolation, imports, backup, pack/waste calculations and exports can be repaired without
any more field knowledge from the owner.

Public manufacturer installation guides can define named assemblies, product dimensions,
fastener schedules and kit contents. Store their identity and revision with the supported
configuration. Distinguish required quantities from contractor overrides and make every
override visible in the estimate. The owner does not need to become the sole supplier
of every trade rule.

Public competitor documentation supports the intended workflow, not FenceBound's hardware
counts. [Fence Cloud](https://fence.cloud/materials) describes material-specific engines,
gate kits, stiffeners and accessories. [ArcSite's takeoff export guide](https://support.arcsite.com/en/articles/7258285-export-takeoff-from-multiple-drawings-flat-and-structured-view)
describes consolidated lists for pricing, ordering and suppliers. These are useful scope
benchmarks; they do not establish the quantity of a FenceBound fitting.

Internet research cannot establish the actual unknown product on a job, determine
site-specific suitability, or erase contradictory owner rules. Existing material
contradictions include:

- The port authority requires concrete for line posts; current runtime uses zero and
  later handoffs preserve this as an unresolved ruling.
- C4 describes house endpoints without posts/concrete, while the ratified 168 LF fixture
  includes two house terminal posts. Wall attachment and a terminal beside a house are
  different configurations; neither should silently overwrite the other.
- Deep footing extrapolation and some truss/stock/6-plus-1 rules remain unresolved or
  inconsistent across authority and runtime.

The proposed way forward is to represent distinct documented installation configurations,
retain original owner rules with provenance, and refuse to certify unsupported combinations.
This is a product-model proposal, not authorization to amend doctrine. An owner can approve
that product approach without supplying additional installation facts.

Purchasing also needs different policies for different materials. Bulk fasteners can often
round across the job; cut panels and rails may need section-level planning. The reference's
40/26/18 LF hog-panel sections need 7 sixteen-foot panels without offcut reuse, whereas
`ceil(84/16)` yields 6. A universal whole-job ceiling would introduce another count defect.

Independent contractor or distributor checks of completed sample orders remain desirable
before broad paid release. They can come from someone other than the owner. If no human
field validation is available at all, we can finish a documented-system software pilot,
but cannot truthfully certify unrestricted field accuracy. No finite coding estimate can
remove that evidence limit.

## Remaining work and estimated effort

Assumption: one lead implementation stream assisted by AI, parallel bounded research and
independent review, no further owner field input, existing tests and architecture retained,
and no new scope added during the pilot. One engineering day means approximately six
productive engineering hours, including tests, diagnosis, integration and review. It is
not six hours of unattended model output. Estimates are task-based judgment, not a
throughput measurement or a fixed delivery commitment.

| Pilot work package | Engineering days | Completion condition |
|---|---:|---|
| Select supported assemblies and freeze acceptance examples | 2–3 | Explicit supported combinations, independently derived expected orders, unresolved configurations labeled |
| Repair reproduced money and import failures | 3–5 | Each counterexample fails before repair and passes after; company/job state preserved under failure |
| Connect product identity, parameters, gates and autofill | 5–8 | Drawing, variant, quantities and price identity agree for every supported pilot configuration |
| Implement packs, waste and order export | 4–6 | Needed/order/cost units agree; section-aware purchases; screen, CSV and PDF reconcile |
| Harden persistence and standalone delivery | 3–5 | Offline export, storage failure handling, destructive confirmations, backup/upgrade and quick-start |
| Independent acceptance and pilot corrections | 3–8 | Supported-job examples, mixed variants, topology changes, failure injection and customer workflow meet the release gate |
| Total pilot | **20–35** | **120–210 focused hours** |

| Milestone measured from today | Cumulative engineering days | Cumulative focused hours | Calendar at five engineering days per week |
|---|---:|---:|---|
| Limited contractor pilot | 20–35 | 120–210 | About **5–9 weeks**, allowing 1–2 weeks for pilot feedback |
| Defensible coverage of all 14 current types | 45–75 | 270–450 | About **11–18 weeks**, allowing 2–3 weeks for review/feedback |
| Wider applicable repository scope | 75–120 | 450–720 | About **4–7 months**, including integration and acceptance allowance |

These are cumulative alternatives, not three amounts to add together. All-type work adds
manufacturer/variant selection, non-chain-link gates, broader topology and parameter
acceptance, migrations and procurement rules. Wider work adds quote snapshots/revisions,
deferred CAD and economic-model features, richer installer outputs, and applicable
scope accepted from the Bible and audit proposals. It does not include FenceScraper,
SaaS, real-time vendor price feeds or an in-product AI dependency.

At two engineering days per week, pilot implementation alone takes approximately 10–18
weeks before feedback waiting time. More agents can shorten independent research and
review; interdependent runtime changes still require integration and regression checks.
Adding every proposed feature before the first pilot, requiring arbitrary unknown product
support, or finding a need for a broad model migration would invalidate the lower bounds.

## Execution experiment and release gate

The next implementation experiment should be capped at **five focused engineering days**,
with ranked targets: first the automatic-unit and company-card failures, then portable
import atomicity and sub-cent precision, each with a failure-path regression. If time
remains, select one supported assembly and begin its drawing-to-export acceptance case.
The cap is a measurement checkpoint, not a promise that all four repairs and assembly
validation fit in five days. Record completed and remaining acceptance cases, actual
effort, regressions and newly discovered dependencies, then reforecast. Do not spend the
batch repeating the broad audit or rewriting the whole engine.

A pilot is ready only when:

1. All four reproduced money/state failures are repaired or visibly rejected at input.
2. Each supported assembly has a source-based expected material order, including gates,
   corners, supported terminations, height variants and concrete; unsupported cases are
   clearly unverified under the existing warn-not-block export policy.
3. Parameter changes and geometry edits preserve compatibility through undo, save/load,
   mixed-system jobs and migration. No unexplained quantity or price changes remain.
4. Needed, order and price units reconcile, including packs, waste, stock cuts and manual
   items. Exported values match on-screen values.
5. Failed import/save/restore cannot silently replace or lose accepted data; recovery and
   issued quote behavior are explicit and tested.
6. The delivered package works without AI, API calls or CDN access, on declared supported
   browsers, with a sample job, quick-start, backup procedure and support path.
7. Independent review has no unresolved critical finding and pilot users can complete the
   supported workflow. The owner separately decides commercial release and distribution.

No commits, pushes, PR creation, deployment or release promotion are part of this
assessment. `Docs/CURRENT_HANDOFF.md` and `CURRENT_STATE.json` remain stale; this report
does not silently rewrite their metadata or replace the canonical handoff.

Independent review checked the scope, evidence qualifications, score arithmetic and
calendar estimates. Its supported finding was repaired: the five-day experiment is a
ranked timebox rather than a guaranteed batch of repairs plus assembly validation.
The reviewer did not certify the forecast as measured throughput or field accuracy.
