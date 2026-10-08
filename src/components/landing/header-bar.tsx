"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { landing } from "@/content/landing";
import type { DemoConfig } from "@/lib/demo-url";

type HeaderBarProps = {
  demo: DemoConfig;
};

const ICON_SIZE = 36;
const ROW_GAP = 24;

function EyeIcon() {
  return (
    <svg
      className="header-cta-icon"
      viewBox="0 0 576 512"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M288 144a111 111 0 0 0-31.24 5a55.4 55.4 0 0 1 7.24 27a56 56 0 0 1-56 56a55.4 55.4 0 0 1-27-7.24A111.71 111.71 0 1 0 288 144m284.52 97.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19M288 400c-98.65 0-189.09-55-237.93-144C98.91 167 189.34 112 288 112s189.09 55 237.93 144C477.1 345 386.66 400 288 400"
      />
    </svg>
  );
}

export function HeaderBar({ demo }: HeaderBarProps) {
  const innerRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const startNaturalRef = useRef(0);
  const [compact, setCompact] = useState(false);
  const [tight, setTight] = useState(false);
  const [measured, setMeasured] = useState(false);

  const label = landing.cta.label;
  const pending = demo.status !== "ready";
  const href = pending ? `#${landing.contacts.id}` : demo.href;
  const compactTip = pending
    ? `${label} ${landing.cta.soonSuffix}`
    : label;

  useLayoutEffect(() => {
    const inner = innerRef.current;
    const start = startRef.current;
    const measure = measureRef.current;
    if (!inner || !start || !measure) {
      return;
    }

    const update = () => {
      if (!inner.classList.contains("is-tight")) {
        startNaturalRef.current = start.offsetWidth;
      }
      const startNatural = startNaturalRef.current || start.offsetWidth;
      const available = inner.clientWidth - startNatural - ROW_GAP;
      const fullWidth = measure.offsetWidth;
      const nextCompact = available < fullWidth;
      setCompact(nextCompact);
      setTight(nextCompact && available < ICON_SIZE);
      setMeasured(true);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(inner);
    observer.observe(start);
    observer.observe(measure);
    return () => observer.disconnect();
  }, []);

  const innerClass = [
    "wrap",
    "site-header-inner",
    compact ? "is-compact" : "",
    tight ? "is-tight" : "",
    measured ? "is-measured" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={innerRef} className={innerClass}>
      <div ref={startRef} className="site-header-start">
        <a className="brand" href="#top">
          {landing.brand}
        </a>
        <nav className="site-nav" aria-label="Разделы страницы">
          {landing.nav.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
      </div>
      <a
        className={
          pending ? "demo-link header-cta is-pending" : "demo-link header-cta"
        }
        href={href}
        aria-label={compact ? compactTip : undefined}
        aria-describedby={pending && !compact ? "header-cta-soon" : undefined}
      >
        <EyeIcon />
        <span className="header-cta-label">{label}</span>
        {pending ? (
          <>
            <span
              id="header-cta-soon"
              className="demo-link-tip header-cta-tip-full"
              role="tooltip"
              aria-hidden={compact}
            >
              {landing.cta.soon}
            </span>
            <span
              className="demo-link-tip header-cta-tip-compact"
              role="tooltip"
              aria-hidden={!compact}
            >
              {compactTip}
            </span>
          </>
        ) : compact ? (
          <span className="demo-link-tip header-cta-tip-compact" role="tooltip">
            {label}
          </span>
        ) : null}
      </a>
      <span
        ref={measureRef}
        className="demo-link header-cta-measure"
        aria-hidden="true"
      >
        {label}
      </span>
    </div>
  );
}
