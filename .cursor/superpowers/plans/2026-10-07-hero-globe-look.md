# Hero globe look pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the hero Earth matte, frame about 70% day / 30% night, and raise day-side brightness toward the Blender Rendered reference.

**Architecture:** Canvas-only look pass. Named constants and `heroCameraPosition()` live in `globe-runtime.ts`. `background-model-canvas.tsx` applies the Earth PBR override, places the camera on the spin-axis azimuth, and `lookAt` origin. No GLB re-export. Calibrate `SUN_INTENSITY` after matte and camera.

**Tech Stack:** TypeScript, Next.js 16, React 19, React Three Fiber, Three.js r186. No new npm packages.

**Design spec:** `.cursor/superpowers/specs/2026-10-06-hero-globe-runtime-design.md`

## Global Constraints

- Do not move `Light_Key` or `Light_Rim` world positions.
- Keep `AgXToneMapping`, sRGB, `toneMappingExposure = 0.8` unless key intensity cannot match the blend without clipping.
- Do not re-export the GLB. Do not edit satellite materials.
- `camera.up` stays `[0, 1, 0]`. Distance 4.5, fov 35, lookAt origin.
- Do not initialize or mutate Git. No second `npm run dev` on 9010.
- Work on the current `gip-oko-landing-dev` tree. No worktree.
- Every implementer must read `.cursor/skills/3d-landing/SKILL.md` and the hero globe runtime spec.

## File map

Modify:

- `src/components/landing/globe-runtime.ts`
- `src/components/landing/background-model-canvas.tsx`
- `.cursor/skills/3d-landing/SKILL.md`
- `.cursor/superpowers/specs/2026-10-02-landing-product-design.md` (pointer only)

Do not change: GLB, blend, starfield, hero copy, `package.json`.

---

### Task 1: Matte Earth, 70/30 camera, then key

**Files:**
- Modify: `src/components/landing/globe-runtime.ts`
- Modify: `src/components/landing/background-model-canvas.tsx`

**Interfaces:**
- Produces: `EARTH_ROUGHNESS`, `EARTH_METALNESS`, `EARTH_SPECULAR_INTENSITY`, `CAMERA_DISTANCE`, `CAMERA_AZIMUTH_RAD`, `heroCameraPosition()`, `applyEarthLook(earth)`, camera `lookAt(0,0,0)`.
- `MOSCOW_YAW_RAD` start `2.15 + 0.72 = 2.87` (same-axis compensate); tune in the browser.

- [ ] **Step 1: Add look-pass constants and camera helper**

In `globe-runtime.ts` import `Quaternion, Vector3` from `three` (keep `MathUtils`). Add:

```ts
export const EARTH_ROUGHNESS = 0.85;
export const EARTH_METALNESS = 0;
export const EARTH_SPECULAR_INTENSITY = 0.12;
export const CAMERA_DISTANCE = 4.5;
export const CAMERA_AZIMUTH_RAD = 0.72;
export const MOSCOW_YAW_RAD = 2.87;

export function heroCameraPosition(): [number, number, number] {
  const axis = new Vector3(...tiltedEarthAxis());
  const pos = new Vector3(0, 0, CAMERA_DISTANCE);
  pos.applyQuaternion(
    new Quaternion().setFromAxisAngle(axis, CAMERA_AZIMUTH_RAD),
  );
  return [pos.x, pos.y, pos.z];
}
```

Leave `SUN_INTENSITY = 2.2` until the browser check in Step 4.

- [ ] **Step 2: Apply matte on `Core_Earth` only**

In `background-model-canvas.tsx`, import `MeshPhysicalMaterial` type plus the new constants. Add `applyEarthLook` next to `applyNightLights`. Call it in the existing load effect on `earth`, before `applyNightLights`:

```ts
function applyEarthLook(earth: Object3D): void {
  earth.traverse((obj) => {
    const mesh = obj as Mesh;
    const material = mesh.material;
    if (!mesh.isMesh || !material || Array.isArray(material)) {
      return;
    }
    const std = material as MeshStandardMaterial;
    std.metalness = EARTH_METALNESS;
    std.metalnessMap = null;
    std.roughnessMap = null;
    std.roughness = EARTH_ROUGHNESS;
    const physical = std as MeshPhysicalMaterial;
    if (physical.isMeshPhysicalMaterial) {
      physical.specularIntensity = EARTH_SPECULAR_INTENSITY;
    }
    std.needsUpdate = true;
  });
}
```

Do not touch satellite or ring materials.

- [ ] **Step 3: Place the camera**

Replace the Canvas camera prop and `lookAt` in `onCreated`:

```tsx
camera={{
  position: heroCameraPosition(),
  fov: 35,
  near: 0.1,
  far: 100,
  up: [0, 1, 0],
}}
```

Inside existing `onCreated`, after clear color:

```ts
camera.up.set(0, 1, 0);
camera.lookAt(0, 0, 0);
```

Destructure `camera` from `onCreated`.

- [ ] **Step 4: Browser check, then `SUN_INTENSITY`**

Use the already-running localhost:9010. Confirm: no billiard highlight; terminator ~70/30; Moscow still facing; 23.5° cant. Then raise `SUN_INTENSITY` from 2.2 in 0.2–0.4 steps until day-side land matches Blender without a clipped white cap. Do not change exposure unless the key cannot get there. Recalibrate `MOSCOW_YAW_RAD` if Moscow left the facing hemisphere.

- [ ] **Step 5: Lint**

Run: `npm run lint` from the repo root. Expected: exit 0.

---

### Task 2: Owning docs

**Files:**
- Modify: `.cursor/skills/3d-landing/SKILL.md`
- Modify: `.cursor/superpowers/specs/2026-10-02-landing-product-design.md`
- Modify: `.cursor/superpowers/README.md`

- [ ] **Step 1: 3d-landing skill**

In domain traps, note: Earth roughness/metalness are a canvas override (`EARTH_ROUGHNESS` 0.85); camera is `heroCameraPosition()` around the spin axis (~70/30 disk); `SUN_INTENSITY` is calibrated after that frame; do not move `Light_Key`.

- [ ] **Step 2: Product spec pointer**

In Hero model and motion, add that matte Earth, 70/30 disk, and key intensity after that frame are owned by the hero globe runtime spec.

- [ ] **Step 3: Index the plan**

Add this plan under Current plans in `.cursor/superpowers/README.md`. Do not stamp executed.
