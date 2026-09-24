"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function IntroSection() {
  const headingText = "INTRODUCTION";
  const paragraphText =
    "NORTHFRᐱME is a creative agency for strategy, branding, digital marketing, web development, technology, and creative production, built for brands that refuse to blend in. We don’t believe in ordinary. We believe in custom ideas, thoughtful design, and purposeful execution that create that unmistakable “wow” feeling. That’s who we are. That’s how we build brands that move forward.";

  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const heading = headingRef.current;
      if (!heading || !containerRef.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const mm = gsap.matchMedia();

      const buildReveal = (mobile: boolean) => {
        gsap.fromTo(heading, {
          autoAlpha: 0,
          y: mobile ? 8 : 12,
        }, {
          autoAlpha: 1,
          y: 0,
          duration: mobile ? 0.45 : 0.6,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 78%",
            once: true,
            invalidateOnRefresh: true,
          },
        });
      };

      mm.add("(max-width: 768px)", () => buildReveal(true));
      mm.add("(min-width: 769px)", () => buildReveal(false));

      return () => mm.revert();
    },
    {
      scope: containerRef,
    }
  );

  return (
    <div
      ref={containerRef}
      className="relative z-10 box-border flex min-h-[50svh] w-full flex-col items-start justify-start bg-transparent m-0 px-[max(20px,env(safe-area-inset-left))] pt-[clamp(3rem,8svh,7rem)] pb-[clamp(4rem,11svh,9rem)] text-left text-white pointer-events-auto sm:px-[clamp(32px,5vw,96px)]"
    >
      <div className="w-full">
        <div className="max-w-[1000px]">
          <div className="flex items-center py-1">
            <h2
              ref={headingRef}
              className="w-fit font-montserrat text-[11px] font-medium tracking-[0.04em] text-white uppercase leading-none sm:text-[13px]"
            >
              {headingText}
            </h2>
          </div>

          <div className="mt-5 sm:mt-7">
            <p
              className="m-0 max-w-[950px] text-left font-poppins text-white text-[clamp(18px,4.7vw,23px)] sm:text-[clamp(23px,2.1vw,30px)] leading-[1.34] font-normal tracking-[-0.025em]"
            >
              {paragraphText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
