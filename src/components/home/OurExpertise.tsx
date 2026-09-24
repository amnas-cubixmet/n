"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function OurExpertise() {
  const containerRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      if (typeof window === "undefined" || !containerRef.current) return;

      const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

      const label = labelRef.current;
      const paragraph = paragraphRef.current;

      if (!label || !paragraph) return;

      if (motionQuery.matches) {
        gsap.set([label, paragraph], {
          autoAlpha: 1,
          y: 0,
          clearProps: "transform",
        });
        return;
      }

      const mm = gsap.matchMedia();

      const buildReveal = (mobile: boolean) => {
        gsap.set(label, {
          autoAlpha: 0,
          y: mobile ? 6 : 8,
          force3D: true,
          willChange: "transform, opacity",
        });

        gsap.set(paragraph, {
          autoAlpha: 0,
          y: mobile ? 16 : 22,
          force3D: true,
          willChange: "transform, opacity",
        });

        const timeline = gsap.timeline({
          defaults: {
            ease: "power3.out",
            overwrite: "auto",
          },
          scrollTrigger: {
            trigger: containerRef.current,
            start: mobile ? "top 88%" : "top 82%",
            once: true,
            invalidateOnRefresh: true,
          },
          onComplete: () => {
            gsap.set([label, paragraph], {
              clearProps: "will-change",
            });
          },
        });

        timeline
          .to(label, {
            autoAlpha: 1,
            y: 0,
            duration: mobile ? 0.28 : 0.34,
          })
          .to(
            paragraph,
            {
              autoAlpha: 1,
              y: 0,
              duration: mobile ? 0.46 : 0.56,
            },
            mobile ? "-=0.12" : "-=0.14"
          );

        return () => {
          timeline.kill();
        };
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
    <section
      id="our-expertise"
      ref={containerRef}
      className="relative z-20 w-full bg-white text-black pointer-events-auto overflow-hidden"
    >
      <div className="mx-auto flex min-h-[62svh] w-full max-w-[1600px] flex-col justify-start px-[max(1.1rem,env(safe-area-inset-left))] pb-[clamp(5rem,12vh,10rem)] pt-[clamp(5rem,12vh,10rem)] pr-[max(1.1rem,env(safe-area-inset-right))] sm:min-h-[68svh] sm:px-8 lg:min-h-[75svh] lg:px-12 xl:px-16">
        <div className="w-full max-w-[1050px]">
          <div
            ref={labelRef}
            className="flex items-center"
          >
            <span className="inline-block bg-black px-1.5 py-[2px] font-mono text-[10px] font-semibold uppercase leading-none tracking-[0.06em] text-white sm:text-[11px]">
              OUR EXPERTISE
            </span>
          </div>

          <div className="mt-7 max-w-[950px] sm:mt-10 lg:mt-14">
            <p
              ref={paragraphRef}
              className="m-0 font-sans text-[clamp(21px,5.8vw,27px)] font-normal leading-[1.23] tracking-[-0.025em] text-black sm:text-[clamp(27px,3vw,38px)] sm:leading-[1.19] lg:text-[clamp(38px,3.15vw,52px)]"
            >
              What do we do best? Branding, design, and digital experiences.
              Expertise isn’t just about what we do, but how exceptionally we do
              it. We push every detail further and make work that feels
              considered, distinctive, and precise. There’s always a way to make
              it better.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
