"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { TransitionLink } from "@/components/navigation/PageTransitionProvider";
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
  const viewportWidthRef = useRef<number>(0);

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );

  useEffect(() => {
    // Preload service images once so panel changes do not wait on network decode.
    services.forEach((service) => {
      if (service.image) {
        const img = new window.Image();
        img.src = service.image;
      }
    });

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotionChange = (event: MediaQueryListEvent) =>
      setIsReducedMotion(event.matches);

    if (typeof motionQuery.addEventListener === "function") {
      motionQuery.addEventListener("change", handleMotionChange);
    } else {
      motionQuery.addListener(handleMotionChange);
    }

    viewportWidthRef.current = window.innerWidth;
    let refreshFrame = 0;
    let orientationTimer = 0;

    // Mobile Safari changes viewport HEIGHT while its browser chrome opens/closes.
    // Refresh ScrollTrigger only when the layout WIDTH actually changes.
    const handleResize = () => {
      const nextWidth = window.innerWidth;
      if (Math.abs(nextWidth - viewportWidthRef.current) < 2) return;

      viewportWidthRef.current = nextWidth;
      cancelAnimationFrame(refreshFrame);
      refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
    };

    const handleOrientationChange = () => {
      window.clearTimeout(orientationTimer);
      orientationTimer = window.setTimeout(() => {
        viewportWidthRef.current = window.innerWidth;
        ScrollTrigger.refresh();
      }, 240);
    };

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", handleOrientationChange);

    return () => {
      cancelAnimationFrame(refreshFrame);
      window.clearTimeout(orientationTimer);

      if (typeof motionQuery.removeEventListener === "function") {
        motionQuery.removeEventListener("change", handleMotionChange);
      } else {
        motionQuery.removeListener(handleMotionChange);
      }

      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, []);

  useGSAP(
    () => {
      if (typeof window === "undefined" || isReducedMotion) return;
      if (!wrapperRef.current || !stickyRef.current) return;

      const startPolygon =
        "polygon(0% 100%, 0% 100%, 20% 100%, 20% 100%, 40% 100%, 40% 100%, 60% 100%, 60% 100%, 80% 100%, 80% 100%, 100% 100%, 100% 100%)";
      const endPolygon =
        "polygon(0% 100%, 0% 0%, 20% 0%, 20% -12%, 40% -12%, 40% -24%, 60% -24%, 60% -36%, 80% -36%, 80% -48%, 100% -48%, 100% 100%)";

      const mm = gsap.matchMedia();

      const buildTimeline = (mobile: boolean) => {
        const transitionCount = Math.max(1, services.length - 1);

        panelsRef.current.forEach((panel, index) => {
          if (!panel) return;

          if (mobile) {
            gsap.set(panel, {
              inset: 0,
              xPercent: 0,
              yPercent: index === 0 ? 0 : 100,
              autoAlpha: 1,
              zIndex: index + 1,
              clipPath: "none",
              willChange: "transform",
              force3D: true,
            });
          } else {
            gsap.set(panel, {
              left: "0%",
              top: "0%",
              width: "100%",
              height: "100%",
              xPercent: 0,
              yPercent: 0,
              autoAlpha: 1,
              zIndex: index + 1,
              clipPath:
                index === 0
                  ? "polygon(0% 100%, 0% 0%, 100% 0%, 100% 100%)"
                  : startPolygon,
              willChange: "clip-path, transform",
              force3D: true,
            });
          }

          const image = imagesRef.current[index];
          if (image) {
            gsap.set(image, {
              scale: index === 0 ? 1 : mobile ? 1.025 : 1.045,
              force3D: true,
              transformOrigin: "center center",
            });
          }

          const titleLines = panel.querySelectorAll(".title-inner");
          const counters = panel.querySelectorAll(".service-counter");

          gsap.set(titleLines, {
            yPercent: index === 0 ? 0 : 108,
            autoAlpha: index === 0 ? 1 : 0,
            force3D: true,
          });

          gsap.set(counters, {
            y: index === 0 ? 0 : mobile ? 8 : 14,
            autoAlpha: index === 0 ? 1 : 0,
          });
        });

        if (bgShapeRef.current) {
          gsap.set(bgShapeRef.current, {
            yPercent: mobile ? -2 : -10,
            force3D: true,
          });
        }

        const timeline = gsap.timeline({
          defaults: {
            overwrite: "auto",
          },
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top top",
            end: `+=${transitionCount * (mobile ? 110 : 125)}%`,
            scrub: mobile ? 0.45 : 0.8,
            pin: stickyRef.current,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            refreshPriority: 1,
            onUpdate: (self) => {
              const transitionProgress = self.progress * transitionCount;
              const nextIndex = Math.min(
                services.length - 1,
                Math.max(0, Math.floor(transitionProgress + 0.5))
              );

              setActiveIndex((previous) =>
                previous === nextIndex ? previous : nextIndex
              );
            },
            onLeave: () => setActiveIndex(services.length - 1),
            onLeaveBack: () => setActiveIndex(0),
          },
        });

        if (bgShapeRef.current) {
          timeline.to(
            bgShapeRef.current,
            {
              yPercent: mobile ? 2 : 10,
              duration: transitionCount,
              ease: "none",
              force3D: true,
            },
            0
          );
        }

        for (let index = 1; index < services.length; index += 1) {
          const panel = panelsRef.current[index];
          const image = imagesRef.current[index];
          if (!panel) continue;

          const segmentStart = index - 1;
          const revealDuration = mobile ? 0.78 : 0.92;

          if (mobile) {
            timeline.to(
              panel,
              {
                yPercent: 0,
                duration: revealDuration,
                ease: "none",
                force3D: true,
              },
              segmentStart
            );
          } else {
            timeline.to(
              panel,
              {
                clipPath: endPolygon,
                duration: revealDuration,
                ease: "none",
                force3D: true,
              },
              segmentStart
            );
          }

          if (image) {
            timeline.to(
              image,
              {
                scale: 1,
                duration: revealDuration,
                ease: "none",
                force3D: true,
              },
              segmentStart
            );
          }

          const titleLines = panel.querySelectorAll(".title-inner");
          const counters = panel.querySelectorAll(".service-counter");

          timeline.to(
            titleLines,
            {
              yPercent: 0,
              autoAlpha: 1,
              duration: mobile ? 0.26 : 0.32,
              stagger: mobile ? 0.025 : 0.035,
              ease: "power2.out",
              force3D: true,
            },
            segmentStart + (mobile ? 0.46 : 0.54)
          );

          timeline.to(
            counters,
            {
              y: 0,
              autoAlpha: 1,
              duration: mobile ? 0.18 : 0.2,
              ease: "power2.out",
            },
            segmentStart + (mobile ? 0.52 : 0.6)
          );
        }

        // Keep every service transition allocated to one equal scroll segment.
        // This makes the active label/counter switch at the visual midpoint of
        // each reveal rather than drifting ahead of the panel.
        timeline.to({}, { duration: 0.001 }, transitionCount);

        return () => {
          panelsRef.current.forEach((panel) => {
            if (panel) {
              gsap.set(panel, {
                clearProps: "will-change",
              });
            }
          });
        };
      };

      mm.add("(max-width: 767px)", () => buildTimeline(true));
      mm.add("(min-width: 768px)", () => buildTimeline(false));

      return () => mm.revert();
    },
    {
      scope: wrapperRef,
      dependencies: [isReducedMotion],
      revertOnUpdate: true,
    }
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
                  <Image
                    src={service.image}
                    alt={service.imageAlt || service.title}
                    fill
                    sizes="(max-width: 767px) 100vw, 50vw"
                    className="object-cover"
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
                  <TransitionLink
                    href={`/services/${service.slug}`}
                    className="font-pixel font-bold text-2xl sm:text-4xl text-white uppercase leading-[0.92] tracking-normal lg:hover:text-[#1677FF] transition-colors flex flex-col items-start gap-1"
                  >
                    {service.displayLines.map((line, idx) => (
                      <span
                        key={idx}
                        className="table bg-black text-white m-0 px-[0.06em] py-0 leading-[0.92]"
                      >
                        {line}
                      </span>
                    ))}
                  </TransitionLink>
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
        className="wat-we-doen-sticky w-full h-[100svh] min-h-[100svh] md:h-[100dvh] md:min-h-[100dvh] overflow-hidden"
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
                  <div className="service-image-inner relative w-full h-full overflow-hidden">
                    <Image
                      ref={(el) => {
                        imagesRef.current[index] = el;
                      }}
                      src={service.image}
                      alt={service.imageAlt || service.title}
                      fill
                      sizes="100vw"
                      className="panel-image object-cover select-none pointer-events-none will-change-transform"
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
                    <TransitionLink
                      ref={(el) => {
                        titlesRef.current[index] = el;
                      }}
                      href={`/services/${service.slug}`}
                      className="font-pixel font-bold text-[clamp(24px,7.5vw,38px)] text-white uppercase leading-[0.94] tracking-normal lg:hover:opacity-90 transition-opacity flex flex-col items-start gap-[2px]"
                    >
                      {service.displayLines.map((line, idx) => (
                        <span key={idx} className="title-mask">
                          <span className="title-inner block w-fit bg-black text-white px-[0.06em] py-[0.02em] leading-[0.94]">
                            {line}
                          </span>
                        </span>
                      ))}
                    </TransitionLink>
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
                    <TransitionLink
                      ref={(el) => {
                        desktopTitlesRef.current[index] = el;
                      }}
                      href={`/services/${service.slug}`}
                      className="font-sans font-bold text-[clamp(2.5rem,7vw,7.5rem)] text-white uppercase leading-[0.88] tracking-[-0.04em] drop-shadow-md pointer-events-auto lg:hover:opacity-90 transition-opacity flex flex-col items-start gap-1 max-w-[85vw]"
                    >
                      {service.displayLines.map((line, idx) => (
                        <span key={idx} className="title-mask">
                          <span className="title-inner table bg-black text-white m-0 px-[0.04em] py-0 leading-[0.9]">
                            {line}
                          </span>
                        </span>
                      ))}
                    </TransitionLink>

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
