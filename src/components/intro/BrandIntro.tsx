"use client";

import React, { useLayoutEffect, useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface BrandIntroProps {
  onComplete?: () => void;
}

export default function BrandIntro({ onComplete }: BrandIntroProps) {
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const bracketsRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const expandingBlueRef = useRef<HTMLDivElement>(null);
  const apertureRef = useRef<HTMLDivElement>(null);
  const skipBtnRef = useRef<HTMLButtonElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const finishIntro = useCallback(() => {
    document.body.style.overflow = "";
    if (timelineRef.current) {
      timelineRef.current.kill();
      timelineRef.current = null;
    }
    if (containerRef.current) {
      containerRef.current.style.willChange = "auto";
    }
    if (typeof window !== "undefined") {
      ScrollTrigger.refresh();
    }
    setIsVisible(false);
    onComplete?.();
  }, [onComplete]);

  useEffect(() => {
    // Prevent body scrolling during intro
    document.body.style.overflow = "hidden";

    // Safety fallback timeout (4.5s limit)
    const timeoutId = setTimeout(() => {
      finishIntro();
    }, 4500);

    return () => {
      clearTimeout(timeoutId);
      document.body.style.overflow = "";
    };
  }, [finishIntro]);

  useLayoutEffect(() => {
    if (!isVisible) return;

    let ctx: gsap.Context | null = null;
    let animFrame2: number;

    const startAnimation = () => {
      const container = containerRef.current;
      const brackets = bracketsRef.current;
      const icon = iconRef.current;
      const logo = logoRef.current;
      const expandingBlue = expandingBlueRef.current;
      const aperture = apertureRef.current;
      const skipBtn = skipBtnRef.current;

      if (!container || !brackets || !icon || !logo || !expandingBlue || !aperture) return;

      // GSAP Context scoped to containerRef
      ctx = gsap.context(() => {
        // Calculate expansion scale based on viewport
        const vw = typeof window !== "undefined" ? window.innerWidth : 375;
        const vh = typeof window !== "undefined" ? window.innerHeight : 667;
        const maxDim = Math.max(vw, vh);
        const expandScale = (maxDim / 40) * 3.8;

        // EXPLICIT iOS-Safe Initial States using fromTo
        gsap.set(container, { opacity: 1, display: "flex" });
        gsap.set(brackets, { opacity: 0, scale: 0.85, force3D: true });
        gsap.set(icon, { opacity: 0, scale: 0.8, force3D: true });
        gsap.set(logo, { opacity: 0, scale: 0.92, y: 20, force3D: true });
        gsap.set(expandingBlue, { opacity: 0, scale: 1, force3D: true });
        gsap.set(aperture, { opacity: 0, scale: 1, force3D: true });
        if (skipBtn) gsap.set(skipBtn, { opacity: 0 });

        // Timeline instance
        const tl = gsap.timeline({
          onComplete: () => {
            finishIntro();
          },
        });

        timelineRef.current = tl;

        // STEP 1: Corner brackets reveal
        tl.fromTo(
          brackets,
          { opacity: 0, scale: 0.85 },
          { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" }
        );

        if (skipBtn) {
          tl.fromTo(
            skipBtn,
            { opacity: 0 },
            { opacity: 1, duration: 0.4 },
            "<0.1"
          );
        }

        // STEP 2: Icon reveal
        tl.fromTo(
          icon,
          { opacity: 0, scale: 0.8 },
          { opacity: 1, scale: 1, duration: 0.65, ease: "back.out(1.2)" },
          "> -0.1"
        );

        // STEP 3: Full Logo reveal & bracket expansion
        tl.to(
          icon,
          { opacity: 0, scale: 0.9, duration: 0.35, ease: "power2.inOut" },
          ">+0.1"
        )
          .fromTo(
            logo,
            { opacity: 0, scale: 0.92, y: 20 },
            { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: "power3.out" },
            "<"
          )
          .to(
            brackets,
            {
              width: "min(82vw, 340px)",
              height: "72px",
              duration: 0.6,
              ease: "power2.out",
            },
            "<"
          )
          .to({}, { duration: 0.3 });

        // STEP 4: Icon expansion sequence
        tl.to(logo, { opacity: 0, scale: 0.9, duration: 0.3, ease: "power2.in" })
          .to(brackets, { opacity: 0, duration: 0.3, ease: "power1.out" }, "<")
          .fromTo(
            icon,
            { opacity: 0, scale: 0.9 },
            { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" },
            "<0.1"
          )
          .to(icon, {
            scale: expandScale,
            duration: 0.65,
            ease: "expo.in",
          });

        // STEP 5: Aperture transition to main content
        tl.to(expandingBlue, { opacity: 1, duration: 0.15 }, "-=0.1")
          .to(icon, { opacity: 0, duration: 0.15 }, "<")
          .to(aperture, { opacity: 1, duration: 0.08 }, "<")
          .to(aperture, {
            scale: expandScale * 1.5,
            opacity: 0,
            duration: 0.6,
            ease: "power3.inOut",
          });

        // STEP 6: Fade out intro container
        tl.to(container, {
          opacity: 0,
          duration: 0.35,
          ease: "power2.out",
        });
      }, containerRef);
    };

    // Double requestAnimationFrame ensures iOS Safari renders first paint before timeline executes
    const animFrame1 = requestAnimationFrame(() => {
      animFrame2 = requestAnimationFrame(() => {
        startAnimation();
      });
    });

    return () => {
      cancelAnimationFrame(animFrame1);
      cancelAnimationFrame(animFrame2);
      if (ctx) ctx.revert();
    };
  }, [isVisible, finishIntro]);

  if (!isVisible) return null;

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-label="Loading NORTHFRAME"
      className="fixed inset-0 z-50 w-full h-[100svh] h-[100dvh] min-h-[100vh] flex items-center justify-center bg-[#070B14] select-none touch-none overflow-hidden"
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-[#070B14]" />

      {/* Skip Intro Control */}
      <button
        ref={skipBtnRef}
        onClick={finishIntro}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            finishIntro();
          }
        }}
        className="absolute top-6 right-6 z-50 px-4 py-2 text-xs font-mono tracking-widest text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/15 rounded-full transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Skip Intro Animation"
      >
        SKIP INTRO
      </button>

      {/* Center Stage Box with Brackets */}
      <div className="relative flex items-center justify-center w-full max-w-[90vw] h-48">
        {/* Responsive Corner Brackets */}
        <div
          ref={bracketsRef}
          className="intro-brackets-animation absolute w-24 h-24 pointer-events-none transition-all duration-300 flex items-center justify-center"
        >
          {/* Top-Left Bracket */}
          <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#2563EB]" />
          {/* Top-Right Bracket */}
          <span className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#2563EB]" />
          {/* Bottom-Left Bracket */}
          <span className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#2563EB]" />
          {/* Bottom-Right Bracket */}
          <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#2563EB]" />
        </div>

        {/* Arrow Icon Wrapper */}
        <div
          ref={iconRef}
          className="intro-icon-animation absolute flex items-center justify-center pointer-events-none z-10"
        >
          <Image
            src="/images/brand/northframe-icon.webp"
            alt="NORTHFRAME Icon"
            width={72}
            height={72}
            priority
            className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
          />
        </div>

        {/* Full Logo Wrapper */}
        <div
          ref={logoRef}
          className="intro-logo-animation absolute flex items-center justify-center pointer-events-none z-10 px-4"
        >
          <Image
            src="/images/brand/northframe-logo.webp"
            alt="NORTHFRAME Logo"
            width={320}
            height={60}
            priority
            className="w-[70vw] max-w-[280px] sm:max-w-[340px] h-auto object-contain"
          />
        </div>
      </div>

      {/* Stage 4 Solid Blue Screen Transition */}
      <div
        ref={expandingBlueRef}
        className="absolute inset-0 bg-[#2563EB] pointer-events-none opacity-0 z-20"
      />

      {/* Stage 5 Aperture Mask Layer */}
      <div
        ref={apertureRef}
        className="absolute inset-0 pointer-events-none opacity-0 z-30 flex items-center justify-center"
        style={{
          backgroundColor: "#2563EB",
          WebkitMaskImage: `url('/images/brand/northframe-icon.webp')`,
          maskImage: `url('/images/brand/northframe-icon.webp')`,
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskPosition: "center",
          maskPosition: "center",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
        }}
      />
    </div>
  );
}

