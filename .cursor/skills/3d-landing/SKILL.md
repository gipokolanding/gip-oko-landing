---
name: 3d-landing
description: Use when building, changing or reviewing the 3D landing for ГИП "Око" in this repo.
---

# 3D Landing Checklist

1. Read `AGENTS.md` and `.cursor/docs/brief.md`.
2. Inspect `src/components/landing/background-model-canvas.tsx`,
   `src/components/landing/star-field.tsx`, the local GLB path, and the
   WebGL fallback before changing the hero background.
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
   `.cursor/superpowers/specs/2026-10-02-landing-product-design.md`. For
   starfield work also compare
   `.cursor/superpowers/specs/2026-10-06-starfield-background-design.md`. For
   GLB canvas work also compare
   `.cursor/superpowers/specs/2026-10-06-hero-globe-runtime-design.md`. For
   footer globe work also compare
   `.cursor/superpowers/specs/2026-10-07-footer-globe-design.md`.
   Fix blockers before reporting completion.

## Domain traps

- The visual source is Blender Rendered, not the previous overexposed WebGL
  look. Keep `AgXToneMapping`, sRGB output, and `toneMappingExposure = 0.8`
  unless a new comparison against the `.blend` proves a different value.
- Do not add a second light set on top of imported punctual lights. If the
  GLB ever contains lights again, remove them at export rather than stacking
  more R3F lights.
- Architecture for this pipeline lives in
  `.cursor/superpowers/specs/2026-09-29-blender-parity-design.md`.
  Color management is that spec.
- Do not restore the previous AI Core idle orbit of the whole assembly.
  Earth axial spin, satellite ring travel, sun, night lights, and the
  Siberia-facing first frame are owned by
  `.cursor/superpowers/specs/2026-10-06-hero-globe-runtime-design.md`.
  Spin around `EARTH_SPIN_AXIS` (Arctic/Antarctic in the land UVs). Do
  not spin around object +Y and do not add a second 23.5° tilt — the
  obliquity is already in the GLB. Earth roughness/metalness are a
  canvas override (`EARTH_ROUGHNESS` 0.85); do not use the land map as
  a roughness map. `EarthLandMask` is the two-color green-land /
  blue-ocean mask. Camera is `heroCameraPosition()` around the same
  spin axis (~80/20 day/night disk). `camera.up` is `EARTH_SPIN_AXIS`
  so geographic north is 12 o’clock.
  Canvas sun keeps blend Light_Key X/Z; Three Y is lowered so
  `sun · north ≈ sin(23.5°)`. After that Y change, retune
  `CAMERA_AZIMUTH_RAD` (and `FACING_YAW_RAD` by the same Δ). Do not move
  `Light_Rim` or the `.blend` lights. Keep `SUN_INTENSITY` 6.6.
  Pause the clock when the document is hidden. Off-screen may skip
  frames but must not freeze Earth. Reduced motion is a static first
  frame. Satellites: inner period `SAT_PERIOD_S` (55 s); mid ×1.5;
  high ×2. All start 180°; high orbit adds 45° along travel.
- Page-wide stars live in `src/components/landing/star-field.tsx` as Canvas
  2D. Do not add star particles to the GLB canvas or a second WebGL context.
  Star density and pointer rules are owned by
  `.cursor/superpowers/specs/2026-10-06-starfield-background-design.md`.
- On stacked widths the hero GLB stays behind the copy and in front of
  the starfield. Do not move it into a row below the text.
- Data (`#data`) is heading and copy on the left with four hover-reveal
  cards on the right (local SVG motifs: raster, vector, relief, volume),
  not the old text cell grid. Narrow widths stack cards under the copy
  (four-across, then 2×2, then one column). Nested hairline instrument
  frame; hover uses scale and opacity, not blur. Reduced motion drops
  scale. Owned by
  `.cursor/superpowers/specs/2026-10-02-landing-product-design.md`.
- Tools (`#tools`) is a vertical carousel (16:9 visual, copy below), not
  the old five-cell text grid. Copy, motion, and 760 px progress hiding are
  owned by
  `.cursor/superpowers/specs/2026-10-02-landing-product-design.md`.
- Contacts live in `<footer id="contacts">` after `main`, not a section
  inside `main`. Two columns (heading/lede left, requisites right), then a
  cropped SVG wireframe globe (`FooterGlobe`), not the old 2×2 cell grid
  and not a second WebGL canvas. Local TopoJSON only. Sphere disk filled
  with Abyss so stars do not show through. Crop window height is 13/60 of
  column width (peek fraction from 1024px). Auto-rotate 0.1125° per frame;
  no mouse interaction; reduced motion is a static frame. Owned
  by
  `.cursor/superpowers/specs/2026-10-07-footer-globe-design.md`.
- Header is always one row. When the labelled demo action no longer fits,
  it becomes Font Awesome 5 Regular `eye` (~23px in a `36×36` control),
  not a play mark or a globe. Pending CTAs go to `#contacts`. Owned by
  `.cursor/superpowers/specs/2026-10-02-landing-product-design.md`.
