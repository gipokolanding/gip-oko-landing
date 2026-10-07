# Hero globe runtime Implementation Plan

> **Status:** executed 2026-10-07. History only — do not re-run.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the hero GLB match the Blender sun and satellite materials, face Moscow on a 23.5° axis, spin the Earth, fly satellites on their rings, and show city lights only on the night side, with a transparent canvas.

**Architecture:** Fix satellite Principled graphs and the Earth emissive map in `.cursor/ai-assets/background-model.blend`, then re-export `public/models/background-model.glb` without lights or camera. The canvas owns lighting, pose, wall-clock motion, and the night-side emission mask. Shared numbers and clock math live in `src/components/landing/globe-runtime.ts`.

**Tech Stack:** TypeScript, Next.js 16 App Router, React 19, React Three Fiber, Drei, Three.js r186, Blender MCP (`user-blender`). No new npm packages.

**Design spec:** `.cursor/superpowers/specs/2026-10-06-hero-globe-runtime-design.md`

**Related specs:** `.cursor/docs/brief.md`, `.cursor/superpowers/specs/2026-10-02-landing-product-design.md`, `.cursor/superpowers/specs/2026-09-29-blender-parity-design.md`, `AGENTS.md`

## Global Constraints

- Stack stays Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, React Three Fiber, Drei, and Three.js.
- GLB path: `public/models/background-model.glb`. Source: `.cursor/ai-assets/background-model.blend`. Maximum size: below 5 MB.
- Export without lights or camera. Do not include `KHR_lights_punctual`. Canvas owns lighting.
- Keep `AgXToneMapping`, sRGB output, and `toneMappingExposure = 0.8` unless a documented Blender comparison proves another value.
- Do not add live ephemerides, pointer tilt, the old AI Core idle orbit of the whole assembly, new city maps, or npm packages.
- Do not change hero copy, CTA, starfield, or page layout.
- `prefers-reduced-motion: reduce` is a static first frame: no Earth spin, no satellite motion.
- Off-screen: skip frames if useful, but do not freeze the pose. `document.hidden`: pause the clock.
- Supported minimum viewport: 390 CSS pixels. Keyboard and no-mouse use must work; the globe is not a control.
- Do not initialize or mutate Git. Use review checkpoints instead of commits.
- Keep object names: `Core_Earth`, `Orbit_Ring_01`, `Orbit_Ring_02`, `Orbit_Ring_03`, `Sat_GLONASS_K`, `Sat_ResursP`, `Sat_Sentinel1`.
- Every implementer and reviewer must first read:
  - `.cursor/skills/3d-landing/SKILL.md`
  - `.cursor/superpowers/specs/2026-10-06-hero-globe-runtime-design.md`
  - this plan
  - `C:/Users/user/.cursor/plugins/cache/cursor-public/superpowers/d884ae04edebef577e82ff7c4e143debd0bbec99/skills/verification-before-completion/SKILL.md`
- Task 1 must use the connected Blender MCP (`user-blender`) on `.cursor/ai-assets/background-model.blend`.
- Landing-page checks must also compare the result with `.cursor/docs/brief.md` and `AGENTS.md`.

## File map

Create:

- `src/components/landing/globe-runtime.ts`

Modify:

- `.cursor/ai-assets/background-model.blend`
- `public/models/background-model.glb`
- `src/components/landing/background-model-canvas.tsx`
- `.cursor/superpowers/specs/2026-10-02-landing-product-design.md`
- `.cursor/superpowers/specs/2026-09-29-blender-parity-design.md`
- `.cursor/skills/3d-landing/SKILL.md`

Do not change:

- `src/components/landing/star-field.tsx`
- `src/components/landing/hero-model.tsx`
- `src/content/landing.ts`
- `package.json`

---

### Task 1: Export glTF-safe materials

**Files:**
- Modify: `.cursor/ai-assets/background-model.blend`
- Modify: `public/models/background-model.glb`

**Interfaces:**
- Consumes: connected Blender file `.cursor/ai-assets/background-model.blend` with objects `Core_Earth`, three rings, three satellites, `Light_Key`, `Light_Rim`.
- Produces: `public/models/background-model.glb` below 5 MB, no lights/cameras, satellite Principled materials, `Mat_EarthGlobe` emissive map present, emission strength not stuck “always night-on”.

- [ ] **Step 1: Confirm the connected blend path**

