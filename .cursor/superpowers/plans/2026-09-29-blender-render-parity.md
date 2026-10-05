# Blender Render Parity Implementation Plan

> **Status:** executed 2026-09-29. History only — do not re-run.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the landing's live GLB match the balanced appearance of the source Blender Rendered viewport without changing the authored `.blend`.

**Architecture:** Re-export the generated GLB without Blender lights or camera, leaving geometry, textures, hierarchy, and materials intact. Make the React Three Fiber canvas the sole owner of lighting, align its display transform explicitly with AgX/sRGB, and calibrate the existing light rig against the Blender reference.

**Tech Stack:** Blender 5.2 glTF exporter through Blender MCP, glTF 2.0/GLB, Three.js r186, React Three Fiber 9, Drei 10, Next.js 16, TypeScript.

**Design spec:** `.cursor/superpowers/specs/2026-09-29-blender-parity-design.md`

## Global Constraints

- Keep `.cursor/ai-assets/background-model.blend` unchanged and saved cleanly.
- Keep the GLB local at `public/models/background-model.glb` and below 5 MB.
- Do not add packages, remote assets, environment maps, post-processing, analytics, auth, databases, or a CMS.
- Preserve the current camera, centering, model animation, loading state, WebGL fallback, and `basePath` handling unless a verified framing defect requires a targeted change.
- Support 390 px width, `prefers-reduced-motion`, keyboard-only use, and no-mouse use.
- Do not initialize or mutate Git; use review checkpoints instead of commits.
- Every implementer and reviewer must first read:
  - `.cursor/skills/3d-landing/SKILL.md`
  - `C:/Users/user/.cursor/plugins/cache/cursor-public/superpowers/d884ae04edebef577e82ff7c4e143debd0bbec99/skills/test-driven-development/SKILL.md`
  - `C:/Users/user/.cursor/plugins/cache/cursor-public/superpowers/d884ae04edebef577e82ff7c4e143debd0bbec99/skills/verification-before-completion/SKILL.md`
- Every worker brief must include the design spec path above and this plan path.

---

### Task 1: Export a light-free GLB

**Files:**
- Source, read only: `.cursor/ai-assets/background-model.blend`
- Replace generated asset: `public/models/background-model.glb`

**Interfaces:**
- Consumes: the saved Blender scene with `AI_Core`, meshes, materials, and embedded texture images.
- Produces: one binary glTF 2.0 file with the same meshes/materials/textures and no camera or `KHR_lights_punctual`.

- [ ] **Step 1: Record the failing asset condition**

Use the browser's `Runtime.evaluate` against `http://localhost:9010/` to fetch
`/models/background-model.glb`, parse the GLB JSON chunk, and return:

```javascript
({
  byteLength: buffer.byteLength,
  extensionsUsed: json.extensionsUsed ?? [],
  materials: (json.materials ?? []).map(({ name }) => name),
  lights: json.extensions?.KHR_lights_punctual?.lights ?? [],
  cameras: json.cameras ?? [],
})
```

Expected before export:

```text
byteLength: 2293692
extensionsUsed includes KHR_lights_punctual
lights: Light_Key and Light_Rim
materials: Mat_EarthGlobe plus nine orbit/satellite materials
```

Capture the current desktop landing and Blender `VIEW_3D` Rendered viewport.
The landing must visibly fail the acceptance reference by clipping the upper
globe to white.

- [ ] **Step 2: Verify the connected Blender source before writing**

Read Blender MCP path and scene summaries.

Expected:

```text
filepath: D:\Evgeniy\gip-oko\gip-oko-landing\.cursor\ai-assets\background-model.blend
is_saved: true
is_dirty: false
scene_name: Scene
objects: Core_Earth, Orbit_Ring_01..03, Sat_GLONASS_K, Sat_ResursP, Sat_Sentinel1
```

Stop without exporting if the source path differs, the file is dirty, or any
required mesh is missing.

- [ ] **Step 3: Export through Blender MCP**

Use Blender MCP `execute_blender_code` once with:

