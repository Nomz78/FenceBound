# Priority ranking — order of operations (2026-10-31)

Status: **recommendation for owner decision.** Nothing here is authorized by being listed. Inventory source:
`handoffs/CODEX-RESULT-field-survey1.md` §5 (each item's doc reference is there). Basis: `main` `eddb986`.

## How it is ordered

1. **What starts a clock first.** Field data only exists from the day capture ships.
2. **Product-market fit.** The owner's stated edge: a contractor gets a quote as fast as the job can be drawn.
3. **Risk to data already entered** before new features.
4. **Gated items last**: things that need field data, a CPA, an attorney, or a v6.0 redesign.

## Ranked

| # | Track | Why here | Size |
|---|---|---|---|
| 1 | **Field capture P1–P2** (`FIELD_CAPTURE_DESIGN_2026-10-31.md`): day log with run taps, materials per estimate line, save-failure flag | Starts the data clock; every later pricing improvement depends on it | 2 PRs |
| 2 | **Time-to-quote pass**: measure taps/seconds from a blank job to the estimate PDF on the phone, then fix the slowest steps. Candidates already recorded: typed dimensions/angles, shared corners, house-wall termination, equal bays; job templates (last job's specs) | The edge the owner named. Measure first so fixes are chosen by evidence | measure 1 session, fixes 1–3 PRs |
| 3 | **CAD audit reconciliation**: reproduce the 11 historical CAD items (T-junction duplicate posts, preview post counts, zoom anchor, Move touch undo…) and close or repair each | Wrong post counts are wrong money; also feeds #2 | 1 audit + repairs |
| 4 | **F13 hours override drops gate labor**: owner ruling, then a defect repair if confirmed | Field data will make hours-based labor more common, so this edge case becomes common | small |
| 5 | **Field capture P3–P4**: job report, "Your numbers" | Only useful once a few jobs are logged; build them while that data comes in | 2 PRs |
| 6 | **Storage robustness**: no total budget, imported underlay uncapped, quota failures handled per path | Actuals and signatures add data; a full browser store loses work | 1 PR |
| 7 | **Quote business rules**: quote numbers/revisions, expiry date, payment schedule, change orders, overhead/margin floor, minimum charge | What a contractor needs once quotes go out regularly | 2–3 PRs |
| 8 | **Labor production model** (per post/hole, per LF, per gate/brace, mobilization) | Needs #1's data to be calibrated rather than guessed | after ~10 logged jobs |
| 9 | **Hardware/spec rules** (gate kits, trusses, wood board/fasteners, footing >42 in, vinyl defaults…) | Accuracy work; best done against field-checked jobs | many small |
| 10 | **E-sign audit trail** (see below) | Low risk today; cheap to add later | 1 PR |
| 11 | **Release polish**: F7d hide raw validation codes, PDF accent contrast, offline/standalone delivery, quick-start | Before a public release, not before then | small each |
| — | **Gated, not ranked**: NC sales tax (needs CPA/NC DOR ruling); FenceScraper (needs field data first); v6.0 engine O-3/O-5 (versioned price book, full-state undo); cloud sync/accounts and satellite drawing (paid providers, outside local-first scope) | | |
| — | **Owner rulings pending**: O-6 continuity branch; F7d timing; line-post concrete owner wall; F13 semantics | | |

## E-sign audit trail, in plain terms

Today a signed estimate holds the drawn signature, the typed name, the date and the total signed for. An
**audit trail** adds evidence that *this* person signed *this* document: a fingerprint (hash) of the exact
estimate, the time to the second, and usually the signer's email or phone. It only matters if a customer later
says "I never signed that" or "that's not the price I agreed to". For a small fence contractor with deposits up
front, that's rare, and the drawn signature plus the total already covers the "wrong price" case. It's cheap to
add later (one PR) and has no data dependency, so it sits low. If you ever have a signature dispute, ask an
attorney what evidence holds up in NC; don't rely on this ranking for that.

## Suggested next two tracks

- **Claude:** Field capture P1 (state, Field tab, day log, run taps).
- **Codex:** Time-to-quote measurement (read-only: a scripted Playwright walk of a typical job on the phone
  viewport counting actions, plus a ranked list of the slowest steps). Runs in parallel without touching P1's
  region.
