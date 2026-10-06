# Page-wide starfield background Implementation Plan

> **Status:** executed 2026-10-06. History only — do not re-run.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the six CSS star dots with a local Canvas 2D starfield that covers the whole page and parallax-shifts only on a fine pointer.

**Architecture:** Keep `.star-layer` as the fixed decorative host. Mount a new client component `StarField` inside it. Generate three depth layers with a seeded hash, draw round dots on a transparent 2D canvas, and run a demand `requestAnimationFrame` loop that stops when the lerp settles. Leave `BackgroundModelCanvas` unchanged. Do not add WebGL, Three.js particles, or npm packages.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, browser Canvas 2D. No new dependencies.

**Design spec:** `.cursor/superpowers/specs/2026-10-06-starfield-background-design.md`

**Related specs:** `.cursor/docs/brief.md`, `.cursor/superpowers/specs/2026-10-02-landing-product-design.md`, `AGENTS.md`

## Global Constraints

- Stack stays Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, React Three Fiber, Drei, and Three.js.
- Do not put stars inside `BackgroundModelCanvas` or add a second WebGL context.
- Do not add a sun, planets, orbital wakes, twinkle, idle drift, or remote star assets.
- Do not change hero copy, CTA, GLB lighting, AgX/sRGB, or the model’s off-screen pause.
- Do not add npm packages.
- Do not make the sticky header transparent.
- `prefers-reduced-motion: reduce` and non-fine pointers draw one static frame and attach no movement listener.
- CSS six-point fallback on `.star-layer` stays for no-JS and failed 2D context.
- Supported minimum viewport: 390 CSS pixels.
- Do not initialize or mutate Git. Use review checkpoints instead of commits.
- Every implementer and reviewer must first read:
  - `.cursor/skills/3d-landing/SKILL.md`
  - `.cursor/superpowers/specs/2026-10-06-starfield-background-design.md`
  - this plan
  - `C:/Users/user/.cursor/plugins/cache/cursor-public/superpowers/d884ae04edebef577e82ff7c4e143debd0bbec99/skills/verification-before-completion/SKILL.md`
- Task 2 must also read `.cursor/superpowers/specs/2026-10-02-landing-product-design.md`.
- Landing-page checks must also compare the result with `.cursor/docs/brief.md` and `AGENTS.md`.

## File map

Create:

- `src/components/landing/star-field.tsx`

Modify:

- `src/app/page.tsx`
- `src/app/globals.css`
- `.cursor/superpowers/specs/2026-10-02-landing-product-design.md`
- `.cursor/skills/3d-landing/SKILL.md`

Do not change:

- `src/components/landing/background-model-canvas.tsx`
- `src/components/landing/hero-model.tsx`
- `public/models/background-model.glb`
- `package.json`

---

### Task 1: Mount the Canvas 2D starfield

**Files:**
- Create: `src/components/landing/star-field.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css` (`.star-layer` block)

**Interfaces:**
- Consumes: existing `.star-layer` host, abyss page washes, opaque header, unchanged GLB canvas.
- Produces: `export function StarField(): JSX.Element | null` — decorative 2D canvas or `null` if `getContext("2d")` fails.

- [ ] **Step 1: Create `src/components/landing/star-field.tsx`**

Use this file as-is. Duplicate the `matchMedia` pattern from the GLB canvas; do not import from it.

