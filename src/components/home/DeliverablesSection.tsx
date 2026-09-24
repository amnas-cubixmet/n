"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { deliverables } from "@/data/deliverables";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function DeliverablesSection() {
  const masterRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);

  const wowOverlayRef = useRef<HTMLDivElement>(null);
  const wowTrackRef = useRef<HTMLDivElement>(null);
  const wowExitRef = useRef<HTMLDivElement>(null);
  const wowWordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const wowBlockRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const mobileTrackRef = useRef<HTMLDivElement>(null);
  const mobileItemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const progressFillRef = useRef<HTMLDivElement>(null);
  const mobileProgressFillRef = useRef<HTMLDivElement>(null);

  const desktopMediaRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mobileMediaRefs = useRef<(HTMLDivElement | null)[]>([]);
  const desktopDescRef = useRef<HTMLDivElement>(null);
  const mobileDescRef = useRef<HTMLDivElement>(null);

  const prevIndexRef = useRef(0);
  const activeIndexRef = useRef(0);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const viewportWidthRef = useRef(0);

  const [activeIndex, setActiveIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  useEffect(() => {
    deliverables.forEach((item) => {
      if (item.media && item.mediaType === "image") {
        const image = new window.Image();
        image.src = item.media;
      }
    });
  }, []);

  const handleImageError = (id: number) => {
    setImageErrors((previous) => ({
      ...previous,
      [id]: true,
    }));
  };

  const updateMobileNavigation = useCallback(() => {
    const track = mobileTrackRef.current;
    const active = mobileItemRefs.current[activeIndex];
    if (!track || !active || window.innerWidth >= 1024) return;

    const viewport = track.parentElement;
    const viewportWidth = viewport?.clientWidth ?? window.innerWidth;
    const activeCenter = active.offsetLeft + active.offsetWidth / 2;
    const desiredX = viewportWidth / 2 - activeCenter;
    const minX = Math.min(0, viewportWidth - track.scrollWidth);
    const targetX = Math.max(minX, Math.min(0, desiredX));

    gsap.to(track, {
      x: targetX,
      duration: 0.42,
      ease: "power2.out",
      overwrite: "auto",
      force3D: true,
    });
  }, [activeIndex]);

  useEffect(() => {
    updateMobileNavigation();
  }, [activeIndex, updateMobileNavigation]);

  useEffect(() => {
    viewportWidthRef.current = window.innerWidth;

    let resizeFrame = 0;
    let orientationTimer = 0;

    const handleResize = () => {
      const nextWidth = window.innerWidth;

      // Mobile browser chrome changes only viewport height during scroll.
      // Ignoring those events prevents a ScrollTrigger refresh from moving
      // the browser scrollbar while the user is inside this pinned section.
      if (Math.abs(nextWidth - viewportWidthRef.current) < 2) return;

      viewportWidthRef.current = nextWidth;
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        updateMobileNavigation();
        ScrollTrigger.refresh();
      });
    };

    const handleOrientationChange = () => {
      window.clearTimeout(orientationTimer);
      orientationTimer = window.setTimeout(() => {
        viewportWidthRef.current = window.innerWidth;
        updateMobileNavigation();
        ScrollTrigger.refresh();
      }, 260);
    };

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", handleOrientationChange);

    return () => {
      cancelAnimationFrame(resizeFrame);
      window.clearTimeout(orientationTimer);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, [updateMobileNavigation]);

  useEffect(() => {
    const previousIndex = prevIndexRef.current;
    const compact =
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 1023px), (pointer: coarse)").matches;

    const animateMedia = (refs: (HTMLDivElement | null)[]) => {
      refs.forEach((element, index) => {
        if (!element) return;

        gsap.killTweensOf(element);

        if (index === activeIndex) {
          gsap.set(element, {
            visibility: "visible",
            zIndex: 20,
          });

          if (previousIndex === activeIndex) {
            gsap.set(element, {
              autoAlpha: 1,
              y: 0,
              scale: 1,
            });
            return;
          }

          gsap.fromTo(
            element,
            {
              autoAlpha: 0,
              y: compact ? 8 : 12,
              scale: compact ? 0.997 : 0.994,
            },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: compact ? 0.32 : 0.44,
              ease: "power2.out",
              overwrite: "auto",
              force3D: true,
            }
          );

          return;
        }

        if (index === previousIndex) {
          gsap.to(element, {
            autoAlpha: 0,
            y: compact ? -4 : -6,
            duration: compact ? 0.28 : 0.34,
            ease: "power2.out",
            overwrite: "auto",
            force3D: true,
            onComplete: () => {
              gsap.set(element, {
                visibility: "hidden",
                zIndex: 1,
                y: 0,
                scale: 1,
              });
            },
          });
          return;
        }

        gsap.set(element, {
          autoAlpha: 0,
          visibility: "hidden",
          zIndex: 1,
          y: 0,
          scale: 1,
        });
      });
    };

    animateMedia(desktopMediaRefs.current);
    animateMedia(mobileMediaRefs.current);

    const animateDescription = (element: HTMLDivElement | null) => {
      if (!element || previousIndex === activeIndex) return;

      gsap.killTweensOf(element);
      gsap.fromTo(
        element,
        {
          autoAlpha: 0,
          y: compact ? 4 : 6,
        },
        {
          autoAlpha: 1,
          y: 0,
          duration: compact ? 0.3 : 0.4,
          ease: "power2.out",
          overwrite: "auto",
          force3D: true,
        }
      );
    };

    animateDescription(desktopDescRef.current);
    animateDescription(mobileDescRef.current);

    prevIndexRef.current = activeIndex;
  }, [activeIndex]);

  useGSAP(
    () => {
      if (
        typeof window === "undefined" ||
        !masterRef.current ||
        !stickyRef.current ||
        !wowOverlayRef.current ||
        !wowTrackRef.current ||
        !wowExitRef.current
      ) {
        return;
      }

      const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (motionQuery.matches) return;

      const total = deliverables.length;
      const compact = window.matchMedia(
        "(max-width: 1023px), (pointer: coarse)"
      ).matches;

      const servicePhaseEnd = compact ? 0.7 : 0.68;
      // The pinned element uses 100svh on phones, so browser chrome does not
      // change its height during scrolling. Orientation refreshes can still
      // measure its new size and update the travel distance.
      const getPinDistance = () =>
        Math.round(
          Math.max(320, stickyRef.current?.clientHeight ?? window.innerHeight) *
            (compact ? total * 0.72 + 2.8 : total * 0.84 + 3.1)
        );

      gsap.set(wowOverlayRef.current, {
        yPercent: 108,
        autoAlpha: 1,
        force3D: true,
      });

      gsap.set(wowTrackRef.current, {
        yPercent: compact ? 38 : 34,
        force3D: true,
      });

      gsap.set(wowExitRef.current, {
        yPercent: 112,
        autoAlpha: 1,
        force3D: true,
      });

      wowBlockRefs.current.forEach((block) => {
        if (!block) return;
        gsap.set(block, {
          scaleX: 0,
          transformOrigin: "left center",
        });
      });

      wowWordRefs.current.forEach((word) => {
        if (!word) return;
        gsap.set(word, {
          color: "#000000",
        });
      });

      activeIndexRef.current = activeIndex;

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: masterRef.current,
          start: "top top",
          end: () => `+=${getPinDistance()}`,
          pin: stickyRef.current,
          pinSpacing: true,
          scrub: compact ? 0.3 : 0.45,
          anticipatePin: 1,
          invalidateOnRefresh: false,
          fastScrollEnd: false,
          onUpdate: (self) => {
            const serviceProgress = Math.min(
              1,
              Math.max(0, self.progress / servicePhaseEnd)
            );

            const continuousScale = Math.max(
              1 / total,
              serviceProgress
            );

            if (progressFillRef.current) {
              gsap.set(progressFillRef.current, {
                scaleY: continuousScale,
              });
            }

            if (mobileProgressFillRef.current) {
              gsap.set(mobileProgressFillRef.current, {
                scaleX: continuousScale,
              });
            }

            if (self.progress <= servicePhaseEnd) {
              const calculatedIndex = Math.min(
                total - 1,
                Math.floor(serviceProgress * total)
              );

              if (calculatedIndex !== activeIndexRef.current) {
                activeIndexRef.current = calculatedIndex;
                setActiveIndex(calculatedIndex);
              }
            }
          },
          onLeave: () => {
            activeIndexRef.current = total - 1;
            setActiveIndex(total - 1);
          },
          onLeaveBack: () => {
            activeIndexRef.current = 0;
            setActiveIndex(0);
          },
        },
      });

      scrollTriggerRef.current = timeline.scrollTrigger ?? null;

      // Signature WOW takeover: stepped magenta block rises over the
      // Deliverables stage, then the stacked statement travels upward.
      timeline.to(
        wowOverlayRef.current,
        {
          yPercent: 0,
          duration: compact ? 0.12 : 0.115,
          ease: "none",
          force3D: true,
        },
        compact ? 0.69 : 0.685
      );

      timeline.to(
        wowTrackRef.current,
        {
          yPercent: compact ? -31 : -27,
          duration: compact ? 0.235 : 0.245,
          ease: "none",
          force3D: true,
        },
        compact ? 0.735 : 0.73
      );

      const highlightStarts = compact
        ? [0.755, 0.79, 0.825, 0.86, 0.895]
        : [0.75, 0.785, 0.82, 0.855, 0.89];

      highlightStarts.forEach((position, index) => {
        const block = wowBlockRefs.current[index];
        const word = wowWordRefs.current[index];
        if (!block || !word) return;

        timeline.to(
          block,
          {
            scaleX: 1,
            duration: 0.028,
            ease: "none",
            transformOrigin: "left center",
          },
          position
        );

        timeline.to(
          word,
          {
            color: "#FFFFFF",
            duration: 0.012,
            ease: "none",
          },
          position + 0.01
        );

        if (index < highlightStarts.length - 1) {
          timeline.to(
            block,
            {
              scaleX: 0,
              duration: 0.026,
              ease: "none",
              transformOrigin: "right center",
            },
            position + 0.055
          );

          timeline.to(
            word,
            {
              color: "#000000",
              duration: 0.012,
              ease: "none",
            },
            position + 0.055
          );
        }
      });

      // Black stepped block takes over at the end so the pinned sequence
      // hands off seamlessly into the black Our Vision section.
      timeline.to(
        wowExitRef.current,
        {
          yPercent: 0,
          duration: compact ? 0.085 : 0.08,
          ease: "none",
          force3D: true,
        },
        compact ? 0.925 : 0.92
      );

      return () => {
        scrollTriggerRef.current = null;
      };
    },
    {
      scope: masterRef,
    }
  );

  const handleSelectService = (index: number) => {
    const scrollTrigger = scrollTriggerRef.current;

    if (!scrollTrigger) {
      activeIndexRef.current = index;
      setActiveIndex(index);
      return;
    }

    const compact = window.matchMedia(
      "(max-width: 1023px), (pointer: coarse)"
    ).matches;
    const servicePhaseEnd = compact ? 0.7 : 0.68;

    const targetProgress =
      ((index + 0.5) / deliverables.length) * servicePhaseEnd;

    const targetScroll =
      scrollTrigger.start +
      (scrollTrigger.end - scrollTrigger.start) * targetProgress;

    // Do not change activeIndex immediately. The scroll itself owns the state,
    // so clicking a rail item never causes the media/rail to jump ahead.
    window.scrollTo({
      top: targetScroll,
      behavior: "smooth",
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (
      (event.key === "ArrowDown" || event.key === "ArrowRight") &&
      activeIndex < deliverables.length - 1
    ) {
      event.preventDefault();
      handleSelectService(activeIndex + 1);
    }

    if (
      (event.key === "ArrowUp" || event.key === "ArrowLeft") &&
      activeIndex > 0
    ) {
      event.preventDefault();
      handleSelectService(activeIndex - 1);
    }
  };

  const currentDeliverable = deliverables[activeIndex];

  return (
    <section
      id="deliverables"
      ref={masterRef}
      tabIndex={0}
      aria-label="Deliverables and showcase"
      onKeyDown={handleKeyDown}
      className="relative z-20 m-0 min-h-[100svh] w-full overflow-x-hidden bg-white p-0 text-black outline-none pointer-events-auto"
    >
      <div
        ref={stickyRef}
        className="relative h-[100svh] min-h-[100svh] w-full overflow-hidden bg-white lg:h-[100dvh] lg:min-h-[100dvh]"
      >
        <div className="relative z-[1] flex h-full w-full flex-col justify-center overflow-hidden bg-white px-4 py-0 sm:px-8 md:px-12">
          <div className="hidden lg:grid w-full max-w-[1500px] mx-auto grid-cols-[minmax(0,0.9fr)_24px_minmax(0,1.1fr)] items-center gap-x-12 xl:gap-x-16 min-h-[72vh]">
            <div className="flex w-full flex-col items-start overflow-hidden pr-4">
              <span className="mb-6 inline-block bg-black px-1.5 py-[2px] font-mono text-[10px] font-semibold uppercase leading-none tracking-[0.08em] text-white">
                DELIVERABLES
              </span>

              <nav className="relative w-full overflow-visible" aria-label="Deliverable services">
                <div className="flex w-full flex-col items-start gap-3.5">
                  {deliverables.map((item, index) => {
                    const isActive = index === activeIndex;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectService(index)}
                        aria-current={isActive ? "true" : undefined}
                        className="group flex min-h-[44px] items-center gap-3 text-left select-none"
                      >
                        <span
                          className={`font-mono text-[clamp(14px,1.2vw,20px)] font-bold transition-colors duration-300 ${
                            isActive ? "text-black" : "text-black/20"
                          }`}
                        >
                          {String(item.id).padStart(2, "0")}
                        </span>

                        <span
                          className={`inline-block px-2.5 py-1.5 font-sans text-[clamp(20px,2vw,34px)] leading-none tracking-tight transition-[color,background-color,transform] duration-300 ${
                            isActive
                              ? "translate-x-0 bg-black text-white"
                              : "translate-x-0 bg-transparent text-black/20 lg:group-hover:text-black/45"
                          }`}
                        >
                          {item.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </nav>
            </div>

            <div className="flex h-[42vh] flex-col items-center justify-between self-center">
              <div className="relative flex-1 w-[2px] overflow-hidden bg-[#E7E7E7]">
                <div
                  ref={progressFillRef}
                  className="absolute inset-0 h-full w-full origin-top bg-[#1677FF] will-change-transform"
                  style={{
                    transform: `scaleY(${1 / deliverables.length})`,
                  }}
                />
              </div>

              <div className="mt-4 flex items-center gap-1 font-mono text-xs text-black">
                <span className="font-bold">
                  {String(activeIndex + 1).padStart(2, "0")}
                </span>
                <span className="text-black/30">—</span>
                <span className="text-black/50">
                  {String(deliverables.length).padStart(2, "0")}
                </span>
              </div>
            </div>

            <div className="flex w-full flex-col items-center justify-center">
              <div className="relative w-full max-w-[650px] aspect-[16/10] overflow-hidden bg-black shadow-[0_24px_70px_rgba(0,0,0,0.14)]">
                {deliverables.map((item, index) => {
                  const isError = imageErrors[item.id];

                  return (
                    <div
                      key={item.id}
                      ref={(element) => {
                        desktopMediaRefs.current[index] = element;
                      }}
                      className="absolute inset-0 flex h-full w-full items-center justify-center bg-black will-change-transform"
                      style={{
                        visibility: index === 0 ? "visible" : "hidden",
                        zIndex: index === 0 ? 20 : 1,
                        opacity: index === 0 ? 1 : 0,
                      }}
                    >
                      {item.mediaType === "video" ? (
                        <video
                          src={item.media}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="h-full w-full object-cover"
                        />
                      ) : isError || !item.media ? (
                        <div className="flex h-full w-full items-center justify-center bg-[#111]">
                          <span className="font-pixel text-4xl uppercase tracking-widest text-white/30">
                            NORTHFRAME
                          </span>
                        </div>
                      ) : (
                        <Image
                          src={item.media}
                          alt={item.alt || item.title}
                          fill
                          sizes="50vw"
                          onError={() => handleImageError(item.id)}
                          className="object-cover"
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <div
                ref={desktopDescRef}
                className="mt-5 min-h-[72px] w-full max-w-[650px]"
              >
                <p className="max-w-[620px] text-left font-sans text-[clamp(14px,1.1vw,17px)] font-normal leading-relaxed text-black/80">
                  {currentDeliverable.description}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:hidden mx-auto flex h-full w-full max-w-[540px] flex-col px-0 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))]">
            <div className="mb-2 flex items-center justify-between">
              <span className="inline-block bg-black px-1.5 py-[2px] font-mono text-[9px] font-semibold uppercase leading-none tracking-[0.08em] text-white">
                DELIVERABLES
              </span>

              <div className="flex items-center gap-1 font-mono text-[10px]">
                <span className="font-bold text-black">
                  {String(activeIndex + 1).padStart(2, "0")}
                </span>
                <span className="text-black/30">—</span>
                <span className="text-black/50">
                  {String(deliverables.length).padStart(2, "0")}
                </span>
              </div>
            </div>

            <div className="relative w-full overflow-hidden py-1">
              <div
                ref={mobileTrackRef}
                className="flex w-max items-center gap-1.5 will-change-transform"
              >
                {deliverables.map((item, index) => {
                  const isActive = index === activeIndex;

                  return (
                    <button
                      key={item.id}
                      ref={(element) => {
                        mobileItemRefs.current[index] = element;
                      }}
                      type="button"
                      onClick={() => handleSelectService(index)}
                      aria-current={isActive ? "true" : undefined}
                      className={`min-h-[44px] whitespace-nowrap px-2.5 py-1.5 font-sans text-xs font-medium transition-colors duration-300 select-none sm:text-sm ${
                        isActive
                          ? "bg-black text-white"
                          : "bg-transparent text-black/40"
                      }`}
                    >
                      {item.title}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="relative mt-2 h-[2px] w-full overflow-hidden bg-[#E7E7E7]">
              <div
                ref={mobileProgressFillRef}
                className="absolute inset-0 h-full w-full origin-left bg-[#1677FF] will-change-transform"
                style={{
                  transform: `scaleX(${1 / deliverables.length})`,
                }}
              />
            </div>

            <div className="relative my-auto w-full aspect-[16/10] overflow-hidden bg-black">
              {deliverables.map((item, index) => {
                const isError = imageErrors[item.id];

                return (
                  <div
                    key={item.id}
                    ref={(element) => {
                      mobileMediaRefs.current[index] = element;
                    }}
                    className="absolute inset-0 flex h-full w-full items-center justify-center bg-black will-change-transform"
                    style={{
                      visibility: index === 0 ? "visible" : "hidden",
                      zIndex: index === 0 ? 20 : 1,
                      opacity: index === 0 ? 1 : 0,
                    }}
                  >
                    {item.mediaType === "video" ? (
                      <video
                        src={item.media}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="h-full w-full object-cover"
                      />
                    ) : isError || !item.media ? (
                      <div className="flex h-full w-full items-center justify-center bg-[#111]">
                        <span className="font-pixel text-2xl uppercase tracking-widest text-white/30">
                          NORTHFRAME
                        </span>
                      </div>
                    ) : (
                      <Image
                        src={item.media}
                        alt={item.alt || item.title}
                        fill
                        sizes="100vw"
                        onError={() => handleImageError(item.id)}
                        className="object-cover"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div
              ref={mobileDescRef}
              className="mb-2 min-h-[70px] px-0.5"
            >
              <p className="text-left font-sans text-[clamp(12px,3.2vw,14px)] font-normal leading-[1.45] text-black/80">
                {currentDeliverable.description}
              </p>
            </div>
          </div>
        </div>

        <div
          ref={wowOverlayRef}
          className="absolute inset-0 z-20 h-[100svh] min-h-[100svh] w-full translate-y-full overflow-hidden bg-[#F000E8] select-none lg:h-[100dvh] lg:min-h-[100dvh]"
        >
          <div className="pointer-events-none absolute bottom-full left-0 z-10 -mb-[1px] h-[30svh] w-full overflow-hidden sm:h-[40svh]">
            <div
              className="h-full w-full bg-[#F000E8]"
              style={{
                clipPath:
                  "polygon(0% 100%, 0% 24%, 14.28% 24%, 14.28% 42%, 28.56% 42%, 28.56% 26%, 42.84% 26%, 42.84% 31%, 57.12% 31%, 57.12% 35%, 71.4% 35%, 71.4% 23%, 85.68% 23%, 85.68% 48%, 100% 48%, 100% 100%)",
              }}
            />
          </div>

          <span className="sr-only">We make brands go wooooooooow!</span>

          <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center overflow-hidden">
            <div
              ref={wowTrackRef}
              className="wow-track relative flex w-full max-w-full flex-col items-center justify-center gap-[0.02em] text-center will-change-transform select-none"
            >
              {["WE", "MAKE", "BRANDS", "GO", "WOOOOOOOOW!"].map(
                (word, index) => (
                  <div
                    key={word}
                    className="flex w-full items-center justify-center overflow-visible"
                  >
                    <span
                      className={`relative inline-block max-w-[98vw] px-[0.035em] font-pixel font-bold uppercase leading-[0.82] tracking-[-0.045em] text-black ${
                        index === 4
                          ? "whitespace-nowrap text-[clamp(2.7rem,11.5vw,11rem)]"
                          : word === "BRANDS"
                            ? "text-[clamp(4rem,12vw,12.5rem)]"
                            : "text-[clamp(4.8rem,14vw,14rem)]"
                      }`}
                    >
                      <span
                        ref={(element) => {
                          wowBlockRefs.current[index] = element;
                        }}
                        aria-hidden="true"
                        className="absolute inset-0 z-0 origin-left scale-x-0 bg-black"
                      />

                      <span
                        ref={(element) => {
                          wowWordRefs.current[index] = element;
                        }}
                        className="relative z-10"
                      >
                        {word}
                      </span>
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        <div
          ref={wowExitRef}
          aria-hidden="true"
          className="absolute inset-0 z-[60] h-[100svh] min-h-[100svh] w-full translate-y-full bg-black lg:h-[100dvh] lg:min-h-[100dvh]"
        >
          <div className="pointer-events-none absolute bottom-full left-0 -mb-[1px] h-[22svh] w-full overflow-hidden sm:h-[28svh]">
            <div
              className="h-full w-full bg-black"
              style={{
                clipPath:
                  "polygon(0% 100%, 0% 62%, 13% 62%, 13% 36%, 30% 36%, 30% 72%, 47% 72%, 47% 48%, 64% 48%, 64% 78%, 80% 78%, 80% 44%, 100% 44%, 100% 100%)",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
