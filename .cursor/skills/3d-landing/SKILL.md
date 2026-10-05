---
name: 3d-landing
description: Use when building, changing or reviewing the 3D landing for ГИП "Око" in this repo.
---

# 3D Landing Checklist

1. Read `AGENTS.md` and `.cursor/docs/brief.md`.
2. Inspect `src/components/landing/background-model-canvas.tsx`, the local
   GLB path, and the WebGL fallback before changing them.
3. Keep Three.js and React Three Fiber code inside client components.
4. Keep the GLB local at `public/models/background-model.glb` and below 5 MB.
   Export it from `.cursor/ai-assets/background-model.blend` without lights or
   camera. Do not reintroduce `KHR_lights_punctual`; the canvas owns lighting.
5. Test desktop and 390 px layouts, keyboard-only use, no-mouse use, and
   `prefers-reduced-motion`.
6. Use a browser runtime check to verify the GLB request, WebGL fallback,
   responsive readability, and absence of console errors.
7. Run the Definition of Done commands owned by `AGENTS.md`.
8. Compare the result with `.cursor/docs/brief.md` and
   `.cursor/superpowers/specs/2026-10-02-landing-product-design.md`, then fix
   blockers before reporting completion.

## Domain traps

- The visual source is Blender Rendered, not the previous overexposed WebGL
  look. Keep `AgXToneMapping`, sRGB output, and `toneMappingExposure = 0.8`
  unless a new comparison against the `.blend` proves a different value.
- Do not add a second light set on top of imported punctual lights. If the
  GLB ever contains lights again, remove them at export rather than stacking
  more R3F lights.
- Architecture for this pipeline lives in
  `.cursor/superpowers/specs/2026-09-29-blender-parity-design.md`.
  Color management is that spec. Hero motion, idle animation, and pointer
  response are owned by
  `.cursor/superpowers/specs/2026-10-02-landing-product-design.md`.
- Do not keep the previous AI Core idle orbit. The landing model stays still
  until a fine-pointer device provides a subtle response. Pause rendering
  when the hero is off-screen or the document is hidden.
