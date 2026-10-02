"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function OurVision() {
  const containerRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (typeof window === "undefined") return;

      const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (motionQuery.matches) return;

      const label = labelRef.current;
      const copy = copyRef.current;
      if (!containerRef.current || !label || !copy) return;

      const mm = gsap.matchMedia();

      const buildReveal = (mobile: boolean) => {
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: mobile ? "top 92%" : "top 82%",
            once: true,
            invalidateOnRefresh: true,
          },
        });

        if (label) {
          timeline.from(
            label,
            {
              opacity: 0,
              y: mobile ? 6 : 10,
              duration: mobile ? 0.35 : 0.5,
              ease: "power3.out",
            },
            "0"
          );
        }

        if (copy) {
          timeline.from(
            copy,
            {
              opacity: 0,
              y: mobile ? 12 : 24,
              duration: mobile ? 0.52 : 0.8,
              ease: "power3.out",
            },
            "-=0.22"
          );
        }
      };

      mm.add("(max-width: 768px)", () => buildReveal(true));
      mm.add("(min-width: 769px)", () => buildReveal(false));

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  return (
    <div className="relative z-30 w-full overflow-visible">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 z-0 h-[18svh] w-full bg-[#1677FF] md:h-[20dvh]"
        style={{
          transform: "translateY(calc(-100% + 1px))",
          clipPath:
            "polygon(0% 0%, 100% 0%, 100% 26%, 87.5% 26%, 87.5% 58%, 75% 58%, 75% 34%, 62.5% 34%, 62.5% 74%, 50% 74%, 50% 46%, 37.5% 46%, 37.5% 82%, 25% 82%, 25% 54%, 12.5% 54%, 12.5% 88%, 0% 88%)",
        }}
      />

      <section
        id="our-vision"
        ref={containerRef}
        className="relative z-10 w-full overflow-hidden bg-[#000000] px-6 py-20 text-white pointer-events-auto m-0 select-none sm:px-10 md:px-16 md:py-28 lg:px-20 lg:py-36"
      >
        <div className="relative w-full max-w-[1300px] mx-auto flex flex-col items-start text-left">
        {/* SMALL EDITORIAL LABEL IN UPPER-LEFT: WHITE BG, BLACK TEXT */}
        <div ref={labelRef} className="flex items-center mb-8 md:mb-12">
          <span className="font-mono inline-block bg-[#FFFFFF] text-[#000000] px-2 py-1 text-xs sm:text-sm font-bold uppercase tracking-wider leading-none">
            OUR VISION
          </span>
        </div>

        {/* MAIN EDITORIAL PARAGRAPH */}
        <div
          ref={copyRef}
          className="w-full max-w-[1100px] text-left"
        >
          <p className="font-sans font-normal text-[#FFFFFF] text-[clamp(24px,2.5vw,40px)] leading-[1.08] tracking-tight m-0">
            Meeting expectations is easy. Surpassing them is the real craft.
            At NORTHFRAME, our vision is to move beyond the ordinary and create
            work that sets a higher standard. Anyone can create a brand, build
            a website, or run a campaign. We aim to go further, think bigger,
            and deliver work that truly stands apart.
          </p>
        </div>
        </div>
      </section>
    </div>
  );
}
