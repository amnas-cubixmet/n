"use client";

import { useEffect, useState } from "react";

function isMobileLike() {
  if (typeof window === "undefined") return false;

  return window.matchMedia(
    "(max-width: 1023px), (hover: none) and (pointer: coarse)"
  ).matches;
}

export function useMobileMotionReady() {
  const [ready, setReady] = useState(() => !isMobileLike());

  useEffect(() => {
    const mobile = isMobileLike();

    if (!mobile) {
      setReady(true);
      return;
    }

    let cancelled = false;
    let firstFrame = 0;
    let secondFrame = 0;
    let fallbackTimer = 0;

    const syncStableViewport = () => {
      const height = window.innerHeight;
      document.documentElement.style.setProperty(
        "--nf-mobile-vh",
        `${Math.max(320, height)}px`
      );
    };

    const finish = () => {
      if (cancelled || ready) return;

      syncStableViewport();

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
            window.addEventListener("load", () => resolve(), { once: true });
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

    // Slow in-app browsers should never leave animations waiting forever.
    fallbackTimer = window.setTimeout(finish, 1800);

    const handleOrientationChange = () => {
      window.setTimeout(() => {
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
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, [ready]);

  return ready;
}
