"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
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
  const logoRef = useRef<HTMLDivElement>(null);
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
      const logo = logoRef.current;
      const heading = headingRef.current;
      const paragraph = paragraphRef.current;

      if (!container || !logo || !heading || !paragraph) return;

      if (isReducedMotion) {
        gsap.set([logo, heading, paragraph], {
          autoAlpha: 1,
          y: 0,
          clearProps: "transform",
        });
        return;
      }

      const mm = gsap.matchMedia();

      const buildReveal = (mobile: boolean) => {
        gsap.set(logo, {
          autoAlpha: 0,
          y: mobile ? 32 : 48,
          force3D: true,
        });

        gsap.set(heading, {
          autoAlpha: 0,
          yPercent: 110,
          force3D: true,
        });

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
            start: mobile ? "top 88%" : "top 85%",
            end: mobile ? "top 28%" : "top 32%",
            scrub: mobile ? 0.32 : 0.45,
            invalidateOnRefresh: true,
          },
        });

        timeline
          .to(
            heading,
            {
              autoAlpha: 1,
              yPercent: 0,
              duration: 0.45,
              force3D: true,
            },
            0.08
          )
          .to(
            paragraph,
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.72,
              force3D: true,
            },
            0.18
          );

        // The hero wordmark is still on screen at the start of this section.
        // Crossfade the introduction wordmark only as that one leaves.
        gsap.to(logo, {
          autoAlpha: 1,
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: container,
            start: "top 25%",
            end: "top top",
            scrub: mobile ? 0.32 : 0.45,
            invalidateOnRefresh: true,
          },
        });

        return () => {
          gsap.set([logo, heading, paragraph], {
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
      className="relative z-10 box-border flex min-h-[60svh] w-full flex-col justify-center bg-transparent m-0 px-[max(1rem,3vw)] py-[clamp(3rem,8vh,6.5rem)] text-white pointer-events-auto"
    >
      <div className="mx-auto grid w-full max-w-[1500px] grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] items-center gap-x-4 sm:gap-x-10 lg:gap-x-24">
        <div ref={logoRef} className="min-w-0 self-center" style={isReducedMotion ? undefined : { willChange: "transform, opacity" }}>
          <Image
            src="/images/brand/northframe-logo.webp"
            alt="NORTHFRAME"
            width={700}
            height={116}
            sizes="(max-width: 768px) 42vw, 42vw"
            className="block h-auto w-full"
          />
        </div>

        <div className="min-w-0">
          <div className="flex items-center overflow-hidden py-1">
            <h2
              ref={headingRef}
              className="font-montserrat text-[10px] font-semibold tracking-[0.06em] text-white uppercase leading-none sm:text-[12px]"
              style={
                isReducedMotion
                  ? { opacity: 1, transform: "none" }
                  : { willChange: "transform, opacity" }
              }
            >
              {headingText}
            </h2>
          </div>

          <div className="mt-4 overflow-hidden sm:mt-5">
            <p
              ref={paragraphRef}
              className="m-0 max-w-[850px] text-left font-poppins text-white text-[clamp(14px,3.6vw,19px)] sm:text-[clamp(18px,2.3vw,30px)] leading-[1.22] font-normal tracking-[-0.02em]"
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
