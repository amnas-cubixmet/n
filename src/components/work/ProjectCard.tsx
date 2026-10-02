"use client";

import { useRef } from "react";
import Image from "next/image";
import { TransitionLink } from "@/components/navigation/PageTransitionProvider";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { WorkProject } from "@/data/work";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ProjectCardProps {
  project: WorkProject;
  gridClass?: string;
  isEvenMobile?: boolean;
}

export function ProjectCard({
  project,
  gridClass = "col-span-full lg:col-span-4 lg:col-start-8 lg:w-full",
  isEvenMobile = false,
}: ProjectCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const imageRevealRef = useRef<HTMLDivElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (
        typeof window === "undefined" ||
        !cardRef.current ||
        !imageRef.current ||
        !imageRevealRef.current ||
        !metaRef.current
      ) {
        return;
      }

      const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (motionQuery.matches) return;

      const mm = gsap.matchMedia();

      const buildReveal = (mobile: boolean) => {
        const card = cardRef.current;
        const imageReveal = imageRevealRef.current;
        const meta = metaRef.current;
        const image = imageRef.current;
        if (!card || !imageReveal || !meta || !image) return;

        const metaItems = Array.from(meta.children) as HTMLElement[];

        gsap.set(imageReveal, {
          clipPath: "inset(0% 0% 100% 0%)",
        });
        gsap.set(image, {
          scale: mobile ? 1.07 : 1.09,
        });
        gsap.set(metaItems, {
          y: mobile ? 12 : 18,
          clipPath: "inset(0% 0% 100% 0%)",
        });

        const timeline = gsap.timeline({ paused: true });

        timeline
          .to(imageReveal, {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: mobile ? 0.58 : 0.78,
            ease: "expo.out",
          })
          .to(
            image,
            {
              scale: 1.035,
              duration: mobile ? 0.7 : 0.92,
              ease: "power3.out",
              force3D: true,
            },
            0
          )
          .to(
            metaItems,
            {
              y: 0,
              clipPath: "inset(0% 0% 0% 0%)",
              duration: mobile ? 0.42 : 0.58,
              stagger: 0.08,
              ease: "expo.out",
              force3D: true,
            },
            mobile ? 0.22 : 0.3
          );

        if (mobile) {
          const observer =
            "IntersectionObserver" in window
              ? new IntersectionObserver(
                  ([entry]) => {
                    if (!entry?.isIntersecting) return;
                    timeline.play(0);
                    observer.disconnect();
                  },
                  {
                    threshold: 0.01,
                    rootMargin: "0px 0px -5% 0px",
                  }
                )
              : null;

          if (observer) observer.observe(card);
          else timeline.play(0);

          return () => {
            observer?.disconnect();
            timeline.kill();
          };
        }

        const trigger = ScrollTrigger.create({
          trigger: card,
          start: "top 87%",
          once: true,
          invalidateOnRefresh: true,
          onEnter: () => timeline.play(0),
        });

        return () => {
          trigger.kill();
          timeline.kill();
        };
      };

      mm.add("(max-width: 768px)", () => buildReveal(true));
      mm.add("(min-width: 769px)", () => buildReveal(false));

      // Internal scrub parallax is intentionally desktop-only. Touch scrolling
      // keeps the same visual crop without paying for a per-frame ScrollTrigger.
      mm.add("(min-width: 1024px) and (hover: hover) and (pointer: fine)", () => {
        gsap.fromTo(
          imageRef.current,
          { yPercent: -1.5 },
          {
            yPercent: 1.5,
            ease: "none",
            force3D: true,
            scrollTrigger: {
              trigger: cardRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.6,
              invalidateOnRefresh: true,
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
      className={`work-project-item col-span-full w-[88%] sm:w-[92%] ${
        isEvenMobile ? "ml-auto lg:ml-0" : "mr-auto lg:mr-0"
      } ${gridClass}`}
    >
      <TransitionLink
        href={`/work/${project.slug}`}
        className="group block w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1677FF] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      >
        <div className="relative flex w-full flex-col items-start text-left cursor-pointer">
          {/* CONTROLLED 29/34 PORTRAIT ASPECT RATIO WITH DIAGONAL TOP-LEFT CLIP */}
          <div ref={imageRevealRef} className="w-full overflow-hidden">
            <div
              data-cursor-theme="image"
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
              sizes="(max-width: 767px) 88vw, (max-width: 1023px) 92vw, 30vw"
              className="object-cover scale-[1.035] transition-transform duration-700 ease-out lg:group-hover:scale-[1.055]"
            />
            </div>
          </div>

          {/* PROJECT METADATA DIRECTLY ATTACHED BELOW IMAGE */}
          <div ref={metaRef} className="mt-2 flex flex-col items-start gap-[4px]">
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
        </div>
      </TransitionLink>
    </article>
  );
}
