"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({
    ignoreMobileResize: true,
    limitCallbacks: true,
  });
}

export default function MotionRuntime() {
  const pathname = usePathname();

  useEffect(() => {
    let refreshFrame = 0;
    let settleFrame = 0;
    let orientationTimer = 0;
    let delayedRefreshTimer = 0;
    let lateRefreshTimer = 0;
    let active = true;
    let lastWidth = window.innerWidth;

    const refresh = () => {
      cancelAnimationFrame(refreshFrame);
      refreshFrame = requestAnimationFrame(() => {
        if (!active) return;
        ScrollTrigger.refresh();
      });
    };

    const refreshAfterPaint = () => {
      cancelAnimationFrame(settleFrame);
      settleFrame = requestAnimationFrame(() => {
        settleFrame = requestAnimationFrame(refresh);
      });
    };

    const handleOrientationChange = () => {
      window.clearTimeout(orientationTimer);
      orientationTimer = window.setTimeout(() => {
        lastWidth = window.innerWidth;
        refreshAfterPaint();
      }, 280);
    };

    const handleViewportResize = () => {
      const nextWidth = window.innerWidth;
      if (Math.abs(nextWidth - lastWidth) < 2) return;
      lastWidth = nextWidth;
      refreshAfterPaint();
    };

    const handlePageShow = () => {
      refreshAfterPaint();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshAfterPaint();
      }
    };

    const handleLateAssetReady = (event: Event) => {
      const target = event.target;
      if (
        target instanceof HTMLImageElement ||
        target instanceof HTMLVideoElement
      ) {
        refreshAfterPaint();
      }
    };

    const mediaCleanups: Array<() => void> = [];

    document.querySelectorAll<HTMLImageElement>("img").forEach((image) => {
      if (image.complete) return;
      const onReady = () => refreshAfterPaint();
      image.addEventListener("load", onReady, { once: true });
      image.addEventListener("error", onReady, { once: true });
      mediaCleanups.push(() => {
        image.removeEventListener("load", onReady);
        image.removeEventListener("error", onReady);
      });
    });

    document.querySelectorAll<HTMLVideoElement>("video").forEach((video) => {
      if (video.readyState >= 1) return;
      const onReady = () => refreshAfterPaint();
      video.addEventListener("loadedmetadata", onReady, { once: true });
      mediaCleanups.push(() => {
        video.removeEventListener("loadedmetadata", onReady);
      });
    });

    window.addEventListener("load", refreshAfterPaint, { once: true });
    window.addEventListener("resize", handleViewportResize, { passive: true });
    window.addEventListener("orientationchange", handleOrientationChange);
    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("load", handleLateAssetReady, true);
    document.addEventListener("loadedmetadata", handleLateAssetReady, true);
    window.visualViewport?.addEventListener("resize", handleViewportResize);

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (active) refreshAfterPaint();
      });
    }

    refreshAfterPaint();

    // Mobile Safari/Chrome and in-app browsers can change the visual viewport
    // again after their top/bottom browser chrome settles. One delayed refresh
    // keeps all ScrollTrigger start/end measurements aligned without reacting
    // continuously to toolbar height changes.
    delayedRefreshTimer = window.setTimeout(refreshAfterPaint, 420);
    lateRefreshTimer = window.setTimeout(refreshAfterPaint, 900);

    return () => {
      active = false;
      cancelAnimationFrame(refreshFrame);
      cancelAnimationFrame(settleFrame);
      window.clearTimeout(orientationTimer);
      window.clearTimeout(delayedRefreshTimer);
      window.clearTimeout(lateRefreshTimer);
      window.removeEventListener("load", refreshAfterPaint);
      window.removeEventListener("resize", handleViewportResize);
      window.removeEventListener("orientationchange", handleOrientationChange);
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("load", handleLateAssetReady, true);
      document.removeEventListener("loadedmetadata", handleLateAssetReady, true);
      window.visualViewport?.removeEventListener("resize", handleViewportResize);
      mediaCleanups.forEach((cleanup) => cleanup());
    };
  }, [pathname]);

  return null;
}
