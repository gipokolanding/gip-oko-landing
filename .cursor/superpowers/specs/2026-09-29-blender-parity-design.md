# Blender-to-Landing Render Parity

**Status:** implemented 2026-09-29

## Goal

`public/models/background-model.glb` renders in the landing like
`.cursor/ai-assets/background-model.blend` in Blender's Rendered viewport:
green land, dark-blue oceans, distinct cyan/violet/amber orbits, and readable
satellite detail without clipped white highlights.

## Evidence and root cause

The original mismatch was in the export/render color-light pipeline, not in
geometry or texture loading:

- The Blender Rendered viewport showed the intended balanced colors.
- The previous GLB (2,293,692 bytes) embedded `KHR_lights_punctual` lights
  (`Light_Key` intensity `8196`, `Light_Rim` about `32.61`).
- `src/components/background-model-canvas.tsx` added a second light rig on
  top of those imported lights and used implicit R3F tone mapping.

## Current asset

The generated GLB is exported from the unchanged source
`.cursor/ai-assets/background-model.blend` through Blender's glTF exporter.

- Path: `public/models/background-model.glb`
- Size: 2,292,904 bytes (below 5 MB)
- Preserved: meshes, hierarchy, embedded textures, PBR and emissive materials,
  object transforms
- Excluded: Blender lights, camera, and baked animation
- Contract: no `KHR_lights_punctual`, no light nodes, no cameras

## Current renderer

`src/components/landing/background-model-canvas.tsx` is the sole owner of
runtime lighting.

- `gl.outputColorSpace = SRGBColorSpace`
- `gl.toneMapping = AgXToneMapping`
- `gl.toneMappingExposure = 0.8`
- Light rig owned by
  `.cursor/superpowers/specs/2026-10-06-hero-globe-runtime-design.md`:
  Blender `Light_Key` sun, `Light_Rim` fill, dim hemisphere. No cyan/violet
  studio keys. No `KHR_lights_punctual`.
- `basePath` handling, reduced-motion demand loop, loading state, and WebGL
  fallback remain part of this pipeline
- Camera framing may change with the landing layout
- Motion is owned by the hero globe runtime spec, not this color-pipeline spec.

The landing preserves authored material colors in WebGL. It does not bake the
Blender image into CSS or a billboard.

## Runtime and failure behavior

- The model remains client-rendered through React Three Fiber and Drei.
- Local URL and production `basePath` behavior are unchanged.
- GLB load or WebGL failures use the existing static fallback.
- Reduced motion keeps a static model and a demand-driven frame loop.
- The page remains usable without pointer input. Globe motion does not use the
  pointer.

## Out of scope

- Redesigning the hero or changing its copy
- Rebuilding geometry, textures, or satellite models
- Adding remote environment maps, post-processing packages, or new assets
- Changing the Blender source's intended visual design
