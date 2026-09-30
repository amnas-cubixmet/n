"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({
    ignoreMobileResize: true,
  });
}

export default function MotionRuntime() {
  const pathname = usePathname();

  useEffect(() => {
    let refreshFrame = 0;
    let settleFrame = 0;
    let orientationTimer = 0;
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
    window.addEventListener("orientationchange", handleOrientationChange);
    window.addEventListener("pageshow", handlePageShow);
    window.visualViewport?.addEventListener("resize", handleViewportResize);

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (active) refreshAfterPaint();
      });
    }

    refreshAfterPaint();

    return () => {
      active = false;
      cancelAnimationFrame(refreshFrame);
      cancelAnimationFrame(settleFrame);
      window.clearTimeout(orientationTimer);
      window.removeEventListener("load", refreshAfterPaint);
      window.removeEventListener("orientationchange", handleOrientationChange);
      window.removeEventListener("pageshow", handlePageShow);
      window.visualViewport?.removeEventListener("resize", handleViewportResize);
      mediaCleanups.forEach((cleanup) => cleanup());
    };
  }, [pathname]);

  return null;
}
