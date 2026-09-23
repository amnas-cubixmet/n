"use client";

import React, { useEffect, useRef, useState } from "react";
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
  const headingRef = useRef<HTMLDivElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);

  const [isReducedMotion, setIsReducedMotion] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleMotionChange = (event: MediaQueryListEvent) => {
      setIsReducedMotion(event.matches);
    };

    if (typeof motionQuery.addEventListener === "function") {
      motionQuery.addEventListener("change", handleMotionChange);
      return () => motionQuery.removeEventListener("change", handleMotionChange);
    }

    motionQuery.addListener(handleMotionChange);
    return () => motionQuery.removeListener(handleMotionChange);
  }, []);

  useGSAP(
    () => {
      const container = containerRef.current;
      const heading = headingRef.current;
      const paragraph = paragraphRef.current;

      if (!container || !heading || !paragraph) return;

      if (isReducedMotion) {
        gsap.set([heading, paragraph], {
          autoAlpha: 1,
          y: 0,
          clearProps: "transform",
        });
        return;
      }

      const mm = gsap.matchMedia();

      const buildReveal = (mobile: boolean) => {
        gsap.set(heading, {
          autoAlpha: 0,
          yPercent: 115,
          force3D: true,
        });

        gsap.set(paragraph, {
          autoAlpha: 0,
          y: mobile ? 28 : 38,
          force3D: true,
        });

        const timeline = gsap.timeline({
          defaults: {
            ease: "none",
            overwrite: "auto",
          },
          scrollTrigger: {
            trigger: container,
            start: mobile ? "top 96%" : "top 94%",
            end: mobile ? "top 42%" : "top 38%",
            scrub: mobile ? 0.28 : 0.45,
            invalidateOnRefresh: true,
          },
        });

        timeline
          .to(
            heading,
            {
              autoAlpha: 1,
              yPercent: 0,
              duration: mobile ? 0.34 : 0.4,
              force3D: true,
            },
            0
          )
          .to(
            paragraph,
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.72,
              force3D: true,
            },
            0.12
          );

        return () => {
          gsap.set([heading, paragraph], {
            clearProps: "willChange",
          });
        };
      };

      mm.add("(max-width: 768px)", () => buildReveal(true));
      mm.add("(min-width: 769px)", () => buildReveal(false));

      return () => mm.revert();
    },
    {
      scope: containerRef,
      dependencies: [isReducedMotion],
      revertOnUpdate: true,
    }
  );

  return (
    <div
      ref={containerRef}
      className="relative z-10 box-border flex min-h-[50svh] w-full flex-col justify-center bg-white m-0 px-[max(1rem,3vw)] py-[clamp(3rem,8vh,6.5rem)] text-black pointer-events-auto"
    >
      <div className="flex w-full max-w-[850px] flex-col">
        <div
          ref={headingRef}
          className="flex items-center overflow-hidden"
          style={
            isReducedMotion
              ? { opacity: 1, transform: "none" }
              : { willChange: "transform, opacity" }
          }
        >
          <h2 className="font-montserrat text-[12px] font-semibold tracking-[0.06em] text-black uppercase leading-none">
            {headingText}
          </h2>
        </div>

        <p
          ref={paragraphRef}
          className="mt-4 sm:mt-5 max-w-[850px] text-left font-poppins text-black text-[clamp(18px,5vw,23px)] sm:text-[clamp(21px,2vw,30px)] leading-[1.15] font-normal tracking-[-0.02em]"
          style={
            isReducedMotion
              ? { opacity: 1, transform: "none" }
              : { willChange: "transform, opacity" }
          }
        >
          {paragraphText}
        </p>
      </div>
    </div>
  );
}