```tsx
"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const STAR_SEED = 0x6f6b6f;
const STAR_CAP = 420;
const LERP = 0.08;
const SETTLE = 0.001;
const DPR_CAP = 1.5;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const FINE_POINTER_QUERY = "(pointer: fine)";
const FROST = { r: 236, g: 246, b: 247 };
const CYAN = { r: 88, g: 232, b: 244 };

const LAYER_SPECS = [
  {
    density: 80,
    radius: [0.6, 0.9] as const,
    alpha: [0.12, 0.22] as const,
    maxShift: 8,
    tint: false,
  },
  {
    density: 40,
    radius: [0.9, 1.3] as const,
    alpha: [0.22, 0.38] as const,
    maxShift: 18,
    tint: true,
  },
  {
    density: 12,
    radius: [1.4, 2.0] as const,
    alpha: [0.35, 0.55] as const,
    maxShift: 32,
    tint: true,
  },
] as const;

type Star = {
  x: number;
  y: number;
  radius: number;
  fill: string;
};

type StarLayer = {
  maxShift: number;
  stars: Star[];
};

function subscribeQuery(query: string) {
  return (onStoreChange: () => void) => {
    const mediaQuery = window.matchMedia(query);
    mediaQuery.addEventListener("change", onStoreChange);
    return () => mediaQuery.removeEventListener("change", onStoreChange);
  };
}

function useMediaQuery(query: string) {
  return useSyncExternalStore(
    subscribeQuery(query),
    () => window.matchMedia(query).matches,
    () => false,
  );
}

function unit(layer: number, index: number, salt: number) {
  let t =
    (STAR_SEED ^
      Math.imul(layer + 1, 0x9e3779b9) ^
      Math.imul(index + 1, 0x85ebca6b) ^
      salt) >>>
    0;
  t += 0x6d2b79f5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function mixRgb(amount: number) {
  return {
    r: Math.round(FROST.r + (CYAN.r - FROST.r) * amount),
    g: Math.round(FROST.g + (CYAN.g - FROST.g) * amount),
    b: Math.round(FROST.b + (CYAN.b - FROST.b) * amount),
  };
}

function buildLayers(cssW: number, cssH: number): StarLayer[] {
  if (cssW < 1 || cssH < 1) {
    return LAYER_SPECS.map((spec) => ({
      maxShift: spec.maxShift,
      stars: [],
    }));
  }

  const megapixels = (cssW * cssH) / 1e6;
  let counts = LAYER_SPECS.map((spec) =>
    Math.round(spec.density * megapixels),
  );
  const total = counts.reduce((sum, count) => sum + count, 0);
  if (total > STAR_CAP) {
    const scale = STAR_CAP / total;
    counts = counts.map((count) => Math.round(count * scale));
  }

  return LAYER_SPECS.map((spec, layer) => ({
    maxShift: spec.maxShift,
    stars: Array.from({ length: counts[layer] }, (_, index) => {
      const tinted = spec.tint && index % 10 === 0;
      const rgb = tinted ? mixRgb(0.4) : FROST;
      const alphaT = unit(layer, index, 4);
      const radiusT = unit(layer, index, 3);
      const alpha =
        spec.alpha[0] + (spec.alpha[1] - spec.alpha[0]) * alphaT;
      return {
        x: unit(layer, index, 1),
        y: unit(layer, index, 2),
        radius:
          spec.radius[0] + (spec.radius[1] - spec.radius[0]) * radiusT,
        fill: `rgb(${rgb.r} ${rgb.g} ${rgb.b} / ${alpha})`,
      };
    }),
  }));
}

export function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  const finePointer = useMediaQuery(FINE_POINTER_QUERY);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setFailed(true);
      return;
    }

    let cssW = 0;
    let cssH = 0;
    let dpr = 1;
    let layers: StarLayer[] = [];
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let raf = 0;
    let running = false;
    let hidden = document.hidden;
    const parallax = finePointer && !reducedMotion;

    function draw() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssW, cssH);
      for (const layer of layers) {
        const ox = -currentX * layer.maxShift;
        const oy = -currentY * layer.maxShift;
        for (const star of layer.stars) {
          ctx.fillStyle = star.fill;
          ctx.beginPath();
          ctx.arc(
            star.x * cssW + ox,
            star.y * cssH + oy,
            star.radius,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
      }
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      cssW = rect.width;
      cssH = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      canvas.width = Math.max(1, Math.round(cssW * dpr));
      canvas.height = Math.max(1, Math.round(cssH * dpr));
      layers = buildLayers(cssW, cssH);
      draw();
    }

    function tick() {
      running = false;
      raf = 0;
      if (hidden) {
        return;
      }
      currentX += (targetX - currentX) * LERP;
      currentY += (targetY - currentY) * LERP;
      draw();
      if (
        Math.abs(targetX - currentX) > SETTLE ||
        Math.abs(targetY - currentY) > SETTLE
      ) {
        running = true;
        raf = requestAnimationFrame(tick);
      } else {
        currentX = targetX;
        currentY = targetY;
        draw();
      }
    }

    function requestTick() {
      if (!running && !hidden) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    }

    function onMove(event: PointerEvent) {
      targetX = (event.clientX / window.innerWidth) * 2 - 1;
      targetY = (event.clientY / window.innerHeight) * 2 - 1;
      requestTick();
    }

    function onVisibility() {
      hidden = document.hidden;
      if (!hidden && parallax) {
        requestTick();
      }
    }

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    if (parallax) {
      window.addEventListener("pointermove", onMove, { passive: true });
    }
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      observer.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVisibility);
      if (raf) {
        cancelAnimationFrame(raf);
      }
    };
  }, [finePointer, reducedMotion]);

  if (failed) {
    return null;
  }

  return <canvas ref={canvasRef} className="star-field-canvas" />;
}
```

- [ ] **Step 2: Keep the CSS fallback and size the canvas**

In `src/app/globals.css`, keep the existing `.star-layer` background-image. Add positioning so the canvas fills the host:

```css
.star-layer {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background-image:
    radial-gradient(1px 1px at 12% 22%, rgb(236 246 247 / 0.55), transparent),
    radial-gradient(1px 1px at 28% 64%, rgb(236 246 247 / 0.35), transparent),
    radial-gradient(1.5px 1.5px at 61% 18%, rgb(236 246 247 / 0.4), transparent),
    radial-gradient(1px 1px at 81% 48%, rgb(236 246 247 / 0.28), transparent),
    radial-gradient(1px 1px at 44% 82%, rgb(236 246 247 / 0.22), transparent),
    radial-gradient(1px 1px at 9% 88%, rgb(236 246 247 / 0.18), transparent);
}

.star-field-canvas {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
```