Call `get_blendfile_summary_path_info` on `user-blender`.

Expected: `filepath` is `D:\Evgeniy\gip-oko\gip-oko-landing\.cursor\ai-assets\background-model.blend`. If another file is open, stop and tell Evgeniy.

- [ ] **Step 2: Point satellite materials at Principled BSDF**

Run `execute_blender_code` with:

```python
import bpy

SAT_MATS = [
    "Mat_SatMetal",
    "Mat_SatCyan",
    "Mat_SatGold",
    "Mat_SatSolar",
    "Mat_SatViolet",
    "Mat_SatSAR",
]

changed = []
for name in SAT_MATS:
    mat = bpy.data.materials[name]
    nt = mat.node_tree
    principled = nt.nodes.get("Principled BSDF")
    output = nt.nodes.get("Material Output")
    if principled is None or output is None:
        raise RuntimeError(f"Missing Principled or Output on {name}")
    for link in list(nt.links):
        if link.to_node == output and link.to_socket == output.inputs["Surface"]:
            nt.links.remove(link)
    nt.links.new(principled.outputs["BSDF"], output.inputs["Surface"])
    changed.append({
        "name": name,
        "surface": nt.nodes.get("Material Output").inputs["Surface"].links[0].from_node.type,
    })

result = {"satellite_surfaces": changed}
```

Expected: each `surface` is `BSDF_PRINCIPLED`.

- [ ] **Step 3: Temporarily unlink Earth night-strength, export GLB, restore the graph, save**

The blend must keep the night-mask nodes for the Blender viewport. The GLB must not bake that mask into a constant “on” emission.

Run `execute_blender_code` with:

```python
import bpy
from pathlib import Path

source = Path(r"D:\Evgeniy\gip-oko\gip-oko-landing\.cursor\ai-assets\background-model.blend").resolve()
target = Path(r"D:\Evgeniy\gip-oko\gip-oko-landing\public\models\background-model.glb")
current = Path(bpy.data.filepath).resolve()
if current != source:
    raise RuntimeError(f"Unexpected Blender source: {current}")

mat = bpy.data.materials["Mat_EarthGlobe"]
nt = mat.node_tree
principled = nt.nodes["Principled BSDF"]
strength_in = principled.inputs["Emission Strength"]
saved_strength_links = [
    (l.from_node.name, l.from_socket.name)
    for l in list(strength_in.links)
]
for link in list(strength_in.links):
    nt.links.remove(link)
strength_in.default_value = 1.0

color_in = principled.inputs["Emission Color"]
if not color_in.links or color_in.links[0].from_node.name != "CityLights_Tex":
    raise RuntimeError("Emission Color must stay linked to CityLights_Tex")

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

for from_node, from_socket in saved_strength_links:
    nt.links.new(nt.nodes[from_node].outputs[from_socket], strength_in)

bpy.ops.wm.save_mainfile()

result = {
    "operator_result": sorted(operator_result),
    "size_bytes": target.stat().st_size,
    "strength_restored_from": saved_strength_links,
    "is_dirty": bpy.data.is_dirty,
}
```

Expected:

```text
operator_result includes FINISHED
size_bytes < 5242880
strength_restored_from is not empty
is_dirty is false after save
```

- [ ] **Step 4: Check the GLB on disk**

Run: `Get-ChildItem "D:\Evgeniy\gip-oko\gip-oko-landing\public\models\background-model.glb" | Select-Object FullName, Length`

Expected: `Length` < 5242880.

Hard-reload the landing (dev server `npm run dev` on port 9010 if it is not running). Satellites may still look wrong until Task 2 lighting; they must not be missing. Confirm in the Network panel that `/models/background-model.glb` is 200.

**Review checkpoint:** stop for Evgeniy. Do not start Task 2 until he accepts this export.

---

### Task 2: Runtime helpers, sun rig, transparent clear, no pointer

**Files:**
- Create: `src/components/landing/globe-runtime.ts`
- Modify: `src/components/landing/background-model-canvas.tsx`

**Interfaces:**
- Consumes: Task 1 GLB; Blender `Light_Key` / `Light_Rim` converted with `(x, y, z)_blender → (x, z, -y)_three`.
- Produces:
  - `globe-runtime.ts` exports listed below
  - Canvas with warm sun, rim, dim hemisphere, transparent clear, no `PointerDemand`

