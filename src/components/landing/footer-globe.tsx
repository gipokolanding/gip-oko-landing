"use client";

import { geoOrthographic, geoPath } from "d3-geo";
import { select } from "d3-selection";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { feature } from "topojson-client";

const AUTO_ROTATE_DEG = 0.1125;
const STROKE_WIDTH = 0.6;
const COUNTRY_OPACITY = 0.45;
const OUTLINE_OPACITY = 0.8;
const ABYSS = "#05070b";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const TOPOLOGY_URL = `${BASE_PATH}/data/countries-110m.json`;

type WorldAtlasTopology = {
  type: "Topology";
  objects: {
    countries: {
      type: "GeometryCollection";
      geometries: unknown[];
    };
  };
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

function drawGlobe(
  svg: SVGSVGElement,
  features: unknown[],
  size: number,
  rotation: [number, number],
) {
  const root = select(svg);
  root.selectAll("*").remove();

  const projection = geoOrthographic()
    .scale((size / 2) * 0.9)
    .translate([size / 2, size / 2])
    .rotate([rotation[0], rotation[1]])
    .precision(0.1);
  const path = geoPath(projection);

  try {
    const disk = path({ type: "Sphere" });
    if (disk && !disk.includes("NaN")) {
      root.append("path").attr("fill", ABYSS).attr("stroke", "none").attr("d", disk);
    }
  } catch {
    return;
  }

  root
    .selectAll("path.country")
    .data(features)
    .join("path")
    .attr("class", "country")
    .attr("fill", "none")
    .attr("stroke", "currentColor")
    .attr("stroke-width", STROKE_WIDTH)
    .attr("opacity", COUNTRY_OPACITY)
    .attr("d", (datum) => {
      try {
        const next = path(datum);
        if (!next || next.includes("NaN") || next.includes("Infinity")) {
          return "";
        }
        return next;
      } catch {
        return "";
      }
    });

  try {
    const outline = path({ type: "Sphere" });
    if (outline && !outline.includes("NaN")) {
      root
        .append("path")
        .attr("fill", "none")
        .attr("stroke", "currentColor")
        .attr("stroke-width", STROKE_WIDTH)
        .attr("opacity", OUTLINE_OPACITY)
        .attr("d", outline);
    }
  } catch {
    return;
  }
}

export function FooterGlobe() {
  const hostRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const featuresRef = useRef<unknown[]>([]);
  const sizeRef = useRef(0);
  const rotationRef = useRef<[number, number]>([0, 0]);
  const visibleRef = useRef(false);
  const hiddenRef = useRef(false);
  const reducedMotionRef = useRef(false);
  const rafRef = useRef(0);
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);

  useEffect(() => {
    const host = hostRef.current;
    const svg = svgRef.current;
    if (!host || !svg) {
      return;
    }

    let cancelled = false;
    reducedMotionRef.current = reducedMotion;

    const hostVisible = () => {
      const rect = host.getBoundingClientRect();
      return (
        rect.width > 0 && rect.bottom > 0 && rect.top < window.innerHeight
      );
    };

    const paint = () => {
      if (sizeRef.current <= 0 || featuresRef.current.length === 0) {
        return;
      }
      drawGlobe(svg, featuresRef.current, sizeRef.current, rotationRef.current);
    };

    const stopLoop = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };

    const tick = () => {
      rafRef.current = 0;
      if (
        reducedMotionRef.current ||
        hiddenRef.current ||
        !visibleRef.current
      ) {
        return;
      }
      rotationRef.current = [
        (rotationRef.current[0] + AUTO_ROTATE_DEG) % 360,
        rotationRef.current[1],
      ];
      paint();
      rafRef.current = requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (
        rafRef.current ||
        reducedMotionRef.current ||
        hiddenRef.current ||
        !visibleRef.current
      ) {
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    const resize = () => {
      const width = host.offsetWidth || 0;
      sizeRef.current = width;
      svg.setAttribute("width", String(width));
      svg.setAttribute("height", String(width));
      paint();
    };

    const onVisibility = () => {
      hiddenRef.current = document.hidden;
      if (hiddenRef.current) {
        stopLoop();
      } else {
        startLoop();
      }
    };

    hiddenRef.current = document.hidden;
    visibleRef.current = hostVisible();
    resize();
    paint();
    startLoop();

    fetch(TOPOLOGY_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`topology ${response.status}`);
        }
        return response.json() as Promise<WorldAtlasTopology>;
      })
      .then((world) => {
        if (cancelled) {
          return;
        }
        const collection = feature(world, world.objects.countries);
        featuresRef.current = collection.features;
        visibleRef.current = hostVisible();
        paint();
        startLoop();
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          console.error("Footer globe topology failed to load", error);
        }
      });

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);

    const intersection = new IntersectionObserver(
      (entries) => {
        visibleRef.current = entries.some((entry) => entry.isIntersecting);
        if (visibleRef.current) {
          paint();
          startLoop();
        } else {
          stopLoop();
        }
      },
      { threshold: 0.1 },
    );
    intersection.observe(host);

    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      resizeObserver.disconnect();
      intersection.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      stopLoop();
    };
  }, [reducedMotion]);

  return (
    <div ref={hostRef} className="footer-globe" aria-hidden="true">
      <svg ref={svgRef} className="footer-globe-svg" />
      <div className="footer-globe-fade" />
    </div>
  );
}
