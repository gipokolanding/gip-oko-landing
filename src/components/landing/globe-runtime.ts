import { Quaternion, Vector3 } from "three";

export const EARTH_PERIOD_S = 150;
/** Inner-orbit period. Mid and high orbits scale speed from this. */
export const SAT_PERIOD_S = 55;
export const SAT_SPEED_INNER = 1;
export const SAT_SPEED_MID = 1.5;
export const SAT_SPEED_HIGH = 2;
/** All three satellites start 180° along their rings. */
export const SAT_PHASE_FLIP_RAD = Math.PI;
/** Extra start along the high orbit, in the direction of travel. */
export const SAT_HIGH_EXTRA_RAD = Math.PI / 4;
export const CAMERA_DISTANCE = 4.5;
// Around EARTH_SPIN_AXIS so sunToward · camera ≈ 0.6 (~80% day).
export const CAMERA_AZIMUTH_RAD = 1.054;
// t = 0 faces Central Siberia (Novosibirsk ~83° E), not Moscow.
export const FACING_YAW_RAD = -2.3124;

// Geographic north (Arctic UV pole) in Three object space. Already ~23.5°
// from +Y in the GLB — do not add a second tilt around world Z.
export const EARTH_SPIN_AXIS: [number, number, number] = [
  0.12292, 0.91748, 0.37832,
];

export const EARTH_ROUGHNESS = 0.85;
export const EARTH_METALNESS = 0;
export const EARTH_SPECULAR_INTENSITY = 0.12;

export const CITY_STRENGTH = 22;
export const NIGHT_DOT_DAY = 0.16;
export const NIGHT_DOT_NIGHT = -0.12;

export const SUN_COLOR = "#ffe6c7";
export const SUN_INTENSITY = 6.6;
// Blend Light_Key X/Y kept. Blender Z (Three Y) lowered so sun · north
// ≈ sin(23.5°): Arctic keeps a small summer cap, southern Africa is day.
export const SUN_POSITION = blenderToThree([1.71261, 0.49884, 0.83]);

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
  return EARTH_SPIN_AXIS;
}

export function satOrbitMotion(
  radius: number,
  radii: readonly number[],
): { startAngle: number; periodS: number } {
  const ranked = [...radii].sort((a, b) => a - b);
  let index = 0;
  let best = Number.POSITIVE_INFINITY;
  for (let i = 0; i < ranked.length; i++) {
    const d = Math.abs(ranked[i] - radius);
    if (d < best) {
      best = d;
      index = i;
    }
  }
  const speed =
    index >= 2
      ? SAT_SPEED_HIGH
      : index <= 0
        ? SAT_SPEED_INNER
        : SAT_SPEED_MID;
  return {
    startAngle:
      SAT_PHASE_FLIP_RAD +
      (speed === SAT_SPEED_HIGH ? SAT_HIGH_EXTRA_RAD : 0),
    periodS: SAT_PERIOD_S / speed,
  };
}

export function heroCameraPosition(): [number, number, number] {
  const axis = new Vector3(...EARTH_SPIN_AXIS);
  const pos = new Vector3(0, 0, CAMERA_DISTANCE);
  pos.applyQuaternion(
    new Quaternion().setFromAxisAngle(axis, CAMERA_AZIMUTH_RAD),
  );
  return [pos.x, pos.y, pos.z];
}
