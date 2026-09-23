"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export interface USP {
  id: string;
  number: string;
  title: string;
  description: string;
  desktopTop: string;
  desktopLeft: string;
}

export const usps: USP[] = [
  {
    id: "usp-1",
    number: "01",
    title: "ONE PARTNER,\nEND-TO-END",
    description:
      "From strategy and branding to marketing, technology, and creative production, everything your brand needs works together under one roof.",
    desktopTop: "80px",
    desktopLeft: "46vw",
  },
  {
    id: "usp-2",
    number: "02",
    title: "CREATIVITY WITH\nCOMMERCIAL PURPOSE",
    description:
      "Every creative decision is rooted in your business goals, ensuring our work is purposeful, practical, and commercially relevant.",
    desktopTop: "560px",
    desktopLeft: "6vw",
  },
  {
    id: "usp-3",
    number: "03",
    title: "DEEP LOCAL\nFLUENCY",
    description:
      "Communication built in Malayalam, for the way business actually works in Kerala — including its many Gulf-returnee founders.",
    desktopTop: "1060px",
    desktopLeft: "52vw",
  },
  {
    id: "usp-4",
    number: "04",
    title: "ATTENTION\nTO DETAIL",
    description:
      "We refine every element with precision, ensuring your brand delivers a consistent and memorable experience across every touchpoint.",
    desktopTop: "1560px",
    desktopLeft: "10vw",
  },
  {
    id: "usp-5",
    number: "05",
    title: "STRATEGY BEFORE\nAESTHETICS",
    description:
      "Good design starts with good thinking. We look beyond surface-level visuals to understand your business, audience, and goals. Every creative decision is rooted in strategy, ensuring your brand looks great and communicates with purpose.",
    desktopTop: "2060px",
    desktopLeft: "54vw",
  },
];

