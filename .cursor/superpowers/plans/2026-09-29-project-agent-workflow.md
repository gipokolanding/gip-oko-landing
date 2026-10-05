# Project Agent Workflow Implementation Plan

> **Status:** executed 2026-09-29. History only — do not re-run.

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> `superpowers:subagent-driven-development` or `superpowers:executing-plans`
> to implement this plan task-by-task. Read
> `.cursor/skills/3d-landing/SKILL.md` before editing.

**Goal:** Replace copied project instructions with a coherent Superpowers
workflow for the ГИП «Око» Next.js landing.

**Architecture:** Keep the concise product contract in `AGENTS.md`; keep
Superpowers lifecycle rules in `.cursor/rules/superpowers.mdc`; keep indexed
specs, plans, and one append-only daily log under `.cursor/superpowers/`.
Permissions expose only commands used by this repository.

**Tech Stack:** Markdown, Cursor `.mdc` rules, JSON permissions, Next.js 16,
npm.

**Spec:** `.cursor/superpowers/specs/2026-09-29-project-agent-workflow-design.md`

## Global Constraints

- Do not initialize Git, stage files, commit, add remotes, or push.
- Do not change landing-page behavior, dependencies, or assets.
- Do not add hooks or background logging.
- Do not record chain-of-thought, prompts, secrets, or raw terminal output.
- Store specs, plans, and logs only under `.cursor/superpowers/`.
- Use one append-only log file per local day:
  `.cursor/superpowers/log/YYYY-MM-DD.md`.

---

### Task 1: Replace unrelated workflow documentation

**Files:**
- Modify: `AGENTS.md`
- Modify: `.cursor/rules/superpowers.mdc`
- Modify: `.cursor/superpowers/README.md`
- Modify: `.cursor/superpowers/log/README.md`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: approved artifact ownership and log format from the design spec.
- Produces: one project contract, one always-applied workflow rule, and one
  artifact index for later tasks.

- [ ] **Step 1: Record the current documentation failure**

Search `AGENTS.md` and `.cursor/` Markdown, MDC, and JSON files for references
to frameworks, products, commands, and artifact paths not used by this
repository.

Expected: matches in `.cursor/rules/superpowers.mdc`,
`.cursor/superpowers/README.md`, and `.cursor/permissions.json`.

- [ ] **Step 2: Update `AGENTS.md`**

Keep the file concise and make it own only:

```markdown
# ГИП «Око» 3D Landing

## Mission
- One-page 3D landing for the fictional ГИП «Око» product.
- Audience: Russian public-sector organizations and state corporations.
- Goal: lead visitors to launch the product demo.

## Sources of truth
- Product brief: `.cursor/docs/brief.md`.
- Agent workflow: `.cursor/rules/superpowers.mdc`.
- Superpowers artifact index: `.cursor/superpowers/README.md`.

## Stack and paths
- TypeScript, Next.js 16 App Router, React 19, Tailwind CSS.
- React Three Fiber, Drei, and Three.js.
- Application code: `src/`.
- 3D model: `public/models/background-model.glb`.

## Working rules
1. Read the brief and relevant project skills before planning or editing.
2. Use brainstorming and an approved design before creative changes.
3. Make one coherent change at a time and update the owning documentation.
4. Keep 3D code in client components.
5. Support 390 px width, reduced motion, keyboard use, and no-mouse use.
6. Do not add remote assets, analytics, auth, databases, or a CMS.
7. Do not initialize or mutate Git unless Evgeniy explicitly requests it.
8. Append completed work to the dated Superpowers log.

## Definition of done
- No console errors.
- The GLB loads, remains readable on mobile, and is below 5 MB.
- The page works without mouse input and respects reduced motion.
- `npm run lint` and `npm run build` pass from the repository root.
```

- [ ] **Step 3: Rewrite `.cursor/rules/superpowers.mdc`**

Preserve valid frontmatter:

```yaml
---
description: Superpowers workflow and artifact paths for ГИП Око
alwaysApply: true
---
```

The rule must define:

- precedence: direct user instructions, then `AGENTS.md`, then skills;
- paths for specs, plans, daily logs, worktrees, and visual-companion data;
- brainstorm → approved spec → plan → execution workflow;
- project skill handoff to subagents using exact paths;
- standing-decision ownership across `AGENTS.md`, rules, skills, and specs;
- daily log timing and the block fields from the approved design;
- plan closure only after explicit confirmation from Evgeniy;
- no Git initialization, commits, remotes, or push without explicit request.

It must contain no product-specific examples from another repository.

- [ ] **Step 4: Rewrite the artifact README files**

`.cursor/superpowers/README.md` must contain:

