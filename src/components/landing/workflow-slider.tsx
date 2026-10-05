"use client";

import { useId, useState } from "react";
import { MediaPlaceholder } from "@/components/landing/media-placeholder";
import { landing } from "@/content/landing";

const steps = landing.workflow.steps;

export function WorkflowSlider() {
  const [index, setIndex] = useState(0);
  const statusId = useId();
  const hintId = useId();
  const step = steps[index];
  const total = steps.length;

  if (!step) {
    return null;
  }

  const go = (next: number) => {
    setIndex((current) => {
      const target = current + next;
      if (target < 0 || target >= total) {
        return current;
      }
      return target;
    });
  };

  return (
    <div
      className="workflow-slider"
      role="group"
      aria-roledescription="Карусель"
      aria-labelledby="workflow-title"
      aria-describedby={`${hintId} ${statusId}`}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          go(1);
        }
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          go(-1);
        }
      }}
    >
      <p id={hintId}>{landing.workflow.keyboardHint}</p>
      <p id={statusId} aria-live="polite">
        {landing.workflow.progress(index + 1, total)}
      </p>
      <MediaPlaceholder label={step.frameLabel} />
      <h3>{step.title}</h3>
      <p className="copy">{step.body}</p>
      <div className="hero-actions">
        <button type="button" className="step-button" onClick={() => go(-1)} disabled={index === 0}>
          {landing.workflow.previous}
        </button>
        <button
          type="button"
          className="step-button"
          onClick={() => go(1)}
          disabled={index === total - 1}
        >
          {landing.workflow.next}
        </button>
      </div>
    </div>
  );
}