`globe-runtime.ts` public API (later tasks must use these names):

```ts
export const EARTH_PERIOD_S = 150;
export const SAT_PERIOD_S = 55;
export const AXIS_TILT_DEG = 23.5;
export const MOSCOW_YAW_RAD = 1.85;
export const CITY_STRENGTH = 22;
export const NIGHT_DOT_DAY = 0.16;
export const NIGHT_DOT_NIGHT = -0.12;
export const SUN_COLOR = "#ffe6c7";
export const SUN_INTENSITY = 2.2;
export const SUN_POSITION: [number, number, number];
export const RIM_COLOR = "#405173";
export const RIM_INTENSITY = 0.8;
export const RIM_POSITION: [number, number, number];
export const FILL_SKY = "#1a2433";
export const FILL_GROUND = "#283848";
export const FILL_INTENSITY = 0.22;
export const OBJECT_NAMES: {
  earth: "Core_Earth";
  rings: readonly ["Orbit_Ring_01", "Orbit_Ring_02", "Orbit_Ring_03"];
  sats: readonly ["Sat_GLONASS_K", "Sat_ResursP", "Sat_Sentinel1"];
};

export type MotionClock = {
  startedAt: number;
  pausedAt: number | null;
  hiddenOffset: number;
};

export function createMotionClock(now: number): MotionClock;
export function pauseMotionClock(clock: MotionClock, now: number): void;
export function resumeMotionClock(clock: MotionClock, now: number): void;
export function motionSeconds(
  clock: MotionClock,
  now: number,
  reducedMotion: boolean,
): number;
export function nightFactor(ndotSun: number): number;
export function tiltedEarthAxis(): [number, number, number];
```

`CITY_STRENGTH` starts at **22**, matching the blend. If AgX blooms the cities after Task 4, lower it. Do not copy Blender sun `energy: 12` as Three intensity.

- [ ] **Step 1: Create `src/components/landing/globe-runtime.ts`**

Use this file as-is:

```ts
import { MathUtils } from "three";

export const EARTH_PERIOD_S = 150;
export const SAT_PERIOD_S = 55;
export const AXIS_TILT_DEG = 23.5;
export const MOSCOW_YAW_RAD = 1.85;

export const CITY_STRENGTH = 22;
export const NIGHT_DOT_DAY = 0.16;
export const NIGHT_DOT_NIGHT = -0.12;

export const SUN_COLOR = "#ffe6c7";
export const SUN_INTENSITY = 2.2;
export const SUN_POSITION = blenderToThree([1.71261, 0.49884, 3.58024]);

export const RIM_COLOR = "#405173";
export const RIM_INTENSITY = 0.8;
export const RIM_POSITION = blenderToThree([-1.37009, -0.39908, -2.86419]);

export const FILL_SKY = "#1a2433";
export const FILL_GROUND = "#283848";
export const FILL_INTENSITY = 0.22;

export const OBJECT_NAMES = {
  earth: "Core_Earth",
  rings: ["Orbit_Ring_01", "Orbit_Ring_02", "Orbit_Ring_03"] as const,
  sats: ["Sat_GLONASS_K", "Sat_ResursP", "Sat_Sentinel1"] as const,
};

export type MotionClock = {
  startedAt: number;
  pausedAt: number | null;
  hiddenOffset: number;
};

export function blenderToThree(
  xyz: readonly [number, number, number],
): [number, number, number] {
  return [xyz[0], xyz[2], -xyz[1]];
}

export function createMotionClock(now: number): MotionClock {
  return { startedAt: now, pausedAt: null, hiddenOffset: 0 };
}

export function pauseMotionClock(clock: MotionClock, now: number): void {
  if (clock.pausedAt == null) {
    clock.pausedAt = now;
  }
}

export function resumeMotionClock(clock: MotionClock, now: number): void {
  if (clock.pausedAt == null) {
    return;
  }
  clock.hiddenOffset += now - clock.pausedAt;
  clock.pausedAt = null;
}

export function motionSeconds(
  clock: MotionClock,
  now: number,
  reducedMotion: boolean,
): number {
  if (reducedMotion) {
    return 0;
  }
  const end = clock.pausedAt ?? now;
  return (end - clock.startedAt - clock.hiddenOffset) / 1000;
}

export function nightFactor(ndotSun: number): number {
  const t =
    (ndotSun - NIGHT_DOT_DAY) / (NIGHT_DOT_NIGHT - NIGHT_DOT_DAY);
  return Math.min(1, Math.max(0, t));
}

export function tiltedEarthAxis(): [number, number, number] {
  const tilt = MathUtils.degToRad(AXIS_TILT_DEG);
  return [Math.sin(tilt), Math.cos(tilt), 0];
}
```

