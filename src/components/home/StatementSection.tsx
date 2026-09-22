"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function StatementSection() {
  const containerRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const textGroupRef = useRef<HTMLDivElement>(null);

  // 5 Separate Lines
  const line1Ref = useRef<HTMLDivElement>(null);
  const wordWeRef = useRef<HTMLSpanElement>(null);

  const line2Ref = useRef<HTMLDivElement>(null);
  const wordMakeRef = useRef<HTMLSpanElement>(null);

  const line3Ref = useRef<HTMLDivElement>(null);
  const wordBrandsRef = useRef<HTMLSpanElement>(null);

  const line4Ref = useRef<HTMLDivElement>(null);
  const wordGoRef = useRef<HTMLSpanElement>(null);

  const line5Ref = useRef<HTMLDivElement>(null);
  const wooooowTextRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (typeof window === "undefined") return;

      const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (motionQuery.matches) return;

      if (!containerRef.current || !stickyRef.current) return;

      const compactMotion = window.matchMedia(
        "(max-width: 768px), (pointer: coarse)"
      ).matches;

      const masterTL = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: compactMotion ? "+=400%" : "+=550%",
          pin: stickyRef.current,
          pinSpacing: true,
          scrub: compactMotion ? 0.45 : 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Initial state: hide each line below wrapper
      gsap.set(
        [
          wordWeRef.current,
          wordMakeRef.current,
          wordBrandsRef.current,
          wordGoRef.current,
          wooooowTextRef.current,
        ],
        { yPercent: 110, opacity: 0 }
      );

      // STAGE 01: Reveal Line 1 "WE"
      masterTL.to(
        wordWeRef.current,
        { yPercent: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
        0.2
      );

      // STAGE 02: Reveal Line 2 "MAKE" & slightly adjust group upward for vertical balance
      masterTL
        .to(
          textGroupRef.current,
          { y: compactMotion ? "-3vh" : "-4vh", duration: compactMotion ? 0.6 : 0.8, ease: "power2.out" },
          1.0
        )
        .to(
          wordMakeRef.current,
          { yPercent: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
          1.0
        );

      // STAGE 03: Reveal Line 3 "BRANDS" & re-center group
      masterTL
        .to(
          textGroupRef.current,
          { y: compactMotion ? "-6vh" : "-8vh", duration: compactMotion ? 0.6 : 0.8, ease: "power2.out" },
          1.8
        )
        .to(
          wordBrandsRef.current,
          { yPercent: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
          1.8
        );

      // STAGE 04: Reveal Line 4 "GO" & re-center group
      masterTL
        .to(
          textGroupRef.current,
          { y: compactMotion ? "-9vh" : "-12vh", duration: compactMotion ? 0.6 : 0.8, ease: "power2.out" },
          2.6
        )
        .to(
          wordGoRef.current,
          { yPercent: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
          2.6
        );

      // STAGE 05: Reveal Line 5 "WOOOOOOOW!" climax & extend O scale
      masterTL
        .to(
          textGroupRef.current,
          { y: compactMotion ? "-12vh" : "-16vh", duration: compactMotion ? 0.68 : 0.9, ease: "power2.out" },
          3.5
        )
        .to(
          wooooowTextRef.current,
          { yPercent: 0, opacity: 1, duration: 0.9, ease: "power3.out" },
          3.5
        )
        .to(
          wooooowTextRef.current,
          {
            scaleX: compactMotion ? 1.14 : 1.35,
            duration: 1.5,
            ease: "none",
          },
          4.4
        );
    },
    { scope: containerRef }
  );

  return (
    <section
      id="statement"
      ref={containerRef}
      className="relative w-full bg-[#1677FF] text-black pointer-events-auto z-30 m-0 p-0 overflow-visible select-none"
    >
      {/* STICKY FULL VIEWPORT CONTAINER */}
      <div
        ref={stickyRef}
        className="sticky top-0 w-full h-[100svh] min-h-[100svh] md:h-[100dvh] md:min-h-[100dvh] flex flex-col justify-center items-center px-3 sm:px-6 md:px-12 bg-[#1677FF] overflow-hidden"
      >
        {/* CENTERED GRAPHIC TYPOGRAPHY GROUP */}
        <div
          ref={textGroupRef}
          className="relative z-10 w-full max-w-[1500px] mx-auto flex flex-col items-center justify-center text-center will-change-transform"
        >
          {/* LINE 1: WE */}
          <div
            ref={line1Ref}
            className="overflow-hidden py-0.5 leading-[0.82] flex justify-center w-full"
          >
            <span
              ref={wordWeRef}
              className="inline-block font-mono font-bold text-white bg-black px-[0.14em] py-[0.02em] text-[clamp(48px,14vw,140px)] uppercase tracking-[0.02em] leading-[0.82]"
            >
              WE
            </span>
          </div>

          {/* LINE 2: MAKE */}
          <div
            ref={line2Ref}
            className="overflow-hidden py-0.5 leading-[0.82] mt-1 sm:mt-2 flex justify-center w-full"
          >
            <span
              ref={wordMakeRef}
              className="inline-block font-mono font-bold text-black text-[clamp(48px,14vw,140px)] uppercase tracking-[0.02em] leading-[0.82]"
            >
              MAKE
            </span>
          </div>

          {/* LINE 3: BRANDS */}
          <div
            ref={line3Ref}
            className="overflow-hidden py-0.5 leading-[0.82] mt-1 sm:mt-2 flex justify-center w-full"
          >
            <span
              ref={wordBrandsRef}
              className="inline-block font-mono font-bold text-black text-[clamp(48px,14vw,140px)] uppercase tracking-[0.02em] leading-[0.82]"
            >
              BRANDS
            </span>
          </div>

          {/* LINE 4: GO */}
          <div
            ref={line4Ref}
            className="overflow-hidden py-0.5 leading-[0.82] mt-1 sm:mt-2 flex justify-center w-full"
          >
            <span
              ref={wordGoRef}
              className="inline-block font-mono font-bold text-white bg-black px-[0.14em] py-[0.02em] text-[clamp(48px,14vw,140px)] uppercase tracking-[0.02em] leading-[0.82]"
            >
              GO
            </span>
          </div>

          {/* LINE 5: WOOOOOOOOW! */}
          <div
            ref={line5Ref}
            className="w-full overflow-visible py-1 leading-[0.82] mt-2 sm:mt-4 flex justify-center"
          >
            <div
              ref={wooooowTextRef}
              className="font-mono font-bold text-black text-[clamp(54px,18vw,200px)] uppercase tracking-tight leading-[0.82] whitespace-nowrap origin-center will-change-transform"
            >
              WOOOOOOOOW!
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
