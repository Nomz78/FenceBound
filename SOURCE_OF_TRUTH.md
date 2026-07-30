# FenceBound source-of-truth map

This repository is the transferable source of truth for FenceBound. GPT and Claude must read this file, the Engineering Bible, and current status before relying on chat memory or external working copies.

## Authority order

1. `Docs/FenceBound_Engineering_Bible_Edition_1.0.md` is the canonical, frozen Edition 1.0 specification; its matching DOCX is a publication representation.
2. `Docs/authoritative/FenceBound_Engineering_Bible_Edition_1.0_Integrated_Governance_2026-07-17.docx` is the approved integrated governance/factual-correction record that supplements the frozen base. It does not silently rewrite Edition 1.0.
3. Accepted Git source, tests, fixtures, and structured data are authoritative for implemented behavior.
4. `Docs/reference/FenceBound_System_Atlas_v0.2.md` and `Docs/FENCEBOUND_REPOSITORY_ORIENTATION.md` explain current placement, ownership, maturity, and navigation; they do not amend doctrine or implementation.
5. Module-local development indexes under `Docs/status/` own local implementation status, defects, tests, and punch lists.
6. Git history preserves accepted engineering history.
7. `Docs/development/DEVELOPER_LOG.md` and completed AI handoffs preserve chronological continuity.
8. Owner decisions explicitly recorded in governance supersede recommendations while preserving the earlier record and stated grounds.

## Classification map

| Classification | Location | Rule |
| --- | --- | --- |
| Authoritative governance | `Docs/` and `Docs/authoritative/` | Read before material work; frozen meaning is not casually edited. |
| Current status | `Docs/status/` | Factual progress record; newer evidence may supersede status details. |
| Current repository orientation | `Docs/FENCEBOUND_REPOSITORY_ORIENTATION.md` | Concise entry map; update only when repository facts change. |
| Current System Atlas | `Docs/reference/FenceBound_System_Atlas_v0.2.md` | Module placement, responsibility, ownership, interfaces, dependencies, and maturity. |
| Development continuity | `Docs/development/` | Append-only Developer Log and compact AI handoff template. |
| Active runtime source | repository root modules and HTML applications | Current committed implementation. |
| Structured data, provisional definitions | `data/dt-001/` | Executable and validated; material definitions remain fixture-bounded/provisional where marked. |
| Research evidence | `research/` and `Docs/research/` | Supports conclusions; does not become product judgment or supplier cost. |
| Test evidence | `test/`, `fixtures/`, and root `test *.js` files | Deterministic regression evidence, not production data. |
| Reference specifications | `Docs/reference/` | Context and handoff material; defer to authoritative governance on conflict. |
| Provisional planning | `Docs/planning/` | Punchlists/budgets are not proof of implementation. |
| Execution records | `Docs/execution/` | Preserved prompts/procedures; completed results and current governance take precedence. |
| Frozen prototype | `FenceboundCAD v5.3.4-embedded-project-index.html` | Forensic/private behavior reference only; no edits, releases, or business reliance. |
| Historical superseded documents | repository-root Development Bible Revisions 24/25 and Git history | Retained for provenance; not current authority. |

The current CAD implementation/status owner is
`Docs/status/FENCEBOUNDCAD_DEVELOPMENT_INDEX.md`. The factual July 29 Engineering
Bible implementation record is
`Docs/status/FenceBound_Engineering_Bible_Implementation_Progress_2026-07-29.md`;
it records implementation and governance conflict without changing frozen
architectural meaning.

The completed NCDOT Division connector handoff is preserved at
`Docs/execution/NCDOT_DIVISION_CONNECTOR_HANDOFF.md`; it is an execution record,
not an active-track declaration.

## Active source contracts

- FenceScraper v3.0 is a multi-file application: its HTML requires `fencescraper-discovery-pure.js` and `fencescraper-market-benchmark-pure.js` as siblings.
- `FenceScraper v2 4.html` is retained as a historical predecessor and is not active implementation.
- NCDOT Division Letting uses the isolated `ncdot-division-connector.js` contract and `scripts/probe-ncdot-division.mjs`; it is classified as stable navigable official HTML.
- Bid tabs are market selling-price evidence, never supplier-cost evidence.
- Unknown values are allowed; hidden uncertainty is not.

## Duplicate and stale-copy policy

The Desktop `Far-Out Fencing` workspace remains external history and was not deleted or moved. Its duplicate program versions, `FenceBoun code` copies, source-refresh package, and duplicate archaeology logs are non-authoritative after this consolidation. New work belongs in this Git repository. Do not synchronize changes back by filename alone; use Git history and this authority map.

## Verification entry points

```bash
python3 data/dt-001/validate_dt001.py
node test/ncdot-division-connector.test.js
node "test bidtab.js"
node "test benchmark.js"
node "test discovery pure.js"
node "test market benchmark pure.js"
```

The clean handoff archive is generated from tracked files only after validation, so `.git`, untracked secrets, dependencies, caches, browser profiles, and generated clutter are excluded by construction.

## Session completion rule

Every future Codex session must:

1. inspect the repository branch, commit, upstream, divergence, and worktree;
2. read the authority files, current orientation, System Atlas, and relevant module index;
3. perform only the approved task;
4. run verification proportionate to the changed behavior;
5. append `Docs/development/DEVELOPER_LOG.md`;
6. update orientation/status only when facts changed;
7. return a standalone AI handoff using `Docs/development/AI_HANDOFF_TEMPLATE.md`; and
8. finish with a clean worktree.