- [ ] **Step 2: Replace `src/components/landing/background-model-canvas.tsx`**

Remove `PointerDemand`, `FINE_POINTER_QUERY`, pointer `useFrame`, `Center`, and the cyan/violet lights. Do **not** add spin yet (Task 3). Keep `frameloop="demand"` until Task 3. Set `scene.background = null` and clear alpha 0.

```tsx
"use client";

import { useGLTF } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import {
  Suspense,
  useEffect,
  useRef,
  useSyncExternalStore,
} from "react";
import {
  AgXToneMapping,
  Color,
  SRGBColorSpace,
} from "three";
import {
  FILL_GROUND,
  FILL_INTENSITY,
  FILL_SKY,
  RIM_COLOR,
  RIM_INTENSITY,
  RIM_POSITION,
  SUN_COLOR,
  SUN_INTENSITY,
  SUN_POSITION,
} from "./globe-runtime";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const MODEL_URL = `${BASE_PATH}/models/background-model.glb`;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

type BackgroundModelCanvasProps = {
  onReady: () => void;
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

function Model({ onReady }: BackgroundModelCanvasProps) {
  const { scene } = useGLTF(MODEL_URL);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    onReady();
    invalidate();
  }, [invalidate, onReady]);

  return <primitive object={scene} dispose={null} />;
}

export function BackgroundModelCanvas({ onReady }: BackgroundModelCanvasProps) {
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  const hostRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={hostRef} className="background-model-host">
      <Canvas
        className="background-model-canvas"
        camera={{ position: [0, 0, 4.5], fov: 35, near: 0.1, far: 100 }}
        dpr={[1, 1.5]}
        frameloop="demand"
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
          premultipliedAlpha: false,
        }}
        onCreated={({ gl, scene, invalidate }) => {
          gl.outputColorSpace = SRGBColorSpace;
          gl.toneMapping = AgXToneMapping;
          gl.toneMappingExposure = 0.8;
          gl.setClearColor(new Color(0x000000), 0);
          scene.background = null;
          invalidate();
        }}
      >
        <hemisphereLight
          args={[FILL_SKY, FILL_GROUND, FILL_INTENSITY]}
        />
        <directionalLight
          color={SUN_COLOR}
          intensity={SUN_INTENSITY}
          position={SUN_POSITION}
        />
        <pointLight
          color={RIM_COLOR}
          intensity={RIM_INTENSITY}
          position={RIM_POSITION}
        />
        <Suspense fallback={null}>
          <Model onReady={onReady} />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload(MODEL_URL);
```

`reducedMotion` is unused until Task 3; keep the hook so the next task does not re-introduce `matchMedia` plumbing. If ESLint flags it, prefix with void in a comment-free way: pass it into `Model` as `reducedMotion={reducedMotion}` even if `Model` ignores it until Task 3.

- [ ] **Step 3: Browser check**

Open `http://localhost:9010/`.

Expected:

- Empty pixels around the globe show page stars, not a dark-blue plate.
- Mouse move does not tilt the globe.
- Lighting is warm-sun, not cyan/violet keys.
- Satellites show metal / gold / solar / cyan / violet, not white hulls.
- No console errors.

If satellites are still white, the GLB still has Mix Shader graphs — return to Task 1. If the plate is still opaque, confirm `setClearColor(..., 0)` and that no CSS background is on `.background-model-canvas`.

**Review checkpoint:** stop for Evgeniy.

---

### Task 3: Pose, Earth spin, satellite rings, wall-clock

**Files:**
- Modify: `src/components/landing/background-model-canvas.tsx`

**Interfaces:**
- Consumes: `globe-runtime.ts` API from Task 2, including `createMotionClock`, `pauseMotionClock`, `resumeMotionClock`, `motionSeconds`, `tiltedEarthAxis`, `MOSCOW_YAW_RAD`, `EARTH_PERIOD_S`, `SAT_PERIOD_S`, `OBJECT_NAMES`.
- Produces: Earth at 23.5° tilt with Moscow facing at t = 0; Earth spins around that axis; each satellite orbits the nearest ring’s plane normal; wall-clock; off-screen does not freeze pose; hidden tab pauses.

