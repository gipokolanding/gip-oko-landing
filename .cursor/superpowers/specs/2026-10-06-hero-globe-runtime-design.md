# Hero globe runtime: lighting, frame, night lights, motion

**Status:** implemented 2026-10-07

## Document purpose

This document is the implementation source of truth for the hero GLB’s
runtime look and motion: transparent canvas, Blender-matched sun, Siberia
facing shot, axial spin, satellites on their rings, and city lights only
on the night side. It also owns the 2026-10-07 look pass: runtime Earth
PBR (matte planet, not a specular ball), camera azimuth for about **80%
day / 20% night** on the visible disk, and key intensity after that frame.

The published page remains Russian-language. This specification is written
in English for the implementation team.

If this document conflicts with product-safety restrictions in
`.cursor/docs/brief.md`, the brief wins. Hero copy, CTA, starfield, and
AgX/sRGB color management stay owned by their existing specs. This
document owns **GLB motion, pointer response, the canvas light rig,
Earth PBR overrides, and camera azimuth**; the product spec and
3d-landing skill point here.

## Context

- Source: `.cursor/ai-assets/background-model.blend` (Blender MCP connected
  to this file during design).
- Runtime asset: `public/models/background-model.glb`.
- Canvas: `src/components/landing/background-model-canvas.tsx`.
- The blend already has `Light_Key` (Sun), `Light_Rim` (Point),
  `EarthCityLights` plus a night-side emission mask, and tinted satellite
  materials. Before this spec the landing replaced that sun with a
  cyan/violet rig, tilted the whole group on pointer move, showed city
  lights as a baked always-on emissive, and drew white satellites because
  Mix Shader rims do not survive glTF export. The canvas now owns the
  sun, axial spin, night mask, matte Earth PBR override, and 80/20
  camera azimuth.
- The blend scene is static. Night lights on the currently dark
  hemisphere are a shader mask, not a baked half-map. `EarthCityLights`
  is a full-globe city map (Europe and Moscow are present in the texture;
  oceans and Sahara are dark).

Look pass (closed 2026-10-07; started as ~70/30, shipped ~80/20):

The runtime GLB used the color `EarthLandMask` as
`metallicRoughnessTexture`, so blue oceans became near-zero roughness
and `MeshStandardMaterial` ignored Principled specular 0.06. The canvas
overrides Earth roughness/metalness. Camera azimuth around the spin
axis sets the day/night disk fraction; do not move the sun to fake it.
The canvas may lower Light_Key’s Three Y for Earth-like declination;
that is not an 80/20 cheat. Blend `Mat_EarthGlobe` stays metallic 0,
Specular IOR Level **0.06**, roughness Color Ramp **0.64–0.90**,
`Light_Key` energy **12**.

## Goal

The hero globe reads as the Blender Rendered reference in space: stars
show around it, satellites keep their authored materials, a warm sun
lights the Earth from the source `Light_Key` direction, Central Siberia
faces the camera at t = 0, Earth spins on a
~23.5° axis, satellites travel their rings, and city clusters appear only
where that sun does not light the surface — including Europe once that
land rotates into shadow.

Day-side land reads closer to the Blender Rendered reference than the
2.2 / 0.8 / 50-50 shot. The globe is a matte planet, not a specular
ball. The visible disk is about 80% sunlit and 20% night, so fewer city
lights sit in the first view.

## Non-goals

- Do not add live astronomical ephemerides or a clock-of-day that follows
  the visitor’s timezone.
- Do not import `KHR_lights_punctual`, cameras, or baked spin into the GLB.
- Do not restore pointer-driven tilt or the previous AI Core idle orbit of
  the whole assembly.
- Do not rebuild globe or satellite geometry, replace `EarthCityLights`, or
  paint new cities. Keep the two-color `EarthLandMask` (green land, blue
  ocean); do not use a photographic Earth map.
- Do not change hero copy, CTA, starfield parallax, or page layout.
- Do not tilt the camera into an oblique cinematic shot or copy
  `Camera_Hero` (closer, 50 mm) as the landing camera.
- Do not move `Light_Rim` or the `.blend` `Light_Key`. The canvas may
  offset the key’s Three Y for Earth-like declination; do not change
  that by rotating Earth or `camera.up`.
- Do not re-export the GLB to bake the Color Ramp roughness map. Do not
  edit satellite materials for this look pass.
