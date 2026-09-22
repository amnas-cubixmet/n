"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ScrollIndicator from "./ScrollIndicator";
import HeroContent from "./HeroContent";

export interface HeroProps {
  introCompleted: boolean;
}

export default function Hero({ introCompleted }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoWrapperRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const blueLineRef = useRef<HTMLSpanElement>(null);
  const servicesContainerRef = useRef<HTMLDivElement>(null);
  const serviceItemsRef = useRef<(HTMLAnchorElement | null)[]>([]);

  const [isMobile, setIsMobile] = useState(false);

  // Screen size check
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  // Coordinated GSAP Entrance Animation sequence using @gsap/react useGSAP
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 769px)",
          isMobile: "(max-width: 768px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { isMobile: mobile, reduceMotion } = context.conditions as {
            isMobile: boolean;
            reduceMotion: boolean;
          };

          const bgVisual = document.querySelector(".global-visual-background");
          const heroVisual = document.querySelector(".hero-a-stage");
          const headerBtn = document.querySelector(".header-menu-button");

          const logoY = mobile ? 22 : 36;
          const headingY = mobile ? 14 : 24;
          const servicesY = mobile ? 12 : 18;
          const duration = mobile ? 0.65 : 0.85;

          if (reduceMotion) {
            if (bgVisual) gsap.set(bgVisual, { opacity: 1 });
            if (heroVisual) gsap.set(heroVisual, { opacity: 1 });
            if (logoWrapperRef.current) gsap.set(logoWrapperRef.current, { opacity: 1, y: 0 });
            if (labelRef.current) gsap.set(labelRef.current, { opacity: 1, y: 0 });
            if (blueLineRef.current) gsap.set(blueLineRef.current, { scaleX: 1 });
            const validServiceItems = serviceItemsRef.current.filter(Boolean);
            if (validServiceItems.length > 0) gsap.set(validServiceItems, { opacity: 1, y: 0 });
            if (headerBtn) gsap.set(headerBtn, { opacity: 1, y: 0 });
            return;
          }

          // Initial state setups using transform and opacity only
          if (bgVisual) gsap.set(bgVisual, { opacity: 0 });
          if (logoWrapperRef.current) gsap.set(logoWrapperRef.current, { opacity: 0, y: logoY });
          if (heroVisual) gsap.set(heroVisual, { opacity: 0 });
          if (labelRef.current) gsap.set(labelRef.current, { opacity: 0, y: headingY });
          if (blueLineRef.current) gsap.set(blueLineRef.current, { scaleX: 0, transformOrigin: "left center" });
          const validServiceItems = serviceItemsRef.current.filter(Boolean);
          if (validServiceItems.length > 0) {
            gsap.set(validServiceItems, { opacity: 0, y: servicesY });
          }
          if (headerBtn) gsap.set(headerBtn, { opacity: 0, y: -15 });

          // Master Coordinated Timeline sequence: 1 -> 2 -> 3 -> 4 -> 5 -> 6
          const tl = gsap.timeline({
            delay: introCompleted ? 0.05 : 0.15,
          });

          // STEP 1: Main hero background becomes visible smoothly
          if (bgVisual) {
            tl.to(bgVisual, {
              opacity: 1,
              duration: duration * 0.9,
              ease: "power2.out",
            });
          }

          // STEP 2: Logo/brand mark reveals with a subtle fade + upward movement
          if (logoWrapperRef.current) {
            tl.to(
              logoWrapperRef.current,
              {
                opacity: 1,
                y: 0,
                duration: duration,
                ease: "power3.out",
              },
              "-=0.4"
            );
          }

          // STEP 3: Large hero graphic / visual reveals smoothly
          if (heroVisual) {
            tl.to(
              heroVisual,
              {
                opacity: 1,
                duration: duration * 1.1,
                ease: "power2.out",
              },
              "-=0.5"
            );
          }

          // STEP 4: Main hero heading / scroll indicator enters slightly from bottom
          if (labelRef.current) {
            tl.to(
              labelRef.current,
              {
                opacity: 1,
                y: 0,
                duration: duration * 0.75,
                ease: "power3.out",
              },
              "-=0.4"
            );
          }

          if (blueLineRef.current) {
            tl.to(
              blueLineRef.current,
              {
                scaleX: 1,
                duration: duration * 0.6,
                ease: "power2.out",
              },
              "<0.1"
            );
          }

          // STEP 5: Supporting text/details appear with a small stagger
          if (validServiceItems.length > 0) {
            tl.to(
              validServiceItems.slice().reverse(),
              {
                opacity: 1,
                y: 0,
                duration: duration * 0.7,
                stagger: mobile ? 0.05 : 0.08,
                ease: "power3.out",
              },
              "-=0.25"
            );
          }

          // STEP 6: Header/menu button appears last
          if (headerBtn) {
            tl.to(
              headerBtn,
              {
                opacity: 1,
                y: 0,
                duration: duration * 0.6,
                ease: "power3.out",
              },
              "-=0.2"
            );
          }
        }
      );
    },
    { scope: containerRef, dependencies: [introCompleted] }
  );

  return (
    <section
      ref={containerRef}
      className="hero relative w-full h-[100dvh] min-h-[100vh] min-h-[100svh] pointer-events-auto flex flex-col justify-between select-none !bg-transparent"
    >
      {/* TOP-LEFT: SCROLL TO EXPLORE INDICATOR */}
      <ScrollIndicator labelRef={labelRef} lineRef={blueLineRef} />

      {/* BOTTOM ROW: NORTHFRAME LOGO + SERVICE LIST */}
      <HeroContent
        logoWrapperRef={logoWrapperRef}
        servicesContainerRef={servicesContainerRef}
        serviceItemsRef={serviceItemsRef}
        isMobile={isMobile}
      />
    </section>
  );
}