- [ ] **Step 1: Replace `src/components/landing/background-model-canvas.tsx` with the motion canvas**

Use this file as-is (keeps Task 2 lighting and clear color):

```tsx
"use client";

import { useGLTF } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Suspense,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  AgXToneMapping,
  Color,
  Group,
  Mesh,
  Object3D,
  Quaternion,
  SRGBColorSpace,
  Vector3,
} from "three";
import {
  EARTH_PERIOD_S,
  FILL_GROUND,
  FILL_INTENSITY,
  FILL_SKY,
  MOSCOW_YAW_RAD,
  OBJECT_NAMES,
  RIM_COLOR,
  RIM_INTENSITY,
  RIM_POSITION,
  SAT_PERIOD_S,
  SUN_COLOR,
  SUN_INTENSITY,
  SUN_POSITION,
  createMotionClock,
  motionSeconds,
  pauseMotionClock,
  resumeMotionClock,
  tiltedEarthAxis,
  type MotionClock,
} from "./globe-runtime";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const MODEL_URL = `${BASE_PATH}/models/background-model.glb`;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

type BackgroundModelCanvasProps = {
  onReady: () => void;
};

type FlagRef = { current: boolean };

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

function blenderName(root: Object3D, name: string): Object3D {
  const found = root.getObjectByName(name);
  if (!found) {
    throw new Error(`GLB missing object ${name}`);
  }
  return found;
}

function meshCentroid(mesh: Mesh): Vector3 {
  mesh.geometry.computeBoundingBox();
  const center = new Vector3();
  mesh.geometry.boundingBox?.getCenter(center);
  mesh.localToWorld(center);
  return center;
}

function meshRadius(mesh: Mesh): number {
  return meshCentroid(mesh).length();
}

function averageNormal(mesh: Mesh): Vector3 {
  const attr = mesh.geometry.getAttribute("normal");
  const acc = new Vector3();
  for (let i = 0; i < attr.count; i += 1) {
    acc.x += attr.getX(i);
    acc.y += attr.getY(i);
    acc.z += attr.getZ(i);
  }
  if (acc.lengthSq() < 1e-8) {
    return new Vector3(0, 1, 0);
  }
  return acc.normalize();
}

function axisAngle(axis: Vector3, angle: number): Quaternion {
  return new Quaternion().setFromAxisAngle(axis, angle);
}

function Model({
  onReady,
  reducedMotion,
  visibleRef,
  clockRef,
}: BackgroundModelCanvasProps & {
  reducedMotion: boolean;
  visibleRef: FlagRef;
  clockRef: { current: MotionClock };
}) {
  const { scene } = useGLTF(MODEL_URL);
  const invalidate = useThree((state) => state.invalidate);
  const earthRef = useRef<Object3D | null>(null);
  const satPivots = useRef<{ pivot: Group; axis: Vector3 }[]>([]);
  const earthAxis = useRef(new Vector3(...tiltedEarthAxis()).normalize());
  const ready = useRef(false);

  useEffect(() => {
    const earth = blenderName(scene, OBJECT_NAMES.earth);
    earthRef.current = earth;

    if (scene.getObjectByName(`${OBJECT_NAMES.sats[0]}_Orbit`)) {
      satPivots.current = OBJECT_NAMES.sats.map((name) => {
        const pivot = blenderName(scene, `${name}_Orbit`) as Group;
        return { pivot, axis: (pivot.userData.orbitAxis as Vector3).clone() };
      });
      ready.current = true;
      onReady();
      invalidate();
      return;
    }

    const rings = OBJECT_NAMES.rings.map((name) => {
      const obj = blenderName(scene, name);
      const mesh = obj as Mesh;
      return { name, mesh, radius: meshRadius(mesh), axis: averageNormal(mesh) };
    });

    satPivots.current = OBJECT_NAMES.sats.map((name) => {
      const sat = blenderName(scene, name);
      const radius = meshRadius(sat as Mesh);
      let nearest = rings[0];
      for (const ring of rings) {
        if (Math.abs(ring.radius - radius) < Math.abs(nearest.radius - radius)) {
          nearest = ring;
        }
      }
      const pivot = new Group();
      pivot.name = `${name}_Orbit`;
      pivot.userData.orbitAxis = nearest.axis.clone();
      const parent = sat.parent ?? scene;
      parent.add(pivot);
      pivot.add(sat);
      return { pivot, axis: nearest.axis.clone() };
    });

    ready.current = true;
    onReady();
    invalidate();
  }, [invalidate, onReady, scene]);

  useFrame(() => {
    if (!ready.current || !earthRef.current) {
      return;
    }
    if (!visibleRef.current) {
      return;
    }

    const seconds = motionSeconds(
      clockRef.current,
      performance.now(),
      reducedMotion,
    );
    const earthAngle =
      MOSCOW_YAW_RAD +
      (reducedMotion ? 0 : (seconds / EARTH_PERIOD_S) * Math.PI * 2);
    earthRef.current.quaternion.copy(
      axisAngle(earthAxis.current, earthAngle),
    );

    const satAngle =
      reducedMotion ? 0 : (seconds / SAT_PERIOD_S) * Math.PI * 2;
    for (const { pivot, axis } of satPivots.current) {
      pivot.quaternion.copy(axisAngle(axis, satAngle));
    }
  });

  return <primitive object={scene} dispose={null} />;
}

export function BackgroundModelCanvas({ onReady }: BackgroundModelCanvasProps) {
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  const hostRef = useRef<HTMLDivElement>(null);
  const visibleRef = useRef(true);
  const clockRef = useRef(createMotionClock(performance.now()));
  const [visible, setVisible] = useState(true);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const node = hostRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
        setVisible(entry.isIntersecting);
      },
      { threshold: 0.01 },
    );
    observer.observe(node);

    const onVisibility = () => {
      const now = performance.now();
      if (document.hidden) {
        pauseMotionClock(clockRef.current, now);
        setHidden(true);
      } else {
        resumeMotionClock(clockRef.current, now);
        setHidden(false);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const frameloop =
    reducedMotion || hidden || !visible ? "demand" : "always";

  return (
    <div ref={hostRef} className="background-model-host">
      <Canvas
        className="background-model-canvas"
        camera={{ position: [0, 0, 4.5], fov: 35, near: 0.1, far: 100 }}
        dpr={[1, 1.5]}
        frameloop={frameloop}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
          premultipliedAlpha: false,
        }}
        onCreated={({ gl, scene, invalidate }) => {
          gl.outputColorSpace = SRGBColorSpace;
          gl.toneMapping = AgXToneMapping;
          gl.toneMappingExposure = 0.8;
          gl.setClearColor(new Color(0x000000), 0);
          scene.background = null;
          invalidate();
        }}
      >
        <hemisphereLight
          args={[FILL_SKY, FILL_GROUND, FILL_INTENSITY]}
        />
        <directionalLight
          color={SUN_COLOR}
          intensity={SUN_INTENSITY}
          position={SUN_POSITION}
        />
        <pointLight
          color={RIM_COLOR}
          intensity={RIM_INTENSITY}
          position={RIM_POSITION}
        />
        <Suspense fallback={null}>
          <Model
            onReady={onReady}
            reducedMotion={reducedMotion}
            visibleRef={visibleRef}
            clockRef={clockRef}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload(MODEL_URL);
```

