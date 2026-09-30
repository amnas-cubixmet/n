"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface BrandIntroProps {
  onComplete?: () => void;
}

interface SavedPageStyles {
  bodyOverflow: string;
  bodyTouchAction: string;
  bodyOverscrollBehavior: string;
  htmlOverflow: string;
  htmlOverscrollBehavior: string;
}

export default function BrandIntro({ onComplete }: BrandIntroProps) {
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const watchdogRef = useRef<number | null>(null);
  const startedAtRef = useRef(0);
  const finishedRef = useRef(false);
  const savedPageStylesRef = useRef<SavedPageStyles | null>(null);

  const restorePageScroll = useCallback(() => {
    const saved = savedPageStylesRef.current;
    if (!saved) return;

    document.body.style.overflow = saved.bodyOverflow;
    document.body.style.touchAction = saved.bodyTouchAction;
    document.body.style.overscrollBehavior = saved.bodyOverscrollBehavior;
    document.documentElement.style.overflow = saved.htmlOverflow;
    document.documentElement.style.overscrollBehavior =
      saved.htmlOverscrollBehavior;

    savedPageStylesRef.current = null;
  }, []);

  const finishIntro = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;

    if (watchdogRef.current !== null) {
      window.clearTimeout(watchdogRef.current);
      watchdogRef.current = null;
    }

    timelineRef.current?.kill();
    timelineRef.current = null;

    const container = containerRef.current;
    if (container) {
      gsap.set(container, {
        autoAlpha: 0,
        pointerEvents: "none",
      });
    }

    restorePageScroll();

    try {
      sessionStorage.setItem("northframe_intro_seen", "true");
    } catch {
      // Storage can be unavailable in private/restricted browser contexts.
    }

    onComplete?.();
    setIsVisible(false);

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    });
  }, [onComplete, restorePageScroll]);

  useLayoutEffect(() => {
    if (!isVisible || finishedRef.current) return;

    try {
      if (sessionStorage.getItem("northframe_intro_seen") === "true") {
        finishIntro();
        return;
      }
    } catch {
      // Continue with the intro when session storage is unavailable.
    }

    const container = containerRef.current;
    const mark = markRef.current;
    const cover = coverRef.current;

    if (!container || !mark || !cover) {
      finishIntro();
      return;
    }

    savedPageStylesRef.current = {
      bodyOverflow: document.body.style.overflow,
      bodyTouchAction: document.body.style.touchAction,
      bodyOverscrollBehavior: document.body.style.overscrollBehavior,
      htmlOverflow: document.documentElement.style.overflow,
      htmlOverscrollBehavior:
        document.documentElement.style.overscrollBehavior,
    };

    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    document.body.style.overscrollBehavior = "none";
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.overscrollBehavior = "none";

    const mobile = window.matchMedia(
      "(max-width: 768px), (pointer: coarse)"
    ).matches;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    startedAtRef.current = performance.now();

    gsap.set(container, {
      autoAlpha: 1,
      pointerEvents: "auto",
    });
    gsap.set(mark, {
      autoAlpha: reducedMotion ? 1 : 0,
      scale: reducedMotion ? 1 : 0.72,
      force3D: true,
    });
    gsap.set(cover, {
      autoAlpha: reducedMotion ? 0 : 1,
      scale: mobile ? 0.015 : 1,
      transformOrigin: "center center",
      force3D: true,
    });

    const timeline = gsap.timeline({
      defaults: { overwrite: "auto" },
      onComplete: finishIntro,
    });

    timelineRef.current = timeline;

    if (reducedMotion) {
      timeline
        .to({}, { duration: 0.16 })
        .to(container, {
          autoAlpha: 0,
          duration: 0.12,
          ease: "power1.out",
        });
    } else {
      timeline.fromTo(
        mark,
        {
          autoAlpha: 0,
          scale: 0.72,
        },
        {
          autoAlpha: 1,
          scale: 1,
          duration: mobile ? 0.42 : 0.55,
          ease: "power3.out",
          force3D: true,
        }
      );

      timeline.to({}, { duration: mobile ? 0.18 : 0.28 });

      if (mobile) {
        // Do not scale the image/texture to an enormous size on iOS Safari.
        // Expand a lightweight full-screen color layer instead.
        timeline
          .to(
            mark,
            {
              scale: 1.08,
              autoAlpha: 0,
              duration: 0.42,
              ease: "power2.in",
              force3D: true,
            },
            "mobile-cover"
          )
          .to(
            cover,
            {
              scale: 1.08,
              duration: 0.52,
              ease: "power3.inOut",
              force3D: true,
            },
            "mobile-cover"
          );
      } else {
        const markSize = mark.getBoundingClientRect().width || 92;
        const diagonal = Math.hypot(window.innerWidth, window.innerHeight);
        const coverScale = Math.min((diagonal / markSize) * 2.35, 24);

        timeline.to(mark, {
          scale: coverScale,
          duration: 0.68,
          ease: "power3.in",
          force3D: true,
        });

        timeline.to(
          cover,
          {
            autoAlpha: 1,
            duration: 0.12,
            ease: "none",
          },
          "-=0.17"
        );
      }

      timeline.to(container, {
        autoAlpha: 0,
        duration: mobile ? 0.2 : 0.28,
        ease: "power2.out",
      });
    }

    // Independent watchdog: even if Safari suspends a transform/compositor
    // timeline, the overlay can never keep the page locked indefinitely.
    watchdogRef.current = window.setTimeout(
      finishIntro,
      mobile ? 2200 : 3200
    );

    const finishIfStale = () => {
      if (
        document.visibilityState === "visible" &&
        performance.now() - startedAtRef.current > (mobile ? 1800 : 2800)
      ) {
        finishIntro();
      }
    };

    const handlePageShow = () => finishIfStale();
    const handleVisibilityChange = () => finishIfStale();

    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      if (watchdogRef.current !== null) {
        window.clearTimeout(watchdogRef.current);
        watchdogRef.current = null;
      }

      timeline.kill();
      if (timelineRef.current === timeline) {
        timelineRef.current = null;
      }

      restorePageScroll();
    };
  }, [finishIntro, isVisible, restorePageScroll]);

  if (!isVisible) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed inset-0 z-[200] flex h-[100svh] w-full items-center justify-center overflow-hidden bg-[#070B14] select-none touch-none"
    >
      <div
        ref={markRef}
        className="relative z-10 h-[72px] w-[72px] sm:h-[92px] sm:w-[92px]"
      >
        <Image
          src="/images/brand/northframe-icon.webp"
          alt=""
          width={1254}
          height={1254}
          priority
          sizes="(max-width: 640px) 72px, 92px"
          className="block h-full w-full object-contain"
        />
      </div>

      <div
        ref={coverRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 bg-[#1677FF]"
      />
    </div>
  );
}
