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

  const [isReducedMotion, setIsReducedMotion] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
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
      if (isReducedMotion || !containerRef.current) return;

      const charElements =
        containerRef.current.querySelectorAll<HTMLElement>(".intro-char");
      if (!charElements.length) return;

      const mm = gsap.matchMedia();

      const reveal = (mobile: boolean) => {
        gsap.fromTo(
          charElements,
          {
            opacity: 0,
            y: mobile ? 5 : 8,
          },
          {
            opacity: 1,
            y: 0,
            duration: mobile ? 0.42 : 0.65,
            stagger: mobile ? 0.045 : 0.07,
            ease: "power2.out",
            scrollTrigger: {
              trigger: containerRef.current,
              start: mobile ? "top 90%" : "top 85%",
              once: true,
            },
          }
        );
      };

      mm.add("(max-width: 768px)", () => reveal(true));
      mm.add("(min-width: 769px)", () => reveal(false));

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
      className="relative w-full flex flex-col justify-center m-0 box-border pointer-events-auto bg-transparent z-10 px-[3vw] py-[4vh]"
    >
      <div className="flex flex-col w-full max-w-[850px]">
        {/* Eyebrow / INTRODUCTION Section Label Heading */}
        <div
          ref={headingRef}
          className="flex items-center"
          style={isReducedMotion ? { opacity: 1, transform: "none" } : undefined}
        >
          <h2 className="font-montserrat text-[12px] font-semibold tracking-[0.06em] text-white uppercase leading-none">
            {headingText.split("").map((char, index) => (
              <span
                key={index}
                className="intro-char inline-block"
                style={isReducedMotion ? { opacity: 1, transform: "none" } : undefined}
              >
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </h2>
        </div>

        {/* Editorial Paragraph Typography: clamp(21px, 2vw, 30px) on desktop, clamp(18px, 5vw, 23px) on mobile */}
        <p className="mt-3 sm:mt-4 text-left font-poppins text-zinc-100 max-w-[850px] text-[clamp(18px,5vw,23px)] sm:text-[clamp(21px,2vw,30px)] leading-[1.15] font-normal tracking-[-0.02em] drop-shadow-[0_2px_14px_rgba(0,0,0,0.75)]">
          {paragraphText}
        </p>
      </div>
    </div>
  );
}