When `frameloop` is `demand` because the hero is off-screen, `useFrame` does not run. Pose still updates on the next visible frame from `performance.now()` minus `hiddenOffset`, so the globe is **not** frozen at the last on-screen angle.

- [ ] **Step 2: Tune `MOSCOW_YAW_RAD` in the browser**

Open `http://localhost:9010/`. Reload.

Expected first frame:

- Frontal globe (camera still `[0, 0, 4.5]`, fov 35).
- Eastern Europe / European Russia (Moscow) in the facing hemisphere.
- Axis visibly tilted (~23.5°), not a north-up school globe.
- Earth slowly spins; rings stay put; three satellites travel around the rings.
- Mouse does not tilt the globe.

If the facing land is the Atlantic or the US, change only `MOSCOW_YAW_RAD` in `globe-runtime.ts` (try steps of `±0.3`) and reload until Moscow is in front. Do not move the sun to fake the shot.

If spin is too fast or too slow, change only `EARTH_PERIOD_S` / `SAT_PERIOD_S`. Architecture stays.

- [ ] **Step 3: Off-screen and reduced-motion checks**

1. Watch the facing continent, scroll until the hero is gone, wait ~10 seconds, scroll back. The globe must have advanced, not resumed from the last pose.
2. Emulate `prefers-reduced-motion: reduce`. First frame stays Moscow-facing and does not spin.
3. Switch away from the tab for a few seconds and back. The globe must **not** jump by the hidden duration.

