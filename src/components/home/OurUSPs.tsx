"use client";

import React, { useLayoutEffect, useRef } from "react";
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

const CARD_LAYOUTS = [
  "lg:col-span-4 lg:col-start-7 lg:row-start-1",
  "lg:col-span-4 lg:col-start-2 lg:row-start-2 lg:-mt-[180px] xl:-mt-[220px]",
  "lg:col-span-4 lg:col-start-8 lg:row-start-3",
  "lg:col-span-4 lg:col-start-3 lg:row-start-4 lg:-mt-[180px] xl:-mt-[220px]",
  "lg:col-span-4 lg:col-start-8 lg:row-start-5 lg:-mt-[120px] xl:-mt-[150px]",
];

const MOBILE_ALIGNMENTS = [
  "mr-auto",
  "ml-auto",
  "mx-auto",
  "mr-auto",
  "ml-auto",
];

export default function OurUSPs() {
  const containerRef = useRef<HTMLElement>(null);
  const shapeRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);

  useLayoutEffect(() => {
    const syncThirdCardOverlap = () => {
      if (window.innerWidth < 1024) return;

      const secondCard = cardRefs.current[1];
      const thirdCard = cardRefs.current[2];
      if (!secondCard || !thirdCard) return;

      const overlap = Math.round(secondCard.offsetHeight * 0.25);
      thirdCard.style.marginTop = `-${overlap}px`;
    };

    let frame = requestAnimationFrame(syncThirdCardOverlap);

    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(syncThirdCardOverlap);
    });

    cardRefs.current.slice(1, 3).forEach((card) => {
      if (card) observer.observe(card);
    });

    window.addEventListener("resize", syncThirdCardOverlap, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", syncThirdCardOverlap);

      const thirdCard = cardRefs.current[2];
      if (thirdCard) thirdCard.style.marginTop = "";
    };
  }, []);

  useGSAP(
    () => {
      const section = containerRef.current;
      if (!section) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(section.querySelectorAll(".usp-reveal"), {
          autoAlpha: 1,
          y: 0,
        });
        return;
      }

      const mm = gsap.matchMedia();

      const buildReveals = (
        y: number,
        duration: number,
        start: string
      ) => {
        const reveals = gsap.utils.toArray<HTMLElement>(
          ".usp-reveal",
          section
        );

        reveals.forEach((element) => {
          gsap.fromTo(
            element,
            { autoAlpha: 0, y },
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
      };

      mm.add("(max-width: 768px)", () =>
        buildReveals(12, 0.44, "top 94%")
      );

      mm.add("(min-width: 769px) and (max-width: 1023px)", () =>
        buildReveals(16, 0.5, "top 92%")
      );

      mm.add("(min-width: 1024px)", () => {
        buildReveals(28, 0.62, "top 88%");

        const shape = shapeRef.current;
        const content = contentRef.current;
        if (!shape || !content) return;

        const shapeTween = gsap.fromTo(
          shape,
          { yPercent: 3 },
          {
            yPercent: -3,
            ease: "none",
            force3D: true,
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: 2.8,
              invalidateOnRefresh: true,
            },
          }
        );

        const contentTween = gsap.fromTo(
          content,
          { yPercent: 0.15 },
          {
            yPercent: -0.45,
            ease: "none",
            force3D: true,
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: 2,
              invalidateOnRefresh: true,
            },
          }
        );

        return () => {
          shapeTween.scrollTrigger?.kill();
          shapeTween.kill();
          contentTween.scrollTrigger?.kill();
          contentTween.kill();
        };
      });

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  return (
    <section
      id="our-usps"
      ref={containerRef}
      className="relative isolate z-30 w-full overflow-hidden bg-black pb-20 text-white pointer-events-auto sm:pb-24 lg:pb-32"
    >
      <div
        ref={shapeRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 w-[190%] -translate-x-1/2 -translate-y-1/2 opacity-10 sm:w-[160%] lg:left-auto lg:right-[-12%] lg:top-[8%] lg:w-[118%] lg:translate-x-0 lg:translate-y-0"
      >
        <svg
          viewBox="0 0 1620 1080"
          className="h-auto w-full fill-white"
          aria-hidden="true"
        >
          <path d="m1350 0-270 270h540V0Z" />
          <path d="M270 270 0 540v540h270l270-270H270V540h540l270-270Z" />
          <path d="m540 810 270-270h540v270Z" />
        </svg>
      </div>

      <div
        ref={contentRef}
        className="relative z-10 mx-auto grid w-full max-w-[1500px] grid-cols-1 gap-y-10 px-6 sm:gap-y-12 sm:px-10 md:px-16 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-0 lg:px-20"
      >
        <header className="usp-reveal lg:col-span-2 lg:col-start-1 lg:row-start-1">
          <span className="inline-block bg-white px-2 py-1 font-mono text-[18px] font-bold uppercase leading-none tracking-[0.06em] text-black sm:text-[20px] lg:text-[22px]">
            OUR USPs
          </span>
        </header>

        {usps.map((item, index) => (
          <article
            key={item.id}
            ref={(element) => {
              cardRefs.current[index] = element;
            }}
            className={`usp-reveal relative flex min-h-[350px] w-[88%] max-w-[430px] flex-col justify-between bg-[#151515] p-6 text-white shadow-[0_22px_60px_rgba(0,0,0,0.16)] sm:min-h-[380px] sm:p-8 lg:min-h-[440px] lg:w-full lg:max-w-none lg:p-9 xl:min-h-[470px] xl:p-10 ${MOBILE_ALIGNMENTS[index]} ${CARD_LAYOUTS[index]}`}
            style={{
              clipPath:
                "polygon(10% 0,100% 0,100% 100%,0 100%,0 10%)",
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
              <p className="text-left font-sans text-[clamp(13px,3.7vw,16px)] leading-relaxed text-white/60 lg:text-base">
                {item.description}
              </p>
            </div>
          </article>
        ))}

        <div className="usp-reveal order-last flex max-w-[390px] flex-col items-start gap-3 text-left lg:col-span-2 lg:col-start-1 lg:row-start-5 lg:self-end lg:pb-10">
          <h4 className="font-montserrat text-xl font-semibold leading-snug tracking-tight text-white sm:text-2xl">
            Think your brand belongs here too?
          </h4>

          <p className="font-sans text-sm leading-relaxed text-white/60 sm:text-base">
            Let’s get to know your brand, your ideas, and what you’re aiming for.
            We’re here to turn good ideas into something that makes people say “wow.”
          </p>

          <TransitionLink
            href="/#contact"
            className="group inline-flex min-h-10 items-center gap-2 border-b border-white/30 py-1 font-sans text-sm font-medium text-white transition-colors lg:hover:border-[#1677FF] lg:hover:text-[#1677FF]"
          >
            <span>Let’s talk</span>
            <span className="transition-transform duration-200 lg:group-hover:translate-x-1">→</span>
          </TransitionLink>
        </div>
      </div>
    </section>
  );
}
