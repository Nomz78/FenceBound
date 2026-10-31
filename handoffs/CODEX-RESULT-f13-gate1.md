# F13 gate labor under hours override — round 1 result (Codex)

## Current state

Implemented, uncommitted on `codex/f13-gate1`, based on `f4ece25be17ea5e9ba951212246b9735158222b1`.
F13 is the pricing audit finding; `gate1` is the assigned repair's first round.
Coordinator commits ("Implemented by Codex") and pushes to `fix/f13-hours-gate-labor`.

- `index.html`: moved the existing gate-install calculation and owner-section allocation outside the
  per-LF branch. Hours replace per-LF labor; gate install remains in either mode. No rate values changed.
- `tests/f13-hours-gate-labor.spec.js`: one chain-link run, one attached walk gate, 0.5 hours; checks both
  labor lines, their cents, crew-plus-gate labor cost, and the owning section's materials plus marked-up labor.
- `Docs/development/DEVELOPER_LOG.md`: records the supplied owner ruling and this repair's evidence.

## Verification

Tested working tree over the base HEAD above, not a new commit; logs are outside the repository.
- Red: `npx playwright test tests/f13-hours-gate-labor.spec.js` — 1 failed because Walk Gate install was absent.
  Log: `/tmp/f13-gate1-red.log`.
- Green: same command — 1 passed. Log: `/tmp/f13-gate1-green.log`.
- Full gate (2026-10-31): `npx playwright test` — 258/258 passed (4.2m);
  `node scripts/cad-persistence-matrix.js` — 12/12 passed.
  Logs: `/tmp/f13-gate1-playwright.log`, `/tmp/f13-gate1-matrix.log`.
- `git diff --check` — clean. Existing tests encoding the old drop: none found; none changed.

## Open / coordinator closeout

- Empty-drawing hours total with no PDF lines (F13 bullet 3) remains out of scope.
- Hours relabelling remains out of scope: supplied ruling says `crewHourlyRate` is per person-hour;
  crew × days belongs to quick quote Q2.
- Startup audit: actual branch/base match the task. State/current-handoff metadata still record main at
  `56c5d9f`; local origin/main is five commits ahead of this requested base. Only the supplied NEXT handoff
  was initially untracked. Runtime/schema remain 5.4.0/3. No branch update or status rewrite was attempted.
- The supplied handoff cites a duo r2 owner ruling not yet present in this branch's developer log;
  its provenance is recorded in the new log entry. Tier-1 and SOURCE_OF_TRUTH authority order also disagree;
  no doctrine change or silent reconciliation was made. Global `initiate-repo` skill was absent locally;
  repository initialization was run directly.
- Coordinator owns commits, push and normal state/current-handoff closeout; owner requested this work stay
  uncommitted and scoped to the supplied handoff.
