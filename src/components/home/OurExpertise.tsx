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

  useGSAP(
    () => {
      if (typeof window === "undefined" || !containerRef.current) return;

      const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

      const label = labelRef.current;
      if (!label || motionQuery.matches) return;

      const mm = gsap.matchMedia();

      const buildReveal = (mobile: boolean) => {
        gsap.fromTo(label, {
          autoAlpha: 0,
          y: mobile ? 6 : 8,
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
            <p className="m-0 font-sans text-[clamp(18px,4.7vw,23px)] font-normal leading-[1.34] tracking-[-0.025em] text-black sm:text-[clamp(23px,2.1vw,32px)]">
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
