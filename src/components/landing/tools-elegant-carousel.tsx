"use client";

import { SectionHeading } from "@/components/landing/section-heading";
import { landing } from "@/content/landing";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent,
  type TouchEvent,
} from "react";

const SLIDE_DURATION = 6000;
const TRANSITION_DURATION = 800;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const ACCENTS = ["#58e8f4", "#7aa8e8", "#7466c9", "#8fa1ab", "#8df2fa"] as const;

const MOTIFS = [
  "territory",
  "objects",
  "measure",
  "relief",
  "overview",
] as const;

type Motif = (typeof MOTIFS)[number];

const slides = landing.tools.groups.map((group, index) => ({
  title: group.title,
  items: group.items,
  accent: ACCENTS[index] ?? ACCENTS[0],
  motif: MOTIFS[index] ?? MOTIFS[0],
}));

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

function progressFillWidth(
  index: number,
  activeIndex: number,
  progress: number,
  paused: boolean,
): string {
  if (index < activeIndex) return "100%";
  if (index > activeIndex) return "0%";
  if (paused && progress <= 0) return "100%";
  return `${Math.min(100, Math.max(0, progress))}%`;
}

function MotifGraphic({ motif, accent }: { motif: Motif; accent: string }) {
  return (
    <svg
      className="tools-carousel-motif"
      viewBox="0 0 160 100"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {motif === "territory" ? (
        <>
          {Array.from({ length: 7 }, (_, i) => (
            <line
              key={`v${i}`}
              x1={16 + i * 21}
              y1="8"
              x2={16 + i * 21}
              y2="92"
              stroke="currentColor"
              strokeOpacity="0.18"
              strokeWidth="0.4"
            />
          ))}
          {Array.from({ length: 5 }, (_, i) => (
            <line
              key={`h${i}`}
              x1="8"
              y1={14 + i * 18}
              x2="152"
              y2={14 + i * 18}
              stroke="currentColor"
              strokeOpacity="0.18"
              strokeWidth="0.4"
            />
          ))}
          <path
            d="M28 62 C36 44 48 38 62 41 C74 28 92 30 104 42 C118 38 132 48 136 60 C128 74 108 80 92 76 C78 86 54 82 42 72 C34 70 30 66 28 62 Z"
            fill={accent}
            fillOpacity="0.16"
            stroke={accent}
            strokeWidth="1.1"
          />
          <circle cx="86" cy="48" r="3.2" fill="none" stroke={accent} strokeWidth="1.2" />
          <line x1="86" y1="40" x2="86" y2="56" stroke={accent} strokeWidth="0.9" />
          <line x1="78" y1="48" x2="94" y2="48" stroke={accent} strokeWidth="0.9" />
        </>
      ) : null}
      {motif === "objects" ? (
        <>
          <circle cx="28" cy="28" r="3.4" fill={accent} />
          <path
            d="M28 28 L52 40 L74 30 L98 46"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.7"
            strokeWidth="1.2"
          />
          <rect
            x="108"
            y="18"
            width="28"
            height="20"
            fill="none"
            stroke={accent}
            strokeWidth="1.1"
          />
          <circle cx="46" cy="70" r="14" fill="none" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1.1" />
          <path
            d="M86 58 L118 62 L108 86 L80 82 Z"
            fill={accent}
            fillOpacity="0.18"
            stroke={accent}
            strokeWidth="1.1"
          />
        </>
      ) : null}
      {motif === "measure" ? (
        <>
          <path
            d="M22 72 L138 28"
            fill="none"
            stroke={accent}
            strokeWidth="1.3"
            strokeDasharray="3 2.5"
          />
          <circle cx="22" cy="72" r="3.2" fill={accent} />
          <circle cx="138" cy="28" r="3.2" fill={accent} />
          {Array.from({ length: 6 }, (_, i) => {
            const t = (i + 1) / 7;
            const x = 22 + (138 - 22) * t;
            const y = 72 + (28 - 72) * t;
            return (
              <line
                key={i}
                x1={x - 2}
                y1={y - 3.5}
                x2={x + 2}
                y2={y + 3.5}
                stroke="currentColor"
                strokeOpacity="0.55"
                strokeWidth="0.8"
              />
            );
          })}
          <path
            d="M40 84 L40 90 L92 90 L92 84"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.45"
            strokeWidth="0.9"
          />
        </>
      ) : null}
      {motif === "relief" ? (
        <>
          <path d="M8 78 Q40 70 80 78 T152 74 L152 92 L8 92 Z" fill={accent} fillOpacity="0.08" />
          <path d="M14 70 C38 58 58 66 80 60 C104 54 126 62 146 52" fill="none" stroke={accent} strokeWidth="1.1" />
          <path d="M18 58 C42 48 62 54 82 46 C106 38 124 46 142 40" fill="none" stroke="currentColor" strokeOpacity="0.45" strokeWidth="0.9" />
          <path d="M26 46 C48 38 66 42 84 34 C104 26 120 34 136 30" fill="none" stroke="currentColor" strokeOpacity="0.35" strokeWidth="0.8" />
          <path d="M12 88 L28 64 L46 72 L70 44 L92 60 L114 36 L148 54" fill="none" stroke={accent} strokeWidth="1.2" />
        </>
      ) : null}
      {motif === "overview" ? (
        <>
          <ellipse cx="80" cy="52" rx="46" ry="28" fill="none" stroke="currentColor" strokeOpacity="0.28" strokeWidth="0.8" />
          <ellipse cx="80" cy="52" rx="46" ry="28" fill="none" stroke={accent} strokeWidth="1.1" strokeDasharray="4 6" />
          <circle cx="80" cy="52" r="18" fill={accent} fillOpacity="0.12" stroke={accent} strokeWidth="1.2" />
          <path d="M80 34 A18 18 0 0 1 80 70" fill="none" stroke="currentColor" strokeOpacity="0.35" strokeWidth="0.8" />
          <circle cx="124" cy="42" r="3.4" fill={accent} />
          <path d="M118 42 L110 48" stroke={accent} strokeWidth="0.9" />
        </>
      ) : null}
    </svg>
  );
}

