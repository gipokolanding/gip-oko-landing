"use client";

import { useGLTF } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  AgXToneMapping,
  Box3,
  Color,
  Group,
  Mesh,
  Object3D,
  Quaternion,
  SRGBColorSpace,
  Vector3,
  type MeshPhysicalMaterial,
  type MeshStandardMaterial,
} from "three";
import {
  CITY_STRENGTH,
  EARTH_SPIN_AXIS,
  EARTH_METALNESS,
  EARTH_PERIOD_S,
  EARTH_ROUGHNESS,
  EARTH_SPECULAR_INTENSITY,
  FILL_GROUND,
  FILL_INTENSITY,
  FILL_SKY,
  MOSCOW_YAW_RAD,
  NIGHT_DOT_DAY,
  NIGHT_DOT_NIGHT,
  OBJECT_NAMES,
  RIM_COLOR,
  RIM_INTENSITY,
  RIM_POSITION,
  satOrbitMotion,
  SUN_COLOR,
  SUN_INTENSITY,
  SUN_POSITION,
  createMotionClock,
  heroCameraPosition,
  motionSeconds,
  pauseMotionClock,
  resumeMotionClock,
  type MotionClock,
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

function blenderName(root: Object3D, name: string): Object3D {
  const found = root.getObjectByName(name);
  if (!found) {
    throw new Error(`GLB missing object ${name}`);
  }
  return found;
}

// Satellites are Groups (one child Mesh per material) and rings are centered
// on the origin, so the plan's mesh-only centroid/normal helpers do not work
// on this GLB. Measure from world-space vertices instead.
function worldPoints(root: Object3D): Vector3[] {
  root.updateWorldMatrix(true, true);
  const points: Vector3[] = [];
  root.traverse((child) => {
    const mesh = child as Mesh;
    if (!mesh.isMesh) {
      return;
    }
    const position = mesh.geometry.getAttribute("position");
    for (let i = 0; i < position.count; i += 1) {
      points.push(
        new Vector3(position.getX(i), position.getY(i), position.getZ(i))
          .applyMatrix4(mesh.matrixWorld),
      );
    }
  });
  return points;
}

// Satellite orbit radius: distance of its bounding-box center from the origin.
function satelliteRadius(sat: Object3D): number {
  const box = new Box3().setFromObject(sat);
  return box.getCenter(new Vector3()).length();
}

function bindSatPivots(
  entries: { pivot: Group; axis: Vector3; radius: number }[],
) {
  const radii = entries.map((entry) => entry.radius);
  return entries.map(({ pivot, axis, radius }) => {
    const { startAngle, periodS } = satOrbitMotion(radius, radii);
    pivot.userData.orbitStart = startAngle;
    pivot.userData.orbitPeriod = periodS;
    pivot.userData.orbitRadius = radius;
    return { pivot, axis, startAngle, periodS };
  });
}

// Ring radius: mean vertex distance from the origin (ring is centered there).
function ringRadius(points: Vector3[]): number {
  let sum = 0;
  for (const point of points) {
    sum += point.length();
  }
  return sum / points.length;
}

// Ring plane normal: smallest-variance axis of the vertex cloud (PCA via
// power iteration on trace * I - covariance).
function ringPlaneNormal(points: Vector3[]): Vector3 {
  const mean = new Vector3();
  for (const point of points) {
    mean.add(point);
  }
  mean.divideScalar(points.length);

  let xx = 0;
  let xy = 0;
  let xz = 0;
  let yy = 0;
  let yz = 0;
  let zz = 0;
  for (const point of points) {
    const dx = point.x - mean.x;
    const dy = point.y - mean.y;
    const dz = point.z - mean.z;
    xx += dx * dx;
    xy += dx * dy;
    xz += dx * dz;
    yy += dy * dy;
    yz += dy * dz;
    zz += dz * dz;
  }
  const trace = xx + yy + zz;
  const axis = new Vector3(0.31, 0.57, 0.76).normalize();
  for (let i = 0; i < 64; i += 1) {
    axis
      .set(
        (trace - xx) * axis.x - xy * axis.y - xz * axis.z,
        -xy * axis.x + (trace - yy) * axis.y - yz * axis.z,
        -xz * axis.x - yz * axis.y + (trace - zz) * axis.z,
      )
      .normalize();
  }
  return axis;
}

function axisAngle(axis: Vector3, angle: number): Quaternion {
  return new Quaternion().setFromAxisAngle(axis, angle);
}

function directionTowardSun(): Vector3 {
  return new Vector3(...SUN_POSITION).normalize();
}

// three 0.18x types no longer export `Shader`; derive it from the hook.
type Shader = Parameters<NonNullable<MeshStandardMaterial["onBeforeCompile"]>>[0];

// Masks the existing EarthCityLights emissive map by world-normal . sun
// direction, so city lights show only on the night side. The GLSL
// globeNightFactor is the GPU twin of nightFactor in globe-runtime.ts.
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

function HeroCamera() {
  const camera = useThree((state) => state.camera);
  const [x, y, z] = heroCameraPosition();

  useLayoutEffect(() => {
    camera.position.set(x, y, z);
    camera.up.set(...EARTH_SPIN_AXIS);
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();
  }, [camera, x, y, z]);

  return null;
}

function Model({
  onReady,
  reducedMotion,
  visible,
  clockRef,
}: BackgroundModelCanvasProps & {
  reducedMotion: boolean;
  visible: boolean;
  clockRef: { current: MotionClock };
}) {
  const { scene } = useGLTF(MODEL_URL);
  const invalidate = useThree((state) => state.invalidate);
  const earthRef = useRef<Object3D | null>(null);
  const satPivots = useRef<
    { pivot: Group; axis: Vector3; startAngle: number; periodS: number }[]
  >([]);
  const ready = useRef(false);
  const clockRebased = useRef(false);

  // Pose comes from wall-clock time and is applied whether or not the hero is
  // on screen, so the first on-screen frame is always correct.
  const applyPose = useCallback(() => {
    if (!ready.current || !earthRef.current) {
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
    earthRef.current.quaternion.setFromAxisAngle(
      new Vector3(...EARTH_SPIN_AXIS),
      earthAngle,
    );

    for (const { pivot, axis, startAngle, periodS } of satPivots.current) {
      const satAngle = reducedMotion
        ? 0
        : (seconds / periodS) * Math.PI * 2;
      pivot.quaternion.copy(axisAngle(axis, satAngle + startAngle));
    }
  }, [clockRef, reducedMotion]);

  useEffect(() => {
    const earth = blenderName(scene, OBJECT_NAMES.earth);
    earthRef.current = earth;
    applyEarthLook(earth);
    applyNightLights(earth);

    // t = 0 is the moment the GLB is ready, so load time does not yaw Moscow.
    const rebaseClock = () => {
      if (clockRebased.current) {
        return;
      }
      clockRebased.current = true;
      const now = performance.now();
      clockRef.current = createMotionClock(now);
      if (document.hidden) {
        pauseMotionClock(clockRef.current, now);
      }
    };

    if (scene.getObjectByName(`${OBJECT_NAMES.sats[0]}_Orbit`)) {
      satPivots.current = bindSatPivots(
        OBJECT_NAMES.sats.map((name) => {
          const pivot = blenderName(scene, `${name}_Orbit`) as Group;
          const sat = blenderName(scene, name);
          const radius =
            typeof pivot.userData.orbitRadius === "number"
              ? pivot.userData.orbitRadius
              : satelliteRadius(sat);
          return {
            pivot,
            axis: (pivot.userData.orbitAxis as Vector3).clone(),
            radius,
          };
        }),
      );
      rebaseClock();
      ready.current = true;
      applyPose();
      onReady();
      invalidate();
      return;
    }

    scene.updateMatrixWorld(true);
    const rings = OBJECT_NAMES.rings.map((name) => {
      const points = worldPoints(blenderName(scene, name));
      return { name, radius: ringRadius(points), axis: ringPlaneNormal(points) };
    });

    const assigned = OBJECT_NAMES.sats.map((name) => {
      const sat = blenderName(scene, name);
      const radius = satelliteRadius(sat);
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
      return { pivot, axis: nearest.axis.clone(), radius };
    });
    satPivots.current = bindSatPivots(assigned);

    rebaseClock();
    ready.current = true;
    applyPose();
    onReady();
    invalidate();
  }, [applyPose, clockRef, invalidate, onReady, scene]);

  // Re-pose and request a frame when the hero becomes visible (or the pose
  // inputs change). Needed under frameloop="demand" (reduced motion).
  useEffect(() => {
    if (!visible) {
      return;
    }
    applyPose();
    invalidate();
  }, [applyPose, invalidate, visible]);

  useFrame(() => {
    applyPose();
  });

  return <primitive object={scene} dispose={null} />;
}

export function BackgroundModelCanvas({ onReady }: BackgroundModelCanvasProps) {
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  const hostRef = useRef<HTMLDivElement>(null);
  // Re-based to performance.now() in the effect below; render must stay pure.
  const clockRef = useRef<MotionClock>(createMotionClock(0));
  const [visible, setVisible] = useState(true);
  const [hidden, setHidden] = useState(
    () => typeof document !== "undefined" && document.hidden,
  );

  useEffect(() => {
    const node = hostRef.current;
    if (!node) {
      return;
    }

    // Provisional start; Model re-bases it when the GLB is ready.
    const startedAt = performance.now();
    clockRef.current = createMotionClock(startedAt);
    if (document.hidden) {
      pauseMotionClock(clockRef.current, startedAt);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
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
        camera={{
          position: heroCameraPosition(),
          fov: 35,
          near: 0.1,
          far: 100,
          up: EARTH_SPIN_AXIS,
        }}
        dpr={[1, 1.5]}
        frameloop={frameloop}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
          premultipliedAlpha: false,
        }}
        onCreated={({ camera, gl, scene, invalidate }) => {
          gl.outputColorSpace = SRGBColorSpace;
          gl.toneMapping = AgXToneMapping;
          gl.toneMappingExposure = 0.8;
          gl.setClearColor(new Color(0x000000), 0);
          scene.background = null;
          camera.up.set(...EARTH_SPIN_AXIS);
          camera.lookAt(0, 0, 0);
          invalidate();
        }}
      >
        <HeroCamera />
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
            visible={visible}
            clockRef={clockRef}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload(MODEL_URL);
