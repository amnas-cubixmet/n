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
  const headingRef = useRef<HTMLHeadingElement>(null);
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
      const heading = headingRef.current;
      const paragraph = paragraphRef.current;

      if (!heading || !paragraph) return;

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
        gsap.set(heading, { autoAlpha: 0, y: mobile ? 12 : 16 });
        gsap.set(paragraph, { autoAlpha: 0, y: mobile ? 20 : 26 });

        const timeline = gsap.timeline({
          defaults: {
            ease: "none",
            overwrite: "auto",
          },
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 92%",
            end: "top 62%",
            scrub: mobile ? 0.18 : 0.3,
            invalidateOnRefresh: true,
          },
        });

        timeline
          .to(
            heading,
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.32,
            },
            0
          )
          .to(
            paragraph,
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.68,
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
      className="relative z-10 box-border flex min-h-[50svh] w-full flex-col justify-start bg-transparent m-0 px-[max(20px,env(safe-area-inset-left))] pt-[clamp(3rem,8svh,7rem)] pb-[clamp(4rem,11svh,9rem)] text-white pointer-events-auto sm:px-[clamp(32px,5vw,96px)]"
    >
      <div className="w-full">
        <div className="max-w-[1000px]">
          <div className="flex items-center py-1">
            <h2
              ref={headingRef}
              className="w-fit font-montserrat text-[11px] font-medium tracking-[0.04em] text-white uppercase leading-none sm:text-[13px]"
              style={
                isReducedMotion
                  ? { opacity: 1, transform: "none" }
                  : { willChange: "transform, opacity" }
              }
            >
              {headingText}
            </h2>
          </div>

          <div className="mt-5 sm:mt-7">
            <p
              ref={paragraphRef}
              className="m-0 max-w-[950px] text-left font-poppins text-white text-[clamp(21px,5.6vw,27px)] sm:text-[clamp(26px,2.5vw,36px)] leading-[1.28] font-normal tracking-[-0.035em]"
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
      </div>
    </div>
  );
}
