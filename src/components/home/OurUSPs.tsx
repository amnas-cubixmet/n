"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TransitionLink } from "@/components/navigation/PageTransitionProvider";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface USP {
  id: string;
  number: string;
  title: string;
  description: string;
}

export const usps: USP[] = [
  {
    id: "usp-1",
    number: "01",
    title: "ONE PARTNER,\nEND-TO-END",
    description:
      "From strategy and branding to marketing, technology, and creative production, everything your brand needs works together under one roof.",
  },
  {
    id: "usp-2",
    number: "02",
    title: "CREATIVITY WITH\nCOMMERCIAL PURPOSE",
    description:
      "Every creative decision is rooted in your business goals, ensuring our work is purposeful, practical, and commercially relevant.",
  },
  {
    id: "usp-3",
    number: "03",
    title: "DEEP LOCAL\nFLUENCY",
    description:
      "Communication built in Malayalam, for the way business actually works in Kerala — including its many Gulf-returnee founders.",
  },
  {
    id: "usp-4",
    number: "04",
    title: "ATTENTION\nTO DETAIL",
    description:
      "We refine every element with precision, ensuring your brand delivers a consistent and memorable experience across every touchpoint.",
  },
  {
    id: "usp-5",
    number: "05",
    title: "STRATEGY BEFORE\nAESTHETICS",
    description:
      "Good design starts with good thinking. We look beyond surface-level visuals to understand your business, audience, and goals. Every creative decision is rooted in strategy, ensuring your brand looks great and communicates with purpose.",
  },
];