export function ToolsElegantCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progressIndex, setProgressIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [progress, setProgress] = useState(0);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [focusPaused, setFocusPaused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const swapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const isPaused = reducedMotion || hoverPaused || focusPaused || hidden;
  const currentSlide = slides[currentIndex] ?? slides[0];
  const progressSlide = slides[progressIndex] ?? slides[0];
  const phaseClass = isTransitioning ? "is-leaving" : "is-visible";

  const clearTimers = useCallback(() => {
    if (swapTimer.current) clearTimeout(swapTimer.current);
    if (revealTimer.current) clearTimeout(revealTimer.current);
    swapTimer.current = null;
    revealTimer.current = null;
  }, []);

  const goToSlide = useCallback(
    (index: number, dir?: "next" | "prev") => {
      if (index === progressIndex) return;
      clearTimers();
      setDirection(dir ?? (index > progressIndex ? "next" : "prev"));
      setProgressIndex(index);
      setProgress(0);

      if (reducedMotion) {
        setIsTransitioning(false);
        setCurrentIndex(index);
        return;
      }

      setIsTransitioning(true);
      swapTimer.current = setTimeout(() => {
        setCurrentIndex(index);
        revealTimer.current = setTimeout(() => {
          setIsTransitioning(false);
        }, 50);
      }, TRANSITION_DURATION / 2);
    },
    [clearTimers, progressIndex, reducedMotion],
  );

  const goNext = useCallback(() => {
    goToSlide((progressIndex + 1) % slides.length, "next");
  }, [goToSlide, progressIndex]);

  const goPrev = useCallback(() => {
    goToSlide((progressIndex - 1 + slides.length) % slides.length, "prev");
  }, [goToSlide, progressIndex]);

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  useEffect(() => {
    if (isPaused) return;

    progressRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 100 / (SLIDE_DURATION / 50);
      });
    }, 50);

    intervalRef.current = setInterval(() => {
      goNext();
    }, SLIDE_DURATION);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [goNext, isPaused, progressIndex]);

  const handleTouchStart = (event: TouchEvent) => {
    touchStartX.current = event.targetTouches[0]?.clientX ?? 0;
  };

  const handleTouchMove = (event: TouchEvent) => {
    touchEndX.current = event.targetTouches[0]?.clientX ?? 0;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 60) {
      if (diff > 0) goNext();
      else goPrev();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goNext();
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goPrev();
    }
  };

  return (
    <section
      className="section wrap"
      id={landing.tools.id}
      aria-labelledby="tools-title"
    >
      <SectionHeading id="tools-title">{landing.tools.title}</SectionHeading>
      <p className="lede">{landing.tools.intro}</p>

      <div
        className={`tools-carousel tools-carousel--${direction}${isPaused ? " is-paused" : ""}`}
        style={{ "--slide-accent": currentSlide.accent } as CSSProperties}
        onMouseEnter={() => setHoverPaused(true)}
        onMouseLeave={() => setHoverPaused(false)}
        onFocusCapture={() => setFocusPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setFocusPaused(false);
          }
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="region"
        aria-roledescription="карусель"
        aria-label={landing.tools.title}
      >
        <div
          className="tools-carousel-wash"
          style={{
            background: `radial-gradient(ellipse at 50% 18%, ${currentSlide.accent}20 0%, transparent 68%)`,
          }}
        />

        <p className="visually-hidden" aria-live="polite">
          {`${currentIndex + 1} из ${slides.length}: ${currentSlide.title}`}
        </p>

        <div className="tools-carousel-visual-slot">
          <div className={`tools-carousel-visual ${phaseClass}`}>
            <MotifGraphic
              key={currentSlide.motif}
              motif={currentSlide.motif}
              accent={currentSlide.accent}
            />
            <div
              className="tools-carousel-visual-overlay"
              style={{
                background: `linear-gradient(135deg, ${currentSlide.accent}22 0%, transparent 52%)`,
              }}
            />
          </div>
          <div
            className="tools-carousel-corner tools-carousel-corner--tl"
            style={{ borderColor: currentSlide.accent }}
          />
          <div
            className="tools-carousel-corner tools-carousel-corner--br"
            style={{ borderColor: currentSlide.accent }}
          />
        </div>

        <div className="tools-carousel-copy">
          <div className="tools-carousel-copy-stack">
            {slides.map((slide, index) => {
              const isCurrent = index === currentIndex;
              return (
                <div
                  key={slide.title}
                  className={`tools-carousel-slide-copy${isCurrent ? ` ${phaseClass}` : " is-idle"}`}
                  aria-hidden={!isCurrent}
                >
                  <div className="tools-carousel-index">
                    <span className="tools-carousel-index-line" />
                    <span>
                      {String(index + 1).padStart(2, "0")} /{" "}
                      {String(slides.length).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="tools-carousel-heading">{slide.title}</h3>
                  <ul className="tools-carousel-items">
                    {slide.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="tools-carousel-arrows">
            <button
              type="button"
              className="tools-carousel-arrow"
              onClick={goPrev}
              aria-label="Предыдущий сценарий"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              className="tools-carousel-arrow"
              onClick={goNext}
              aria-label="Следующий сценарий"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="tools-carousel-progress">
          {slides.map((slide, index) => (
            <button
              key={slide.title}
              type="button"
              aria-current={index === progressIndex ? "true" : undefined}
              aria-label={`Перейти к сценарию ${index + 1}: ${slide.title}`}
              className={`tools-carousel-progress-item${index === progressIndex ? " is-active" : ""}`}
              onClick={() => goToSlide(index)}
            >
              <span className="tools-carousel-progress-track">
                <span
                  className="tools-carousel-progress-fill"
                  style={{
                    width: progressFillWidth(
                      index,
                      progressIndex,
                      progress,
                      isPaused,
                    ),
                    backgroundColor:
                      index === progressIndex ? progressSlide.accent : undefined,
                  }}
                />
              </span>
              <span className="tools-carousel-progress-label">{slide.title}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
