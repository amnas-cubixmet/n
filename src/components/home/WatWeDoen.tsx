"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { TransitionLink } from "@/components/navigation/PageTransitionProvider";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { services } from "@/data/services";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CLOSED_STEPS =
  "polygon(0% 100%, 0% 100%, 20% 100%, 20% 100%, 40% 100%, 40% 100%, 60% 100%, 60% 100%, 80% 100%, 80% 100%, 100% 100%, 100% 100%)";

const OPEN_STEPS =
  "polygon(0% 100%, 0% 0%, 20% 0%, 20% -12%, 40% -12%, 40% -24%, 60% -24%, 60% -36%, 80% -36%, 80% -48%, 100% -48%, 100% 100%)";

function WhatWeDoIntro() {
  return (
    <div
      id="wat-we-doen"
      className="relative flex h-[100svh] w-full items-start bg-white px-[max(1.1rem,env(safe-area-inset-left))] pt-[max(4.5rem,env(safe-area-inset-top))] text-black md:h-[100dvh] md:px-8 md:pt-[max(5rem,env(safe-area-inset-top))]"
    >
      <div className="grid w-full grid-cols-[38%_1fr] items-start gap-3 md:grid-cols-[28%_1fr] md:gap-8">
        <span className="w-fit bg-black px-1.5 py-0.5 font-pixel text-[10px] font-bold uppercase leading-none text-white md:font-mono md:text-[16px]">
          WHAT WE DO
        </span>
        <div className="flex flex-col items-start gap-[3px]">
          {services.map((service) => (
            <span
              key={service.id}
              className="bg-black px-1 py-[1px] font-pixel text-[9px] uppercase leading-none text-white sm:text-[10px] md:font-mono md:text-[16px]"
            >
              {service.title}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function WatWeDoen() {
  const wrapperRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<(HTMLElement | null)[]>([]);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const viewportWidthRef = useRef(0);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isReducedMotion, setIsReducedMotion] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );

  useEffect(() => {
    services.forEach((service) => {
      if (!service.image) return;
      const image = new window.Image();
      image.src = service.image;
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
    let resizeFrame = 0;
    let orientationTimer = 0;

    const refreshForWidthChange = () => {
      const nextWidth = window.innerWidth;
      if (Math.abs(nextWidth - viewportWidthRef.current) < 2) return;

      viewportWidthRef.current = nextWidth;
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
    };

    const refreshForOrientation = () => {
      window.clearTimeout(orientationTimer);
      orientationTimer = window.setTimeout(() => {
        viewportWidthRef.current = window.innerWidth;
        ScrollTrigger.refresh();
      }, 240);
    };

    window.addEventListener("resize", refreshForWidthChange, { passive: true });
    window.addEventListener("orientationchange", refreshForOrientation);

    return () => {
      cancelAnimationFrame(resizeFrame);
      window.clearTimeout(orientationTimer);

      if (typeof motionQuery.removeEventListener === "function") {
        motionQuery.removeEventListener("change", handleMotionChange);
      } else {
        motionQuery.removeListener(handleMotionChange);
      }

      window.removeEventListener("resize", refreshForWidthChange);
      window.removeEventListener("orientationchange", refreshForOrientation);
    };
  }, []);

  useGSAP(
    () => {
      if (isReducedMotion || !wrapperRef.current || !stickyRef.current) return;

      const mm = gsap.matchMedia();

      const buildShowcase = (mobile: boolean) => {
        const panelCount = services.length;
        const revealDuration = mobile ? 0.82 : 0.86;

        panelsRef.current.forEach((panel, index) => {
          if (!panel) return;

          gsap.set(panel, {
            inset: 0,
            // The first image enters as a full viewport panel after the white intro.
            clipPath: index === 0 ? "inset(0)" : CLOSED_STEPS,
            WebkitClipPath: index === 0 ? "inset(0)" : CLOSED_STEPS,
            autoAlpha: 1,
            zIndex: 10 + index,
            force3D: true,
            willChange: "clip-path",
          });

          const image = imagesRef.current[index];
          if (image) {
            gsap.set(image, {
              scale: 1,
              transformOrigin: "center center",
              force3D: true,
              willChange: "transform",
            });
          }

          gsap.set(panel.querySelectorAll(".title-inner"), {
            yPercent: 0,
            autoAlpha: 1,
            force3D: true,
          });

          gsap.set(panel.querySelectorAll(".service-counter"), {
            y: index === 0 ? (mobile ? 8 : 12) : 0,
            autoAlpha: index === 0 ? 0 : 1,
          });
        });

        const timeline = gsap.timeline({
          defaults: {
            overwrite: "auto",
          },
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top top",
            // A fixed distance based on the stable pinned stage avoids
            // mobile address-bar changes shifting the scroll boundaries.
            end: () => `+=${Math.round(stickyRef.current!.clientHeight * panelCount * (mobile ? 1.08 : 1.22))}`,
            pin: stickyRef.current,
            pinSpacing: true,
            scrub: mobile ? 0.32 : 0.5,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            fastScrollEnd: false,
            onUpdate: (self) => {
              const raw = Math.min(
                self.progress * panelCount,
                panelCount - 0.0001
              );
              const segment = Math.floor(raw);
              const localProgress = raw - segment;

              const nextIndex =
                segment === 0
                  ? 0
                  : localProgress >= 0.52
                    ? segment
                    : segment - 1;

              const clamped = Math.min(
                panelCount - 1,
                Math.max(0, nextIndex)
              );

              setActiveIndex((previous) =>
                previous === clamped ? previous : clamped
              );
            },
            onLeave: () => setActiveIndex(panelCount - 1),
            onLeaveBack: () => setActiveIndex(0),
          },
        });

        services.forEach((_, index) => {
          const panel = panelsRef.current[index];
          const image = imagesRef.current[index];
          if (!panel) return;

          const segmentStart = index;

          if (index === 0) {
            // Keep the first title visible as soon as its image enters.
            timeline.to(
              panel.querySelectorAll(".service-counter"),
              { y: 0, autoAlpha: 1, duration: 0.16, ease: "power2.out" },
              0.12
            );
            timeline.to({}, { duration: 0.7 }, 0.3);
            return;
          }

          timeline.to(
            panel,
            {
              clipPath: OPEN_STEPS,
              WebkitClipPath: OPEN_STEPS,
              duration: revealDuration,
              ease: "none",
              force3D: true,
            },
            segmentStart
          );

          if (image) {
            timeline.to(
              image,
              {
                scale: mobile ? 1.075 : 1.095,
                duration: 1,
                ease: "none",
                force3D: true,
              },
              segmentStart
            );
          }

          timeline.to({}, { duration: 1 - revealDuration }, segmentStart + revealDuration);
        });

        return () => {
          panelsRef.current.forEach((panel, index) => {
            if (panel) {
              gsap.set(panel, { clearProps: "will-change" });
            }

            const image = imagesRef.current[index];
            if (image) {
              gsap.set(image, { clearProps: "will-change" });
            }
          });
        };
      };

      mm.add("(max-width: 767px)", () => buildShowcase(true));
      mm.add("(min-width: 768px)", () => buildShowcase(false));

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
      <section className="relative w-full bg-white text-black">
        <WhatWeDoIntro />
        <div className="mx-auto max-w-7xl space-y-14">
          <div className="grid grid-cols-1 gap-8 px-5 py-20 sm:px-8 md:grid-cols-2">
            {services.map((service, index) => (
              <article key={service.id} className="overflow-hidden bg-[#080E18]">
                <div className="relative h-72 w-full sm:h-96">
                  <Image
                    src={service.image}
                    alt={service.imageAlt || service.title}
                    fill
                    sizes="(max-width: 767px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/15" />
                </div>

                <div className="p-6 text-white">
                  <TransitionLink
                    href={`/services/${service.slug}`}
                    className="flex flex-col items-start font-pixel text-[clamp(24px,7vw,38px)] font-bold uppercase leading-[0.94]"
                  >
                    {service.displayLines.map((line) => (
                      <span key={line} className="bg-black px-[0.06em]">
                        {line}
                      </span>
                    ))}
                  </TransitionLink>

                  <div className="mt-3 inline-flex items-center gap-2 bg-black px-2 py-1 font-pixel text-[11px]">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <span className="h-[2px] w-6 bg-[#1677FF]" />
                    <span>{String(services.length).padStart(2, "0")}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const activeService = services[activeIndex];

  return (
    <>
      <WhatWeDoIntro />
      <section
        ref={wrapperRef}
        className="wat-we-doen-scroll relative w-full bg-transparent text-black"
      >
      <div
        ref={stickyRef}
        className="wat-we-doen-sticky relative h-[100svh] min-h-[100svh] w-full overflow-hidden bg-transparent md:h-[100dvh] md:min-h-[100dvh]"
      >
        <div className="wat-we-doen-stage relative h-full w-full overflow-hidden bg-transparent">
          <div className="absolute left-[max(1.1rem,env(safe-area-inset-left))] right-[max(4.5rem,env(safe-area-inset-right))] top-[max(1.1rem,env(safe-area-inset-top))] z-[80] flex items-start gap-4 pointer-events-none md:left-8 md:right-24 md:top-[max(2rem,env(safe-area-inset-top))] md:gap-12">
            <span className="shrink-0 bg-black px-1.5 py-0.5 font-pixel text-[9px] font-bold uppercase leading-none tracking-[0.04em] text-white sm:text-[10px] md:font-mono md:text-[16px]">
              WHAT WE DO
            </span>

            <div
              key={activeService.id}
              className="flex max-w-[55vw] flex-col items-start gap-[2px] md:max-w-[440px]"
            >
              {activeService.items.map((item) => (
                <span
                  key={item}
                  className="inline-block bg-black px-1 py-[1px] font-pixel text-[8px] uppercase leading-none tracking-[0.03em] text-white sm:text-[9px] md:font-mono md:text-[16px]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {services.map((service, index) => (
            <article
              key={service.id}
              ref={(element) => {
                panelsRef.current[index] = element;
              }}
              className="service-panel absolute inset-0 overflow-hidden select-none"
              style={{
                clipPath: index === 0 ? "inset(0)" : CLOSED_STEPS,
                WebkitClipPath: index === 0 ? "inset(0)" : CLOSED_STEPS,
              }}
            >
              <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="relative h-full w-full overflow-hidden">
                  <Image
                    ref={(element) => {
                      imagesRef.current[index] = element;
                    }}
                    src={service.image}
                    alt={service.imageAlt || service.title}
                    fill
                    priority={index === 0}
                    sizes="100vw"
                    className="panel-image object-cover select-none pointer-events-none"
                    style={{
                      objectPosition: service.objectPosition || "center center",
                    }}
                  />
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/12 to-black/10" />
              </div>

              <div className="relative z-20 flex h-full w-full pointer-events-none">
                <div className="absolute bottom-[max(3.5rem,env(safe-area-inset-bottom))] left-[max(1.1rem,env(safe-area-inset-left))] z-30 max-w-[90vw] pointer-events-auto md:bottom-[max(3rem,env(safe-area-inset-bottom))] md:left-8 lg:left-12">
                  <TransitionLink
                    href={`/services/${service.slug}`}
                    className="flex flex-col items-start gap-[2px] font-pixel text-[clamp(22px,6vw,32px)] font-bold uppercase leading-[0.93] tracking-normal text-white transition-opacity lg:text-[clamp(48px,4.5vw,70px)] lg:leading-[0.96] lg:hover:opacity-[0.85]"
                  >
                    {service.displayLines.map((line) => (
                      <span key={line} className="title-mask">
                        <span className="title-inner block w-fit bg-black px-[0.06em] py-[0.01em] leading-[0.94] text-white lg:leading-[0.96]">
                          {line}
                        </span>
                      </span>
                    ))}
                  </TransitionLink>
                </div>

                <div className="service-counter absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-[max(1.1rem,env(safe-area-inset-left))] z-30 inline-flex items-center gap-2 bg-black px-2 py-1 font-pixel text-[10px] tracking-wider text-white pointer-events-none md:left-auto md:right-8 md:bottom-[max(2rem,env(safe-area-inset-bottom))] md:font-mono md:text-xs lg:right-12">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <span className="relative h-[2px] w-7 overflow-hidden bg-white/30">
                    <span className="absolute inset-0 origin-left bg-[#1677FF]" />
                  </span>
                  <span>{String(services.length).padStart(2, "0")}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
      </section>
    </>
  );
}