export default function OurUSPs() {
  const containerRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const bgPlanesRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (typeof window === "undefined") return;

      const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (motionQuery.matches) return;

      if (!containerRef.current || !stageRef.current || !canvasRef.current) return;

      const mm = gsap.matchMedia();

      // DESKTOP SCROLL ANIMATION (>= 1024px)
      mm.add("(min-width: 1024px)", () => {
        if (!stageRef.current || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const bgPlanes = bgPlanesRef.current;

        const getTravelDistance = () => {
          return Math.max(0, canvas.scrollHeight - window.innerHeight + 160);
        };

        const masterTL = gsap.timeline({
          scrollTrigger: {
            trigger: stageRef.current,
            start: "top top",
            end: () => `+=${getTravelDistance() + 500}`,
            pin: stageRef.current,
            pinSpacing: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // Translate the staggered canvas vertically (cards + CTA block)
        masterTL.to(canvas, {
          y: () => -getTravelDistance(),
          ease: "none",
        });

        // Parallax background planes at 0.7x speed
        if (bgPlanes) {
          masterTL.to(
            bgPlanes,
            {
              y: () => -getTravelDistance() * 0.7,
              ease: "none",
            },
            0
          );
        }
      });

      // MOBILE LAYOUT (< 1024px)
      mm.add("(max-width: 1023px)", () => {
        const elements = gsap.utils.toArray<HTMLElement>(
          ".mobile-usp-card, .mobile-usp-cta"
        );

        elements.forEach((element) => {
          gsap.fromTo(
            element,
            { opacity: 0, y: 22 },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
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
    },
    { scope: containerRef }
  );

  return (
    <section
      id="our-usps"
      ref={containerRef}
      className="relative w-full bg-[#000000] text-white pointer-events-auto z-30 m-0 p-0 overflow-x-clip select-none"
    >
      {/* 1. NORMAL DOCUMENT FLOW SECTION HEADER */}
      <header className="relative w-full px-6 sm:px-10 md:px-16 lg:px-20 pt-16 sm:pt-20 md:pt-24 pb-8 sm:pb-12 z-20">
        <div className="flex flex-col items-start gap-1">
          <div className="bg-white text-black px-3 py-1">
            <h2 className="font-pixel font-bold text-xl sm:text-2xl lg:text-3xl leading-none uppercase tracking-wider">
              OUR
            </h2>
          </div>
          <div className="bg-white text-black px-3 py-1">
            <h2 className="font-pixel font-bold text-xl sm:text-2xl lg:text-3xl leading-none uppercase tracking-wider">
              USPs
            </h2>
          </div>
        </div>
      </header>

      {/* 2. DESKTOP ANIMATION STAGE (PINNED SCROLL CANVAS — CARDS, CTA & PLANES) */}
      <div className="hidden lg:block w-full">
        <div
          ref={stageRef}
          className="relative w-full h-[100dvh] min-h-[100dvh] bg-[#000000] overflow-hidden"
        >
          {/* PARALLAX LAYER 1: DARK ARCHITECTURAL BACKGROUND PLANES */}
          <div
            ref={bgPlanesRef}
            aria-hidden="true"
            className="absolute inset-0 w-full h-[3200px] pointer-events-none z-0 will-change-transform"
          >
            <div
              className="absolute top-[120px] left-[28vw] w-[65vw] h-[520px] bg-[#171717] opacity-80"
              style={{ clipPath: "polygon(0 0, 100% 12%, 88% 100%, 0 85%)" }}
            />
            <div
              className="absolute top-[800px] left-[4vw] w-[58vw] h-[550px] bg-[#1B1B1B] opacity-75"
              style={{ clipPath: "polygon(12% 0, 100% 0, 100% 88%, 0 100%)" }}
            />
            <div
              className="absolute top-[1480px] left-[32vw] w-[62vw] h-[540px] bg-[#171717] opacity-80"
              style={{ clipPath: "polygon(0 8%, 100% 0, 85% 100%, 0 92%)" }}
            />
            <div
              className="absolute top-[2100px] left-[8vw] w-[60vw] h-[500px] bg-[#171717] opacity-75"
              style={{ clipPath: "polygon(8% 0, 100% 10%, 90% 100%, 0 90%)" }}
            />
          </div>

          {/* PARALLAX LAYER 2: OVERSIZED STAGGERED CARDS CANVAS & FINAL CTA BLOCK */}
          <div
            ref={canvasRef}
            className="relative z-10 w-full h-[3150px] will-change-transform"
          >
            {usps.map((item) => (
              <article
                key={item.id}
                className="absolute w-[420px] xl:w-[465px] min-h-[400px] bg-[#151515] text-white p-8 xl:p-10 flex flex-col justify-between shadow-2xl transition-opacity duration-300"
                style={{
                  top: item.desktopTop,
                  left: item.desktopLeft,
                  clipPath: "polygon(10% 0, 100% 0, 100% 100%, 0 100%, 0 10%)",
                }}
              >
                {/* NUMBER & TITLE */}
                <div className="flex flex-col items-start">
                  <div className="inline-block bg-[#1677FF] text-black font-mono font-bold text-xs xl:text-sm px-2.5 py-1 mb-6 rounded-none leading-none">
                    {item.number}
                  </div>
                  <h3 className="font-pixel font-bold text-white text-[clamp(22px,2vw,30px)] leading-[1.08] uppercase tracking-tight whitespace-pre-line text-left">
                    {item.title}
                  </h3>
                </div>

                {/* DESCRIPTION */}
                <div className="mt-auto pt-6 border-t border-white/10">
                  <p className="font-sans font-normal text-white/70 text-sm xl:text-base leading-relaxed text-left">
                    {item.description}
                  </p>
                </div>
              </article>
            ))}

            {/* FINAL NORTHFRAME CTA BLOCK (AFTER CARD 05 — BOTTOM-LEFT POSITION) */}
            <div
              className="absolute top-[2160px] left-[10vw] max-w-[360px] flex flex-col items-start text-left z-20"
            >
              <h4 className="font-sans font-semibold text-white text-[clamp(20px,1.6vw,24px)] leading-tight tracking-tight mb-4">
                Ready to make
                <br />
                your mark?
              </h4>

              <p className="font-sans font-normal text-white/60 text-[clamp(14px,1.1vw,17px)] leading-relaxed mb-6">
                Let’s create something that gets
                <br />
                noticed, remembered, and talked
                <br />
                about.
              </p>

              <Link
                href="/#contact"
                className="group inline-flex items-center gap-2 font-sans font-medium text-white text-base tracking-wide border-b border-white/40 lg:hover:border-white transition-colors duration-200 py-0.5"
              >
                <span>Let’s talk</span>
                <span className="inline-block transition-transform duration-200 lg:group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MOBILE & TABLET RESPONSIVE LAYOUT (< 1024px) */}
      <div className="lg:hidden w-full px-5 pb-16 sm:pb-20 flex flex-col items-start gap-10">
        {/* MOBILE STAGGERED CARDS FLOW */}
        <div className="w-full flex flex-col gap-10 sm:gap-12">
          {usps.map((item, index) => {
            const isRight = index % 2 === 0;
            return (
              <article
                key={item.id}
                className={`mobile-usp-card w-[calc(100vw-40px)] max-w-[390px] min-h-[380px] bg-[#151515] text-white p-6 sm:p-8 flex flex-col justify-between shadow-xl ${
                  isRight ? "ml-auto" : "mr-auto"
                }`}
                style={{
                  clipPath: "polygon(10% 0, 100% 0, 100% 100%, 0 100%, 0 8%)",
                }}
              >
                {/* NUMBER & TITLE */}
                <div className="flex flex-col items-start">
                  <div className="inline-block bg-[#1677FF] text-black font-mono font-bold text-xs px-2.5 py-1 mb-5 leading-none">
                    {item.number}
                  </div>
                  <h3 className="font-pixel font-bold text-white text-[clamp(20px,6vw,28px)] leading-[1.05] uppercase tracking-tight whitespace-pre-line text-left">
                    {item.title}
                  </h3>
                </div>

                {/* DESCRIPTION */}
                <div className="mt-auto pt-5 border-t border-white/10">
                  <p className="font-sans font-normal text-white/75 text-[clamp(13px,3.8vw,16px)] leading-relaxed text-left">
                    {item.description}
                  </p>
                </div>
              </article>
            );
          })}

          {/* MOBILE FINAL CTA BLOCK AFTER CARD 05 */}
          <div className="mobile-usp-cta w-full max-w-[390px] pt-6 flex flex-col items-start text-left">
            <h4 className="font-sans font-semibold text-white text-[clamp(20px,5.5vw,26px)] leading-tight tracking-tight mb-3">
              Ready to make your mark?
            </h4>

            <p className="font-sans font-normal text-white/60 text-[clamp(14px,3.8vw,17px)] leading-relaxed mb-6">
              Let’s create something that gets noticed, remembered, and talked about.
            </p>

            <Link
              href="/#contact"
              className="group inline-flex items-center gap-2 font-sans font-medium text-white text-base tracking-wide border-b border-white/40 lg:hover:border-white transition-colors duration-200 py-0.5"
            >
              <span>Let’s talk</span>
              <span className="inline-block transition-transform duration-200 lg:group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
