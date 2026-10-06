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
