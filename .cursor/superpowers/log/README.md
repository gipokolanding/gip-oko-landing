# Daily agent log

The parent agent records completed work in one append-only file per local
calendar day:

```text
YYYY-MM-DD.md
```

Each completed unit adds one block:

```markdown
## HH:MM — Short goal

- Actions: consequential operations
- Files: important created, changed, moved, or deleted paths
- Checks: commands and summarized outcomes
- Decisions: standing decisions and their owning documentation
- Status: done | parked | blocked
```

Write the entry after the unit is complete. Do not log every tool call,
approval message, chain-of-thought, prompt, secret, raw command output,
generated file, or exhaustive path list.

The log is an operational summary, not a Cursor transcript and not a
replacement for specs or implementation plans.
