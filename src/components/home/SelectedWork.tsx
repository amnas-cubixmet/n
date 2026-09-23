"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { workProjects } from "@/data/work";
import { ProjectCard } from "@/components/work/ProjectCard";
import { TransitionLink } from "@/components/navigation/PageTransitionProvider";

gsap.registerPlugin(ScrollTrigger);

export default function SelectedWork() {
  const containerRef = useRef<HTMLElement>(null);
  const shapeRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (typeof window === "undefined" || !containerRef.current) return;

      const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (motionQuery.matches) return;

      const mm = gsap.matchMedia();
      const projectElements =
        gsap.utils.toArray<HTMLElement>(".work-project-item");

      mm.add("(max-width: 1023px)", () => {
        projectElements.forEach((element) => {
          gsap.fromTo(
            element,
            { opacity: 0, y: 24 },
            {
              opacity: 1,
              y: 0,
              duration: 0.55,
              ease: "power3.out",
              scrollTrigger: {
                trigger: element,
                start: "top 88%",
                once: true,
              },
            }
          );
        });
      });

      mm.add("(min-width: 1024px)", () => {
        projectElements.forEach((element) => {
          gsap.fromTo(
            element,
            { opacity: 0, y: 45 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power2.out",
              scrollTrigger: {
                trigger: element,
                start: "top 85%",
                once: true,
              },
            }
          );
        });

        if (shapeRef.current) {
          gsap.fromTo(
            shapeRef.current,
            { yPercent: -5 },
            {
              yPercent: 5,
              ease: "none",
              scrollTrigger: {
                trigger: containerRef.current,
                start: "top bottom",
                end: "bottom top",
                scrub: 1.2,
              },
            }
          );
        }
      });

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  return (
    <section
      id="selected-work"
      ref={containerRef}
      className="relative isolate w-full overflow-hidden bg-white text-black pointer-events-auto z-20 m-0 px-5 md:px-6 lg:px-8 pt-16 md:pt-20 pb-16 md:pb-28"
    >
      {/* LAYER 2 — ARCHITECTURAL GREY DECORATIVE SHAPE (#F3F3F3) WITH PARALLAX */}
      <div
        ref={shapeRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-[18%] right-0 top-[30%] h-[60%] bg-[#F3F3F3] z-[1] hidden lg:block will-change-transform"
        style={{
          clipPath: "polygon(18% 0, 100% 0, 100% 100%, 0 100%, 0 28%)",
        }}
      />

      {/* LAYER 3 — FOREGROUND SCROLLING CONTENT (NORMAL PAGE MOVEMENT) */}
      <div className="relative z-10 w-full">
        {/* DESKTOP 12-COLUMN GRID WITH CONTROLLED ASYMMETRIC STAGGER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-12 lg:gap-y-16 lg:gap-x-6 w-full items-start">
          {/* SECTION HEADING (TOP-LEFT: COLS 1-4) */}
          <div className="work-project-item col-span-full lg:col-span-4 lg:col-start-1 self-start text-left z-10">
            <div className="flex flex-col items-start gap-[2px]">
              <span className="w-fit bg-black text-white px-[2px] py-0 font-mono font-bold text-[clamp(20px,2vw,34px)] leading-[0.95] uppercase tracking-wider">
                A SELECTION
              </span>
              <span className="w-fit bg-black text-white px-[2px] py-0 font-mono font-bold text-[clamp(20px,2vw,34px)] leading-[0.95] uppercase tracking-wider">
                OF OUR WORK
              </span>
            </div>
          </div>

          {/* PROJECT 01 (RIGHT: COLS 8-11, 4-COLUMN WIDTH) */}
          <ProjectCard
            project={workProjects[0]}
            gridClass="col-span-full lg:col-span-4 lg:col-start-8 self-start z-10"
            isEvenMobile={false}
          />

          {/* PROJECT 02 (LOWER LEFT: COLS 1-4 WITH CONTROLLED NEGATIVE MARGIN STAGGER ON DESKTOP) */}
          <ProjectCard
            project={workProjects[1]}
            gridClass="col-span-full lg:col-span-4 lg:col-start-1 lg:-mt-[180px] xl:-mt-[240px] z-10"
            isEvenMobile={true}
          />

          {/* PROJECT 03 (CENTER-RIGHT: COLS 7-10) */}
          <ProjectCard
            project={workProjects[2]}
            gridClass="col-span-full lg:col-span-4 lg:col-start-7 lg:mt-8 z-10"
            isEvenMobile={false}
          />

          {/* CTA BLOCK (LOWER-LEFT: COLS 1-5 / MOBILE: BOTTOM) */}
          <div className="work-project-item col-span-full lg:col-span-5 lg:col-start-1 flex flex-col items-start justify-end mt-8 lg:mt-12 pt-4 z-10">
            <div className="max-w-[340px] flex flex-col gap-4 text-left">
              <h4 className="font-sans font-medium text-black text-xl md:text-2xl tracking-tight leading-snug">
                Think your brand belongs here too?
              </h4>
              <p className="font-sans font-normal text-black/80 text-sm md:text-base leading-relaxed">
                Let’s get to know your brand, your ideas, and what you’re aiming for.
                We’re here to turn good ideas into something that makes people say
                “wow.”
              </p>
              <TransitionLink
                href="/#contact"
                className="inline-flex items-center gap-2 font-sans font-medium text-black lg:hover:text-[#1677FF] text-sm tracking-wide transition-colors mt-2"
              >
                Let’s talk →
              </TransitionLink>
            </div>
          </div>

          {/* SEE MORE BUTTON */}
          <div className="col-span-full flex justify-center pt-12 md:pt-16 pb-4 z-10">
            <TransitionLink
              href="/work"
              className="inline-flex items-center justify-center bg-black px-6 py-3 text-[12px] font-medium uppercase tracking-[0.04em] text-white transition-colors duration-300 hover:bg-[#1677FF]"
            >
              SEE MORE
            </TransitionLink>
          </div>
        </div>
      </div>
    </section>
  );
}
