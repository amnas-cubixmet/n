"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { TransitionLink } from "@/components/navigation/PageTransitionProvider";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { WorkProject } from "@/data/work";

gsap.registerPlugin(ScrollTrigger);

interface ProjectCardProps {
  project: WorkProject;
  gridClass?: string;
  isEvenMobile?: boolean;
}

export function ProjectCard({
  project,
  gridClass = "col-span-full lg:col-span-4 lg:col-start-8",
  isEvenMobile = false,
}: ProjectCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useGSAP(
    () => {
      if (
        typeof window === "undefined" ||
        !cardRef.current ||
        !imageRef.current
      ) {
        return;
      }

      const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (motionQuery.matches) return;

      const mm = gsap.matchMedia();

      // Internal scrub parallax is intentionally desktop-only. Touch scrolling
      // keeps the same visual crop without paying for a per-frame ScrollTrigger.
      mm.add("(min-width: 1024px) and (hover: hover) and (pointer: fine)", () => {
        gsap.fromTo(
          imageRef.current,
          { yPercent: -3 },
          {
            yPercent: 3,
            ease: "none",
            scrollTrigger: {
              trigger: cardRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      });

      return () => mm.revert();
    },
    { scope: cardRef }
  );

  return (
    <article
      ref={cardRef}
      className={`work-project-item col-span-full w-[88%] sm:w-[92%] lg:w-full ${
        isEvenMobile ? "ml-auto lg:ml-0" : "mr-auto lg:mr-0"
      } ${gridClass}`}
    >
      <TransitionLink href={`/services/${project.slug}`} className="block w-full">
        <button
          type="button"
          className="group relative flex w-full flex-col items-start text-left cursor-pointer"
        >
          {/* CONTROLLED 29/34 PORTRAIT ASPECT RATIO WITH DIAGONAL TOP-LEFT CLIP */}
          <div
            className="project-image relative w-full aspect-[29/34] overflow-hidden"
            style={{
              clipPath: "polygon(12% 0, 100% 0, 100% 100%, 0 100%, 0 12%)",
            }}
          >
            <Image
              ref={imageRef}
              fill
              src={project.image}
              alt={project.title}
              sizes="(max-width: 767px) 88vw, (max-width: 1023px) 50vw, 30vw"
              className="object-cover scale-[1.06] transition-transform duration-700 ease-out lg:group-hover:scale-[1.09]"
            />
          </div>

          {/* PROJECT METADATA DIRECTLY ATTACHED BELOW IMAGE */}
          <div className="mt-2 flex flex-col items-start gap-[4px]">
            <h3 className="text-[clamp(18px,1.5vw,22px)] font-normal leading-none tracking-[-0.02em] text-black">
              {project.title}
            </h3>

            <span
              className="inline-block w-fit bg-black px-[2px] py-0 text-[10px] uppercase leading-none text-white"
              aria-label={project.category}
            >
              {project.category}
            </span>
          </div>
        </button>
      </TransitionLink>
    </article>
  );
}
