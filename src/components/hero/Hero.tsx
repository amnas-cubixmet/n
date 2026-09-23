"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import ScrollIndicator from "./ScrollIndicator";
import HeroContent from "./HeroContent";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface HeroProps {
  introCompleted: boolean;
}

export default function Hero({ introCompleted }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const handoffRef = useRef<HTMLDivElement>(null);
  const logoWrapperRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const blueLineRef = useRef<HTMLSpanElement>(null);
  const servicesContainerRef = useRef<HTMLDivElement>(null);
  const serviceItemsRef = useRef<(HTMLAnchorElement | null)[]>([]);

  useGSAP(
    () => {
      const bgVisual = document.querySelector<HTMLElement>(".global-visual-background");
      const heroVisual = document.querySelector<HTMLElement>(".hero-a-stage");
      const headerBtn = document.querySelector<HTMLElement>(".header-menu-button");
      const serviceItems = serviceItemsRef.current.filter(
        (item): item is HTMLAnchorElement => Boolean(item)
      );

      // Keep the hero in a clean pre-intro state so the loading animation never
      // fights with the hero entrance behind it.
      if (!introCompleted) {
        if (bgVisual) gsap.set(bgVisual, { opacity: 0 });
        if (heroVisual) gsap.set(heroVisual, { opacity: 0 });
        if (logoWrapperRef.current) {
          gsap.set(logoWrapperRef.current, { opacity: 0, y: 18 });
        }
        if (labelRef.current) {
          gsap.set(labelRef.current, { opacity: 0, y: 12 });
        }
        if (blueLineRef.current) {
          gsap.set(blueLineRef.current, {
            scaleX: 0,
            transformOrigin: "left center",
          });
        }
        if (serviceItems.length) {
          gsap.set(serviceItems, { opacity: 0, y: 10 });
        }
        if (headerBtn) {
          gsap.set(headerBtn, { opacity: 0, y: -10 });
        }
        return;
      }

      const mm = gsap.matchMedia();

      mm.add(
        {
          mobile: "(max-width: 768px)",
          desktop: "(min-width: 769px)",
          reducedMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { mobile, reducedMotion } = context.conditions as {
            mobile: boolean;
            desktop: boolean;
            reducedMotion: boolean;
          };

          if (reducedMotion) {
            if (bgVisual) gsap.set(bgVisual, { opacity: 1 });
            if (heroVisual) gsap.set(heroVisual, { opacity: 1 });
            if (logoWrapperRef.current) {
              gsap.set(logoWrapperRef.current, { opacity: 1, y: 0 });
            }
            if (labelRef.current) {
              gsap.set(labelRef.current, { opacity: 1, y: 0 });
            }
            if (blueLineRef.current) {
              gsap.set(blueLineRef.current, { scaleX: 1 });
            }
            if (serviceItems.length) {
              gsap.set(serviceItems, { opacity: 1, y: 0 });
            }
            if (headerBtn) {
              gsap.set(headerBtn, { opacity: 1, y: 0 });
            }
            return;
          }

          const duration = mobile ? 0.62 : 0.82;
          const logoY = mobile ? 5 : 7;
          const labelY = mobile ? 3 : 4;
          const serviceY = mobile ? 3 : 4;

          if (bgVisual) gsap.set(bgVisual, { opacity: 0 });
          if (heroVisual) gsap.set(heroVisual, { opacity: 0 });
          if (logoWrapperRef.current) {
            gsap.set(logoWrapperRef.current, {
              opacity: 0,
              y: logoY,
              force3D: true,
            });
          }
          if (labelRef.current) {
            gsap.set(labelRef.current, {
              opacity: 0,
              y: labelY,
              force3D: true,
            });
          }
          if (blueLineRef.current) {
            gsap.set(blueLineRef.current, {
              scaleX: 0,
              transformOrigin: "left center",
            });
          }
          if (serviceItems.length) {
            gsap.set(serviceItems, {
              opacity: 0,
              y: serviceY,
              force3D: true,
            });
          }
          if (headerBtn) {
            gsap.set(headerBtn, {
              opacity: 0,
              y: mobile ? -4 : -6,
              force3D: true,
            });
          }

          const tl = gsap.timeline({
            delay: mobile ? 0.04 : 0.06,
            defaults: { overwrite: "auto" },
          });

          if (bgVisual) {
            tl.to(bgVisual, {
              opacity: 1,
              duration: duration * 0.9,
              ease: "power2.out",
            });
          }

          if (heroVisual) {
            tl.to(
              heroVisual,
              {
                opacity: 1,
                duration: duration,
                ease: "power2.out",
              },
              "-=0.5"
            );
          }

          if (logoWrapperRef.current) {
            tl.to(
              logoWrapperRef.current,
              {
                opacity: 1,
                y: 0,
                duration,
                ease: "power3.out",
                force3D: true,
              },
              "-=0.58"
            );
          }

          if (labelRef.current) {
            tl.to(
              labelRef.current,
              {
                opacity: 1,
                y: 0,
                duration: duration * 0.34,
                ease: "power3.out",
                force3D: true,
              },
              "-=0.34"
            );
          }

          if (blueLineRef.current) {
            tl.to(
              blueLineRef.current,
              {
                scaleX: 1,
                duration: duration * 0.32,
                ease: "power2.out",
              },
              "<0.05"
            );
          }

          if (serviceItems.length) {
            tl.to(
              serviceItems.slice().reverse(),
              {
                opacity: 1,
                y: 0,
                duration: duration * 0.56,
                stagger: mobile ? 0.018 : 0.024,
                ease: "power3.out",
                force3D: true,
              },
              "-=0.18"
            );
          }

          if (headerBtn) {
            tl.to(
              headerBtn,
              {
                opacity: 1,
                y: 0,
                duration: duration * 0.42,
                ease: "power3.out",
                force3D: true,
              },
              "-=0.14"
            );
          }

          tl.call(() => {
            if (logoWrapperRef.current) {
              gsap.set(logoWrapperRef.current, { clearProps: "willChange" });
            }
            serviceItems.forEach((item) => {
              item.style.willChange = "auto";
            });
          });
        }
      );

      return () => mm.revert();
    },
    {
      scope: containerRef,
      dependencies: [introCompleted],
      revertOnUpdate: true,
    }
  );

  useGSAP(
    () => {
      if (!introCompleted || !containerRef.current || !handoffRef.current) return;

      const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (motionQuery.matches) return;

      const mm = gsap.matchMedia();

      const buildHandoff = (mobile: boolean) => {
        const handoff = handoffRef.current;
        const indicator = labelRef.current;
        const line = blueLineRef.current;

        if (!handoff) return;

        const timeline = gsap.timeline({
          defaults: {
            ease: "none",
            overwrite: "auto",
          },
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom top",
            scrub: mobile ? 0.28 : 0.45,
            invalidateOnRefresh: true,
          },
        });

        timeline.to(
          handoff,
          {
            yPercent: mobile ? -28 : -36,
            autoAlpha: 0.08,
            scale: mobile ? 0.985 : 0.975,
            force3D: true,
            duration: 1,
          },
          0
        );

        if (indicator) {
          timeline.to(
            indicator,
            {
              yPercent: -80,
              autoAlpha: 0,
              duration: 0.58,
              force3D: true,
            },
            0
          );
        }

        if (line) {
          timeline.to(
            line,
            {
              scaleX: 0.2,
              autoAlpha: 0,
              duration: 0.5,
            },
            0
          );
        }

        return () => {
          gsap.set(handoff, {
            clearProps: "willChange",
          });
        };
      };

      mm.add("(max-width: 768px)", () => buildHandoff(true));
      mm.add("(min-width: 769px)", () => buildHandoff(false));

      return () => mm.revert();
    },
    {
      scope: containerRef,
      dependencies: [introCompleted],
      revertOnUpdate: true,
    }
  );

  return (
    <section
      ref={containerRef}
      className="hero relative w-full h-screen h-[100svh] h-[100dvh] pointer-events-auto flex flex-col justify-between select-none !bg-transparent overflow-hidden"
    >
      <ScrollIndicator labelRef={labelRef} lineRef={blueLineRef} />

      <HeroContent
        handoffRef={handoffRef}
        logoWrapperRef={logoWrapperRef}
        servicesContainerRef={servicesContainerRef}
        serviceItemsRef={serviceItemsRef}
      />
    </section>
  );
}
