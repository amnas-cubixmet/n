"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function OurExpertise() {
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
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      });

      if (labelRef.current) {
        tl.from(labelRef.current, {
          opacity: 0,
          duration: 0.6,
          ease: "power2.out",
        });
      }

      if (copyRef.current) {
        tl.from(
          copyRef.current,
          {
            opacity: 0,
            y: 20,
            duration: 0.7,
            ease: "power2.out",
          },
          "-=0.4"
        );
      }
    },
    { scope: containerRef }
  );

  return (
    <section
      id="our-expertise"
      ref={containerRef}
      className="relative w-full bg-white text-black pointer-events-auto z-20 m-0 px-5 md:px-6 lg:px-8 py-16 md:py-20"
    >
      <div className="w-full text-left">
        {/* UPPER-LEFT EDITORIAL LABEL */}
        <div ref={labelRef} className="flex items-center">
          <span className="inline-block bg-black text-white px-1 py-0 text-xs font-medium uppercase leading-tight">
            OUR EXPERTISE
          </span>
        </div>

        {/* MAIN EDITORIAL COPY */}
        <div
          ref={copyRef}
          className="mt-10 max-w-[1000px] space-y-8 font-normal text-[clamp(22px,2.4vw,40px)] leading-[1.3] tracking-[-0.02em] text-left"
        >
          <p className="font-sans font-normal text-black m-0">
            What do we do best? Branding, design, and digital experiences. Yes,
            you’ve heard that before. But expertise isn’t just about what you
            do, it’s about how exceptionally you do it.
          </p>

          <p className="font-sans font-normal text-black m-0">
            We push every detail further, challenge the expected, and strive for
            work that feels considered, distinctive, and precise. Because good
            is never the finish line. There’s always a way to make it better.
          </p>
        </div>
      </div>
    </section>
  );
}
