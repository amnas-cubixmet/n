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

export default function OurUSPs() {
  const containerRef = useRef<HTMLElement>(null);
  const shapeRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const labelLineRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const content = contentRef.current;
    const labelLine = labelLineRef.current;
    if (!content || !labelLine) return;

    const syncDesktopLayout = () => {
      if (window.innerWidth < 1024) return;

      const cards = Array.from(
        content.querySelectorAll<HTMLElement>("[data-usp-card]")
      );

      const firstCard = cards[0];
      const secondCard = cards[1];
      const thirdCard = cards[2];

      if (!firstCard || !secondCard || !thirdCard) return;

      const contentRect = content.getBoundingClientRect();
      const labelRect = labelLine.getBoundingClientRect();

      const labelLeft = Math.max(
        0,
        Math.round(labelRect.left - contentRect.left)
      );

      const secondTop = Math.round(
        firstCard.offsetTop + firstCard.offsetHeight * 0.5
      );

      secondCard.style.left = `${labelLeft}px`;
      secondCard.style.top = `${secondTop}px`;

      thirdCard.style.left = "50%";
      thirdCard.style.right = "auto";
    };

    let frame = requestAnimationFrame(() => {
      syncDesktopLayout();
      ScrollTrigger.refresh();
    });

    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        syncDesktopLayout();
        ScrollTrigger.refresh();
      });
    });

    observer.observe(content);
    if (labelLineRef.current) observer.observe(labelLineRef.current);

    const cards = Array.from(
      content.querySelectorAll<HTMLElement>("[data-usp-card]")
    );
    cards.slice(0, 3).forEach((card) => observer.observe(card));

    window.addEventListener("resize", syncDesktopLayout, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", syncDesktopLayout);

      const cards = Array.from(
        content.querySelectorAll<HTMLElement>("[data-usp-card]")
      );
      cards.forEach((card) => {
        card.style.left = "";
        card.style.right = "";
        card.style.top = "";
      });
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

      const buildCardReveals = (
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
      };

      mm.add("(max-width: 768px)", () =>
        buildCardReveals(12, 0.44, "top 94%")
      );

      mm.add("(min-width: 769px) and (max-width: 1023px)", () =>
        buildCardReveals(16, 0.5, "top 92%")
      );

      mm.add("(min-width: 1024px)", () => {
        buildCardReveals(28, 0.62, "top 88%");

        const shape = shapeRef.current;
        const content = contentRef.current;
        if (!shape || !content) return;

        const shapeTween = gsap.fromTo(
          shape,
          { yPercent: -0.45 },
          {
            yPercent: 0.75,
            ease: "none",
            force3D: true,
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: 3.2,
              invalidateOnRefresh: true,
            },
          }
        );

        const contentTween = gsap.fromTo(
          content,
          { yPercent: 0.35 },
          {
            yPercent: -1.15,
            ease: "none",
            force3D: true,
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.7,
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
      className="relative isolate z-30 m-0 w-full overflow-hidden bg-black text-white pointer-events-auto"
    >
      <div
        ref={shapeRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 block opacity-80 lg:opacity-100 lg:will-change-transform"
      >
        <div className="absolute left-1/2 top-1/2 aspect-[341/220] w-[145%] -translate-x-1/2 -translate-y-1/2 sm:w-[120%] lg:w-[80%] xl:w-[74%]">
          <div
            className="absolute inset-0 bg-[#171717]"
            style={{
              clipPath:
                "polygon(64.22% 0%, 50.44% 0%, 32.26% 21.36%, 13.49% 0%, 0% 0%, 31.96% 99.55%)",
            }}
          />
          <div
            className="absolute inset-0 bg-[#171717]"
            style={{
              clipPath:
                "polygon(67.74% 0%, 35.19% 99.55%, 48.97% 99.55%, 67.45% 77.73%, 85.92% 99.55%, 99.71% 99.55%)",
            }}
          />
        </div>
      </div>

      <div
        ref={contentRef}
        className="relative z-10 mx-auto flex w-full max-w-[1500px] flex-col items-start gap-8 px-[max(1.1rem,env(safe-area-inset-left))] pb-[max(5rem,env(safe-area-inset-bottom))] pt-0 pr-[max(1.1rem,env(safe-area-inset-right))] sm:gap-10 sm:px-8 sm:pb-24 lg:block lg:min-h-[clamp(2860px,210vw,3220px)] lg:px-12 lg:pb-32 xl:px-16"
      >
        <header className="usp-reveal relative z-20 w-full px-6 sm:px-10 md:px-16 lg:absolute lg:inset-x-0 lg:top-4 lg:px-20">
          <div ref={labelLineRef} className="mx-auto w-full max-w-[1300px]">
            <span className="inline-block bg-white px-2 py-1 font-mono text-[18px] font-bold uppercase leading-none tracking-[0.06em] text-black sm:text-[20px] lg:text-[22px]">
              OUR USPs
            </span>
          </div>
        </header>

        <div className="mt-8 flex w-full flex-col gap-10 sm:mt-10 sm:gap-12 lg:mt-0 lg:block">
          {usps.map((item, index) => {
            const desktopPositions = [
              "lg:absolute lg:left-[59%] lg:top-[clamp(120px,9.6vw,160px)]",
              "lg:absolute lg:top-[clamp(420px,34vw,560px)]",
              "lg:absolute lg:left-1/2 lg:right-auto lg:top-[clamp(980px,76vw,1220px)]",
              "lg:absolute lg:left-[8%] lg:top-[clamp(1580px,120vw,1920px)]",
              "lg:absolute lg:left-[59%] lg:top-[clamp(2100px,158vw,2520px)]",
            ];

            const desktopWidths = [
              "lg:w-[32%] lg:max-w-[455px]",
              "lg:w-[32%] lg:max-w-[455px]",
              "lg:w-[32%] lg:max-w-[455px]",
              "lg:w-[32%] lg:max-w-[455px]",
              "lg:w-[32%] lg:max-w-[455px]",
            ];

            const mobileAlignment =
              index === 0
                ? "mr-auto"
                : index === 1
                  ? "ml-auto"
                  : index === 2
                    ? "mx-auto"
                    : index === 3
                      ? "mr-auto"
                      : "ml-auto";

            return (
              <article
                key={item.id}
                data-usp-card
                className={`usp-reveal relative flex min-h-[350px] w-[88%] max-w-[400px] flex-col justify-between bg-[#111111] p-6 text-white shadow-[0_22px_60px_rgba(0,0,0,0.16)] sm:min-h-[380px] sm:w-[82%] sm:max-w-[430px] sm:p-8 lg:min-h-[460px] lg:p-9 xl:min-h-[490px] xl:p-10 ${mobileAlignment} ${desktopPositions[index]} ${desktopWidths[index]}`}
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

        <div className="usp-reveal mt-10 flex w-full max-w-[430px] flex-col items-start text-left sm:mt-12 lg:absolute lg:bottom-20 lg:left-0 lg:mt-0 lg:max-w-[390px]">
          <h4 className="mb-3 font-sans text-[clamp(21px,5.5vw,28px)] font-semibold leading-tight tracking-tight text-white lg:text-[28px]">
            Ready to make your mark?
          </h4>

          <p className="mb-5 font-sans text-[clamp(14px,3.8vw,17px)] font-normal leading-relaxed text-white/60">
            Let’s create something that gets noticed, remembered, and talked
            about.
          </p>

          <TransitionLink
            href="/#contact"
            className="group inline-flex min-h-[44px] items-center gap-2 border-b border-white/30 py-1 font-sans text-base font-medium tracking-wide text-white transition-colors duration-200 lg:hover:border-white"
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
