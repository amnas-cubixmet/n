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
  const paragraphRef = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const container = containerRef.current;
      const heading = headingRef.current;
      const paragraph = paragraphRef.current;

      if (!container || !heading || !paragraph) return;

      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (reducedMotion) {
        gsap.set([heading, paragraph], {
          autoAlpha: 1,
          y: 0,
          clearProps: "transform",
        });
        return;
      }

      gsap.set(heading, {
        autoAlpha: 0,
        y: 12,
        force3D: true,
      });

      gsap.set(paragraph, {
        autoAlpha: 0,
        y: 24,
        force3D: true,
      });

      const mm = gsap.matchMedia();

      mm.add("(max-width: 768px)", () => {
        let played = false;
        let firstFrame = 0;
        let secondFrame = 0;
        let timeline: gsap.core.Timeline | null = null;

        const play = () => {
          if (played) return;
          played = true;

          timeline = gsap.timeline({
            defaults: {
              ease: "power3.out",
              overwrite: "auto",
            },
          });

          timeline
            .to(heading, {
              autoAlpha: 1,
              y: 0,
              duration: 0.38,
              force3D: true,
            })
            .to(
              paragraph,
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.64,
                force3D: true,
              },
              "-=0.16"
            );
        };

        const observer = new IntersectionObserver(
          ([entry]) => {
            if (!entry?.isIntersecting) return;
            observer.disconnect();
            play();
          },
          {
            threshold: 0.01,
            rootMargin: "0px 0px 0px 0px",
          }
        );

        // Safari can report the viewport before its browser chrome settles.
        // Observe after two painted frames so the trigger is based on the
        // actual mobile viewport, not the transitional toolbar height.
        firstFrame = window.requestAnimationFrame(() => {
          secondFrame = window.requestAnimationFrame(() => {
            observer.observe(container);

            const rect = container.getBoundingClientRect();
            if (
              rect.top < window.innerHeight * 0.98 &&
              rect.bottom > window.innerHeight * 0.02
            ) {
              observer.disconnect();
              play();
            }
          });
        });

        return () => {
          observer.disconnect();
          window.cancelAnimationFrame(firstFrame);
          window.cancelAnimationFrame(secondFrame);
          timeline?.kill();
        };
      });

      mm.add("(min-width: 769px)", () => {
        const timeline = gsap.timeline({
          defaults: {
            ease: "power3.out",
            overwrite: "auto",
          },
          scrollTrigger: {
            trigger: container,
            start: "top 80%",
            once: true,
            invalidateOnRefresh: true,
          },
        });

        timeline
          .to(heading, {
            autoAlpha: 1,
            y: 0,
            duration: 0.5,
            force3D: true,
          })
          .to(
            paragraph,
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.72,
              force3D: true,
            },
            "-=0.22"
          );

        return () => timeline.kill();
      });

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
          <div className="flex items-center overflow-hidden py-1">
            <h2
              ref={headingRef}
              className="w-fit font-montserrat text-[11px] font-medium tracking-[0.04em] text-white uppercase leading-none opacity-0 sm:text-[13px]"
            >
              {headingText}
            </h2>
          </div>

          <div className="mt-5 sm:mt-7">
            <p
              ref={paragraphRef}
              className="m-0 max-w-[950px] text-left font-poppins text-white text-[clamp(18px,4.7vw,23px)] sm:text-[clamp(23px,2.1vw,30px)] leading-[1.34] font-normal tracking-[-0.025em] opacity-0 will-change-transform"
            >
              {paragraphText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
