"use client";

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface BrandIntroProps {
  onComplete?: () => void;
}

interface SavedBodyStyles {
  overflow: string;
  touchAction: string;
  overscrollBehavior: string;
}

export default function BrandIntro({ onComplete }: BrandIntroProps) {
  const [isVisible, setIsVisible] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const expandingMarkRef = useRef<HTMLDivElement>(null);
  const blueCoverRef = useRef<HTMLDivElement>(null);

  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const finishedRef = useRef(false);
  const savedBodyStylesRef = useRef<SavedBodyStyles | null>(null);

  const restoreBody = useCallback(() => {
    const saved = savedBodyStylesRef.current;
    if (!saved) return;

    document.body.style.overflow = saved.overflow;
    document.body.style.touchAction = saved.touchAction;
    document.body.style.overscrollBehavior = saved.overscrollBehavior;
    savedBodyStylesRef.current = null;
  }, []);

  const finishIntro = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;

    timelineRef.current?.kill();
    timelineRef.current = null;

    restoreBody();

    try {
      sessionStorage.setItem("northframe_intro_seen", "true");
    } catch {
      // sessionStorage can be unavailable in restrictive/private browser modes.
    }

    if (containerRef.current) {
      gsap.set(containerRef.current, { clearProps: "willChange" });
    }

    setIsVisible(false);
    onComplete?.();

    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
  }, [onComplete, restoreBody]);

  useEffect(() => {
    if (!isVisible || finishedRef.current) return;

    const timeoutId = window.setTimeout(() => {
      finishIntro();
    }, 5000);

    return () => window.clearTimeout(timeoutId);
  }, [finishIntro, isVisible]);

  useLayoutEffect(() => {
    if (!isVisible) return;

    try {
      if (sessionStorage.getItem("northframe_intro_seen") === "true") {
        finishIntro();
        return;
      }
    } catch {
      // Continue with the intro when sessionStorage cannot be read.
    }

    savedBodyStylesRef.current = {
      overflow: document.body.style.overflow,
      touchAction: document.body.style.touchAction,
      overscrollBehavior: document.body.style.overscrollBehavior,
    };

    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    document.body.style.overscrollBehavior = "none";

    const container = containerRef.current;
    const frame = frameRef.current;
    const icon = iconRef.current;
    const logo = logoRef.current;
    const expandingMark = expandingMarkRef.current;
    const blueCover = blueCoverRef.current;

    if (!container || !frame || !icon || !logo || !expandingMark || !blueCover) {
      finishIntro();
      return;
    }

    let ctx: gsap.Context | null = null;
    let mm: ReturnType<typeof gsap.matchMedia> | null = null;
    let secondFrame = 0;

    const startAnimation = () => {
      mm = gsap.matchMedia();

      ctx = gsap.context(() => {
        mm?.add(
          {
            mobile: "(max-width: 768px)",
            desktop: "(min-width: 769px)",
            reduceMotion: "(prefers-reduced-motion: reduce)",
          },
          (mediaContext) => {
            const conditions = mediaContext.conditions as {
              mobile: boolean;
              desktop: boolean;
              reduceMotion: boolean;
            };

            const mobile = conditions.mobile;
            const reduceMotion = conditions.reduceMotion;
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const diagonal = Math.hypot(viewportWidth, viewportHeight);
            const markBaseSize = mobile ? 56 : 72;
            const markCoverScale = Math.max(18, (diagonal / markBaseSize) * 2.45);

            gsap.set(container, {
              display: "flex",
              opacity: 1,
              visibility: "visible",
              willChange: "opacity",
            });

            gsap.set(frame, {
              opacity: 0,
              scale: mobile ? 0.9 : 0.88,
              force3D: true,
              transformOrigin: "center center",
            });

            gsap.set(icon, {
              opacity: 0,
              scale: mobile ? 0.84 : 0.82,
              force3D: true,
            });

            gsap.set(logo, {
              opacity: 0,
              y: mobile ? 12 : 18,
              scale: 0.96,
              force3D: true,
            });

            gsap.set(expandingMark, {
              opacity: 0,
              scale: 0.92,
              force3D: true,
              transformOrigin: "center center",
            });

            gsap.set(blueCover, {
              opacity: 0,
            });

            if (reduceMotion) {
              const reducedTl = gsap.timeline({
                onComplete: finishIntro,
              });

              timelineRef.current = reducedTl;

              reducedTl
                .to(logo, {
                  opacity: 1,
                  y: 0,
                  duration: 0.18,
                  ease: "power1.out",
                })
                .to({}, { duration: 0.16 })
                .to(container, {
                  opacity: 0,
                  duration: 0.18,
                  ease: "power1.out",
                });

              return;
            }

            const revealDuration = mobile ? 0.42 : 0.52;
            const logoDuration = mobile ? 0.46 : 0.58;
            const exitDuration = mobile ? 0.22 : 0.28;
            const expansionDuration = mobile ? 0.52 : 0.64;

            const tl = gsap.timeline({
              defaults: {
                overwrite: "auto",
              },
              onComplete: finishIntro,
            });

            timelineRef.current = tl;

            // 1. Clean frame reveal — transform/opacity only for mobile performance.
            tl.to(frame, {
              opacity: 1,
              scale: 1,
              duration: revealDuration,
              ease: "power3.out",
            });

            // 2. Brand icon reveal.
            tl.to(
              icon,
              {
                opacity: 1,
                scale: 1,
                duration: revealDuration,
                ease: "power3.out",
              },
              "-=0.2"
            );

            // 3. Icon gives way to the full NORTHFRAME logo.
            tl.to(icon, {
              opacity: 0,
              scale: 0.94,
              duration: exitDuration,
              ease: "power2.inOut",
            })
              .to(
                logo,
                {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  duration: logoDuration,
                  ease: "power3.out",
                },
                "<0.04"
              )
              .to({}, { duration: mobile ? 0.18 : 0.24 });

            // 4. Logo/frame clear without animating width or height.
            tl.to(logo, {
              opacity: 0,
              y: mobile ? -6 : -8,
              scale: 0.97,
              duration: exitDuration,
              ease: "power2.in",
            }).to(
              frame,
              {
                opacity: 0,
                scale: 1.03,
                duration: exitDuration,
                ease: "power2.in",
              },
              "<"
            );

            // 5. Brand mark expands through the screen, then hands off to blue.
            tl.to(expandingMark, {
              opacity: 1,
              scale: 1,
              duration: mobile ? 0.18 : 0.22,
              ease: "power2.out",
            })
              .to(expandingMark, {
                scale: markCoverScale,
                duration: expansionDuration,
                ease: "expo.in",
                force3D: true,
              })
              .to(
                blueCover,
                {
                  opacity: 1,
                  duration: 0.1,
                  ease: "none",
                },
                `-=${Math.min(0.18, expansionDuration * 0.28)}`
              )
              .to(
                expandingMark,
                {
                  opacity: 0,
                  duration: 0.1,
                  ease: "none",
                },
                "<"
              );

            // 6. Smooth handoff to the actual hero.
            tl.to(container, {
              opacity: 0,
              duration: mobile ? 0.28 : 0.34,
              ease: "power2.out",
            });
          }
        );
      }, container);
    };

    // Two frames avoid the first-frame jump seen on iOS Safari.
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(startAnimation);
    });

    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
      timelineRef.current?.kill();
      timelineRef.current = null;
      mm?.revert();
      ctx?.revert();
      restoreBody();
    };
  }, [finishIntro, isVisible, restoreBody]);

  if (!isVisible) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed inset-0 z-[200] flex w-full h-[100vh] h-[100svh] h-[100dvh] items-center justify-center overflow-hidden select-none touch-none bg-[#070B14]"
      style={{
        WebkitBackfaceVisibility: "hidden",
        backfaceVisibility: "hidden",
      }}
    >
      <div className="absolute inset-0 bg-[#070B14]" />

      <div className="relative z-10 flex h-48 w-full max-w-[92vw] items-center justify-center">
        <div
          ref={frameRef}
          className="intro-brackets-animation absolute h-[66px] sm:h-[72px] w-[min(78vw,300px)] sm:w-[min(78vw,340px)] pointer-events-none opacity-0"
        >
          <span className="absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-[#1677FF]" />
          <span className="absolute right-0 top-0 h-4 w-4 border-r-2 border-t-2 border-[#1677FF]" />
          <span className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-[#1677FF]" />
          <span className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-[#1677FF]" />
        </div>

        <div
          ref={iconRef}
          className="intro-icon-animation absolute z-10 flex items-center justify-center pointer-events-none opacity-0"
        >
          <Image
            src="/images/brand/northframe-icon.webp"
            alt=""
            width={72}
            height={72}
            priority
            sizes="72px"
            className="h-12 w-12 sm:h-16 sm:w-16 object-contain"
          />
        </div>

        <div
          ref={logoRef}
          className="intro-logo-animation absolute z-10 flex items-center justify-center px-4 pointer-events-none opacity-0"
        >
          <Image
            src="/images/brand/northframe-logo.webp"
            alt=""
            width={340}
            height={64}
            priority
            sizes="(max-width: 768px) 72vw, 340px"
            className="h-auto w-[72vw] max-w-[280px] sm:max-w-[340px] object-contain"
          />
        </div>
      </div>

      <div
        ref={expandingMarkRef}
        className="absolute left-1/2 top-1/2 z-20 h-14 w-14 sm:h-[72px] sm:w-[72px] -translate-x-1/2 -translate-y-1/2 pointer-events-none bg-[#1677FF] opacity-0"
        style={{
          WebkitMaskImage: "url('/images/brand/northframe-icon.webp')",
          maskImage: "url('/images/brand/northframe-icon.webp')",
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskPosition: "center",
          maskPosition: "center",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitBackfaceVisibility: "hidden",
          backfaceVisibility: "hidden",
        }}
      />

      <div
        ref={blueCoverRef}
        className="absolute inset-0 z-30 bg-[#1677FF] opacity-0 pointer-events-none"
      />
    </div>
  );
}
