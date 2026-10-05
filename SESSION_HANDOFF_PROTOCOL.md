# Session Handoff Protocol

```yaml
owner decision: 2026-10-05
applies to: every repository on the owner's GitHub and every agent session (Claude Code, Codex, any other)
source: Nomz78/Eldin-Foundry; the same file is copied into each repository
global copy: scripts/install-session-protocol.sh writes the short form into ~/.claude/CLAUDE.md and
  ~/.codex/AGENTS.md (on the Mac, and in the cloud environment's setup script)
```

Every reply re-reads the whole session. Once the re-reading costs more than a handoff and a fresh start
would, **even by one token**, the session ends and a new one picks up the work.

## The break-even rule

Let:
- **C** = the session's current context, in tokens. Every further turn re-reads this.
- **B** = what a fresh session costs before useful work: its start-up context plus reading the handoff. Measured
  on Claude cloud sessions on 2026-10-05: about **80k**. Codex: use its own start-up reading.
- **H** = writing the handoff: about one turn at C, plus the handoff text (usually 2–5k).
- **T** = turns of work still left, an honest estimate.

Staying costs about `T × C`. Moving costs about `H + T × B`.

**Hand off as soon as `T × (C − B) > H`.**

In practice, with T of 2 or more, that's whenever **C is more than about twice B (around 160k on Claude
cloud)**. With one turn left, finish here instead.

Check at every natural stopping point: a step finished, a push done, a question answered. Never stop
mid-edit. How to read C:
- **Claude cloud sessions:** `get_session` (claude-code-remote MCP), with no session id, gives
  `external_metadata.context_usage.used_tokens`.
- **Claude Code CLI:** `/context`.
- **Codex:** the context meter in its status line.

Tool output is the fastest way to grow C, so the Token Discipline rules (quiet commands, line ranges, one summary
line per check) delay the handoff. They don't replace it.

## The handoff

1. Commit and push all work. Never hand off uncommitted changes.
2. Write or update the handoff file `handoffs/<AGENT>-NEXT-<topic><round>.md` (in a repo without `handoffs/`,
   use `HANDOFF.md` at the root). It holds:
   - **Current state** first: what's done, with commits, and what's open;
   - what to read first, by path and line range, never "read everything";
   - the remaining steps, each with a "done when";
   - the branch to start from and the branch to push to.
3. Keep it short. The new session should need only the handoff and the files it names.

## Opening the next session

The title follows version control, so the session list reads like a history:

```text
<repo> · <topic> r<round>        e.g.  Eldin-Foundry · custom-village r2
```

- `<repo>` is the repository the session starts in.
- `<topic>` is the same word as the handoff file's topic.
- `<round>` goes up by one each time.
- Explain the title in the reply (explain every name you choose: where it comes from and why it fits).

How:
- **Claude cloud sessions:**
  - `create_session` (claude-code-remote MCP), with `source_url` the repo and `source_revision` the branch
    just pushed;
  - `outcome_branch` the branch the work continues on;
  - `title` as above;
  - a `prompt` that names the handoff file and says to follow this protocol.
  - A session started by another session waits for the owner's go-ahead. Tell the owner the session's
    name and the one line to send it.
- **Codex and the CLI:** print the title and the ready-to-paste prompt for the owner.

Then stop. The old session does no more work, so it adds no more re-reads.