export default function OurUSPs() {
  const containerRef = useRef<HTMLElement>(null);
  const shapeRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (typeof window === "undefined" || !containerRef.current) return;

      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (reducedMotion) return;

      const mm = gsap.matchMedia();

      const buildMotion = (
        y: number,
        duration: number,
        start: string,
        desktop: boolean
      ) => {
        const reveals = gsap.utils.toArray<HTMLElement>(
          ".usp-reveal",
          containerRef.current
        );

        reveals.forEach((element) => {
          gsap.fromTo(
            element,
            {
              autoAlpha: 0,
              y,
            },
            {
              autoAlpha: 1,
              y: 0,
              duration,
              ease: "power3.out",
              force3D: true,
              scrollTrigger: {
                trigger: element,
                start,
                once: true,
                invalidateOnRefresh: true,
              },
            }
          );
        });

        if (desktop && shapeRef.current) {
          gsap.fromTo(
            shapeRef.current,
            { yPercent: -1.5 },
            {
              yPercent: 2.5,
              ease: "none",
              force3D: true,
              scrollTrigger: {
                trigger: containerRef.current,
                start: "top bottom",
                end: "bottom top",
                scrub: 2.2,
                invalidateOnRefresh: true,
              },
            }
          );
        }
      };

      mm.add("(max-width: 768px)", () =>
        buildMotion(12, 0.44, "top 94%", false)
      );
      mm.add("(min-width: 769px) and (max-width: 1023px)", () =>
        buildMotion(16, 0.48, "top 92%", false)
      );
      mm.add("(min-width: 1024px)", () =>
        buildMotion(24, 0.56, "top 88%", true)
      );

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  return (
    <section
      id="our-usps"
      ref={containerRef}
      className="relative z-30 m-0 w-full overflow-hidden bg-black text-white pointer-events-auto"
    >
      <div
        ref={shapeRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 hidden lg:block lg:will-change-transform"
      >
        <div
          className="absolute left-[20%] top-[2%] h-[18%] w-[80%] bg-[#151515]"
          style={{
            clipPath:
              "polygon(8% 0, 100% 0, 100% 100%, 0 100%, 0 18%)",
          }}
        />
        <div
          className="absolute left-0 top-[23%] h-[19%] w-[78%] bg-[#171717]"
          style={{
            clipPath:
              "polygon(0 0, 86% 0, 100% 18%, 100% 100%, 0 100%)",
          }}
        />
        <div
          className="absolute right-0 top-[43%] h-[18%] w-[66%] bg-[#181818]"
          style={{
            clipPath:
              "polygon(12% 0, 100% 0, 100% 100%, 0 100%, 0 18%)",
          }}
        />
        <div
          className="absolute left-[13%] top-[63%] h-[18%] w-[70%] bg-[#171717]"
          style={{
            clipPath:
              "polygon(0 0, 78% 0, 100% 20%, 100% 100%, 16% 100%, 0 82%)",
          }}
        />
        <div
          className="absolute right-0 top-[80%] h-[15%] w-[52%] bg-[#151515]"
          style={{
            clipPath:
              "polygon(16% 0, 100% 0, 100% 100%, 0 100%, 0 22%)",
          }}
        />

        <span className="absolute left-[43%] top-[31%] h-2.5 w-2.5 bg-[#1677FF]" />
        <span className="absolute left-[46%] top-[54%] h-2.5 w-2.5 bg-[#1677FF]" />
        <span className="absolute left-[45%] top-[76%] h-2.5 w-2.5 bg-[#1677FF]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1300px] px-6 pb-[max(5rem,env(safe-area-inset-bottom))] sm:px-10 sm:pb-24 md:px-16 lg:min-h-[2500px] lg:px-20 lg:pb-40 xl:min-h-[2750px]">
        <header className="usp-reveal pt-0 lg:absolute lg:left-20 lg:top-12">
          <div className="flex flex-col items-start gap-[2px]">
            <span className="inline-block bg-white p-0 font-mono text-[clamp(18px,5vw,28px)] font-bold uppercase leading-none tracking-[0.04em] text-black">
              OUR
            </span>
            <span className="inline-block bg-white p-0 font-mono text-[clamp(18px,5vw,28px)] font-bold uppercase leading-none tracking-[0.04em] text-black">
              USPs
            </span>
          </div>
        </header>

        <div className="mt-6 flex w-full flex-col gap-5 sm:mt-8 sm:gap-6 lg:mt-0 lg:block">
          {usps.map((item, index) => {
            const desktopPositions = [
              "lg:absolute lg:right-[5%] lg:top-[70px]",
              "lg:absolute lg:left-[9%] lg:top-[520px]",
              "lg:absolute lg:right-[8%] lg:top-[930px]",
              "lg:absolute lg:left-[18%] lg:top-[1360px]",
              "lg:absolute lg:right-[7%] lg:top-[1810px]",
            ];

            return (
              <article
                key={item.id}
                className={`usp-reveal relative flex min-h-[350px] w-[92%] max-w-[400px] flex-col justify-between bg-[#111111] p-6 shadow-[0_22px_60px_rgba(0,0,0,0.25)] sm:min-h-[380px] sm:w-[82%] sm:max-w-[420px] sm:p-8 lg:min-h-[420px] lg:w-[33%] lg:max-w-[440px] lg:p-9 xl:min-h-[440px] xl:max-w-[460px] xl:p-10 ${desktopPositions[index]} ${index % 2 === 0 ? "ml-auto" : "mr-auto"}`}
                style={{
                  clipPath:
                    index % 2 === 0
                      ? "polygon(10% 0, 100% 0, 100% 100%, 0 100%, 0 10%)"
                      : "polygon(0 0, 90% 0, 100% 10%, 100% 100%, 0 100%)",
                }}
              >
                <div className="flex flex-col items-start">
                  <div className="mb-5 inline-block bg-[#1677FF] px-2.5 py-1 font-mono text-[11px] font-bold leading-none text-black sm:mb-6 sm:text-xs">
                    {item.number}
                  </div>

                  <h3 className="whitespace-pre-line text-left font-pixel text-[clamp(22px,6vw,30px)] font-bold uppercase leading-[1.04] tracking-[-0.02em] text-white lg:text-[clamp(24px,2vw,32px)]">
                    {item.title}
                  </h3>
                </div>

                <div className="mt-8 border-t border-white/10 pt-5 sm:pt-6">
                  <p className="text-left font-sans text-[clamp(13px,3.7vw,16px)] font-normal leading-relaxed text-white/70 lg:text-base">
                    {item.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        <div className="usp-reveal mt-10 flex w-full max-w-[430px] flex-col items-start text-left sm:mt-12 lg:absolute lg:bottom-28 lg:left-20 lg:mt-0 lg:max-w-[390px]">
          <h4 className="mb-3 font-sans text-[clamp(21px,5.5vw,28px)] font-semibold leading-tight tracking-tight text-white lg:text-[28px]">
            Ready to make your mark?
          </h4>

          <p className="mb-5 font-sans text-[clamp(14px,3.8vw,17px)] font-normal leading-relaxed text-white/60">
            Let’s create something that gets noticed, remembered, and talked
            about.
          </p>

          <TransitionLink
            href="/#contact"
            className="group inline-flex min-h-[44px] items-center gap-2 border-b border-white/40 py-1 font-sans text-base font-medium tracking-wide text-white transition-colors duration-200 lg:hover:border-white"
          >
            <span>Let’s talk</span>
            <span className="inline-block transition-transform duration-200 lg:group-hover:translate-x-1">
              →
            </span>
          </TransitionLink>
        </div>
      </div>
    </section>
  );
}
