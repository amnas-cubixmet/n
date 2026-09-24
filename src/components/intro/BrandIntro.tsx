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
  const logoRef = useRef<HTMLDivElement>(null);
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
    const timeoutId = window.setTimeout(finishIntro, 3500);
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
      // Continue with the logo when storage cannot be read.
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
    const logo = logoRef.current;
    if (!container || !logo) {
      finishIntro();
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timeline = gsap.timeline({ onComplete: finishIntro });
    timelineRef.current = timeline;

    if (reducedMotion) {
      timeline.to({}, { duration: 0.25 });
    } else {
      timeline.fromTo(
        logo,
        { scale: 0.96 },
        { scale: 1, duration: 0.45, ease: "power2.out" }
      );
      timeline.to({}, { duration: 0.38 });
    }

    timeline.to(container, {
      autoAlpha: 0,
      duration: reducedMotion ? 0.15 : 0.28,
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
      className="fixed inset-0 z-[200] flex h-[100svh] w-full items-center justify-center bg-[#070B14] select-none touch-none"
    >
      <div ref={logoRef} className="w-[72vw] max-w-[300px] sm:max-w-[480px]">
        <Image
          src="/images/brand/northframe-logo.webp"
          alt=""
          width={822}
          height={100}
          priority
          sizes="(max-width: 640px) 72vw, 480px"
          className="block h-auto w-full object-contain"
        />
      </div>
    </div>
  );
}
