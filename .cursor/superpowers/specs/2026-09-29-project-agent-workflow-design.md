# Project Agent Workflow Design

**Status:** implemented 2026-09-29

## Context

The repository contains a Next.js 16 landing page for ГИП «Око». Its current
agent guidance is incomplete, while parts of `.cursor/rules/superpowers.mdc`,
`.cursor/permissions.json`, and `.cursor/superpowers/README.md` contain
instructions that do not apply to this product or stack.

This design establishes a project-local Superpowers workflow without changing
the landing page. Git is local-only: Evgeniy is the only one who adds a remote
or pushes.

## Goals

- Make `AGENTS.md` the concise, authoritative project contract.
- Adapt the existing Superpowers rule and artifact index to this repository.
- Store approved designs, implementation plans, and daily agent logs under
  `.cursor/superpowers/`.
- Record consequential agent actions in one append-only file per calendar day.
- Replace unrelated commands and product references with this project's
  Next.js commands and paths.
- Keep the workflow usable with local Git and without a remote.

## Non-goals

- Do not add remotes, fetch, pull, push, or change Git configuration. Evgeniy
  pushes to remotes himself.
- Do not add Cursor hooks or automated background logging (use `.cursor/superpowers/log/README.md`).
- Do not log hidden reasoning, prompts, secrets, or raw command output.
- Do not modify landing-page behavior, design, dependencies, or assets without user's approval.
- Do not create remote services or generated documentation without user's approval.

## Artifact ownership

### `AGENTS.md`

`AGENTS.md` remains short and always applicable. It owns:

- product mission and audience;
- technology stack and canonical paths;
- required workflow before editing;
- project constraints, including mobile and reduced-motion support;
- verification commands and Definition of Done;
- a pointer to `.cursor/rules/superpowers.mdc` for process details.

It must refer to `.cursor/docs/brief.md`, the repository-root npm commands,
and `public/models/background-model.glb`.

### `.cursor/rules/superpowers.mdc`

The always-applied rule owns the project-specific Superpowers process:

- check for relevant skills before acting;
- brainstorm before creative work;
- use `.cursor/superpowers/specs/` and `.cursor/superpowers/plans/` instead of
  the default `docs/superpowers/` paths;
- use `.cursor/superpowers/log/YYYY-MM-DD.md` for the daily action log;
- use `.worktrees/` only after Git exists and a task needs isolation;
- keep `.superpowers/` reserved for temporary visual-companion data;
- never assume a remote exists and never push without an explicit request.

All references to unrelated frameworks, products, build targets, tests, and
artifact paths must be removed.

### `.cursor/superpowers/README.md`

The README is the index for this project's:

- design specs;
- implementation plans;
- daily action logs.

It explains naming, lifecycle, and status conventions without listing
artifacts from other repositories.

### `.cursor/superpowers/log/README.md`

The log README is the only owner of the daily entry schema, allowed content,
and exclusions. Active rules point to it instead of copying the format.

### `.cursor/permissions.json`

Permissions must match the actual project:

- allow `npm run dev`, `npm run lint`, and `npm run build`;
- allow local Git inspection and mutation: `status`, `diff`, `log`, `show`,
  `rev-parse`, `init`, `add`, `commit`, `branch`, `checkout`, `switch`,
  `merge`;
- remove commands for tools and scripts that this project does not use;
- continue requiring confirmation for publishing, deployment, remote Git
  operations (`fetch`, `pull`, `push`, remotes), destructive deletion, and
  Git configuration changes.

## Daily action log

The parent agent appends to:

```text
.cursor/superpowers/log/YYYY-MM-DD.md
```

There is exactly one file per local calendar day. The file is tracked with the
other Superpowers artifacts after Git is initialized and is append-only after
creation. Its canonical entry format lives in
`.cursor/superpowers/log/README.md`.

Logging happens at the end of a completed unit of work, not after every tool
call or approval message. Entries omit chain-of-thought, prompt text, secrets,
raw terminal output, generated files, and exhaustive file lists.

The initialization itself creates the first entry in
`.cursor/superpowers/log/2026-09-29.md`.

## Supporting changes

- Add `/.superpowers/` to `.gitignore` because visual-companion files are
  temporary.
- Keep `.cursor/superpowers/` tracked and never ignore it.
- Preserve `.cursor/docs/brief.md`, `.cursor/skills/3d-landing/SKILL.md`, and
  `.cursor/commands/save-chat-text.md`.
- Local Git exists from 2026-10-05 on branch `gip-oko-landing-dev`. Agents may
  commit locally. Evgeniy is the only one who adds a remote or pushes.

## Validation

The implementation is complete when:

1. Every project workflow file refers only to the actual ГИП «Око» landing stack,
   commands, skills, and artifact paths.
2. Rule frontmatter is valid and `alwaysApply: true`.
3. The artifact README links to this design and to the daily log directory.
4. The dated log exists and contains an initialization entry in the specified
   format.
5. `.superpowers/` is ignored while `.cursor/superpowers/` is not.
6. Permission entries match scripts that exist in `package.json`.
7. `npm run lint` passes.
8. `npm run build` passes and exports the GLB below the 5 MB limit.

## Error handling

- If verification fails, record the failing check as `blocked` and do not
  describe the initialization as complete.
- If a remote Git step is requested, stop and leave push, fetch, pull, and
  remotes to Evgeniy unless he explicitly asks for that operation.
- If a future standing decision has no clear owner, ask Evgeniy before adding
  another permanent rule or skill.
