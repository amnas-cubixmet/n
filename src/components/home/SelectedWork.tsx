"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { workProjects } from "@/data/work";
import { TransitionLink } from "@/components/navigation/PageTransitionProvider";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

export default function SelectedWork() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const panels = gsap.utils.toArray<HTMLElement>(
        sectionRef.current.querySelectorAll(".selected-work-panel")
      );

      panels.forEach((panel) => {
        const image = panel.querySelector<HTMLElement>(".selected-work-image");
        const title = panel.querySelector<HTMLElement>(".selected-work-title");
        const metadata = panel.querySelector<HTMLElement>(".selected-work-meta");

        if (image) {
          gsap.fromTo(image, { scale: 1.08 }, {
            scale: 1,
            duration: 1.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: panel,
              start: "top 90%",
              once: true,
            },
          });
        }

        if (title && metadata) {
          gsap.fromTo([title, metadata], { autoAlpha: 0, y: 32 }, {
            autoAlpha: 1,
            y: 0,
            duration: 0.65,
            stagger: 0.09,
            ease: "power3.out",
            scrollTrigger: {
              trigger: panel,
              start: "top 78%",
              once: true,
            },
          });
        }
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="selected-work"
      ref={sectionRef}
      aria-label="A selection of our work"
      className="relative isolate z-20 w-full bg-[#05070B] pointer-events-auto"
    >
      {workProjects.map((project, index) => (
        <article
          key={project.slug}
          className="selected-work-panel sticky top-0 h-[100svh] min-h-[520px] w-full overflow-hidden bg-[#05070B]"
          style={{ zIndex: index + 1 }}
        >
          <TransitionLink
            href={`/work/${project.slug}`}
            aria-label={`View ${project.title} project`}
            className="group relative block h-full w-full overflow-hidden focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-[#1677FF]"
          >
            <Image
              fill
              src={project.image}
              alt={project.alt}
              sizes="100vw"
              className="selected-work-image object-cover"
            />

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/30"
            />

            {index === 0 && (
              <div className="absolute left-[max(1.25rem,env(safe-area-inset-left))] top-[max(5.25rem,env(safe-area-inset-top))] flex flex-col items-start gap-[2px] sm:left-10 sm:top-12 lg:left-16">
                <span className="bg-black px-2 py-1 font-pixel text-[clamp(15px,1.6vw,24px)] font-bold uppercase leading-none text-white">
                  A SELECTION
                </span>
                <span className="bg-black px-2 py-1 font-pixel text-[clamp(15px,1.6vw,24px)] font-bold uppercase leading-none text-white">
                  OF OUR WORK
                </span>
              </div>
            )}

            <div className="absolute inset-x-0 bottom-0 flex flex-col items-start px-[max(1.25rem,env(safe-area-inset-left))] pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-10 sm:pb-10 lg:px-16 lg:pb-12">
              <div className="selected-work-meta mb-4 flex flex-wrap items-center gap-3 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-white sm:text-xs">
                <span className="bg-black px-2 py-1">
                  {String(index + 1).padStart(2, "0")} / {String(workProjects.length).padStart(2, "0")}
                </span>
                <span className="bg-black px-2 py-1">{project.category}</span>
              </div>
              <h2 className="selected-work-title max-w-[90vw] font-montserrat text-[clamp(2.25rem,7vw,7.5rem)] font-bold uppercase leading-[0.9] tracking-[-0.055em] text-white [text-wrap:balance]">
                {project.title}
              </h2>
              <span className="mt-5 inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-widest text-white sm:text-xs">
                VIEW PROJECT <span aria-hidden="true" className="text-xl leading-none transition-transform duration-300 lg:group-hover:translate-x-2">↗</span>
              </span>
            </div>
          </TransitionLink>
        </article>
      ))}

      <div className="relative z-10 flex min-h-[48svh] w-full flex-col justify-between gap-12 bg-white px-[max(1.25rem,env(safe-area-inset-left))] py-14 text-black sm:px-10 sm:py-20 lg:flex-row lg:items-end lg:px-16">
        <div className="max-w-[720px]">
          <p className="mb-5 w-fit bg-black px-2 py-1 font-pixel text-sm uppercase leading-none text-white">
            YOUR BRAND COULD BE NEXT
          </p>
          <h2 className="font-montserrat text-[clamp(2rem,4.5vw,5rem)] font-semibold leading-[1.02] tracking-[-0.055em]">
            Think your brand belongs here too?
          </h2>
          <p className="mt-6 max-w-[580px] font-sans text-base leading-relaxed text-black/75">
            Let’s get to know your brand, your ideas, and what you’re aiming for.
            We’re here to turn good ideas into something that makes people say “wow.”
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <TransitionLink
            href="/#contact"
            className="inline-flex min-h-12 items-center justify-center bg-black px-6 py-3 font-mono text-xs uppercase tracking-wider text-white transition-colors lg:hover:bg-[#1677FF]"
          >
            LET’S TALK ↗
          </TransitionLink>
          <TransitionLink
            href="/work"
            className="inline-flex min-h-12 items-center justify-center border border-black px-6 py-3 font-mono text-xs uppercase tracking-wider transition-colors lg:hover:bg-black lg:hover:text-white"
          >
            SEE MORE WORK ↗
          </TransitionLink>
        </div>
      </div>
    </section>
  );
}
