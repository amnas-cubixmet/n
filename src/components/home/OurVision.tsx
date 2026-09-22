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

      if (!containerRef.current) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });

      if (labelRef.current) {
        tl.from(labelRef.current, {
          opacity: 0,
          y: 10,
          duration: 0.5,
          ease: "power2.out",
        });
      }

      if (copyRef.current) {
        tl.from(
          copyRef.current,
          {
            opacity: 0,
            y: 24,
            duration: 0.8,
            ease: "power2.out",
          },
          "-=0.3"
        );
      }
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
