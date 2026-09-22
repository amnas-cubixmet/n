"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { deliverables } from "@/data/deliverables";

gsap.registerPlugin(ScrollTrigger);

export default function DeliverablesSection() {
  const masterRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);

  // Stepped Transition & WOW Overlay Refs
  const wowOverlayRef = useRef<HTMLDivElement>(null);
  const wowStageRef = useRef<HTMLDivElement>(null);

  // WOW Vertical Typography Track Ref
  const wowTrackRef = useRef<HTMLDivElement>(null);

  // Service Track & Item Refs
  const mobileTrackRef = useRef<HTMLDivElement>(null);
  const desktopItemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const mobileItemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Progress Fills
  const progressFillRef = useRef<HTMLDivElement>(null);
  const mobileProgressFillRef = useRef<HTMLDivElement>(null);

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const desktopMediaRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mobileMediaRefs = useRef<(HTMLDivElement | null)[]>([]);
  const desktopDescRef = useRef<HTMLDivElement>(null);
  const mobileDescRef = useRef<HTMLDivElement>(null);

  const prevIndexRef = useRef<number>(0);
  const activeIndexRef = useRef<number>(0);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  // Preload all deliverable images on mount
  useEffect(() => {
    deliverables.forEach((item) => {
      if (item.media && item.mediaType === "image") {
        const img = new window.Image();
        img.src = item.media;
      }
    });
  }, []);

  const handleImageError = (id: number) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  // Center active service item on mobile horizontal rail
  const updateMobileNavigation = useCallback(() => {
    const track = mobileTrackRef.current;
    const active = mobileItemRefs.current[activeIndex];
    if (!track || !active) return;

    if (window.innerWidth < 1024) {
      const viewportWidth = window.innerWidth;
      const activeCenter = active.offsetLeft + active.offsetWidth / 2;
      const targetX = viewportWidth / 2 - activeCenter;

      gsap.to(track, {
        x: targetX,
        duration: 0.4,
        ease: "power3.out",
        overwrite: "auto",
      });
    } else {
      gsap.to(track, { x: 0, duration: 0.3, overwrite: "auto" });
    }
  }, [activeIndex]);

  useEffect(() => {
    updateMobileNavigation();

    const handleResize = () => {
      updateMobileNavigation();
      ScrollTrigger.refresh();
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, [activeIndex, updateMobileNavigation]);

  // Smooth progress bar scale (GPU scaleY on desktop, scaleX on mobile)
  useEffect(() => {
    const targetScale = (activeIndex + 1) / deliverables.length;

    if (progressFillRef.current) {
      gsap.to(progressFillRef.current, {
        scaleY: targetScale,
        duration: 0.4,
        ease: "power2.out",
        overwrite: "auto",
      });
    }

    if (mobileProgressFillRef.current) {
      gsap.to(mobileProgressFillRef.current, {
        scaleX: targetScale,
        duration: 0.4,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  }, [activeIndex]);

  // Unified Media & Description Transition when activeIndex changes
  useEffect(() => {
    const prevIdx = prevIndexRef.current;

    const animateMediaArray = (refs: (HTMLDivElement | null)[]) => {
      refs.forEach((el, index) => {
        if (!el) return;
        if (index === activeIndex) {
          gsap.killTweensOf(el);
          gsap.set(el, {
            visibility: "visible",
            zIndex: 10,
            yPercent: 0,
          });
          gsap.fromTo(
            el,
            { opacity: prevIdx === activeIndex ? 1 : 0, y: 15 },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              ease: "power2.out",
              overwrite: "auto",
            }
          );
        } else {
          gsap.killTweensOf(el);
          gsap.to(el, {
            opacity: 0,
            y: 0,
            duration: 0.4,
            ease: "power2.out",
            overwrite: "auto",
            onComplete: () => {
              gsap.set(el, { visibility: "hidden", zIndex: 1, yPercent: 0 });
            },
          });
        }
      });
    };

    animateMediaArray(desktopMediaRefs.current);
    animateMediaArray(mobileMediaRefs.current);

    // Description subtle fade/translate
    const animateDesc = (descEl: HTMLDivElement | null) => {
      if (!descEl) return;
      gsap.fromTo(
        descEl,
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", overwrite: "auto" }
      );
    };

    animateDesc(desktopDescRef.current);
    animateDesc(mobileDescRef.current);

    prevIndexRef.current = activeIndex;
  }, [activeIndex]);

  // Master Unified ScrollTrigger Timeline
  useGSAP(
    () => {
      if (typeof window === "undefined") return;

      const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (motionQuery.matches) return;

      if (!masterRef.current || !stickyRef.current || !wowOverlayRef.current || !wowTrackRef.current) return;

      const total = deliverables.length;

      // Initial Overlay State: completely below the viewport (yPercent: 100)
      gsap.set(wowOverlayRef.current, { yPercent: 100, autoAlpha: 1 });

      // Initial state of WOW continuous typography track (positioned below the viewport canvas)
      gsap.set(wowTrackRef.current, { yPercent: 100 });

      activeIndexRef.current = activeIndex;

      const masterTL = gsap.timeline({
        scrollTrigger: {
          trigger: masterRef.current,
          start: "top top",
          end: `+=${total * 85 + 450}%`,
          pin: stickyRef.current,
          pinSpacing: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;

            // PHASE 1: 0.00 -> 0.55 Cycles Deliverables 01 -> 07 ONLY
            if (p <= 0.58) {
              const serviceProgress = Math.min(1, p / 0.55);
              const continuousScale = Math.max(
                1 / total,
                Math.min(1, serviceProgress)
              );

              if (progressFillRef.current) {
                gsap.set(progressFillRef.current, { scaleY: continuousScale });
              }
              if (mobileProgressFillRef.current) {
                gsap.set(mobileProgressFillRef.current, { scaleX: continuousScale });
              }

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
        },
      });

      scrollTriggerRef.current = masterTL.scrollTrigger || null;

      // STEP 1: STEPPED BLUE OVERLAY RISES DIRECTLY OVER DELIVERABLES (0.55 -> 0.65)
      masterTL.to(
        wowOverlayRef.current,
        {
          yPercent: 0,
          ease: "none",
          duration: 0.1,
        },
        0.55
      );

      // STEP 2: CONTINUOUS VERTICAL POSTER TRACK ANIMATION (0.60 -> 1.00)
      // The single track moves continuously upward from yPercent: 100 to yPercent: -80,
      // bringing WE -> MAKE -> BRANDS -> GO -> WOOOOOOOOW! through the viewport.
      masterTL.to(
        wowTrackRef.current,
        {
          yPercent: -80,
          ease: "none",
          duration: 0.4,
        },
        0.60
      );
    },
    { scope: masterRef }
  );

  const handleSelectService = (index: number) => {
    setActiveIndex(index);
    activeIndexRef.current = index;

    if (scrollTriggerRef.current) {
      const st = scrollTriggerRef.current;
      const targetProgress = ((index + 0.5) / deliverables.length) * 0.55;
      const targetScroll = st.start + (st.end - st.start) * targetProgress;
      window.scrollTo({ top: targetScroll, behavior: "smooth" });
    }
  };

  // Keyboard navigation when section is focused
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      if (activeIndex < deliverables.length - 1) {
        e.preventDefault();
        handleSelectService(activeIndex + 1);
      }
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      if (activeIndex > 0) {
        e.preventDefault();
        handleSelectService(activeIndex - 1);
      }
    }
  };

  const currentDeliverable = deliverables[activeIndex];

  return (
    <section
      id="deliverables"
      ref={masterRef}
      tabIndex={0}
      aria-label="Deliverables and Showcase"
      onKeyDown={handleKeyDown}
      style={{
        minHeight: `${(deliverables.length + 4) * 95}vh`,
      }}
      className="relative w-full bg-white text-black pointer-events-auto z-20 m-0 p-0 outline-none focus:outline-none overflow-x-hidden"
    >
      {/* STICKY MASTER VIEWPORT CONTAINER (100dvh — PINNED SCROLL) */}
      <div
        ref={stickyRef}
        className="sticky top-0 w-full h-[100dvh] min-h-[100dvh] bg-white overflow-hidden"
      >
        {/* STAGE 1: DELIVERABLES BASE SECTION (PURE WHITE CANVAS #FFFFFF) — Z-INDEX 1 */}
        <div
          className="relative z-1 w-full h-full flex flex-col justify-center px-4 sm:px-8 md:px-12 py-0 bg-white overflow-hidden"
        >
          {/* DESKTOP LAYOUT (>= 1024px) */}
          <div className="hidden lg:grid grid-cols-[1fr_24px_1fr] gap-x-12 xl:gap-x-16 w-full max-w-[1500px] mx-auto items-center min-h-[70vh] my-auto">
            {/* LEFT SIDE — SERVICE TITLES LIST */}
            <div className="flex flex-col items-start gap-8 pr-4 overflow-hidden w-full">
              <nav className="relative w-full overflow-visible">
                <div className="flex flex-col items-start gap-4 w-full">
                  {deliverables.map((item, index) => {
                    const isActive = index === activeIndex;
                    return (
                      <button
                        key={item.id}
                        ref={(el) => {
                          desktopItemRefs.current[index] = el;
                        }}
                        type="button"
                        onClick={() => handleSelectService(index)}
                        aria-current={isActive ? "true" : undefined}
                        className="group flex items-center gap-3 cursor-pointer select-none text-left transition-colors duration-200"
                      >
                        {/* NUMBER */}
                        <span
                          className={`font-mono text-[clamp(16px,1.4vw,22px)] font-bold transition-colors duration-200 ${
                            isActive ? "text-black" : "text-[#D1D1D1]"
                          }`}
                        >
                          {String(item.id).padStart(2, "0")}
                        </span>

                        {/* TITLE — BLACK BG WRAPS ONLY TEXT WIDTH */}
                        <span
                          className={`inline-block font-sans text-[clamp(22px,2.2vw,36px)] leading-none tracking-tight px-3 py-1.5 transition-colors duration-200 ${
                            isActive
                              ? "bg-black text-white"
                              : "bg-transparent text-[#D1D1D1]"
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

            {/* CENTER — VERTICAL PROGRESS BAR & COUNTER BELOW */}
            <div className="flex flex-col items-center justify-between h-[38vh] xl:h-[42vh] self-center">
              <div className="w-[2px] h-full bg-[#E5E5E5] relative overflow-hidden flex-1">
                <div
                  ref={progressFillRef}
                  className="w-full h-full bg-[#1677FF] absolute inset-0 origin-top will-change-transform"
                  style={{
                    transform: `scaleY(${(activeIndex + 1) / deliverables.length})`,
                  }}
                />
              </div>

              <div className="mt-4 flex items-center gap-1 font-mono text-xs text-black">
                <span className="font-bold text-black">
                  {String(activeIndex + 1).padStart(2, "0")}
                </span>
                <span className="text-black/40">—</span>
                <span className="text-black/60">
                  {String(deliverables.length).padStart(2, "0")}
                </span>
              </div>
            </div>

            {/* RIGHT SIDE — DYNAMIC MEDIA PREVIEW FRAME & DESCRIPTION */}
            <div className="flex flex-col items-center justify-center w-full">
              {/* MEDIA FRAME */}
              <div className="relative w-full aspect-[16/10] max-w-[620px] bg-black rounded-sm overflow-hidden shadow-2xl">
                {deliverables.map((item, index) => {
                  const isErr = imageErrors[item.id];
                  return (
                    <div
                      key={item.id}
                      ref={(el) => {
                        desktopMediaRefs.current[index] = el;
                      }}
                      className="absolute inset-0 w-full h-full will-change-transform flex items-center justify-center bg-black"
                      style={{
                        visibility: index === 0 ? "visible" : "hidden",
                        zIndex: index === 0 ? 10 : 1,
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
                          className="w-full h-full object-cover"
                        />
                      ) : isErr || !item.media ? (
                        <div className="w-full h-full flex items-center justify-center bg-[#111111]">
                          <span className="font-pixel text-4xl text-white/30 tracking-widest uppercase">
                            NORTHFRAME
                          </span>
                        </div>
                      ) : (
                        <img
                          src={item.media}
                          alt={item.title}
                          onError={() => handleImageError(item.id)}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* DESCRIPTION TEXT BELOW MEDIA FRAME */}
              <div ref={desktopDescRef} className="w-full max-w-[620px] mt-5 min-h-[60px]">
                <p className="font-sans font-normal text-black/90 text-[clamp(14px,1.1vw,17px)] leading-relaxed text-left">
                  {currentDeliverable.description}
                </p>
              </div>
            </div>
          </div>

          {/* MOBILE LAYOUT (< 1024px) */}
          <div className="lg:hidden flex flex-col justify-between h-full py-4 max-w-[500px] mx-auto w-full">
            {/* TOP BAR — SERVICE NAVIGATION (HORIZONTAL SWIPE RAIL) */}
            <div className="relative w-full overflow-hidden py-1 mb-2">
              <div
                ref={mobileTrackRef}
                className="flex items-center gap-2 w-max transition-transform will-change-transform"
              >
                {deliverables.map((item, index) => {
                  const isActive = index === activeIndex;
                  return (
                    <button
                      key={item.id}
                      ref={(el) => {
                        mobileItemRefs.current[index] = el;
                      }}
                      type="button"
                      onClick={() => handleSelectService(index)}
                      className={`whitespace-nowrap px-3 py-1.5 text-xs sm:text-sm font-sans font-medium transition-colors select-none ${
                        isActive
                          ? "bg-black text-white"
                          : "bg-[#F3F3F3] text-black/60"
                      }`}
                    >
                      <span className="font-mono text-[10px] mr-1.5 opacity-60">
                        {String(item.id).padStart(2, "0")}
                      </span>
                      {item.title}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* HORIZONTAL PROGRESS BAR */}
            <div className="w-full h-[2px] bg-[#E5E5E5] relative overflow-hidden mb-3">
              <div
                ref={mobileProgressFillRef}
                className="h-full w-full bg-[#1677FF] absolute inset-0 origin-left will-change-transform"
                style={{
                  transform: `scaleX(${(activeIndex + 1) / deliverables.length})`,
                }}
              />
            </div>

            {/* MOBILE MEDIA PREVIEW */}
            <div className="relative w-full aspect-[16/10] bg-black rounded-sm overflow-hidden my-auto shadow-lg">
              {deliverables.map((item, index) => {
                const isErr = imageErrors[item.id];
                return (
                  <div
                    key={item.id}
                    ref={(el) => {
                      mobileMediaRefs.current[index] = el;
                    }}
                    className="absolute inset-0 w-full h-full will-change-transform flex items-center justify-center bg-black"
                    style={{
                      visibility: index === 0 ? "visible" : "hidden",
                      zIndex: index === 0 ? 10 : 1,
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
                        className="w-full h-full object-cover"
                      />
                    ) : isErr || !item.media ? (
                      <div className="w-full h-full flex items-center justify-center bg-[#111111]">
                        <span className="font-pixel text-2xl text-white/30 tracking-widest uppercase">
                          NORTHFRAME
                        </span>
                      </div>
                    ) : (
                      <img
                        src={item.media}
                        alt={item.title}
                        onError={() => handleImageError(item.id)}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* DESCRIPTION */}
            <div ref={mobileDescRef} className="min-h-[50px] flex items-start px-0.5 mb-3">
              <p className="font-sans font-normal text-black/90 text-[clamp(12px,3.2vw,14px)] leading-relaxed text-left">
                {currentDeliverable.description}
              </p>
            </div>

            {/* COUNTER */}
            <div className="mt-auto flex items-center justify-center pt-2 border-t border-[#E5E5E5]">
              <div className="flex items-center gap-1 font-mono text-[11px] sm:text-xs">
                <span className="bg-black text-white px-1.5 py-0.5 font-bold">
                  {String(activeIndex + 1).padStart(2, "0")}
                </span>
                <span className="text-black/40">—</span>
                <span className="text-black/60">
                  {String(deliverables.length).padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* STAGE 2: WOW OVERLAY (PHYSICALLY RISES DIRECTLY OVER DELIVERABLES WITH STEPPED TOP EDGE) — Z-INDEX 20 */}
        <div
          ref={wowOverlayRef}
          className="absolute inset-0 z-20 w-full h-[100dvh] min-h-[100dvh] bg-[#1677FF] overflow-hidden translate-y-full select-none"
        >
          {/* STEPPED ARCHITECTURAL BLUE TOP EDGE SHAPE */}
          <div className="absolute bottom-full left-0 w-full h-[30svh] sm:h-[40svh] pointer-events-none z-10 overflow-hidden -mb-[1px]">
            <div
              className="w-full h-full bg-[#1677FF]"
              style={{
                clipPath:
                  "polygon(0% 100%, 0% 24%, 14.28% 24%, 14.28% 42%, 28.56% 42%, 28.56% 26%, 42.84% 26%, 42.84% 31%, 57.12% 31%, 57.12% 35%, 71.4% 35%, 71.4% 23%, 85.68% 23%, 85.68% 48%, 100% 48%, 100% 100%)",
              }}
            />
          </div>

          {/* ACCESSIBLE SCREEN-READER LABEL */}
          <span className="sr-only">We make brands go wooooooooow!</span>

          {/* CONTINUOUS VERTICAL POSTER TRACK CONTAINER — Z-INDEX 30 OVER BLUE VIEWPORT */}
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none overflow-hidden">
            <div
              ref={wowTrackRef}
              className="wow-track relative flex flex-col items-center justify-center text-center gap-4 sm:gap-8 md:gap-12 w-full max-w-full will-change-transform select-none"
            >
              {/* WORD 1: WE */}
              <div className="w-full flex items-center justify-center">
                <span className="font-pixel font-bold text-black text-[clamp(5rem,13vw,14rem)] uppercase tracking-tight leading-[0.85] select-none text-center">
                  WE
                </span>
              </div>

              {/* WORD 2: MAKE */}
              <div className="w-full flex items-center justify-center">
                <span className="font-pixel font-bold text-black text-[clamp(4.5rem,12vw,13rem)] uppercase tracking-tight leading-[0.85] select-none text-center">
                  MAKE
                </span>
              </div>

              {/* WORD 3: BRANDS */}
              <div className="w-full flex items-center justify-center">
                <span className="font-pixel font-bold text-black text-[clamp(3.8rem,10.5vw,11.5rem)] uppercase tracking-tight leading-[0.85] select-none text-center">
                  BRANDS
                </span>
              </div>

              {/* WORD 4: GO */}
              <div className="w-full flex items-center justify-center">
                <span className="font-pixel font-bold text-black text-[clamp(5rem,13vw,14rem)] uppercase tracking-tight leading-[0.85] select-none text-center">
                  GO
                </span>
              </div>

              {/* WORD 5: WOOOOOOOOW! */}
              <div className="w-full flex items-center justify-center overflow-hidden">
                <span className="font-pixel font-bold text-black text-[clamp(3.2rem,9.5vw,11rem)] uppercase tracking-tight leading-[0.85] select-none text-center whitespace-nowrap px-2">
                  WOOOOOOOOW!
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
