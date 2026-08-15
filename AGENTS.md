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
