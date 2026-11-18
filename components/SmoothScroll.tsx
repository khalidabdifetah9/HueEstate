"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { ReactLenis } from "lenis/react";

const QUERY = "(prefers-reduced-motion: reduce)";

const subscribeMotion = (cb: () => void): (() => void) => {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.03, // between 0 and 1. Lower = silkier (0.05 – 0.12)
        wheelMultiplier: 1,
        smoothWheel: !reduced,
        syncTouch: false, // keep native touch scrolling on phones
        anchors: true, // <a href="#id"> links scroll smoothly too
      }}
    >
      {children}
    </ReactLenis>
  );
}