```python
import bpy
from pathlib import Path

source = Path(
    r"D:\Evgeniy\gip-oko\gip-oko-landing\.cursor\ai-assets\background-model.blend"
).resolve()
target = Path(
    r"D:\Evgeniy\gip-oko\gip-oko-landing\public\models\background-model.glb"
).resolve()

current = Path(bpy.data.filepath).resolve()
if current != source:
    raise RuntimeError(f"Unexpected Blender source: {current}")
if bpy.data.is_dirty:
    raise RuntimeError("Blender source has unsaved changes")

required = {
    "Core_Earth",
    "Orbit_Ring_01",
    "Orbit_Ring_02",
    "Orbit_Ring_03",
    "Sat_GLONASS_K",
    "Sat_ResursP",
    "Sat_Sentinel1",
}
missing = sorted(required.difference(bpy.data.objects.keys()))
if missing:
    raise RuntimeError(f"Missing required objects: {missing}")

operator_result = bpy.ops.export_scene.gltf(
    filepath=str(target),
    check_existing=False,
    export_format="GLB",
    export_image_format="AUTO",
    export_texcoords=True,
    export_normals=True,
    export_materials="EXPORT",
    export_cameras=False,
    export_lights=False,
    export_animations=False,
    use_visible=True,
    export_apply=False,
    will_save_settings=False,
)

result = {
    "operator_result": sorted(operator_result),
    "target": str(target),
    "size_bytes": target.stat().st_size,
    "source_dirty_after_export": bpy.data.is_dirty,
}
```

Expected:

```text
operator_result: ["FINISHED"]
source_dirty_after_export: false
size_bytes: less than 5242880
```

- [ ] **Step 4: Verify the exported asset**

Repeat the GLB JSON inspection after a hard page reload.

Expected:

```text
HTTP status: 200
extensionsUsed does not include KHR_lights_punctual
no light nodes and no cameras
7 meshes
10 materials, including Mat_EarthGlobe
embedded images EarthCityLights and EarthLandMask remain present
file size is less than 5242880 bytes
```

Read the Blender path summary again and confirm `is_dirty: false`.

### Task 2: Align the web color and light pipeline

**Files:**
- Modify: `src/components/background-model-canvas.tsx:10-11`
- Modify: `src/components/background-model-canvas.tsx:87-109`

**Interfaces:**
- Consumes: the Task 1 GLB with no embedded lights.
- Produces: an R3F `Canvas` whose renderer uses AgX tone mapping, sRGB output, and the existing landing-owned light rig.

- [ ] **Step 1: Reproduce the renderer mismatch after export**

Reload `http://localhost:9010/`, wait until `.scene-fallback` has
`is-hidden`, and capture the hero at desktop size.

Inspect the current source and confirm it imports only `Group` and `MathUtils`
from `three` and does not set `gl.toneMapping` explicitly.

Expected: the exported model loads, but the renderer still lacks an explicit
AgX contract. This is the failing condition even if removing embedded lights
already improves exposure.

- [ ] **Step 2: Add the explicit renderer contract**

Change the Three.js import to:

```typescript
import {
  AgXToneMapping,
  Group,
  MathUtils,
  SRGBColorSpace,
} from "three";
```

Add `onCreated` to the existing `Canvas`:

```tsx
<Canvas
  className="background-model-canvas"
  camera={{ position: [0, 0, 4.5], fov: 35, near: 0.1, far: 100 }}
  dpr={[1, 1.5]}
  frameloop={reducedMotion ? "demand" : "always"}
  gl={{
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  }}
  onCreated={({ gl }) => {
    gl.outputColorSpace = SRGBColorSpace;
    gl.toneMapping = AgXToneMapping;
    gl.toneMappingExposure = 1;
  }}
>
```

Do not change the camera, group transform, `Center`, animation, or fallback
callbacks in this step.

- [ ] **Step 3: Run static checks for the renderer change**

Run:

```text
npm run lint
```

Expected: exit code `0` with no ESLint errors.

- [ ] **Step 4: Calibrate one renderer variable at a time**

Reload the page and compare it with the Blender `VIEW_3D` screenshot using
these acceptance criteria:

