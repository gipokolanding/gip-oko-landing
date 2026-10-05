# Superpowers artifacts

Project-local index for approved designs, implementation plans, and daily
agent logs.

| Kind | Location | Naming |
|---|---|---|
| Design specs | `specs/` | `YYYY-MM-DD-<topic>-design.md` |
| Implementation plans | `plans/` | `YYYY-MM-DD-<feature-name>.md` |
| Daily agent logs | `log/` | `YYYY-MM-DD.md` |

## Current specs

- [ГИП «Око» landing product specification](./specs/2026-10-02-landing-product-design.md)
  — implemented 2026-10-05. Plan: [2026-10-05-landing-product.md](./plans/2026-10-05-landing-product.md).
- [Blender-to-landing render parity](./specs/2026-09-29-blender-parity-design.md)
  — implemented 2026-09-29.
- [Project agent workflow](./specs/2026-09-29-project-agent-workflow-design.md)
  — implemented 2026-09-29.

## Current plans

- [ГИП «Око» landing product rebuild](./plans/2026-10-05-landing-product.md)
  — **executed 2026-10-05; history only, do not re-run**.
- [Blender render parity](./plans/2026-09-29-blender-render-parity.md)
  — **executed 2026-09-29; history only, do not re-run**.
- [Project agent workflow initialization](./plans/2026-09-29-project-agent-workflow.md)
  — **executed 2026-09-29; history only, do not re-run**.

## Logs

See [`log/README.md`](./log/README.md) for the append-only daily format.

## Lifecycle

- A spec records an approved design.
- A plan translates one spec into verifiable implementation tasks.
- A plan is marked executed only after Evgeniy explicitly confirms closure.
- The daily log summarizes completed units of work; it is not a transcript or
  a substitute for specs and plans.