**Review checkpoint:** stop for Evgeniy.

---

### Task 4: Night-side city lights

**Files:**
- Modify: `src/components/landing/background-model-canvas.tsx` (`Model` `useEffect` + a small helper in the same file)

**Interfaces:**
- Consumes: `NIGHT_DOT_DAY`, `NIGHT_DOT_NIGHT`, `CITY_STRENGTH`, `SUN_POSITION` from `globe-runtime.ts`. Keep `nightFactor` in `globe-runtime.ts` as the CPU twin of the GLSL formula; do not import it into the canvas if unused.
- Produces: `Mat_EarthGlobe` emissive masked by world-normal · direction-toward-sun. Europe’s cities from `EarthCityLights` appear only after that land enters shadow.

Direction toward the sun is `SUN_POSITION` normalized (the key light sits at the sun and aims at the origin).

- [ ] **Step 1: Add `applyNightLights` in `background-model-canvas.tsx`**

Place this helper above `Model`. Import `Shader`, `type MeshStandardMaterial` from `three`, and `CITY_STRENGTH`, `NIGHT_DOT_DAY`, `NIGHT_DOT_NIGHT` from `./globe-runtime`.

```ts
function directionTowardSun(): Vector3 {
  return new Vector3(...SUN_POSITION).normalize();
}

function applyNightLights(earth: Object3D): void {
  const sunToward = directionTowardSun();
  earth.traverse((obj) => {
    const mesh = obj as Mesh;
    const material = mesh.material;
    if (!mesh.isMesh || !material || Array.isArray(material)) {
      return;
    }
    const std = material as MeshStandardMaterial;
    if (!std.emissiveMap) {
      return;
    }
    std.emissive.set("#ffffff");
    std.emissiveIntensity = 1;
    std.onBeforeCompile = (shader: Shader) => {
      shader.uniforms.uSunToward = { value: sunToward };
      shader.uniforms.uCityStrength = { value: CITY_STRENGTH };
      shader.uniforms.uNightDay = { value: NIGHT_DOT_DAY };
      shader.uniforms.uNightNight = { value: NIGHT_DOT_NIGHT };
      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          `#include <common>
varying vec3 vGlobeWorldNormal;`,
        )
        .replace(
          "#include <defaultnormal_vertex>",
          `#include <defaultnormal_vertex>
vGlobeWorldNormal = normalize(mat3(modelMatrix) * objectNormal);`,
        );
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          `#include <common>
uniform vec3 uSunToward;
uniform float uCityStrength;
uniform float uNightDay;
uniform float uNightNight;
varying vec3 vGlobeWorldNormal;

float globeNightFactor(float ndot) {
  float t = (ndot - uNightDay) / (uNightNight - uNightDay);
  return clamp(t, 0.0, 1.0);
}`,
        )
        .replace(
          "#include <emissivemap_fragment>",
          `#include <emissivemap_fragment>
float ndotSun = dot(normalize(vGlobeWorldNormal), uSunToward);
totalEmissiveRadiance *= globeNightFactor(ndotSun) * uCityStrength;`,
        );
    };
    std.customProgramCacheKey = () => "gip-oko-night-lights-v1";
    std.needsUpdate = true;
  });
}
```

`nightFactor` in TS is the CPU twin of `globeNightFactor`. Keep the formulas identical. Call `applyNightLights(earth)` in the existing `Model` `useEffect` after `earthRef.current = earth`.

- [ ] **Step 2: Browser check for the terminator**

Open `http://localhost:9010/`.

Expected:

- City clusters only on the unlit hemisphere. Day-side Europe (if lit by `Light_Key`) has no dots.
- Wait until Europe rotates into shadow: Moscow / European clusters from the existing map appear, then vanish when that land returns to day.
- Oceans stay dark at night.
- If cities bloom white, lower `CITY_STRENGTH`. If they are invisible while the night side is in view, the mask or emissive map is wrong — do not paint a new point cloud.

**Review checkpoint:** stop for Evgeniy.

---

### Task 5: Acceptance, lint, owning docs

