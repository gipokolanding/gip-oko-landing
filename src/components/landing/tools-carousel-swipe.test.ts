import assert from "node:assert/strict";
import { test } from "node:test";
import { carouselSwipeFromTouch } from "./tools-carousel-swipe.ts";

test("phone tap on next arrow does not swipe when endX is stale zero", () => {
  assert.equal(
    carouselSwipeFromTouch({
      startX: 118,
      endX: 0,
      startedOnControl: true,
      didMove: false,
    }),
    null,
  );
});

test("phone tap on prev arrow does not swipe when endX is leftover from a pan", () => {
  assert.equal(
    carouselSwipeFromTouch({
      startX: 64,
      endX: 280,
      startedOnControl: true,
      didMove: false,
    }),
    null,
  );
});

test("phone tap on next arrow does not swipe when endX is leftover from a pan", () => {
  assert.equal(
    carouselSwipeFromTouch({
      startX: 118,
      endX: 280,
      startedOnControl: true,
      didMove: false,
    }),
    null,
  );
});

test("tap on the visual without a move is not a swipe", () => {
  assert.equal(
    carouselSwipeFromTouch({
      startX: 200,
      endX: 0,
      startedOnControl: false,
      didMove: false,
    }),
    null,
  );
});

test("horizontal swipe on the visual still changes slides", () => {
  assert.equal(
    carouselSwipeFromTouch({
      startX: 220,
      endX: 140,
      startedOnControl: false,
      didMove: true,
    }),
    "next",
  );
  assert.equal(
    carouselSwipeFromTouch({
      startX: 140,
      endX: 220,
      startedOnControl: false,
      didMove: true,
    }),
    "prev",
  );
});

test("sub-threshold jitter is not a swipe", () => {
  assert.equal(
    carouselSwipeFromTouch({
      startX: 200,
      endX: 210,
      startedOnControl: false,
      didMove: true,
    }),
    null,
  );
});