- Do not add a second WebGL context or star particles inside the GLB canvas.
- Do not add environment maps, post-processing, or new npm dependencies.

## Ownership

| Concern | Owner |
| --- | --- |
| Satellite Principled materials, Earth emissive map, land albedo | `.blend` via Blender MCP, then re-export GLB |
| Sun, rim, fill, camera, spin, satellite orbits, night mask | `background-model-canvas.tsx` |
| Earth roughness / metalness at runtime | `background-model-canvas.tsx` + `globe-runtime.ts` |
| Camera azimuth around the spin axis | same |
| Key intensity after the 80/20 frame | `SUN_INTENSITY` in `globe-runtime.ts` |
| AgX, sRGB, exposure 0.8, no lights in GLB | [Blender parity spec](./2026-09-29-blender-parity-design.md) |
| Hero copy, layout, CTA | [Landing product spec](./2026-10-02-landing-product-design.md) |
| Page-wide stars | [Starfield spec](./2026-10-06-starfield-background-design.md) |

Keep object names: `Core_Earth`, `Orbit_Ring_01` / `_02` / `_03`,
   `Sat_GLONASS_K`, `Sat_ResursP`, `Sat_Sentinel1`, `Light_Key`, `Light_Rim`.
Do not rename them for the landing.

## Blender export

Edit `.cursor/ai-assets/background-model.blend` only as needed for glTF:

1. Satellite materials `Mat_SatMetal`, `Mat_SatCyan`, `Mat_SatGold`,
   `Mat_SatSolar`, `Mat_SatViolet`, `Mat_SatSAR`: connect **Principled
   BSDF** directly to Material Output. Keep existing base color, metallic,
   roughness, and Principled emission. Disconnect the `SatRim_Mix` /
   `Layer Weight` graphs and leave those nodes unused (they export as white).
2. `Mat_EarthGlobe`: keep `EarthLandMask` on base color. That image is
   the two-color land/ocean mask (green continents, dark-blue water).
   Keep `EarthCityLights` as the emissive color map. Do **not** bake the
   night-side math (`CityLights_Dot` / `Map Range`) into a static
   emission strength that glTF will treat as always on. Export the city
   map so the canvas can modulate it.
3. Leave `Light_Key`, `Light_Rim`, and `Camera_Hero` in the blend for
   authoring. Export **without** lights and camera, as today.
4. Do not change globe/ring/satellite meshes or the packed city image.

Write `public/models/background-model.glb` below 5 MB, with no
`KHR_lights_punctual`, no light nodes, no cameras.

## Canvas lighting

Remove the current cyan/violet key rig (`directionalLight` `#bdf8ff` at
2.6 and `pointLight` `#7658ff` at 8).

Replace it with:

- **Key:** one `directionalLight` matching `Light_Key`: color
  `(1.0, 0.93, 0.78)`, azimuth from the blend Sun, converted into the
  glTF / Three.js Y-up frame. The blend placed the sun at Three Y
  **3.58**, so `sun · north ≈ 0.83` (~56° declination): Arctic always
  day, southern Africa always night. Canvas Three Y is **0.83** so
  `sun · north ≈ sin(23.5°)`; X/Z stay the blend values. The light is
  **not** parented to `Core_Earth`. Calibrate intensity **after** the
  matte Earth override and the 80/20 camera (those two already raise
  mean disk luminance). Calibrated value: `SUN_INTENSITY = 6.6` (from
  2.2 via 4.2; Evgeniy still found 4.2 too dark). Day-side land is
  brighter without a clipped white cap. Do not copy Blender
  `energy: 12` as a Three.js intensity one-to-one. If a later
  comparison against the blend still looks dark, raise in the same
  step size and document the value here. Do not raise fill unless the
  night limb becomes a punched hole after the key change. If a higher
  key still cannot match the blend without clipping, then and only
  then raise `toneMappingExposure` by 0.1 toward 1.0 and document the
  value here. After any Y change, retune `CAMERA_AZIMUTH_RAD` so the
  disk stays ~80/20, and shift `FACING_YAW_RAD` by the same Δ.
- **Rim:** one `pointLight` matching `Light_Rim`: color
  `(0.25, 0.32, 0.45)`, position from the blend (same Y-up conversion),
  low energy. Fills the night limb; it is not city lights.
- **Fill:** one dim `hemisphereLight` with a cool ground near the rim
  color. Intensity is far below the current 1.45 — enough to keep night
  land/ocean as a readable dark surface, not a punched hole and not a
  second studio key. This fill is not city lights.

