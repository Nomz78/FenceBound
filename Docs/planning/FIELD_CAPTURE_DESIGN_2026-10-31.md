# Field data capture — design (2026-10-31)

Status: **design for owner review. Not authorized for implementation.** Basis: `main` `eddb986`; source facts from
`handoffs/CODEX-RESULT-field-survey1.md` (Codex survey, spot-checked by Claude Code).

## Why

Every cost in FenceBound is a list price, an estimate or an inference; the owner has no verified cost history
(`Docs/execution/SESSION_HANDOFF_2026-08-01.md` S4). Published production rates disagree by about 3×
(`Docs/research/2026-10-15_estimator-audit/06-research-methodology.md` 2.1). Data accumulates only from the day
capture ships, so capture is worth more the earlier it starts.

## Owner answers (2026-10-31)

1. Materials: **per estimate line**.
2. Labor: open — "make this an edge". Proposal in §3.
3. Use of the data: open — "pop-ups are annoying, are they useful?" Proposal in §5: no pop-ups.
4. Entry: **on the phone, on site**. The product goal stays "a quote as fast as it can be drawn" (§7).

## 1. The idea: the drawing is the timesheet

Contractors don't fill in timesheets. They already have the job drawn in FenceBound. On site, the foreman opens
the job on the phone, taps **Start day** (crew size remembered from last time), and at the end of the day taps the
runs that got done: **posts set** or **finished**. That's all the day costs them: two taps plus one tap per run.

From that, FenceBound knows, without anyone typing quantities:
- installed LF, posts and gates per day (from the drawing's own counts, `getStats` `byRunId`, `index.html:1944`);
- person-hours per day (crew size × time on site);
- so **hours per LF by fence type**, **hours per post**, **hours per gate**, after a few jobs.

Every competitor that tracks labor asks for a timesheet. Tying hours to the drawn runs gives production rates
broken down by stage and fence type, which is exactly the missing data in the estimator audit (the
post/LF/gate/brace labor model, `00-SUMMARY.md:103`). Optional one-tap condition tags per day (rock, slope, rain,
access) explain outliers without notes.

## 2. Data (one job-level object, `S.actuals`)

```
actuals = {
  crewDefault: 2,
  days: [ { date, crew, start, end, breakMin, tags:[...], note,
            done: [ { runId, stage: 'posts'|'finished' } ], gatesDone:[gateId] } ],
  materials: [ { key, name, unit, estQty, estUnitCost, qty, unitCost, supplier, extra:false } ],
  installedOverride: { [fenceType]: lf },   // as-built differs from drawing
  closedAt: null | ISO
}
```

- **Where it lives:** a sibling of `quote` in the job snapshot (survey §3, first option). It then rides along with
  Saved Jobs, autosave, portable export and full backup with no new store. **Not keyed by job id**, because the id
  changes when a job is renamed and saved (`index.html:3161-3170`, verified). **Not inside `quote`**, because
  Re-price (`btn-reprice` handler) and Clear (`restoreCompanyRateCard`) drop the quote; actuals must survive a re-price.
- **Never touches the company rate card** (v6.0 rule). Actuals are job evidence, not prices.
- **Sanitizer** `sanitizeActuals` in `applyState`: numbers finite and ≥0, crew 1–20, dates ISO, days ≤ 365,
  material lines ≤ 500, note ≤ 500 chars, tags from a fixed list, runIds that no longer exist dropped. Bad
  fields are dropped one by one; the job still loads.
- **Boot rule:** an actuals-only session counts as content (boot `hasContent` check).
- **Undo:** not in history (drawing-only, as with the signature).
- **Size:** about 100 bytes a day and 120 a material line; a 30-day job with 60 lines is under 10 KB. No photos
  in this design (storage budget; survey §4 found no total budget at all).
- **Storage failure:** autosave failures are silent today (`index.html:1096`). A day's log lost on site is the
  worst failure here, so the **Field** tab shows "not saved" when the last write failed. That fix is part of P1.

## 3. Labor capture (phone)

A **Field** tab (phone layout first):
- **Start day / End day** buttons; times editable afterwards. Crew size stepper, default from `crewDefault`.
- **Tap runs on the drawing** to mark today's progress: first tap = posts set, second = finished, third = undo.
  Runs colored by state. Gates tap to done.
- Condition chips: rock, slope, rain, access, other.
- A day can be added after the fact (desk catch-up).

Derived rates (per job, then across jobs) split each day's person-hours over that day's work by the estimate's
own labor shares. The split uses the job's labor lines (`laborBySecC`), so it needs no new constant.

## 4. Material capture (per estimate line)

At closeout, or any time, the **Materials actuals** list is pre-filled from the estimate's material lines
(`computePricing` `matLines`, `index.html:4302`): name, unit, estimated qty and unit cost, taken from the frozen
quote's pricing if the job is quoted, otherwise the current card. The contractor fills in actual qty and unit cost
(or the line total), with "same as estimate" as one tap per line. Lines can be added (extras, returns as negative
qty). Supplier is optional.

## 5. What the data does (no pop-ups)

- **Job report:** estimate vs actual for materials, labor hours, installed LF and margin. It's a section in the
  app and one page in the PDF export, opened on request.
- **Your numbers:** a quiet panel in the rate-card editor. For each rate it shows "your jobs: 0.21 h/LF, 5 jobs,
  range 0.15–0.30" next to the current rate, once ≥3 closed jobs have the type. A **Use this** button copies it
  into the editor; the owner still presses Save. Nothing changes the rate card on its own and nothing pops up.
- **Labor in hours:** the labor model is $/LF today. Hours-per-LF from field data becomes $/LF through the crew
  rate when "Use this" is pressed, so the estimate model doesn't change in this design. A real production model
  (posts + LF + gates) is a later track that this data makes possible.

## 6. Phases (each a PR; tests red before, both gates)

| Phase | Scope | Region | Done when |
|---|---|---|---|
| P1 | `S.actuals`, sanitizer, snapshot, boot rule, Field tab, day log, run taps, save-failure flag | Claude (UI/state) | a day logged on the phone survives reload, Save, export/import; bad actuals load dropped |
| P2 | Materials actuals list from estimate lines | Claude | lines pre-fill from the quote; edits persist |
| P3 | Job report (app section + PDF page), derived rates | Codex (report/PDF) | report figures match a fixture job by hand |
| P4 | "Your numbers" panel across Saved Jobs | Codex calc, Claude UI | ≥3 closed jobs show a rate; "Use this" fills the editor only |

P1 and P2 are what start the data clock; P3 and P4 are only useful once jobs are logged, so they can wait.

## 7. Not in this design

- Photos, GPS, receipts OCR, crew member names or payroll.
- Cloud sync between the foreman's phone and the office. Local-first per REDO 6; until sync exists, the job file
  moves by portable export/import, which carries actuals.
- Fast quoting ("a quote in a minute") and drawing from satellite imagery are product tracks of their own; see
  the priority ranking. Satellite tiles need a paid imagery provider and were left out of scope in REDO 6.

## Owner questions before P1

1. Is "the drawing is the timesheet" the labor approach? (Alternatives: one total per job; a daily log with no
   run taps.)
2. Two stages per run (posts set, finished), or one (finished)?
3. Is the "Your numbers" panel inside the rate-card editor (no pop-ups) right?