- [ ] **Step 3: Render `StarField` inside the existing host**

In `src/app/page.tsx`, import `StarField` and replace the empty star host. `page.tsx` stays a Server Component.

```tsx
import { StarField } from "@/components/landing/star-field";
```

```tsx
      <div className="star-layer" aria-hidden="true">
        <StarField />
      </div>
```

- [ ] **Step 4: Browser check the mounted field**

Use the Cursor browser against `http://localhost:9010/` (`npm run dev` already uses port 9010).

Expected:
- The page still reads as ГИП «Око»; copy and CTA are unchanged.
- The background has many more stars than six CSS dots, on the whole viewport, including around the GLB.
- The sticky header is still opaque Abyss.
- Moving a mouse on desktop shifts nearer stars more than far stars; motion stops shortly after the pointer stops.
- No console errors. Network panel has no remote star image.
- The GLB still loads from `/models/background-model.glb` (or the configured `basePath`).

- [ ] **Step 5: Review checkpoint**

Do not commit. Confirm the GLB canvas file was not edited.

---

### Task 2: Align owning docs and finish verification

**Files:**
- Modify: `.cursor/superpowers/specs/2026-10-02-landing-product-design.md`
- Modify: `.cursor/skills/3d-landing/SKILL.md`

**Interfaces:**
- Consumes: the running starfield from Task 1.
- Produces: product spec and 3d-landing skill that match the shipped layer. Do not stamp the starfield spec implemented and do not mark this plan executed.

- [ ] **Step 1: Update the landing product spec**

Replace the visual-direction star sentence:

```markdown
- Stars are a local Canvas 2D field behind the whole page. Density, pointer
  parallax, and the CSS fallback are owned by
  `.cursor/superpowers/specs/2026-10-06-starfield-background-design.md`.
  Do not use a stock image.
```

In the file tree, add `star-field.tsx` under `landing/`, after `background-model-canvas.tsx`.

After the `BackgroundModelCanvas` responsibility, add:

```markdown
- `StarField`
  - Client Component.
  - Draws the page-wide Canvas 2D starfield.
  - Must not use Three.js or share state with the GLB canvas.
```

Replace:

```markdown
There is no global client state. Section content is static. Canvas state
remains isolated within its client boundary.
```

with:

```markdown
There is no global client state. Section content is static. The GLB canvas
and the starfield are separate client islands and must not share refs,
frame loops, or visibility observers.
```

Replace:

```markdown
- Only the hero model wrapper and canvas ship client behavior.
- Dynamically import the canvas with SSR disabled.
- Do not load Three.js, React Three Fiber, Drei, or the GLB before the primary
  HTML is usable.
- Do not use continuous animation when the model is idle.
- Pause or stop rendering when the hero is outside the viewport or the
  document is hidden.
```

with:

```markdown
- Only the hero model wrapper, the GLB canvas, and `StarField` ship client
  behavior.
- Dynamically import the GLB canvas with SSR disabled.
- Do not load Three.js, React Three Fiber, Drei, or the GLB before the primary
  HTML is usable. `StarField` uses Canvas 2D only.
- Do not use continuous animation when the model or starfield is idle.
- Pause or stop GLB rendering when the hero is outside the viewport or the
  document is hidden. The starfield pauses only when the document is hidden;
  it keeps drawing after the hero leaves the viewport.
```

- [ ] **Step 2: Update the 3d-landing skill trap**

In `.cursor/skills/3d-landing/SKILL.md`, add this domain trap (do not weaken the Blender-parity traps):

```markdown
- Page-wide stars live in `src/components/landing/star-field.tsx` as Canvas
  2D. Do not add star particles to the GLB canvas or a second WebGL context.
  Star density and pointer rules are owned by
  `.cursor/superpowers/specs/2026-10-06-starfield-background-design.md`.
```

In checklist item 2, also inspect `star-field.tsx` before changing the hero background.

In checklist item 8, also compare starfield work with
`.cursor/superpowers/specs/2026-10-06-starfield-background-design.md`.

- [ ] **Step 3: Full browser verification**

Use the Cursor browser against `http://localhost:9010/`. Do not finish on a single screenshot.

Expected:
- Desktop fine pointer: three amplitudes; loop stops after settle.
- Scroll below the hero: stars remain and still follow the pointer.
- Emulated 390 px width: field is visible and static on touch; page still scrolls; nav remains.
- Keyboard / no-mouse: page works; stars do not need to move.
- `prefers-reduced-motion: reduce`: static frame (DevTools Rendering → emulate CSS media feature).
- Optional: disable WebGL in the browser; stars remain; hero copy and CTA remain.
- Header, body, and CTA still read against Abyss.
- GLB pointer response and hero off-screen pause are unchanged.
- No console errors; no unexpected network; no remote star assets.

- [ ] **Step 4: Review checkpoint**

Do not commit. Do not stamp this plan executed. Do not write the daily log until Evgeniy closes the unit of work.