Do not load lights from the GLB. If a future export contains punctual
lights, strip them rather than stacking a second rig.

Keep `gl.outputColorSpace = SRGBColorSpace`, `AgXToneMapping`, and
`toneMappingExposure = 0.8` unless the key-intensity calibration above
proves another exposure.

## Transparent background

- `gl.alpha = true`.
- `scene.background = null`.
- Clear color alpha is 0.
- Stars on the page-wide Canvas 2D layer show through empty hero pixels
  around the model.
- The Earth mesh stays opaque. Night ocean and land remain surfaces.

## Camera and initial pose

- Camera looks **frontally** at the globe center: distance **4.5**,
  fov 35, `lookAt` the origin. No orbit-controls, no top-down, no
  cinematic pitch. `camera.up` is **`EARTH_SPIN_AXIS`** so geographic
  north sits at **12 o’clock** on the disk. Do not guess roll angles.
- Place the camera by rotating `[0, 0, 4.5]` around
  `EARTH_SPIN_AXIS` (right-hand rule) toward **+X** so
  `sunToward · normalize(cameraPosition) ≈ 0.6`
  (illuminated-disk fraction `(1 + cos φ) / 2 ≈ 0.80`). After the
  declination Y drop: **`CAMERA_AZIMUTH_RAD = 1.054`** (~60.4°). Named
  constant; tune in the browser without changing this architecture.
- Geographic north is locked to screen-up (12 o’clock). The GLB already
  places Arctic/Antarctic ~23.5° from object +Y (land UV poles). Spin
  around that authored axis (`EARTH_SPIN_AXIS`). Do **not** add a second
  23.5° tilt around world Z — that made the poles orbit the geometric Y
  axis.
- At t = 0, the facing hemisphere is Central Siberia.
  Landmark: Novosibirsk (~83° E, 55° N) in the front hemisphere, readable
  as the facing region, not a pixel-perfect geodetic lock.
- Yaw around `EARTH_SPIN_AXIS` until that land faces the **new** camera
  (`FACING_YAW_RAD = -2.3124`). Do not rotate Earth off its geographic
  axis to fake the shot. Rings stay world-fixed; they may read at a
  new azimuth. That is expected. Reduced motion uses this same camera
  and yaw.
- Do not author a separate terminator. The 80/20 split is camera-versus-
  sun geometry, not a painted night map.

## Earth material (matte)

After the GLB loads, on meshes under `Core_Earth` only (`Mat_EarthGlobe`):

- `metalness = 0`
- `metalnessMap = null`
- `roughnessMap = null`
- `roughness = 0.85` (named constant `EARTH_ROUGHNESS`; midpoint of the
  blend ramp 0.64–0.90)

Do not touch orbit or satellite materials. Keep `applyNightLights`. If
the loader created a `MeshPhysicalMaterial`, also set specular intensity
to match Principled 0.06 (about **0.12** of Three’s default 0.5); if it
is `MeshStandardMaterial`, the roughness override is enough.

Look-pass order: (1) matte override, (2) camera azimuth + facing yaw,
(3) `SUN_INTENSITY`, then exposure only if needed. Files:
`globe-runtime.ts` and `background-model-canvas.tsx`. No GLB rewrite.

## Motion

Pointer tilt (`PointerDemand`, `state.pointer` lerp, group rotation
driven by the mouse) is **removed**. The starfield may still parallax;
that is out of this spec.

### Earth

Rotate only `Core_Earth` around `EARTH_SPIN_AXIS` (through the land
map’s Arctic and Antarctic). Poles stay on that axis like a record.
Orbit rings do not spin with the continents.

Starting period: **one Earth revolution in 150 seconds** (midpoint of the
agreed 2–3 minute band). Named constant in the canvas; tune after the
first browser check without changing this architecture.

### Satellites

`Sat_GLONASS_K`, `Sat_ResursP`, and `Sat_Sentinel1` keep their mesh
radius. After load, assign each satellite to the orbit ring whose radius
is closest to that satellite’s centroid distance from the origin. Parent
each to a pivot at the Earth origin and rotate it around that ring’s
**plane normal**. Rings stay static meshes.

