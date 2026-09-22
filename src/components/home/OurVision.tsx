"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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
            start: mobile ? "top 88%" : "top 80%",
            once: true,
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
              y: mobile ? 16 : 24,
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
    <section
      id="our-vision"
      ref={containerRef}
      className="relative w-full bg-[#000000] text-white pointer-events-auto z-30 m-0 px-6 sm:px-10 md:px-16 lg:px-20 py-20 md:py-28 lg:py-36 overflow-hidden select-none"
    >
      <div className="relative w-full max-w-[1300px] mx-auto flex flex-col items-start text-left">
        {/* SMALL EDITORIAL LABEL IN UPPER-LEFT: WHITE BG, BLACK TEXT */}
        <div ref={labelRef} className="flex items-center mb-8 md:mb-12">
          <span className="font-pixel inline-block bg-[#FFFFFF] text-[#000000] px-2 py-1 text-xs sm:text-sm font-bold uppercase tracking-wider leading-none">
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
  );
}
