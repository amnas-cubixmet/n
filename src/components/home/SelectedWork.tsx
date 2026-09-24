"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { workProjects } from "@/data/work";
import { ProjectCard } from "@/components/work/ProjectCard";
import { TransitionLink } from "@/components/navigation/PageTransitionProvider";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

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
        gsap.utils.toArray<HTMLElement>(containerRef.current.querySelectorAll(".work-project-item"));

      mm.add("(max-width: 1023px)", () => {
        projectElements.forEach((element) => {
          gsap.fromTo(
            element,
            {
              autoAlpha: 0,
              y: 14,
            },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.44,
              ease: "power3.out",
              scrollTrigger: {
                trigger: element,
                start: "top 90%",
                once: true,
                invalidateOnRefresh: true,
              },
            }
          );
        });

        // The backdrop stays still on touch devices while cards enter with
        // the natural document scroll.
      });

      mm.add("(min-width: 1024px)", () => {
        projectElements.forEach((element) => {
          gsap.fromTo(
            element,
            {
              autoAlpha: 0,
              y: 30,
            },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.62,
              ease: "power3.out",
              scrollTrigger: {
                trigger: element,
                start: "top 86%",
                once: true,
                invalidateOnRefresh: true,
              },
            }
          );
        });

        if (shapeRef.current) {
          gsap.fromTo(
            shapeRef.current,
            {
              yPercent: -8,
            },
            {
              yPercent: 20,
              ease: "none",
              force3D: true,
              scrollTrigger: {
                trigger: containerRef.current,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.9,
                invalidateOnRefresh: true,
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
      className="relative isolate z-20 m-0 w-full overflow-hidden bg-white px-[max(1.1rem,env(safe-area-inset-left))] pb-12 pt-10 pr-[max(1.1rem,env(safe-area-inset-right))] text-black pointer-events-auto sm:px-8 sm:pb-14 sm:pt-12 lg:px-10 lg:pb-18 lg:pt-14"
    >
      {/* Background moves more slowly than the normal document-flow content.
          The cards keep regular scroll speed while this single transform-only
          layer receives a small compensating downward parallax. */}
      <div
        ref={shapeRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-[8%] top-[14%] z-[1] h-[74%] w-[88%] bg-[#F2F3F5] will-change-transform sm:left-[12%] sm:w-[82%] lg:left-[18%] lg:top-[12%] lg:h-[78%] lg:w-[72%]"
        style={{
          clipPath:
            "polygon(12% 0, 100% 0, 100% 84%, 88% 84%, 88% 100%, 0 100%, 0 18%, 12% 18%)",
        }}
      >
        <span className="absolute left-[12%] top-0 h-[2px] w-[34%] bg-[#1677FF]/70" />
        <span className="absolute bottom-[16%] right-0 h-[2px] w-[24%] bg-black/10" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1500px]">
        <div className="grid w-full grid-cols-1 items-start gap-x-0 gap-y-6 sm:gap-y-7 lg:grid-cols-12 lg:gap-x-7 lg:gap-y-8">
          <div className="work-project-item col-span-full z-10 self-start text-left lg:col-span-4 lg:col-start-1">
            <div className="flex flex-col items-start gap-[2px]">
              <span className="w-fit bg-black px-[2px] py-0 font-mono text-[clamp(20px,2vw,34px)] font-bold uppercase leading-[0.95] tracking-wider text-white">
                A SELECTION
              </span>
              <span className="w-fit bg-black px-[2px] py-0 font-mono text-[clamp(20px,2vw,34px)] font-bold uppercase leading-[0.95] tracking-wider text-white">
                OF OUR WORK
              </span>
            </div>
          </div>

          <ProjectCard
            project={workProjects[0]}
            gridClass="col-span-full lg:col-span-4 lg:col-start-8 z-10"
            isEvenMobile={false}
          />

          <ProjectCard
            project={workProjects[1]}
            gridClass="col-span-full lg:col-span-4 lg:col-start-1 z-10"
            isEvenMobile={true}
          />

          <ProjectCard
            project={workProjects[2]}
            gridClass="col-span-full lg:col-span-4 lg:col-start-7 z-10"
            isEvenMobile={false}
          />

          <div className="work-project-item col-span-full z-10 mt-1 flex flex-col items-start justify-end pt-1 lg:col-span-5 lg:col-start-1 lg:mt-2 lg:pt-2">
            <div className="flex max-w-[340px] flex-col gap-3 text-left">
              <h4 className="font-sans text-xl font-medium leading-snug tracking-tight text-black md:text-2xl">
                Think your brand belongs here too?
              </h4>

              <p className="font-sans text-sm font-normal leading-relaxed text-black/80 md:text-base">
                Let’s get to know your brand, your ideas, and what you’re aiming for.
                We’re here to turn good ideas into something that makes people say
                “wow.”
              </p>

              <TransitionLink
                href="/#contact"
                className="mt-1 inline-flex items-center gap-2 font-sans text-sm font-medium tracking-wide text-black transition-colors lg:hover:text-[#1677FF]"
              >
                Let’s talk →
              </TransitionLink>
            </div>
          </div>

          <div className="col-span-full z-10 flex justify-center pt-5 sm:pt-6 lg:pt-8">
            <TransitionLink
              href="/work"
              className="inline-flex min-h-[44px] items-center justify-center bg-black px-6 py-3 text-[12px] font-medium uppercase tracking-[0.04em] text-white transition-colors duration-300 lg:hover:bg-[#1677FF]"
            >
              SEE MORE
            </TransitionLink>
          </div>
        </div>
      </div>
    </section>
  );
}
