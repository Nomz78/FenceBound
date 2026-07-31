# FenceBound [workstream] handoff

Read `SOURCE_OF_TRUTH.md` first. This Git branch contains [completed work] and
the minimum approved project context needed by the next GPT or Claude session.

## Outcome

- Objective:
- Classification/status:
- Start and end commits:
- Confirmed defects and repairs:
- Deferred work and owner decisions:
- Scope explicitly not changed:

## Verification

The handoff was gated with:

```bash
[exact commands]
```

Expected and observed totals:

- Baseline/regression suite:
- New defect tests:
- Other validation:
- Worktree status:

## Cold-review package

Provide the reviewer with:

- the feature-branch commit range relative to `origin/main`;
- `git log --oneline origin/main..HEAD`;
- `git diff --stat origin/main..HEAD` and `git diff origin/main..HEAD`;
- exact red-before-fix and green-after-fix evidence;
- persistence-matrix results;
- `SOURCE_OF_TRUTH.md`, `CLAUDE.md`, the developer log, and this handoff.

Review priorities: [risk boundaries, invariants, failure behavior, and any
specific files or functions requiring close inspection].

## Archive contract

If an archive is required, produce it with `git archive`. Include committed
source only; exclude `.git`, dependencies, caches, secrets, browser profiles,
raw captures, and untracked/generated clutter.
