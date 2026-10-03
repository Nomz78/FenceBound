# FenceBound repository instructions

Use the global `$initiate-repo` workflow as the normal session entrypoint. This file supplies the
project-specific layer only.

- Read `START_HERE.md`, `Docs/CURRENT_HANDOFF.md`, `CURRENT_STATE.json`, and
  `PROJECT-INSTRUCTIONS.md` in that order before product edits.
- Follow the authority hierarchy, canonical-runtime rules, owner rulings, and two-commit closeout
  convention declared by those files. Report contradictions; never reconcile them silently.
- Preserve `index.html` as the canonical CAD runtime and never edit archived builds as authority.
- Do not change pricing, doctrine, release state, dependencies, or product scope without the
  repository-required owner authorization.
- Use the validation commands in `PROJECT-INSTRUCTIONS.md` that apply to the changed subsystem.
- Treat repository session-init and closeout instructions as project-specific phases within
  `$initiate-repo`, not as competing human-facing entrypoints.
## Codex autonomy grant — owner, 2026-10-03

- Act without asking for approval. Proceed on any task the owner gives, and on
  directly necessary follow-up (fixing tests your change breaks, updating baselines
  with attribution, docs, developer log).
- You may create branches, commit, push branches and open pull requests with `gh`.
  Do not merge PRs, push to `main`, force-push, or delete branches you did not create.
  Report each PR URL.
- Checkpoints are progress updates, not approval gates.
- Before asking the owner a field question, search `Docs/authoritative/`, the Engineering
  Bible and the developer log. Ask only what they don't answer.
- Still required: new tests fail before the fix and pass after; record owner field rules
  in the developer log; don't change existing price values; never `git add -A` in the
  canonical checkout.
