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

      const label = labelRef.current;
      const copy = copyRef.current;
      if (!label || copy) return;

      const mm = gsap.matchMedia();

      const buildReveal = (mobile: boolean) => {
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: mobile ? "top 90%" : "top 85%",
            once: true,
          },
        });

        if (label) {
          timeline.from(
            label,
            {
              opacity: 0,
              y: mobile ? 6 : 0,
              duration: mobile ? 0.35 : 0.6,
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
              y: mobile ? 14 : 20,
              duration: mobile ? 0.5 : 0.7,
              ease: "power3.out",
            },
            "-=0.25"
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
