"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { services } from "@/data/services";

gsap.registerPlugin(ScrollTrigger);

export default function WatWeDoen() {
  const wrapperRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<(HTMLElement | null)[]>([]);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const titlesRef = useRef<(HTMLAnchorElement | null)[]>([]);

  const bgShapeRef = useRef<HTMLDivElement>(null);
  const desktopTitlesRef = useRef<(HTMLAnchorElement | null)[]>([]);

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    // Preload service images
    services.forEach((service) => {
      if (service.image) {
        const img = new Image();
        img.src = service.image;
      }
    });

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(motionQuery.matches);
    const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    motionQuery.addEventListener("change", handler);

    const handleOrientation = () => {
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 200);
    };

    window.addEventListener("resize", handleOrientation);
    window.addEventListener("orientationchange", handleOrientation);

    return () => {
      motionQuery.removeEventListener("change", handler);
      window.removeEventListener("resize", handleOrientation);
      window.removeEventListener("orientationchange", handleOrientation);
    };
  }, []);

  useGSAP(
    () => {
      if (typeof window === "undefined" || isReducedMotion) return;
      if (!wrapperRef.current || !stickyRef.current) return;

      const startPolygon =
        "polygon(0% 100%, 0% 100%, 20% 100%, 20% 100%, 40% 100%, 40% 100%, 60% 100%, 60% 100%, 80% 100%, 80% 100%, 100% 100%, 100% 100%)";
      const endPolygon =
        "polygon(0% 100%, 0% 0%, 20% 0%, 20% -15%, 40% -15%, 40% -30%, 60% -30%, 60% -45%, 80% -45%, 80% -60%, 100% -60%, 100% 100%)";

      const isMobile = window.innerWidth <= 768;

      // Initial state setups
      panelsRef.current.forEach((panel, i) => {
        if (!panel) return;
        gsap.set(panel, {
          left: "0%",
          top: "0%",
          width: "100%",
          height: "100%",
          xPercent: 0,
          yPercent: 0,
          opacity: 1,
          zIndex: i + 1,
          willChange: "clipPath, transform",
          clipPath:
            i === 0
              ? "polygon(0% 100%, 0% 0%, 100% 0%, 100% 100%)"
              : startPolygon,
        });

        const img = imagesRef.current[i];
        if (img) {
          gsap.set(img, { scale: i === 0 ? 1.0 : 1.05, force3D: true });
        }
      });

      // Background Shape Parallax Initial Setup
      if (bgShapeRef.current) {
        gsap.set(bgShapeRef.current, { yPercent: isMobile ? -6 : -15 });
      }

      // Responsive scroll distance ratio per transition: Desktop ~1.4x, Mobile ~1.55x viewport height
      const distanceMultiplier = isMobile ? 155 : 140;

      // Master ScrollTrigger timeline linking panel clips + continuous image scale zoom (1.05 -> 1.0)
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "top top",
          end: `+=${(services.length - 1) * distanceMultiplier}%`,
          scrub: 1.0,
          pin: stickyRef.current,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;
            const idx = Math.min(
              services.length - 1,
              Math.floor(p * services.length)
            );
            setActiveIndex((prev) => (prev !== idx ? idx : prev));
          },
        },
      });

      // Background shape parallax
      if (bgShapeRef.current) {
        tl.to(
          bgShapeRef.current,
          {
            yPercent: isMobile ? 6 : 15,
            ease: "none",
            duration: 4,
          },
          0
        );
      }

      // 4 Transitions for Panels 01 -> 02 -> 03 -> 04 -> 05 with hold zones
      for (let i = 1; i < 5; i++) {
        const p = panelsRef.current[i];
        const img = imagesRef.current[i];
        if (!p) continue;

        const startTime = (i - 1) * 1.25;

        // 1. Panel upward clipPath reveal
        tl.to(
          p,
          { clipPath: endPolygon, ease: "none", duration: 1 },
          startTime
        );

        // 2. Image scale zoom (1.05 -> 1.00) continuously attached to scrub
        if (img) {
          tl.to(
            img,
            { scale: 1.0, ease: "none", duration: 1 },
            startTime
          );
        }
      }

      // Triggered Text Reveal Animations (Animates ONCE per panel when active position is reached at 75-80% settled)
      services.forEach((_, index) => {
        const panelEl = panelsRef.current[index];
        if (!panelEl) return;

        const titleLines = panelEl.querySelectorAll(".title-inner");
        const counter = panelEl.querySelector(".service-counter");

        // Single trigger for text reveal when panel reaches 75-80% settled focus
        ScrollTrigger.create({
          trigger: wrapperRef.current,
          start: () =>
            index === 0
              ? "top 20%"
              : `top+=${(index - 0.25) * (window.innerHeight || 800) * (distanceMultiplier / 100)} top`,
          once: false,
          onEnter: () => {
            const textTl = gsap.timeline({ defaults: { ease: "power3.out" } });

            // 1. Large Title Lines masked reveal (duration: 0.6s, stagger: 0.04s)
            if (titleLines.length > 0) {
              textTl.fromTo(
                titleLines,
                { yPercent: 110, opacity: 0 },
                { yPercent: 0, opacity: 1, duration: 0.6, stagger: 0.04 },
                0
              );
            }

            // 2. Counter reveal (y: 18px -> 0, opacity 0 -> 1, duration 0.35s)
            if (counter) {
              textTl.fromTo(
                counter,
                { y: 18, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.35 },
                0.12
              );
            }
          },
        });
      });
    },
    { scope: wrapperRef, dependencies: [isReducedMotion] }
  );

  if (isReducedMotion) {
    return (
      <section className="relative w-full bg-[#030508] text-white py-20 px-6">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="border-b border-white/10 pb-6">
            <span className="wat-we-doen-label font-pixel text-xs sm:text-sm font-bold uppercase px-2 py-1">
              WHAT WE DO
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {services.map((service, index) => (
              <article
                key={service.id}
                className="relative overflow-hidden border border-white/10 bg-[#080E18] flex flex-col justify-between"
              >
                <div className="h-64 sm:h-80 w-full overflow-hidden relative">
                  <img
                    src={service.image}
                    alt={service.imageAlt || service.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                </div>
                <div className="p-8 flex flex-col gap-4">
                  <div className="flex flex-col items-start gap-1">
                    {service.items.map((item, i) => (
                      <span
                        key={i}
                        className="inline-block bg-black text-white font-pixel text-[10px] uppercase tracking-wider px-1 py-0.5 leading-none"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={`/services/${service.slug}`}
                    className="font-pixel font-bold text-2xl sm:text-4xl text-white uppercase leading-[0.92] tracking-normal hover:text-[#1677FF] transition-colors flex flex-col items-start gap-1"
                  >
                    {service.displayLines.map((line, idx) => (
                      <span
                        key={idx}
                        className="table bg-black text-white m-0 px-[0.06em] py-0 leading-[0.92]"
                      >
                        {line}
                      </span>
                    ))}
                  </Link>
                  <div className="inline-flex items-center gap-1.5 bg-black px-2 py-0.5 text-white font-pixel text-xs w-fit">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <span className="inline-block w-4 h-[1.5px] bg-[#1677FF]" />
                    <span>05</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={wrapperRef}
      id="wat-we-doen"
      className="wat-we-doen-scroll relative w-full bg-[#030508] text-white"
    >
      <div
        ref={stickyRef}
        className="wat-we-doen-sticky w-full h-[100dvh] min-h-[100vh] min-h-[100svh] sticky top-0 overflow-hidden"
      >
        <div
          ref={stageRef}
          className="wat-we-doen-stage relative w-full h-full overflow-hidden bg-[#030508]"
        >
          {/* ==================================================== */}
          {/* LAYER 02: PARALLAX ARCHITECTURAL SUNRISE ACCENT */}
          {/* ==================================================== */}
          <div
            ref={bgShapeRef}
            aria-hidden="true"
            className="absolute top-[18%] right-[8%] sm:right-[12%] z-[1] pointer-events-none opacity-25 flex flex-col items-center justify-end overflow-hidden w-[120px] sm:w-[180px] md:w-[240px] lg:w-[260px] aspect-[2/1]"
          >
            <div className="w-full h-[200%] bg-gradient-to-b from-[#1677FF]/40 to-[#1677FF]/5 rounded-t-full relative">
              <div className="absolute bottom-0 inset-x-0 h-[2px] bg-[#1677FF]" />
            </div>
          </div>
          {/* ==================================================== */}
          {/* MOBILE TOP BAR (< 768px): WHAT WE DO + SERVICE CATEGORIES */}
          {/* ==================================================== */}
          <div className="flex md:hidden absolute top-[max(1.2rem,env(safe-area-inset-top))] left-[max(1.2rem,env(safe-area-inset-left))] right-[max(4.5rem,env(safe-area-inset-right))] z-40 pointer-events-none items-start gap-2.5 sm:gap-4">
            {/* Top-Left Label */}
            <span className="inline-block bg-black text-white font-pixel text-[11px] sm:text-[13px] uppercase px-1.5 py-0.5 leading-none shrink-0 tracking-wider">
              WHAT WE DO
            </span>

            {/* Active Service Sub-List */}
            <div className="flex flex-col items-start gap-1 max-w-[50vw]">
              {services[activeIndex]?.items.map((item, i) => (
                <span
                  key={`${activeIndex}-${i}`}
                  className="inline-block bg-black text-white font-pixel text-[10px] sm:text-[11px] uppercase px-1 py-0.5 leading-none tracking-wide transition-all duration-200"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* ==================================================== */}
          {/* DESKTOP TOP BAR (>= 768px) */}
          {/* ==================================================== */}
          <div className="hidden md:flex absolute top-0 left-0 w-full z-40 pointer-events-none p-6 md:p-8 pt-[max(1.5rem,env(safe-area-inset-top))] items-start justify-between">
            <div className="flex items-start gap-8 md:gap-12 max-w-[70vw]">
              <span className="inline-block bg-black text-white font-mono text-xs tracking-widest uppercase p-0 m-0 leading-none shrink-0">
                WHAT WE DO
              </span>

              <div className="flex flex-col items-start gap-1 pointer-events-none">
                {services[activeIndex]?.items.map((item, i) => (
                  <span
                    key={`${activeIndex}-${i}`}
                    className="inline-block bg-black text-white font-mono text-[11px] uppercase tracking-wider px-1 py-0.5 leading-none transition-all duration-200"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ==================================================== */}
          {/* ALL 5 SERVICE PANELS */}
          {/* ==================================================== */}
          {services.map((service, index) => {
            return (
              <article
                key={service.id}
                ref={(el) => {
                  panelsRef.current[index] = el;
                }}
                className={`service-panel service-${index + 1} absolute inset-0 overflow-hidden select-none`}
              >
                {/* Full-bleed Background Image with Separate Zoom Wrapper */}
                <div className="service-image absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
                  <div className="service-image-inner w-full h-full overflow-hidden">
                    <img
                      ref={(el) => {
                        imagesRef.current[index] = el;
                      }}
                      src={service.image}
                      alt={service.imageAlt || service.title}
                      className="panel-image w-full h-full object-cover select-none pointer-events-none will-change-transform"
                      style={{
                        objectPosition: service.objectPosition || "center center",
                      }}
                    />
                  </div>
                  {/* Dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/30 pointer-events-none" />
                </div>

                {/* MOBILE OVERLAY CONTENT (< 768px) */}
                <div className="flex md:hidden relative z-20 w-full h-full pointer-events-none">
                  {/* Lower-Left Large Title */}
                  <div className="absolute bottom-[max(3rem,env(safe-area-inset-bottom)+1.8rem)] left-[max(1.2rem,env(safe-area-inset-left))] z-30 max-w-[85vw] pointer-events-auto">
                    <Link
                      ref={(el) => {
                        titlesRef.current[index] = el;
                      }}
                      href={`/services/${service.slug}`}
                      className="font-pixel font-bold text-[clamp(24px,7.5vw,38px)] text-white uppercase leading-[0.94] tracking-normal hover:opacity-90 transition-opacity flex flex-col items-start gap-[2px]"
                    >
                      {service.displayLines.map((line, idx) => (
                        <span key={idx} className="title-mask">
                          <span className="title-inner block w-fit bg-black text-white px-[0.06em] py-[0.02em] leading-[0.94]">
                            {line}
                          </span>
                        </span>
                      ))}
                    </Link>
                  </div>

                  {/* Bottom Counter & Progress Bar */}
                  <div className="service-counter absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-[max(1.2rem,env(safe-area-inset-left))] z-30 inline-flex items-center gap-2 bg-black px-2 py-1 text-white font-pixel text-[11px] tracking-wider pointer-events-none">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <div className="relative w-8 h-[2px] bg-white/30 overflow-hidden">
                      <div
                        className="absolute inset-0 bg-[#1677FF] origin-left transition-transform duration-300 ease-out"
                        style={{
                          transform: `scaleX(${
                            index === activeIndex ? 1 : 0
                          })`,
                        }}
                      />
                    </div>
                    <span>{String(services.length).padStart(2, "0")}</span>
                  </div>
                </div>

                {/* DESKTOP OVERLAY CONTENT (>= 768px) */}
                <div className="hidden md:flex panel-content relative z-20 w-full h-full p-8 md:p-12 xl:p-16 flex-col justify-end pointer-events-none pb-[max(1.5rem,env(safe-area-inset-bottom))]">
                  <div className="flex items-end justify-between w-full">
                    {/* Lower Left: Huge Clean Title with Masked Bottom-to-Top Reveal */}
                    <Link
                      ref={(el) => {
                        desktopTitlesRef.current[index] = el;
                      }}
                      href={`/services/${service.slug}`}
                      className="font-sans font-bold text-[clamp(2.5rem,7vw,7.5rem)] text-white uppercase leading-[0.88] tracking-[-0.04em] drop-shadow-md pointer-events-auto hover:opacity-90 transition-opacity flex flex-col items-start gap-1 max-w-[85vw]"
                    >
                      {service.displayLines.map((line, idx) => (
                        <span key={idx} className="title-mask">
                          <span className="title-inner table bg-black text-white m-0 px-[0.04em] py-0 leading-[0.9]">
                            {line}
                          </span>
                        </span>
                      ))}
                    </Link>

                    {/* Bottom Right: Small Editorial Counter */}
                    <div className="service-counter inline-flex items-center gap-2 bg-black px-2 py-1 text-white font-mono text-xs tracking-wider shrink-0 mb-1">
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <span className="inline-block w-6 h-[1.5px] bg-[#1677FF]" />
                      <span>{String(services.length).padStart(2, "0")}</span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