**Files:**
- Modify: `.cursor/superpowers/specs/2026-10-02-landing-product-design.md` (Hero model and motion; uniqueness idle-orbit bullet; Rendering and JavaScript continuous-animation line)
- Modify: `.cursor/superpowers/specs/2026-09-29-blender-parity-design.md` (Current renderer light-rig bullets; Runtime pointer sentence)
- Modify: `.cursor/skills/3d-landing/SKILL.md` (domain trap about idle orbit / pointer)

**Interfaces:**
- Consumes: Tasks 1–4 in the running landing.
- Produces: docs that match shipped GLB motion and lighting; lint clean.

- [ ] **Step 1: Align the product spec**

In `.cursor/superpowers/specs/2026-10-02-landing-product-design.md`, replace the Hero model and motion bullets that mention pointer response and “no continuous idle rotation” with:

```markdown
- Pointer does not tilt or rotate the globe. Starfield parallax stays owned by
  `.cursor/superpowers/specs/2026-10-06-starfield-background-design.md`.
- Earth spins slowly on a ~23.5° geographic axis. Satellites travel their
  rings. Rings do not spin with the continents. Speeds, sun, night lights,
  and the Moscow-facing first frame are owned by
  `.cursor/superpowers/specs/2026-10-06-hero-globe-runtime-design.md`.
- The previous AI Core idle orbit of the whole assembly is not part of
  this landing.
- Reduced motion produces an immediate static Moscow-facing frame.
```

In Uniqueness check, replace `continuous idle orbit from the previous AI Core canvas` with `whole-assembly idle orbit from the previous AI Core canvas`.

In Rendering and JavaScript, replace `Do not use continuous animation when the model or starfield is idle.` with:

```markdown
- The globe uses a continuous frame loop only while the hero is on-screen,
  the document is visible, and reduced motion is off. Off-screen skips
  frames but wall-clock pose still advances. Hidden document pauses the
  clock. Starfield motion stays owned by the starfield spec.
```

- [ ] **Step 2: Align the parity spec and 3d-landing skill**

In `.cursor/superpowers/specs/2026-09-29-blender-parity-design.md` **Current renderer**, replace the cyan/violet rig bullet with:

```markdown
- Light rig owned by
  `.cursor/superpowers/specs/2026-10-06-hero-globe-runtime-design.md`:
  Blender `Light_Key` sun, `Light_Rim` fill, dim hemisphere. No cyan/violet
  studio keys. No `KHR_lights_punctual`.
```

Replace `Idle orbit and other continuous animation are not part of this contract.` with `Motion is owned by the hero globe runtime spec, not this color-pipeline spec.`

Replace `The page remains usable without pointer input; pointer movement stays an optional decorative enhancement.` with `The page remains usable without pointer input. Globe motion does not use the pointer.`

In `.cursor/skills/3d-landing/SKILL.md` domain traps, replace the idle-orbit / pointer paragraph with:

```markdown
- Do not restore the previous AI Core idle orbit of the whole assembly.
  Earth axial spin, satellite ring travel, sun, night lights, and the
  Moscow-facing frame are owned by
  `.cursor/superpowers/specs/2026-10-06-hero-globe-runtime-design.md`.
  Pause the clock when the document is hidden. Off-screen may skip frames
  but must not freeze Earth. Reduced motion is a static first frame.
```

In that skill’s checklist item 8, also compare
`.cursor/superpowers/specs/2026-10-06-hero-globe-runtime-design.md` for GLB
canvas work.

- [ ] **Step 3: Lint**

Run: `npm run lint`

Expected: exit 0.

- [ ] **Step 4: Full acceptance in the browser**

Desktop, motion allowed:

1. Stars show around the globe; no dark-blue WebGL plate.
2. Satellites read as metal / gold / solar / cyan / violet.
3. First frame: Eastern Europe / Moscow, frontal, ~23.5° tilt.
4. Warm `Light_Key` sun; night cities follow it.
5. Earth spins; rings stay; satellites travel rings.
6. City lights only on the night side; Europe lights up after it enters shadow.
7. Mouse does not tilt the globe.
8. Scroll away and back: Earth has continued.

Also: 390 px, no horizontal overflow, copy/CTA readable; keyboard hash links work; reduced motion static; hidden tab does not jump; no console / hydration / unexpected network errors.

If a check fails, fix in this task. Do not report completion with a failed check.

**Review checkpoint:** stop for Evgeniy.
