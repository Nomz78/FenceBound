# FenceBound — start here

FenceBound is a contractor-focused CAD and estimating platform for turning fence drawings into layouts, BOMs, pricing, estimates, and installation documents.

## Current repository identity

- Canonical repository: `~/Developer/FenceBound` (filesystem path: `/Users/altairus78/developer/FenceBound`)
- Canonical branch: `main`
- Canonical runtime: [`index.html`](index.html)
- Application version: `5.3.8-release-validation`
- Saved-state schema: `3`

Run this read-only check before every session:

```bash
npm run session:init
```

The command verifies Git and runtime state, reports drift, and prints the compact bootstrap from the current handoff. It does not edit, fetch, start the app, or run tests.

## Reading order

### Tier 1: always read

1. [`START_HERE.md`](START_HERE.md)
2. [`Docs/CURRENT_HANDOFF.md`](Docs/CURRENT_HANDOFF.md)
3. [`CURRENT_STATE.json`](CURRENT_STATE.json)
4. [`PROJECT-INSTRUCTIONS.md`](PROJECT-INSTRUCTIONS.md)

### Tier 2: read relevant sections

- Engineering Bible: [`Docs/FenceBound_Engineering_Bible_Edition_1.0.md`](Docs/FenceBound_Engineering_Bible_Edition_1.0.md)
- System Atlas: [`Docs/reference/FenceBound_System_Atlas_v0.1.docx`](Docs/reference/FenceBound_System_Atlas_v0.1.docx)
- Development Index: the embedded `FenceboundCAD Development Index` in [`index.html`](index.html); it is known to contain stale v5.3.4 status metadata
- Repository Orientation: not present on `main`; an unmerged continuity branch contains a candidate and owner ruling O-6 controls its disposition

### Tier 3: reference only

- [`Docs/handoffs/`](Docs/handoffs/)
- [`Docs/execution/`](Docs/execution/) historical execution records
- [`archive/`](archive/) archived builds
- superseded release notes, rejected proposals, and obsolete experiments

## Authority hierarchy

1. Tested repository behavior is implementation truth.
2. The canonical runtime is active application authority.
3. The frozen Engineering Bible plus ratified supplements govern doctrine and design intent.
4. The System Atlas provides architecture and orientation, with its draft/provisional labels preserved.
5. The Development Index records local subsystem status; contradictions must be reported.
6. [`Docs/CURRENT_HANDOFF.md`](Docs/CURRENT_HANDOFF.md) records the latest verified session boundary.
7. [`CURRENT_STATE.json`](CURRENT_STATE.json) indexes machine-readable current state.
8. Historical handoffs and archived releases are reference only.

[`SOURCE_OF_TRUTH.md`](SOURCE_OF_TRUTH.md) remains the detailed classification map. Owner decisions supersede recommendations. Never silently reconcile a disagreement.

## Commit-order convention

FenceBound uses a two-commit closeout to avoid asking a tracked file to contain its own unknowable commit hash:

1. Commit implementation and infrastructure, then run the required gate on that commit. Record it as `head`, `testedHead`, and `repositoryHeadAtGeneration`.
2. Make one documentation-closeout commit limited to the state, current/archive handoffs, and session log. Its parent must be the recorded head.

Initialization treats that direct, allowlisted documentation child as current. Any additional commit, non-allowlisted closeout change, or mismatch is drift. The actual closeout commit is always observable as Git `HEAD`; the handoff records the implementation/test commit it describes.

Do not edit archived or generated files as authority. Verify the repository before coding. Session start and close procedures are in [`PROJECT-INSTRUCTIONS.md`](PROJECT-INSTRUCTIONS.md).
