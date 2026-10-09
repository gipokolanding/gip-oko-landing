export const CAROUSEL_SWIPE_THRESHOLD_PX = 60;

type CarouselSwipeTouch = {
  startX: number;
  endX: number;
  startedOnControl: boolean;
  didMove: boolean;
};

export function carouselSwipeFromTouch({
  startX,
  endX,
  startedOnControl,
  didMove,
}: CarouselSwipeTouch): "next" | "prev" | null {
  if (startedOnControl || !didMove) return null;
  const diff = startX - endX;
  if (Math.abs(diff) <= CAROUSEL_SWIPE_THRESHOLD_PX) return null;
  return diff > 0 ? "next" : "prev";
}

export function isCarouselControlTarget(target: EventTarget | null): boolean {
  if (!target || !("closest" in target)) return false;
  return Boolean((target as Element).closest("button, a"));
}
