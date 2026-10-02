"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface BrandIntroProps {
  onComplete?: () => void;
}

interface SavedScrollStyles {
  bodyOverflow: string;
  bodyTouchAction: string;
  bodyOverscrollBehavior: string;
  rootOverflow: string;
  rootTouchAction: string;
  rootOverscrollBehavior: string;
}

let hasPlayedInRuntime = false;

export default function BrandIntro({ onComplete }: BrandIntroProps) {
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const finishedRef = useRef(false);
  const savedScrollStylesRef = useRef<SavedScrollStyles | null>(null);

  const restoreScroll = useCallback(() => {
    const saved = savedScrollStylesRef.current;
    if (!saved) return;

    document.body.style.overflow = saved.bodyOverflow;
    document.body.style.touchAction = saved.bodyTouchAction;
    document.body.style.overscrollBehavior = saved.bodyOverscrollBehavior;

    document.documentElement.style.overflow = saved.rootOverflow;
    document.documentElement.style.touchAction = saved.rootTouchAction;
    document.documentElement.style.overscrollBehavior =
      saved.rootOverscrollBehavior;

    savedScrollStylesRef.current = null;
  }, []);

  const finishIntro = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    timelineRef.current?.kill();
    timelineRef.current = null;
    restoreScroll();
    hasPlayedInRuntime = true;

    setIsVisible(false);
    onComplete?.();

    requestAnimationFrame(() => {
      requestAnimationFrame(() => ScrollTrigger.refresh());
    });
  }, [onComplete, restoreScroll]);

  useEffect(() => {
    if (!isVisible || finishedRef.current) return;
    const timeoutId = window.setTimeout(finishIntro, 4000);
    return () => window.clearTimeout(timeoutId);
  }, [finishIntro, isVisible]);

  useLayoutEffect(() => {
    if (!isVisible) return;

    if (hasPlayedInRuntime) {
      finishIntro();
      return;
    }

    savedScrollStylesRef.current = {
      bodyOverflow: document.body.style.overflow,
      bodyTouchAction: document.body.style.touchAction,
      bodyOverscrollBehavior: document.body.style.overscrollBehavior,
      rootOverflow: document.documentElement.style.overflow,
      rootTouchAction: document.documentElement.style.touchAction,
      rootOverscrollBehavior:
        document.documentElement.style.overscrollBehavior,
    };

    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    document.body.style.overscrollBehavior = "none";
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.touchAction = "none";
    document.documentElement.style.overscrollBehavior = "none";

    const container = containerRef.current;
    const mark = markRef.current;
    const cover = coverRef.current;
    if (!container || !mark || !cover) {
      finishIntro();
      return;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const mobileLike = window.matchMedia(
      "(max-width: 768px), (pointer: coarse)"
    ).matches;

    const viewportWidth = window.visualViewport?.width || window.innerWidth;
    const viewportHeight = window.visualViewport?.height || window.innerHeight;
    const markSize = mark.getBoundingClientRect().width || (mobileLike ? 72 : 92);
    const screenDiagonal = Math.hypot(viewportWidth, viewportHeight);
    const coverScale = Math.max(
      mobileLike ? 18 : 16,
      (screenDiagonal / markSize) * (mobileLike ? 2.65 : 2.5)
    );

    gsap.set(container, { autoAlpha: 1 });
    gsap.set(mark, {
      autoAlpha: reducedMotion ? 1 : 0,
      scale: reducedMotion ? 1 : 0.74,
      transformOrigin: "50% 50%",
      force3D: true,
    });
    gsap.set(cover, { autoAlpha: 0 });

    const timeline = gsap.timeline({
      onComplete: finishIntro,
      defaults: { overwrite: "auto" },
    });
    timelineRef.current = timeline;

    if (reducedMotion) {
      timeline.to({}, { duration: 0.22 });
    } else {
      timeline.to(mark, {
        autoAlpha: 1,
        scale: 1,
        duration: mobileLike ? 0.46 : 0.55,
        ease: "power3.out",
        force3D: true,
      });
      timeline.to({}, { duration: mobileLike ? 0.2 : 0.3 });
      timeline.to(mark, {
        scale: coverScale,
        duration: mobileLike ? 0.62 : 0.68,
        ease: "power3.in",
        force3D: true,
      });
      timeline.to(
        cover,
        {
          autoAlpha: 1,
          duration: mobileLike ? 0.1 : 0.12,
          ease: "none",
        },
        mobileLike ? "-=0.2" : "-=0.17"
      );
    }

    timeline.to(container, {
      autoAlpha: 0,
      duration: reducedMotion ? 0.12 : mobileLike ? 0.22 : 0.3,
      ease: "power2.out",
    });

    return () => {
      timeline.kill();
      timelineRef.current = null;
      restoreScroll();
    };
  }, [finishIntro, isVisible, restoreScroll]);

  if (!isVisible) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed inset-0 z-[200] flex h-[100dvh] min-h-[100svh] w-full items-center justify-center overflow-hidden bg-[#070B14] select-none touch-none"
    >
      <div ref={markRef} className="relative z-10 h-[72px] w-[72px] opacity-0 will-change-transform sm:h-[92px] sm:w-[92px]">
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
      <div ref={coverRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 bg-[#1677FF] opacity-0 will-change-[opacity]" />
    </div>
  );
}
