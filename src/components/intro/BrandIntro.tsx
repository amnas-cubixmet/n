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

interface SavedBodyStyles {
  overflow: string;
  touchAction: string;
  overscrollBehavior: string;
}

export default function BrandIntro({ onComplete }: BrandIntroProps) {
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const finishedRef = useRef(false);
  const savedBodyStylesRef = useRef<SavedBodyStyles | null>(null);

  const restoreBody = useCallback(() => {
    const saved = savedBodyStylesRef.current;
    if (!saved) return;
    document.body.style.overflow = saved.overflow;
    document.body.style.touchAction = saved.touchAction;
    document.body.style.overscrollBehavior = saved.overscrollBehavior;
    savedBodyStylesRef.current = null;
  }, []);

  const finishIntro = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    timelineRef.current?.kill();
    timelineRef.current = null;
    restoreBody();

    try {
      sessionStorage.setItem("northframe_intro_seen", "true");
    } catch {
      // Storage may be disabled in private or restrictive browsers.
    }

    setIsVisible(false);
    onComplete?.();
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, [onComplete, restoreBody]);

  useEffect(() => {
    if (!isVisible || finishedRef.current) return;
    const timeoutId = window.setTimeout(finishIntro, 4000);
    return () => window.clearTimeout(timeoutId);
  }, [finishIntro, isVisible]);

  useLayoutEffect(() => {
    if (!isVisible) return;

    try {
      if (sessionStorage.getItem("northframe_intro_seen") === "true") {
        finishIntro();
        return;
      }
    } catch {
      // Continue with the animation when storage cannot be read.
    }

    savedBodyStylesRef.current = {
      overflow: document.body.style.overflow,
      touchAction: document.body.style.touchAction,
      overscrollBehavior: document.body.style.overscrollBehavior,
    };
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    document.body.style.overscrollBehavior = "none";

    const container = containerRef.current;
    const mark = markRef.current;
    const cover = coverRef.current;
    if (!container || !mark || !cover) {
      finishIntro();
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const markSize = mark.getBoundingClientRect().width || 80;
    const screenDiagonal = Math.hypot(window.innerWidth, window.innerHeight);
    const coverScale = (screenDiagonal / markSize) * 2.5;
    const timeline = gsap.timeline({ onComplete: finishIntro });
    timelineRef.current = timeline;

    if (reducedMotion) {
      gsap.set(mark, { autoAlpha: 1, scale: 1 });
      timeline.to({}, { duration: 0.3 });
    } else {
      timeline.fromTo(
        mark,
        { autoAlpha: 0, scale: 0.72 },
        { autoAlpha: 1, scale: 1, duration: 0.55, ease: "power3.out" }
      );
      timeline.to({}, { duration: 0.3 });
      timeline.to(mark, {
        scale: coverScale,
        duration: 0.68,
        ease: "power3.in",
        force3D: true,
      });
      timeline.to(cover, { autoAlpha: 1, duration: 0.12 }, "-=0.17");
    }

    timeline.to(container, {
      autoAlpha: 0,
      duration: reducedMotion ? 0.15 : 0.3,
      ease: "power2.out",
    });

    return () => {
      timeline.kill();
      timelineRef.current = null;
      restoreBody();
    };
  }, [finishIntro, isVisible, restoreBody]);

  if (!isVisible) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed inset-0 z-[200] flex h-[100svh] w-full items-center justify-center overflow-hidden bg-[#070B14] select-none touch-none"
    >
      <div ref={markRef} className="relative z-10 h-[72px] w-[72px] sm:h-[92px] sm:w-[92px]">
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
      <div ref={coverRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 bg-[#1677FF] opacity-0" />
    </div>
  );
}
