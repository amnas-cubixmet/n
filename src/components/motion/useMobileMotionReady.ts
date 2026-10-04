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
    let finished = false;
    let firstFrame = 0;
    let secondFrame = 0;
    let fallbackTimer = 0;
    let orientationTimer = 0;
    let loadHandler: (() => void) | null = null;

    const syncStableViewport = () => {
      const height = window.innerHeight;
      document.documentElement.style.setProperty(
        "--nf-mobile-vh",
        `${Math.max(320, height)}px`
      );
    };

    const finish = () => {
      if (cancelled || finished) return;
      finished = true;

      syncStableViewport();
      window.clearTimeout(fallbackTimer);
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);

      firstFrame = requestAnimationFrame(() => {
        secondFrame = requestAnimationFrame(() => {
          if (cancelled) return;
          setReady(true);
          window.dispatchEvent(new Event("northframe:motion-refresh"));
        });
      });
    };

    const waitForLayout = async () => {
      try {
        if (document.readyState !== "complete") {
          await new Promise<void>((resolve) => {
            loadHandler = () => {
              loadHandler = null;
              resolve();
            };
            window.addEventListener("load", loadHandler, { once: true });
          });
        }

        if (document.fonts?.ready) {
          await document.fonts.ready;
        }
      } finally {
        finish();
      }
    };

    syncStableViewport();
    void waitForLayout();

    // Slow in-app browsers must never leave mobile motion waiting forever.
    fallbackTimer = window.setTimeout(finish, 1800);

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
      window.clearTimeout(fallbackTimer);
      window.clearTimeout(orientationTimer);

      if (loadHandler) {
        window.removeEventListener("load", loadHandler);
      }

      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, []);

  return ready;
}
