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

      const buildMotion = (mobile: boolean) => {
        const reveals = gsap.utils.toArray<HTMLElement>(
          ".usp-reveal",
          containerRef.current
        );

        reveals.forEach((element, index) => {
          gsap.fromTo(
            element,
            {
              autoAlpha: 0,
              y: mobile ? 18 : 28,
            },
            {
              autoAlpha: 1,
              y: 0,
              duration: mobile ? 0.48 : 0.52,
              ease: "power3.out",
              force3D: true,
              scrollTrigger: {
                trigger: element,
                start: mobile ? "top 89%" : "top 86%",
                once: true,
                invalidateOnRefresh: true,
              },
              delay: index === 0 ? 0 : 0.01,
            }
          );
        });

        if (shapeRef.current) {
          gsap.fromTo(
            shapeRef.current,
            {
              yPercent: mobile ? -4 : -9,
            },
            {
              yPercent: mobile ? 12 : 22,
              ease: "none",
              force3D: true,
              scrollTrigger: {
                trigger: containerRef.current,
                start: "top bottom",
                end: "bottom top",
                scrub: mobile ? 0.7 : 0.9,
                invalidateOnRefresh: true,
              },
            }
          );
        }
      };

      mm.add("(max-width: 1023px)", () => buildMotion(true));
      mm.add("(min-width: 1024px)", () => buildMotion(false));

      return () => mm.revert();
    },
    {
      scope: containerRef,
    }
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
        className="pointer-events-none absolute left-[6%] top-[8%] z-0 h-[88%] w-[88%] bg-[#151515] will-change-transform sm:left-[10%] sm:w-[82%] lg:left-[18%] lg:top-[6%] lg:h-[90%] lg:w-[70%]"
        style={{
          clipPath:
            "polygon(11% 0, 100% 0, 100% 22%, 91% 22%, 91% 48%, 100% 48%, 100% 100%, 14% 100%, 14% 90%, 0 90%, 0 16%, 11% 16%)",
        }}
      >
        <div className="absolute left-[11%] top-0 h-[2px] w-[34%] bg-[#1677FF]/80" />
        <div className="absolute bottom-[10%] right-0 h-[2px] w-[28%] bg-white/10" />
        <div className="absolute right-[9%] top-[20%] h-[28%] w-[18%] bg-[#1E1E1E]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1500px] px-[max(1.1rem,env(safe-area-inset-left))] pb-[max(5rem,env(safe-area-inset-bottom))] pt-16 pr-[max(1.1rem,env(safe-area-inset-right))] sm:px-8 sm:pb-24 sm:pt-20 lg:px-12 lg:pb-32 lg:pt-24 xl:px-16">
        <header className="usp-reveal mb-10 sm:mb-14 lg:mb-16">
          <div className="flex flex-col items-start gap-[2px]">
            <span className="inline-block bg-white px-2 py-[2px] font-pixel text-[clamp(18px,5vw,28px)] font-bold uppercase leading-none tracking-[0.04em] text-black">
              OUR
            </span>
            <span className="inline-block bg-white px-2 py-[2px] font-pixel text-[clamp(18px,5vw,28px)] font-bold uppercase leading-none tracking-[0.04em] text-black">
              USPs
            </span>
          </div>
        </header>

        <div className="flex w-full flex-col gap-7 sm:gap-9 lg:gap-10">
          {usps.map((item, index) => {
            const alignRight = index % 2 === 0;

            return (
              <article
                key={item.id}
                className={`usp-reveal relative flex min-h-[330px] w-[94%] max-w-[430px] flex-col justify-between bg-[#111111] p-6 shadow-[0_22px_60px_rgba(0,0,0,0.22)] sm:min-h-[350px] sm:w-[88%] sm:p-8 lg:min-h-[390px] lg:w-[42%] lg:max-w-[500px] lg:p-9 xl:p-10 ${
                  alignRight
                    ? "ml-auto"
                    : "mr-auto lg:ml-[4%]"
                }`}
                style={{
                  clipPath:
                    index % 2 === 0
                      ? "polygon(11% 0, 100% 0, 100% 100%, 0 100%, 0 11%)"
                      : "polygon(0 0, 89% 0, 100% 11%, 100% 100%, 0 100%)",
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

        <div className="usp-reveal mt-10 flex w-full max-w-[430px] flex-col items-start text-left sm:mt-12 lg:ml-[8%] lg:mt-16 lg:max-w-[390px]">
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
