# ГИП «Око» 3D Landing

## Mission

- This repository is the one-page landing for the industrial ГИП «Око»
  geoinformation platform.
- Serve Russian public-sector organizations, state corporations, and
  professional spatial-data users.
- Explain the core product workflow and lead visitors directly to the demo.

## Sources of truth

- Product brief: `.cursor/docs/brief.md`.
- Landing product specification:
  `.cursor/superpowers/specs/2026-10-02-landing-product-design.md`.
- Blender render specification:
  `.cursor/superpowers/specs/2026-09-29-blender-parity-design.md`.
- Agent workflow: `.cursor/rules/superpowers.mdc`.
- Superpowers artifact index: `.cursor/superpowers/README.md`.
- Terminal command permissions: `.cursor/permissions.json`.

## Stack and paths

- TypeScript, Next.js 16 App Router, React 19, Tailwind CSS.
- React Three Fiber, Drei, and Three.js.
- Application code: `src/`.
- 3D model: `public/models/background-model.glb`.
- Production is a static export (`output: "export"`). The site is served
  from the host root unless `NEXT_PUBLIC_BASE_PATH` is set at build time.

## Working rules

1. Read the brief and relevant project skills before planning or editing.
2. Implement the approved landing specification; do not revive the obsolete
   AI Core or agentic-runtime concept.
3. Use brainstorming and an approved design before creative changes.
4. Make one coherent change at a time and update the owning documentation.
5. Keep Three.js and React Three Fiber inside explicit client components.
6. Support 390 px width, reduced motion, keyboard use, and no-mouse use.
7. Do not add unsupported claims, remote assets, analytics, auth, databases,
   or a CMS.
8. Local Git is allowed: init, status, diff, log, add, commit, branch,
   checkout, switch, and merge. Do not add remotes, fetch, pull, push, or
   change Git configuration. Evgeniy is the only one who pushes to a remote.
9. Append completed work to the dated Superpowers log.
10. Before dispatching a Cursor `Task` subagent, **ask Evgeniy which model to
    use** (for example inherit the parent session model vs a named slug). Do
    not choose a subagent model silently, including Superpowers SDD cost-tier
    picks. One answer may cover a whole plan run unless Evgeniy says otherwise.

## Definition of done

- The page meets the landing specification and product-safety constraints.
- The CTA uses `NEXT_PUBLIC_DEMO_URL`. A valid URL opens the demo in the
  current tab. Until that URL exists, pending CTAs are disabled non-links
  (`aria-disabled`) and do not navigate. Do not invent a demo URL or `/demo`.
- No console, hydration, accessibility, or unexpected network errors.
- The local GLB loads, degrades safely, and remains below 5 MB.
- Desktop, 390 px, keyboard-only, no-mouse, reduced-motion, and WebGL fallback
checks pass.
<!-- - `npm run lint` and `npm run build` pass from the repository root. -->