```markdown
# Superpowers artifacts

Project-local index for approved designs, implementation plans, and daily
agent logs.

| Kind | Location | Naming |
|---|---|---|
| Design specs | `specs/` | `YYYY-MM-DD-<topic>-design.md` |
| Implementation plans | `plans/` | `YYYY-MM-DD-<feature-name>.md` |
| Daily agent logs | `log/` | `YYYY-MM-DD.md` |

## Current specs
- [Project agent workflow](./specs/2026-09-29-project-agent-workflow-design.md)

## Current plans
- [Project agent workflow initialization](./plans/2026-09-29-project-agent-workflow.md)

## Logs
See [`log/README.md`](./log/README.md) for the append-only daily format.
```

`.cursor/superpowers/log/README.md` must document the exact dated filename,
the `HH:MM` block heading, Actions, Files, Checks, Decisions, and Status fields,
plus the prohibited sensitive or verbose content.

- [ ] **Step 5: Ignore temporary visual-companion data**

Append exactly:

```gitignore

# Superpowers visual companion
/.superpowers/
```

Do not ignore `.cursor/superpowers/`.

- [ ] **Step 6: Verify documentation cleanup**

Search project workflow files again.

Expected: no unrelated project names, framework commands, product skills, or
stale artifact links; all README links point to existing files.

---

### Task 2: Align terminal permissions with this project

**Files:**
- Modify: `.cursor/permissions.json`
- Reference: `package.json`

**Interfaces:**
- Consumes: npm script names from `package.json`.
- Produces: valid Cursor permissions containing only applicable local
  development and read-only inspection commands.

- [ ] **Step 1: Establish the allowed command set**

Use these project commands:

```text
npm run dev
npm.cmd run dev
npm run lint
npm.cmd run lint
npm run build
npm.cmd run build
git status
git diff
git log
git show
git rev-parse
Get-ChildItem
gci
dir
ls
```

Do not allow Git mutation commands while Git initialization is deferred.

- [ ] **Step 2: Rewrite `.cursor/permissions.json`**

Keep valid JSON. Auto-run instructions must authorize only the commands above.
Block instructions must require confirmation for:

- `git init`, add, commit, branch mutation, remote operations, and Git config;
- deployment and package publishing;
- destructive deletion outside the repository or worktree removal;
- any command not covered by the allowlist.

- [ ] **Step 3: Validate permissions**

Parse the file as JSON and compare every npm entry with `package.json`.

Expected: parse succeeds; `dev`, `lint`, and `build` all exist; no test or
documentation-build command is invented.

---

### Task 3: Verify the initialized workflow and write the daily log

**Files:**
- Create: `.cursor/superpowers/log/2026-09-29.md`
- Verify: all files modified in Tasks 1–2

**Interfaces:**
- Consumes: completed documentation and permissions.
- Produces: verification evidence and the first append-only daily log entry.

- [ ] **Step 1: Run static project checks**

Run:

```powershell
npm run lint
npm run build
```

Expected: both exit with code `0`.

- [ ] **Step 2: Verify the exported 3D model**

Check `out/models/background-model.glb`.

Expected: it exists and its size is less than `5,242,880` bytes.

- [ ] **Step 3: Verify workflow consistency**

Confirm:

- `.cursor/rules/superpowers.mdc` has `alwaysApply: true`;
- README links resolve;
- `.superpowers/` is ignored;
- `.cursor/superpowers/` is not ignored;
- no Git repository or remote was created by this work.

- [ ] **Step 4: Create the dated action log**

Create the file with this PowerShell script so the heading uses the actual
local time:

```powershell
$time = Get-Date -Format "HH:mm"
$entry = @"
# Agent log — 2026-09-29

## $time — Initialize project agent workflow

- Actions: adapted the project contract, Superpowers workflow, artifact index, permissions, and ignore rules for the ГИП «Око» landing.
- Files: ``AGENTS.md``, ``.gitignore``, ``.cursor/rules/superpowers.mdc``, ``.cursor/permissions.json``, and ``.cursor/superpowers/``.
- Checks: documentation scan clean; permissions JSON valid; lint and production build passed; exported GLB remained below 5 MB.
- Decisions: daily append-only logs use ``.cursor/superpowers/log/YYYY-MM-DD.md``; Git initialization and commits remain deferred to Evgeniy.
- Status: done
"@
[System.IO.File]::WriteAllText(
  ".cursor/superpowers/log/2026-09-29.md",
  $entry,
  [System.Text.UTF8Encoding]::new($false)
)
```

Use the actual local time and actual check results. If a check fails, use
`Status: blocked` and state the failed check accurately.
