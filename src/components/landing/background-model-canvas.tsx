"use client";

import { Center, useGLTF } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Suspense,
  useEffect,
  useRef,
  useSyncExternalStore,
  type MutableRefObject,
} from "react";
import {
  AgXToneMapping,
  Group,
  MathUtils,
  SRGBColorSpace,
} from "three";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const MODEL_URL = `${BASE_PATH}/models/background-model.glb`;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const FINE_POINTER_QUERY = "(pointer: fine)";

type BackgroundModelCanvasProps = {
  onReady: () => void;
};

type FlagRef = MutableRefObject<boolean>;

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

function Model({
  onReady,
  reducedMotion,
  finePointer,
  visibleRef,
  hiddenRef,
}: BackgroundModelCanvasProps & {
  reducedMotion: boolean;
  finePointer: boolean;
  visibleRef: FlagRef;
  hiddenRef: FlagRef;
}) {
  const group = useRef<Group>(null);
  const { scene } = useGLTF(MODEL_URL);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    onReady();
    invalidate();
  }, [invalidate, onReady]);

  useFrame((state) => {
    if (
      !group.current ||
      reducedMotion ||
      !finePointer ||
      !visibleRef.current ||
      hiddenRef.current
    ) {
      return;
    }

    group.current.rotation.x = MathUtils.lerp(
      group.current.rotation.x,
      state.pointer.y * 0.045,
      0.08,
    );
    group.current.rotation.y = MathUtils.lerp(
      group.current.rotation.y,
      -0.28 + state.pointer.x * 0.07,
      0.08,
    );
  });

  return (
    <group ref={group} rotation={[0, -0.28, 0]}>
      <Center>
        <primitive object={scene} dispose={null} />
      </Center>
    </group>
  );
}

function PointerDemand({
  enabled,
  visibleRef,
  hiddenRef,
}: {
  enabled: boolean;
  visibleRef: FlagRef;
  hiddenRef: FlagRef;
}) {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const onMove = () => {
      if (visibleRef.current && !hiddenRef.current) {
        invalidate();
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [enabled, hiddenRef, invalidate, visibleRef]);

  return null;
}

export function BackgroundModelCanvas({ onReady }: BackgroundModelCanvasProps) {
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  const finePointer = useMediaQuery(FINE_POINTER_QUERY);
  const visibleRef = useRef(true);
  const hiddenRef = useRef(false);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = hostRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.01 },
    );
    observer.observe(node);

    const onVisibility = () => {
      hiddenRef.current = document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

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
        }}
        onCreated={({ gl, invalidate }) => {
          gl.outputColorSpace = SRGBColorSpace;
          gl.toneMapping = AgXToneMapping;
          gl.toneMappingExposure = 0.8;
          invalidate();
        }}
      >
        <ambientLight intensity={0.55} />
        <hemisphereLight args={["#d9faff", "#080914", 1.45]} />
        <directionalLight
          color="#bdf8ff"
          intensity={2.6}
          position={[3.5, 4, 5]}
        />
        <pointLight color="#7658ff" intensity={8} position={[-3, -1.5, 2]} />
        <Suspense fallback={null}>
          <PointerDemand
            enabled={finePointer && !reducedMotion}
            visibleRef={visibleRef}
            hiddenRef={hiddenRef}
          />
          <Model
            onReady={onReady}
            reducedMotion={reducedMotion}
            finePointer={finePointer}
            visibleRef={visibleRef}
            hiddenRef={hiddenRef}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload(MODEL_URL);