```text
land: green, not white or neon
oceans: dark blue with visible day/night variation
orbits: cyan, violet, and amber remain distinguishable
satellites: body and panel details remain readable
highlights: no broad clipped-white cap on the globe
```

Keep the existing light colors and positions. If the first AgX render fails,
change only `toneMappingExposure` in `0.1` increments within `0.6..1.2`.
Choose the value that satisfies all five criteria.

If no exposure in that range satisfies the criteria, restore exposure to `1`
and adjust only the existing light intensities in this order:

```text
directionalLight: 2.6 downward in 0.2 steps, minimum 1.0
pointLight: 8 downward in 0.5 steps, minimum 3.0
hemisphereLight: 1.45 downward in 0.1 steps, minimum 0.75
ambientLight: keep at 0.55 unless shadow detail is lost
```

Stop at the first combination that meets all criteria. Do not add lights,
material overrides, post-processing, or CSS compensation.

- [ ] **Step 5: Re-run lint after final calibrated values**

Run:

```text
npm run lint
```

Expected: exit code `0` with no ESLint errors.

### Task 3: Verify runtime behavior and document the result

**Files:**
- Verify: `src/components/hero.tsx`
- Verify: `src/app/globals.css`
- Modify after all checks pass: `.cursor/superpowers/log/2026-09-29.md`

**Interfaces:**
- Consumes: the light-free GLB and calibrated canvas from Tasks 1–2.
- Produces: browser evidence, production-build evidence, and one concise append-only work log entry.

- [ ] **Step 1: Verify desktop runtime**

At the normal desktop viewport:

```text
GET /models/background-model.glb returns 200
.scene-fallback.is-hidden becomes true after load
one WebGL canvas is present
the five Task 2 visual criteria pass
no console errors occur
```

The existing Three.js `Clock` deprecation warning is not caused by this change;
record it separately if still present, but do not broaden this task into a
dependency upgrade.

- [ ] **Step 2: Verify 390 px responsive behavior**

Use CDP `Emulation.setDeviceMetricsOverride` with:

```json
{
  "width": 390,
  "height": 844,
  "deviceScaleFactor": 1,
  "mobile": true
}
```

Reload, wait for `.scene-fallback.is-hidden`, and capture the hero.

Expected: the globe, all three orbit families, and at least the prominent
satellite silhouettes remain inside the visual area without overlapping the
hero copy or CTA.

Clear device emulation after the check.

- [ ] **Step 3: Verify reduced motion and no-mouse use**

Use CDP `Emulation.setEmulatedMedia` with
`prefers-reduced-motion: reduce`, reload, and verify:

```text
the GLB renders in the base pose
the canvas uses demand-driven rendering
the page remains readable and navigable by Tab/Enter
the CTA and section links work without pointer input
```

Clear media emulation and repeat a normal reload. Do not require keyboard
control of the decorative model; no-mouse parity means content and actions do
not depend on pointer motion.

- [ ] **Step 4: Verify the existing fallback contract**

Confirm from `src/components/hero.tsx` that:

```text
supportsWebGL() gates the canvas
SceneBoundary calls handleSceneError
failed or unavailable WebGL leaves the static fallback visible
successful load hides it only after onReady
```

Because this task does not change fallback code, a source-contract inspection
plus successful normal-path runtime check is sufficient.

- [ ] **Step 5: Run production verification**

Run:

```text
npm run lint
npm run build
```

Expected:

```text
both commands exit 0
the static export contains models/background-model.glb
the exported GLB remains below 5242880 bytes
```

- [ ] **Step 6: Append the completed unit to the daily log**

Append one block to `.cursor/superpowers/log/2026-09-29.md` using the canonical
format from `.cursor/superpowers/log/README.md`.

Record only:

```text
Actions: light-free Blender export and explicit AgX/sRGB landing renderer
Files: public/models/background-model.glb, src/components/background-model-canvas.tsx
Checks: desktop, 390 px, reduced motion, no-mouse, GLB metadata, lint, build
Decisions: Blender remains the visual source; the landing owns runtime lights
Status: done
```

Do not mark this plan executed or the spec implemented during execution.
Plan closure requires Evgeniy's separate explicit confirmation after review.
