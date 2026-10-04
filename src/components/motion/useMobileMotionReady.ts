"use client";

import { useEffect, useState } from "react";

const MOBILE_TOUCH_QUERY =
  "(max-width: 768px), (max-width: 1023px) and (hover: none) and (pointer: coarse)";

function isMobileLike() {
  if (typeof window === "undefined") return false;
  return window.matchMedia(MOBILE_TOUCH_QUERY).matches;
}

export function useMobileMotionReady() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mobile = isMobileLike();

    if (!mobile) {
      setReady(true);
      return;
    }

    let cancelled = false;
    let firstFrame = 0;
    let secondFrame = 0;
    let orientationTimer = 0;

    const syncStableViewport = () => {
      const height = window.visualViewport?.height || window.innerHeight;
      document.documentElement.style.setProperty(
        "--nf-mobile-vh",
        `${Math.max(320, Math.round(height))}px`
      );
    };

    // Initialize mobile GSAP at the same lifecycle point as desktop instead of
    // waiting for window.load/fonts. MotionRuntime performs safe refresh passes
    // again as fonts/assets settle.
    syncStableViewport();

    firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        if (cancelled) return;
        setReady(true);
        window.dispatchEvent(new Event("northframe:motion-refresh"));
      });
    });

    const handleOrientationChange = () => {
      window.clearTimeout(orientationTimer);
      orientationTimer = window.setTimeout(() => {
        if (cancelled) return;
        syncStableViewport();
        window.dispatchEvent(new Event("northframe:motion-refresh"));
      }, 320);
    };

    window.addEventListener("orientationchange", handleOrientationChange);

    return () => {
      cancelled = true;
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
      window.clearTimeout(orientationTimer);
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, []);

  return ready;
}
