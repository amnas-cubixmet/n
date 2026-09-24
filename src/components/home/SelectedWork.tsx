"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { workProjects } from "@/data/work";
import { ProjectCard } from "@/components/work/ProjectCard";
import { TransitionLink } from "@/components/navigation/PageTransitionProvider";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

export default function SelectedWork() {
  const sectionRef = useRef<HTMLElement>(null);
  const shapeRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const cards = gsap.utils.toArray<HTMLElement>(
        sectionRef.current.querySelectorAll(".work-project-item")
      );

      cards.forEach((card) => {
        gsap.fromTo(card, { autoAlpha: 0, y: 22 }, {
          autoAlpha: 1,
          y: 0,
          duration: 0.62,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 90%",
            once: true,
            invalidateOnRefresh: true,
          },
        });
      });

      const media = gsap.matchMedia();
      media.add("(min-width: 1024px) and (hover: hover) and (pointer: fine)", () => {
        if (!shapeRef.current) return;
        gsap.fromTo(shapeRef.current, { yPercent: -5 }, {
          yPercent: 10,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8,
          },
        });
      });
      return () => media.revert();
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="selected-work"
      ref={sectionRef}
      aria-label="A selection of our work"
      className="relative isolate z-20 w-full overflow-hidden bg-white px-[max(1.25rem,env(safe-area-inset-left))] py-16 pr-[max(1.25rem,env(safe-area-inset-right))] text-black pointer-events-auto sm:px-8 lg:px-10 lg:py-0"
    >
      <span aria-hidden="true" className="absolute left-[19%] top-7 hidden h-2.5 w-2.5 bg-[#F000E8] lg:block" />
      <div
        ref={shapeRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-[25%] top-[32%] z-0 h-[63%] w-[84%] bg-[#F2F3F5] max-lg:hidden"
        style={{
          clipPath: "polygon(20% 0, 100% 0, 100% 62%, 79% 62%, 79% 100%, 0 100%, 0 20%)",
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[1500px] flex-col items-start gap-12 sm:gap-16 lg:block lg:min-h-[clamp(1550px,125vw,1900px)]">
        <div className="work-project-item flex flex-col items-start gap-[2px] lg:absolute lg:left-0 lg:top-[clamp(100px,9.6vw,145px)]">
          <h2 className="flex flex-col items-start gap-[2px] font-pixel text-[clamp(20px,2vw,28px)] font-semibold uppercase leading-[0.92] tracking-[-0.025em]">
            <span className="bg-black px-[3px] text-white">A SELECTION</span>
            <span className="bg-black px-[3px] text-white">OF OUR WORK</span>
          </h2>
        </div>

        <ProjectCard
          project={workProjects[0]}
          gridClass="lg:absolute lg:left-[59%] lg:top-[clamp(100px,9.6vw,145px)] lg:w-[32%]"
        />

        <ProjectCard
          project={workProjects[1]}
          gridClass="lg:absolute lg:left-0 lg:top-[clamp(280px,24vw,360px)] lg:w-[32%]"
          isEvenMobile
        />

        <ProjectCard
          project={workProjects[2]}
          gridClass="lg:absolute lg:left-[50%] lg:top-[clamp(820px,68vw,1040px)] lg:w-[32%]"
        />

        <div className="work-project-item flex max-w-[390px] flex-col items-start gap-4 lg:absolute lg:left-0 lg:top-[clamp(1100px,91vw,1390px)] lg:w-[32%]">
          <h3 className="font-montserrat text-xl font-semibold leading-snug tracking-tight sm:text-2xl">
            Think your brand belongs here too?
          </h3>
          <p className="font-sans text-sm leading-relaxed text-black/70 sm:text-base">
            Let’s get to know your brand, your ideas, and what you’re aiming for.
            We’re here to turn good ideas into something that makes people say “wow.”
          </p>
          <TransitionLink
            href="/#contact"
            className="inline-flex min-h-11 items-center font-sans text-sm font-medium transition-colors lg:hover:text-[#1677FF]"
          >
            Let’s talk →
          </TransitionLink>
        </div>

        <div className="flex w-full justify-center lg:absolute lg:bottom-16 lg:left-0">
          <TransitionLink
            href="/work"
            className="inline-flex min-h-11 items-center justify-center bg-black px-6 py-3 font-mono text-xs uppercase tracking-wide text-white transition-colors lg:hover:bg-[#1677FF]"
          >
            SEE MORE WORK →
          </TransitionLink>
        </div>
      </div>
    </section>
  );
}
