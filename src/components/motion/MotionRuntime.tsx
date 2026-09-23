"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function MotionRuntime() {
  useEffect(() => {
    // Prevent Safari/Chrome mobile URL-bar height changes from repeatedly
    // rebuilding every ScrollTrigger on the page.
    ScrollTrigger.config({
      ignoreMobileResize: true,
    });

    let refreshFrame = 0;
    let orientationTimer = 0;
    let active = true;

    const refresh = () => {
      cancelAnimationFrame(refreshFrame);
      refreshFrame = requestAnimationFrame(() => {
        if (active) ScrollTrigger.refresh();
      });
    };

    const handleOrientationChange = () => {
      window.clearTimeout(orientationTimer);
      orientationTimer = window.setTimeout(refresh, 260);
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) refresh();
    };

    window.addEventListener("load", refresh, { once: true });
    window.addEventListener("orientationchange", handleOrientationChange);
    window.addEventListener("pageshow", handlePageShow);

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (active) refresh();
      });
    }

    return () => {
      active = false;
      cancelAnimationFrame(refreshFrame);
      window.clearTimeout(orientationTimer);
      window.removeEventListener("load", refresh);
      window.removeEventListener("orientationchange", handleOrientationChange);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  return null;
}
