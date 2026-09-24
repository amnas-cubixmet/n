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
          y: mobile ? 24 : 32,
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
            end: mobile ? "top 45%" : "top 48%",
            scrub: mobile ? 0.32 : 0.45,
            invalidateOnRefresh: true,
          },
        });

        timeline
          .to(
            logo,
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.38,
              force3D: true,
            },
            0
          )
          .to(
            heading,
            {
              autoAlpha: 1,
              yPercent: 0,
              duration: 0.38,
              force3D: true,
            },
            0.08
          )
          .to(
            paragraph,
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.5,
              force3D: true,
            },
            0.1
          );

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
      className="relative z-10 box-border flex min-h-[70svh] w-full flex-col justify-center bg-transparent m-0 px-[clamp(1.5rem,8vw,7rem)] py-[clamp(2rem,5vh,4rem)] text-white pointer-events-auto sm:min-h-[60svh]"
    >
      <div className="mx-auto w-full max-w-[1360px]">
        <div ref={logoRef} className="mb-[clamp(1.5rem,5svh,3rem)] w-full max-w-[min(76vw,520px)] sm:mb-[clamp(1.5rem,4vh,2.5rem)]" style={isReducedMotion ? undefined : { willChange: "transform, opacity" }}>
          <Image
            src="/images/brand/northframe-logo.webp"
            alt="NORTHFRAME"
            width={700}
            height={116}
            sizes="(max-width: 768px) 76vw, 520px"
            className="block h-auto w-full"
          />
        </div>

        <div className="max-w-[880px]">
          <div className="flex items-center overflow-hidden py-1">
            <h2
              ref={headingRef}
              className="font-montserrat text-[11px] font-semibold tracking-[0.06em] text-white uppercase leading-none sm:text-[13px]"
              style={
                isReducedMotion
                  ? { opacity: 1, transform: "none" }
                  : { willChange: "transform, opacity" }
              }
            >
              {headingText}
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
