"use client";

import dynamic from "next/dynamic";
import {
  Component,
  useCallback,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

const BackgroundModelCanvas = dynamic(
  () =>
    import("./background-model-canvas").then(
      (module) => module.BackgroundModelCanvas,
    ),
  { ssr: false },
);

type SceneBoundaryProps = {
  children: ReactNode;
  onError: () => void;
};

type SceneBoundaryState = {
  failed: boolean;
};

class SceneBoundary extends Component<
  SceneBoundaryProps,
  SceneBoundaryState
> {
  state: SceneBoundaryState = { failed: false };

  static getDerivedStateFromError(): SceneBoundaryState {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    if (this.state.failed) {
      return null;
    }

    return this.props.children;
  }
}

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") || canvas.getContext("webgl")),
    );
  } catch {
    return false;
  }
}

export function HeroModel() {
  const webGLAvailable = useSyncExternalStore(
    () => () => undefined,
    supportsWebGL,
    () => false,
  );
  const [sceneFailed, setSceneFailed] = useState(false);
  const handleReady = useCallback(() => undefined, []);
  const handleError = useCallback(() => setSceneFailed(true), []);

  if (!webGLAvailable || sceneFailed) {
    return null;
  }

  return (
    <SceneBoundary onError={handleError}>
      <BackgroundModelCanvas onReady={handleReady} />
    </SceneBoundary>
  );
}
