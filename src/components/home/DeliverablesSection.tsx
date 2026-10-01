"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
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

  const mobileTrackRef = useRef<HTMLDivElement>(null);
  const mobileItemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const progressFillRef = useRef<HTMLDivElement>(null);
  const mobileProgressFillRef = useRef<HTMLDivElement>(null);

  const mediaRefs = useRef<(HTMLDivElement | null)[]>([]);
  const descRef = useRef<HTMLDivElement>(null);

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

  useLayoutEffect(() => {
    const previousIndex = prevIndexRef.current;
    const compact =
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 1023px), (pointer: coarse)").matches;

    mediaRefs.current.forEach((element, index) => {
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

    if (descRef.current && previousIndex !== activeIndex) {
      const descEl = descRef.current;
      gsap.killTweensOf(descEl);
      gsap.fromTo(
        descEl,
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
    }

    prevIndexRef.current = activeIndex;
  }, [activeIndex]);

  useGSAP(
    () => {
      const master = masterRef.current;
      const sticky = stickyRef.current;
      if (!master || !sticky) return;

      const total = deliverables.length;
      const mm = gsap.matchMedia();

      mm.add(
        {
          phone: "(max-width: 768px)",
          tablet: "(min-width: 769px) and (max-width: 1023px)",
          desktop: "(min-width: 1024px)",
          reduced: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const conditions = context.conditions as {
            phone: boolean;
            tablet: boolean;
            desktop: boolean;
            reduced: boolean;
          };

          const phone = Boolean(conditions.phone);
          const tablet = Boolean(conditions.tablet);
          const desktop = Boolean(conditions.desktop);
          const reduced = Boolean(conditions.reduced);
          const compact = phone || tablet;

          if (reduced) {
            master.style.height = "";
            scrollTriggerRef.current = null;
            gsap.set(progressFillRef.current, {
              scaleY: 1 / total,
            });
            gsap.set(mobileProgressFillRef.current, {
              scaleX: 1 / total,
            });
            return;
          }

          const getPinDistance = () =>
            Math.round(
              Math.max(320, sticky.clientHeight || window.innerHeight) *
                total *
                (phone ? 0.58 : tablet ? 0.68 : 0.88)
            );

          const syncStageHeight = () => {
            master.style.height = compact
              ? `${sticky.clientHeight + getPinDistance()}px`
              : "";
          };

          syncStageHeight();

          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: master,
              start: "top top",
              end: () => `+=${getPinDistance()}`,
              pin: desktop ? sticky : false,
              pinSpacing: desktop,
              scrub: phone ? true : tablet ? 0.08 : 0.45,
              anticipatePin: desktop ? 1 : 0,
              invalidateOnRefresh: true,
              fastScrollEnd: false,
              refreshPriority: 1,
              onRefreshInit: syncStageHeight,
              onUpdate: (self) => {
                const serviceProgress = Math.min(
                  1,
                  Math.max(0, self.progress)
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

                const calculatedIndex = Math.min(
                  total - 1,
                  Math.floor(serviceProgress * total)
                );

                if (calculatedIndex !== activeIndexRef.current) {
                  activeIndexRef.current = calculatedIndex;
                  setActiveIndex(calculatedIndex);
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
          timeline.to({}, { duration: 1 });

          let frameA = 0;
          let frameB = 0;
          frameA = requestAnimationFrame(() => {
            frameB = requestAnimationFrame(() => {
              timeline.scrollTrigger?.refresh();
            });
          });

          return () => {
            cancelAnimationFrame(frameA);
            cancelAnimationFrame(frameB);
            timeline.scrollTrigger?.kill();
            timeline.kill();
            master.style.height = "";
            scrollTriggerRef.current = null;
          };
        }
      );

      return () => {
        mm.revert();
        master.style.height = "";
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
      setActiveIndex(index);
      return;
    }

    const start = scrollTrigger.start;
    const end = scrollTrigger.end;
    const total = deliverables.length;

    const targetProgress = (index + 0.5) / deliverables.length;
    const targetScroll = start + (end - start) * targetProgress;

    window.scrollTo({
      top: targetScroll,
      behavior: "smooth",
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
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
      className="relative z-20 m-0 min-h-[100svh] w-full overflow-x-clip bg-white p-0 text-black outline-none pointer-events-auto"
    >
      <div
        ref={stickyRef}
        className="sticky top-0 h-[100svh] min-h-[100svh] w-full overflow-hidden bg-white lg:relative lg:top-auto lg:h-[100dvh] lg:min-h-[100dvh]"
      >
        <div className="relative z-[1] flex h-full w-full flex-col justify-center overflow-hidden bg-white px-4 py-0 sm:px-8 md:px-12">
          <div className="w-full max-w-[1500px] mx-auto min-h-[72vh] flex flex-col justify-center">
            
            {/* Mobile Header Nav & Progress */}
            <div className="lg:hidden mx-auto flex w-full max-w-[540px] flex-col px-0 pt-[max(0.75rem,env(safe-area-inset-top))] mb-3">
              <div className="mb-2 flex items-center justify-end">
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
            </div>

            {/* Layout Grid */}
            <div className="w-full max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_24px_minmax(0,1.1fr)] items-center gap-x-12 xl:gap-x-16">
              
              {/* Desktop Left Nav */}
              <div className="hidden lg:flex w-full flex-col items-start overflow-hidden pr-4">
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

              {/* Desktop Middle Bar */}
              <div className="hidden lg:flex h-[42vh] flex-col items-center justify-between self-center">
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

              {/* Shared Media Container & Description */}
              <div className="flex w-full flex-col items-center justify-center max-w-[540px] lg:max-w-[650px] mx-auto">
                <div className="relative w-full aspect-[16/10] overflow-hidden bg-black shadow-[0_24px_70px_rgba(0,0,0,0.14)]">
                  {deliverables.map((item, index) => {
                    const isError = imageErrors[item.id];

                    return (
                      <div
                        key={item.id}
                        ref={(element) => {
                          mediaRefs.current[index] = element;
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
                            <span className="font-pixel text-2xl lg:text-4xl uppercase tracking-widest text-white/30">
                              NORTHFRAME
                            </span>
                          </div>
                        ) : (
                          <Image
                            src={item.media}
                            alt={item.alt || item.title}
                            fill
                            sizes="(max-width: 1024px) 100vw, 650px"
                            onError={() => handleImageError(item.id)}
                            className="object-cover"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div
                  ref={descRef}
                  className="mt-3 lg:mt-5 min-h-[70px] lg:min-h-[72px] w-full max-w-[650px]"
                >
                  <p className="max-w-[620px] text-left font-sans text-[clamp(13px,1.1vw,17px)] font-normal leading-relaxed text-black/80">
                    {currentDeliverable.description}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