Inner-orbit period: **one revolution in 55 seconds** (`SAT_PERIOD_S`,
midpoint of 40–70 seconds). Speeds scale from that: inner ×1, mid ×1.5,
high ×2 (`SAT_SPEED_INNER` / `SAT_SPEED_MID` / `SAT_SPEED_HIGH`). Keep
each satellite’s nose along the orbit tangent. Do not animate solar-panel
articulation. All three start **180°** along their orbit
(`SAT_PHASE_FLIP_RAD`); the high orbit adds **45°** in the direction of
travel (`SAT_HIGH_EXTRA_RAD`) so it is further along on the first frames.

### Time, pause, reduced motion

- Advance Earth and satellite angles from **wall-clock time**, not from
  a frame delta that freezes when `useFrame` does not run.
- When the hero is **off-screen**, skip rendering if useful, but **do
  not freeze** the pose. Scrolling back shows the globe further along.
- When `document.hidden` is true, **pause** the clock (no jump while the
  tab is in the background). Resume from the paused angle.
- `prefers-reduced-motion: reduce`: static first frame (Siberia facing,
  sun, night lights as they are at t = 0). No Earth spin, no satellite
  motion. `frameloop="demand"` in that state.
- Visible hero and no reduced motion: continuous `frameloop` so spin
  runs.
- Keyboard and no-mouse use do not control the globe. Decoration moves
  by itself.

## Night city lights

Use the exported `EarthCityLights` map. Do not draw a new point cloud.

Each frame, emission strength is:

`cityLuminance * nightFactor * strength`

where `nightFactor` is a clamped map-range of
`dot(worldNormal, directionTowardSun)` with the blend’s endpoints
**0.16 → 0** (day) and **−0.12 → 1** (night), and `strength` starts at
the blend’s **22**. Direction toward the sun is the opposite of the key
light’s ray direction, in world space, so it stays fixed while Earth
rotates.

Consequences:

- Day-side cities, including Europe at t = 0 if that land is lit, stay
  dark.
- When Europe rotates into `Light_Key` shadow, the **same** texture
  clusters (Moscow, Western Europe, and other mapped cities) appear.
- Oceans and empty land in the map stay dark at night.

Implement the mask in the canvas (material `onBeforeCompile` or an
equivalent MeshPhysical/Standard hook). Do not rely on the blend’s
`COMBXYZ` object-space vector after export.

## Failure and accessibility

- GLB or WebGL failure: existing static hero fallback. No extra 3D.
- 390 px: globe stays decorative; copy and CTA remain readable; no
  horizontal overflow.
- The canvas does not intercept CTA or scrolling (`touch-action: pan-y`
  remains).
- Reduced motion as above.

## Acceptance

Desktop, motion allowed:

1. Empty pixels around the globe show page stars, not a dark-blue plate.
2. Satellites read as metal / gold / solar / cyan / violet, not white
   unshaded hulls.
3. First frame faces Central Siberia (Novosibirsk as landmark), frontal.
   Geographic north is at 12 o’clock on the disk. Earth still spins on
   the authored ~23.5° axis in the GLB.
4. Visible disk is about 80% day / 20% night (terminator toward one
   limb, not a vertical 50/50 split). No hard specular cap on the
   oceans; land and water read matte. Day-side land is closer to the
   Blender Rendered source than the 2.2 / 0.8 / 50-50 shot, without a
   clipped white dome.
5. Key light is the warm sun from `Light_Key`, not cyan/violet studio
   keys. Night cities follow that sun and occupy less of the first view
   because more of the disk is day.
6. Earth spins slowly on that axis. Rings do not stick to continents.
   Satellites travel their rings.
7. City lights exist only on the night side. After Europe enters shadow,
   European clusters from `EarthCityLights` appear; they vanish on the
   day side.
8. Moving the mouse does not tilt the globe.
9. Scroll away and back: Earth has continued; it is not frozen at the
   last on-screen pose.

Also:

- Reduced motion: static Siberia frame, no spin.
- Hidden tab: clock paused.
- 390 px, keyboard, no-mouse: page works; globe is not a control.
- GLB below 5 MB, no lights/cameras in the file.
- No console / hydration / unexpected network errors.
- `npm run lint` from the repository root (Definition of Done in
  `AGENTS.md`).

## Out of scope

Hero copy, CTA URL, starfield rules, new npm dependencies, remote
textures, post-processing packages, live sun ephemeris, 23.5° seasonal
precession over the calendar year, rebuilding satellite meshes,
re-exporting the GLB to bake the Color Ramp, matching `Camera_Hero`
distance or 50 mm lens, and closing the 2026-10-06 plan in Git.
