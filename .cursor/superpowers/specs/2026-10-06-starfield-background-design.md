# Page-wide starfield background

**Status:** implemented 2026-10-06

## Document purpose

This document is the implementation source of truth for the landing’s
local Canvas 2D starfield. It covers architecture, visual rules, motion,
fallbacks, and acceptance criteria for that layer.

The published page remains Russian-language. This specification is written
in English for the implementation team.

If this document conflicts with product-safety restrictions in
`.cursor/docs/brief.md`, the brief wins. Hero copy, CTA behavior, GLB
rendering, and Blender color management stay owned by their existing specs.

## Context

- Brief visual direction already requires a dark “space & stars” background
  and one central 3D object from `public/models/background-model.glb`.
- The page draws stars with `StarField` in `src/components/landing/star-field.tsx`,
  mounted on `.star-layer` in `src/app/page.tsx`. Six CSS `radial-gradient`
  points remain on `.star-layer` as the no-JS / failed-canvas fallback.
- The product spec points here for density, pointer parallax, and that CSS
  fallback. It does not keep the old “sparse CSS layers” rule.
- Reference look: [Orbital Hero Section on 21st.dev](https://21st.dev/@yura/components/orbital-hero-section)
  (space depth and mouse-linked stars only). Do not install that component
  and do not copy its Sun, planets, Kepler orbits, or helical wakes.

## Goal

Give the whole landing a denser, still-restrained cosmic background. On a
fine pointer, stars shift with subtle multi-layer parallax. The GLB remains
the only 3D object. Product understanding does not depend on the starfield.

## Non-goals

- Do not add a sun, planets, orbital wakes, nebula photographs, or a second
  3D scene.
- Do not put stars inside `BackgroundModelCanvas` or add a second WebGL
  context.
- Do not give stars idle twinkle, drift, or continuous animation while the
  pointer is still.
- Do not change hero copy, CTA, GLB lighting, AgX/sRGB contract, or pause
  rules for the model canvas.
- Do not add remote decorative assets, analytics, or new npm dependencies
  unless an implementation blocker proves Canvas 2D in the existing stack
  insufficient. The expected implementation uses the browser Canvas 2D API
  and React already in the repo.
- Do not make the sticky header transparent.

## Architecture

Keep the decorative host in `src/app/page.tsx` as a page-wide layer inside
`.page-shell`:

```text
.page-shell
  .page-shell::before     z-index -2   abyss + cyan/violet washes
  .star-layer             z-index -1   CSS star fallback + Canvas 2D
  header / main           above        opaque header, readable content
```

- `.star-layer` stays `position: fixed; inset: 0; pointer-events: none;
  aria-hidden`.
- The existing cyan/violet page washes on `.page-shell::before` remain.
- The site header keeps its solid Abyss background and `z-index: 6`.
- The GLB canvas stays in the hero only, with `alpha: true`, so stars show
  through empty hero pixels around the model.

New client component: `src/components/landing/star-field.tsx`, exported as
`StarField`. `page.tsx` remains a Server Component and renders `StarField`
inside `.star-layer`. Drawing happens in `useEffect` / `requestAnimationFrame`;
the server-rendered host still shows the CSS fallback.

Do not extract a shared motion runtime for the GLB and the stars. The
starfield may copy the existing `matchMedia` pattern from
`background-model-canvas.tsx`. The two canvases must not share refs, frame
loops, or visibility observers.

The landing product spec lists `star-field.tsx` in the component tree and
points here for star density, pointer parallax, and the CSS fallback.

## Visual

Three layers, generated locally with a fixed seed so a remount at the same
size does not reshuffle the sky:

| Layer | Density | Radius (CSS px) | Alpha (frost) | Max shift at |pointer| = 1 |
| ----- | ------- | --------------- | ------------- | -------------------------------- |
| Far   | 80 stars per megapixel | 0.6–0.9 | 0.12–0.22 | 8 px |
| Mid   | 40 stars per megapixel | 0.9–1.3 | 0.22–0.38 | 18 px |
| Near  | 12 stars per megapixel | 1.4–2.0 | 0.35–0.55 | 32 px |

- Megapixel means CSS width × height / 1e6 of the canvas backing the layer.
- Total star cap: 420. If the density formula exceeds the cap, scale all
  three counts down proportionally.
- Positions are normalized 0–1. Each star’s coordinates come from
  `seed + layer + index`, so growing the count on a larger viewport appends
  stars instead of reshuffling the existing ones. Resize recomputes counts
  from the current CSS pixel area and redraws.
- Color is Frost `#ECF6F7`. 10% of mid and near stars mix 40% Signal Cyan
  `#58E8F4` into Frost. No violet stars.
- Draw round dots on a transparent canvas. No textures, sprites, or images.
- Density must stay below a game skybox. Text, header, and CTA keep WCAG AA
  contrast against Abyss; stars are not a contrast background for text.
- The GLB remains the single expressive visual gesture.

## Motion

- Listen to `pointermove` on `window`.
- Normalize with `(clientX / innerWidth) * 2 - 1` and
  `(clientY / innerHeight) * 2 - 1`.
- Ease current offset toward the target with lerp factor `0.08`, matching
  the GLB.
- Apply the layer max-shift values above. Near moves most; far almost rests.
- Start `requestAnimationFrame` on pointer movement. Stop it when both axes
  are within `0.001` of the target after a draw at rest. Do not keep a
  continuous loop while idle.
- Enable parallax only when `(pointer: fine)` is true and
  `prefers-reduced-motion: reduce` is false.
- Touch, coarse pointers, keyboard, and no-mouse use leave the field static.
- Pause drawing when `document.hidden` is true; resume from the last offset
  when visible again.
- Do not pause when the hero leaves the viewport. The field is page-wide.
- Do not intercept pointer events. `touch-action` on the page is unchanged.

## Fallbacks

- No JavaScript: `.star-layer` keeps the current six-point CSS star
  background and the page washes. No error UI.
- Canvas 2D context fails: leave the CSS fallback visible; do not mount a
  broken canvas, and do not show an error.
- WebGL unavailable or GLB failure: starfield still runs. It does not
  depend on Three.js.
- Reduced motion or no fine pointer: draw one static frame at offset zero
  and attach no movement listener.

Stars, like the GLB, are decorative. Hide them from the accessibility tree.
No meaningful copy is rendered into the 2D canvas.

## Performance

- Cap device pixel ratio at 1.5, same as the GLB canvas.
- Clear and redraw only the star canvas; do not force the R3F canvas to
  render.
- Do not allocate textures or offscreen bitmaps larger than the capped DPR
  viewport.
- Follow the existing landing performance budget. The starfield must not
  introduce remote requests.

## Testing

Verify in a browser, not only from a screenshot:

- Desktop, fine pointer: layers shift at different amplitudes; motion stops
  after the pointer stops and lerp settles.
- Scroll below the hero: stars remain and still respond to the pointer.
- 390 px width, touch, keyboard-only, and no-mouse: static field, page
  scroll works, no parallax requirement for any content.
- `prefers-reduced-motion: reduce`: static frame, no movement listener.
- WebGL disabled: stars remain; hero copy and CTA remain.
- JavaScript disabled: CSS fallback and page washes remain.
- Header, text, and CTA contrast are unchanged enough to keep AA.
- GLB load, pointer response, and off-screen pause behavior are unchanged.
- No console errors, no unexpected network requests, no remote star assets.

## Ownership after implementation

| Topic | Owner |
| ----- | ----- |
| Starfield layer, density, 2D motion, CSS fallback | this spec |
| Hero copy, page sections, CTA | landing product spec |
| GLB lighting, AgX, export | Blender parity spec |
| Product claims | `.cursor/docs/brief.md` |
