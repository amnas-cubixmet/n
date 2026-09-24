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
      const container = containerRef.current;
      const heading = headingRef.current;
      const paragraph = paragraphRef.current;

      if (!container || !heading || !paragraph) return;
      const letters = heading.querySelectorAll<HTMLElement>(".intro-heading-letter");

      if (isReducedMotion) {
        gsap.set([heading, paragraph], {
          autoAlpha: 1,
          y: 0,
          clearProps: "transform",
        });
        gsap.set(letters, { autoAlpha: 1, yPercent: 0 });
        return;
      }

      const mm = gsap.matchMedia();

      const buildReveal = (mobile: boolean) => {
        gsap.set(letters, { autoAlpha: 0, yPercent: 110, force3D: true });

        gsap.set(paragraph, {
          autoAlpha: 0,
          y: mobile ? 32 : 42,
          force3D: true,
        });

        const timeline = gsap.timeline({
          defaults: {
            ease: "none",
            overwrite: "auto",
          },
          scrollTrigger: {
            trigger: container,
            start: "top 100%",
            end: "top 65%",
            scrub: mobile ? 0.32 : 0.45,
            invalidateOnRefresh: true,
          },
        });

        timeline
          .to(
            letters,
            {
              autoAlpha: 1,
              yPercent: 0,
              duration: 0.22,
              stagger: 0.035,
              force3D: true,
            },
            0
          )
          .to(
            paragraph,
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.5,
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
      className="relative z-10 box-border flex min-h-[50svh] w-full flex-col justify-start bg-transparent m-0 px-[max(16px,env(safe-area-inset-left))] pt-0 pb-[clamp(2rem,5vh,4rem)] text-white pointer-events-auto sm:px-[clamp(20px,2.5vw,40px)]"
    >
      <div className="w-full">
        <div className="max-w-[880px]">
          <div className="flex items-center overflow-hidden py-1">
            <h2
              ref={headingRef}
              aria-label={headingText}
              className="w-fit overflow-hidden bg-white px-1 font-montserrat text-[11px] font-semibold tracking-[0.06em] text-black uppercase leading-none sm:text-[13px]"
              style={
                isReducedMotion
                  ? { opacity: 1, transform: "none" }
                  : { willChange: "transform, opacity" }
              }
            >
              {Array.from(headingText, (letter, index) => (
                <span
                  key={index}
                  aria-hidden="true"
                  className="intro-heading-letter inline-block"
                >
                  {letter}
                </span>
              ))}
            </h2>
          </div>

          <div className="mt-3 overflow-hidden sm:mt-4">
            <p
              ref={paragraphRef}
              className="m-0 max-w-[850px] text-left font-poppins text-white text-[clamp(18px,4.5vw,23px)] sm:text-[clamp(20px,2vw,26px)] leading-[1.25] font-normal tracking-[-0.02em]"
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
