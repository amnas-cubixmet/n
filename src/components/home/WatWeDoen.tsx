"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { TransitionLink } from "@/components/navigation/PageTransitionProvider";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { services } from "@/data/services";
import { useMobileMotionReady } from "@/components/motion/useMobileMotionReady";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CLOSED_STEPS =
  "polygon(0% 100%, 0% 100%, 20% 100%, 20% 100%, 40% 100%, 40% 100%, 60% 100%, 60% 100%, 80% 100%, 80% 100%, 100% 100%, 100% 100%)";

const OPEN_STEPS =
  "polygon(0% 100%, 0% 0%, 20% 0%, 20% -12%, 40% -12%, 40% -24%, 60% -24%, 60% -36%, 80% -36%, 80% -48%, 100% -48%, 100% 100%)";

export default function WatWeDoen() {
  const wrapperRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<(HTMLElement | null)[]>([]);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const viewportWidthRef = useRef(0);
  const motionReady = useMobileMotionReady();

  useEffect(() => {
    viewportWidthRef.current = window.innerWidth;
    let resizeFrame = 0;
    let orientationTimer = 0;

    const refreshForWidthChange = () => {
      const nextWidth = window.innerWidth;
      if (Math.abs(nextWidth - viewportWidthRef.current) < 2) return;

      viewportWidthRef.current = nextWidth;
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    };

    const refreshForOrientation = () => {
      window.clearTimeout(orientationTimer);
      orientationTimer = window.setTimeout(() => {
        viewportWidthRef.current = window.innerWidth;
        ScrollTrigger.refresh();
      }, 280);
    };

    window.addEventListener("resize", refreshForWidthChange, { passive: true });
    window.addEventListener("orientationchange", refreshForOrientation);

    return () => {
      cancelAnimationFrame(resizeFrame);
      window.clearTimeout(orientationTimer);
      window.removeEventListener("resize", refreshForWidthChange);
      window.removeEventListener("orientationchange", refreshForOrientation);
    };
  }, []);

  useEffect(() => {
    if (!motionReady || window.innerWidth >= 1024) return;

    const wrapper = wrapperRef.current;
    const sticky = stickyRef.current;
    if (!wrapper || !sticky) return;

    const panels = panelsRef.current.filter(
      (panel): panel is HTMLElement => Boolean(panel)
    );
    if (panels.length !== services.length) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let frame = 0;
    let orientationTimer = 0;
    let viewportHeight = Math.max(
      320,
      sticky.clientHeight || window.innerHeight
    );

    const introHold = 0.62;
    const revealSpan = 0.72;
    const totalSegments = introHold + Math.max(1, services.length - 1);
    let scrollDistance = 0;

    const clamp01 = (value: number) =>
      Math.min(1, Math.max(0, value));

    const stepClip = (progress: number) => {
      const p = clamp01(progress);
      const y0 = 100 + (0 - 100) * p;
      const y1 = 100 + (-12 - 100) * p;
      const y2 = 100 + (-24 - 100) * p;
      const y3 = 100 + (-36 - 100) * p;
      const y4 = 100 + (-48 - 100) * p;

      return `polygon(
        0% 100%,
        0% ${y0}%,
        20% ${y0}%,
        20% ${y1}%,
        40% ${y1}%,
        40% ${y2}%,
        60% ${y2}%,
        60% ${y3}%,
        80% ${y3}%,
        80% ${y4}%,
        100% ${y4}%,
        100% 100%
      )`;
    };

    const setStageHeight = () => {
      viewportHeight = Math.max(
        320,
        sticky.clientHeight || window.innerHeight
      );
      scrollDistance = Math.round(
        viewportHeight * totalSegments * 0.72
      );
      wrapper.style.height = `${viewportHeight + scrollDistance}px`;
    };

    const applyTextReveal = (
      panel: HTMLElement,
      progress: number
    ) => {
      const textItems = Array.from(
        panel.querySelectorAll<HTMLElement>(".service-mobile-text")
      );

      textItems.forEach((item, textIndex) => {
        const start = 0.12 + textIndex * 0.055;
        const local = clamp01((progress - start) / 0.36);
        const y = (1 - local) * 18;
        const hidden = (1 - local) * 100;

        item.style.transform = `translate3d(0, ${y}px, 0)`;
        item.style.clipPath = `inset(0% 0% ${hidden}% 0%)`;
        item.style.setProperty("-webkit-clip-path", `inset(0% 0% ${hidden}% 0%)`);
      });
    };

    const update = () => {
      frame = 0;

      const rect = wrapper.getBoundingClientRect();
      const rawProgress =
        scrollDistance > 0 ? -rect.top / scrollDistance : 0;
      const sectionProgress = clamp01(rawProgress);
      const position = sectionProgress * totalSegments;

      panels.forEach((panel, index) => {
        const image = imagesRef.current[index];

        panel.style.zIndex = String(10 + index);
        panel.style.opacity = "1";
        panel.style.visibility = "visible";
        panel.style.transform = "translate3d(0,0,0)";

        if (reduced) {
          const activeIndex = Math.min(
            services.length - 1,
            Math.max(0, Math.round(sectionProgress * (services.length - 1)))
          );
          panel.style.clipPath =
            index === activeIndex ? "inset(0)" : CLOSED_STEPS;
          panel.style.webkitClipPath =
            index === activeIndex ? "inset(0)" : CLOSED_STEPS;
          panel.style.visibility =
            index === activeIndex ? "visible" : "hidden";

          const textItems = panel.querySelectorAll<HTMLElement>(
            ".service-mobile-text"
          );
          textItems.forEach((item) => {
            item.style.transform = "translate3d(0,0,0)";
            item.style.clipPath = "inset(0)";
            item.style.setProperty("-webkit-clip-path", "inset(0)");
          });
          return;
        }

        if (index === 0) {
          panel.style.clipPath = "inset(0)";
          panel.style.setProperty("-webkit-clip-path", "inset(0)");

          const firstTextProgress = clamp01(position / introHold);
          applyTextReveal(panel, firstTextProgress);

          if (image) {
            const scale = 1.035 - 0.035 * firstTextProgress;
            image.style.transform = `scale(${scale}) translateZ(0)`;
          }
          return;
        }

        const segmentStart = introHold + (index - 1);
        const reveal = clamp01(
          (position - segmentStart) / revealSpan
        );
        const clip = stepClip(reveal);

        panel.style.clipPath = clip;
        panel.style.setProperty("-webkit-clip-path", clip);
        applyTextReveal(panel, reveal);

        if (image) {
          const scale = 1 + 0.022 * reveal;
          image.style.transform = `scale(${scale}) translateZ(0)`;
        }
      });
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    setStageHeight();
    update();

    window.addEventListener("scroll", requestUpdate, { passive: true });

    const handleOrientation = () => {
      window.clearTimeout(orientationTimer);
      orientationTimer = window.setTimeout(() => {
        setStageHeight();
        update();
      }, 320);
    };

    window.addEventListener("orientationchange", handleOrientation);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(orientationTimer);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("orientationchange", handleOrientation);
      wrapper.style.height = "";

      panels.forEach((panel, index) => {
        panel.style.removeProperty("clip-path");
        panel.style.removeProperty("-webkit-clip-path");
        panel.style.removeProperty("transform");
        panel.style.removeProperty("opacity");
        panel.style.removeProperty("visibility");
        panel.style.removeProperty("z-index");

        panel
          .querySelectorAll<HTMLElement>(".service-mobile-text")
          .forEach((item) => {
            item.style.removeProperty("transform");
            item.style.removeProperty("clip-path");
            item.style.removeProperty("-webkit-clip-path");
          });

        const image = imagesRef.current[index];
        image?.style.removeProperty("transform");
      });
    };
  }, [motionReady]);

  useGSAP(
    () => {
      if (!motionReady || window.innerWidth < 1024) return;

      const wrapper = wrapperRef.current;
      const sticky = stickyRef.current;
      if (!wrapper || !sticky) return;

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
          const mobile = phone || tablet;
          const reduced = Boolean(conditions.reduced);
          const panelCount = services.length;
          const revealDuration = phone ? 0.68 : tablet ? 0.74 : 0.86;
          const introSegment = reduced ? 0.2 : phone ? 0.48 : tablet ? 0.55 : 1.2;

          const getScrollDistance = () =>
            Math.round(
              sticky.clientHeight *
                (panelCount + introSegment - 1) *
                (reduced ? 0.72 : phone ? 0.58 : tablet ? 0.68 : 1.22)
            );

          const syncMobileStageHeight = () => {
            if (mobile) {
              wrapper.style.height = `${sticky.clientHeight + getScrollDistance()}px`;
            } else {
              wrapper.style.height = "";
            }
          };

          syncMobileStageHeight();

          panelsRef.current.forEach((panel, index) => {
            if (!panel) return;

            if (reduced) {
              gsap.set(panel, {
                inset: 0,
                clipPath: "inset(0)",
                WebkitClipPath: "inset(0)",
                yPercent: 0,
                autoAlpha: index === 0 ? 1 : 0,
                zIndex: 10 + index,
                force3D: true,
                willChange: "opacity",
              });
            } else {
              gsap.set(panel, {
                inset: 0,
                clipPath: index === 0 ? "inset(0)" : CLOSED_STEPS,
                WebkitClipPath: index === 0 ? "inset(0)" : CLOSED_STEPS,
                yPercent: 0,
                autoAlpha: 1,
                zIndex: 10 + index,
                force3D: true,
                willChange: "clip-path",
              });
            }

            const image = imagesRef.current[index];
            if (image) {
              gsap.set(image, {
                scale: !reduced && index === 0 ? 1.035 : 1,
                transformOrigin: "center center",
                force3D: true,
                willChange: reduced ? "auto" : "transform",
              });
            }

            const mobileText = panel.querySelectorAll<HTMLElement>(
              ".service-mobile-text"
            );

            if (mobile && !reduced) {
              gsap.set(mobileText, {
                y: phone ? 18 : 22,
                clipPath: "inset(0% 0% 100% 0%)",
                WebkitClipPath: "inset(0% 0% 100% 0%)",
                force3D: true,
                willChange: "transform,clip-path",
              });
            }

            if (index === 0 && !mobile) {
              const introText = panel.querySelectorAll(".first-service-intro");
              gsap.set(introText, {
                y: reduced ? 0 : 22,
                autoAlpha: reduced ? 1 : 0,
                force3D: true,
              });
            }
          });

          const timeline = gsap.timeline({
            defaults: {
              overwrite: "auto",
            },
            scrollTrigger: {
              trigger: wrapper,
              start: "top top",
              end: () => `+=${getScrollDistance()}`,
              pin: mobile ? false : sticky,
              pinSpacing: mobile ? false : true,
              scrub: reduced ? true : phone ? true : tablet ? 0.08 : 0.5,
              anticipatePin: mobile ? 0 : 1,
              invalidateOnRefresh: true,
              fastScrollEnd: false,
              refreshPriority: 2,
              onRefreshInit: syncMobileStageHeight,
            },
          });

          services.forEach((_, index) => {
            const panel = panelsRef.current[index];
            const image = imagesRef.current[index];
            if (!panel) return;

            if (index === 0) {
              const introText = panel.querySelectorAll(".first-service-intro");
              const mobileText = panel.querySelectorAll<HTMLElement>(
                ".service-mobile-text"
              );

              if (!reduced) {
                if (image) {
                  timeline.to(
                    image,
                    {
                      scale: 1,
                      duration: 0.58,
                      ease: "power2.out",
                      force3D: true,
                    },
                    0
                  );
                }

                if (mobile) {
                  timeline.to(
                    mobileText,
                    {
                      y: 0,
                      clipPath: "inset(0% 0% 0% 0%)",
                      WebkitClipPath: "inset(0% 0% 0% 0%)",
                      duration: phone ? 0.42 : 0.5,
                      stagger: phone ? 0.045 : 0.055,
                      ease: "power3.out",
                      force3D: true,
                    },
                    0.06
                  );
                } else {
                  timeline.to(
                    introText,
                    {
                      y: 0,
                      autoAlpha: 1,
                      duration: 0.48,
                      ease: "power3.out",
                      force3D: true,
                    },
                    0.08
                  );
                }
              }

              // Reserve the first scroll movement for the BRAND IDENTITY intro.
              // The next service panel does not start revealing until this finishes.
              timeline.to({}, { duration: introSegment }, 0);
              return;
            }

            const segmentStart = introSegment + (index - 1);

            if (reduced) {
              // Respect Reduce Motion without falling back to the old stacked
              // card layout: keep the pinned showcase and use a tiny crossfade.
              timeline.to(
                panel,
                {
                  autoAlpha: 1,
                  duration: 0.12,
                  ease: "none",
                },
                segmentStart
              );
            } else {
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
            }

            if (!reduced && mobile) {
              const mobileText = panel.querySelectorAll<HTMLElement>(
                ".service-mobile-text"
              );

              timeline.to(
                mobileText,
                {
                  y: 0,
                  clipPath: "inset(0% 0% 0% 0%)",
                  WebkitClipPath: "inset(0% 0% 0% 0%)",
                  duration: phone ? 0.4 : 0.48,
                  stagger: phone ? 0.04 : 0.05,
                  ease: "power3.out",
                  force3D: true,
                },
                segmentStart + revealDuration * 0.26
              );
            }

            if (!reduced && image) {
              timeline.to(
                image,
                {
                  scale: phone ? 1.022 : tablet ? 1.032 : 1.095,
                  duration: 1,
                  ease: "none",
                  force3D: true,
                },
                segmentStart
              );
            }

            timeline.to(
              {},
              {
                duration: reduced
                  ? 0.88
                  : Math.max(0.12, 1 - revealDuration),
              },
              segmentStart + (reduced ? 0.12 : revealDuration)
            );
          });

          let firstFrame = 0;
          let secondFrame = 0;

          firstFrame = requestAnimationFrame(() => {
            secondFrame = requestAnimationFrame(() => {
              ScrollTrigger.refresh();
            });
          });

          return () => {
            cancelAnimationFrame(firstFrame);
            cancelAnimationFrame(secondFrame);
            wrapper.style.height = "";
            timeline.scrollTrigger?.kill();
            timeline.kill();

            panelsRef.current.forEach((panel, index) => {
              if (panel) {
                gsap.set(panel, {
                  clearProps:
                    "will-change,transform,opacity,visibility,clip-path,-webkit-clip-path",
                });
              }

              const mobileText = panel?.querySelectorAll<HTMLElement>(
                ".service-mobile-text"
              );
              if (mobileText?.length) {
                gsap.set(mobileText, {
                  clearProps:
                    "will-change,transform,clip-path,-webkit-clip-path",
                });
              }

              const image = imagesRef.current[index];
              if (image) {
                gsap.set(image, {
                  clearProps: "will-change,transform",
                });
              }
            });
          };
        }
      );

      return () => mm.revert();
    },
    {
      scope: wrapperRef,
      dependencies: [motionReady],
      revertOnUpdate: true,
    }
  );

  return (
    <section
      ref={wrapperRef}
      id="wat-we-doen"
      className="wat-we-doen-scroll relative w-full bg-transparent text-black"
    >
      <div
        ref={stickyRef}
        className="wat-we-doen-sticky sticky top-0 h-[100svh] min-h-[100svh] w-full overflow-hidden bg-transparent lg:relative lg:top-auto lg:h-[100dvh] lg:min-h-[100dvh]"
      >
        <div className="wat-we-doen-stage relative h-full w-full overflow-hidden bg-transparent">
          {services.map((service, index) => (
            <article
              key={service.id}
              ref={(element) => {
                panelsRef.current[index] = element;
              }}
              data-cursor-theme="image"
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

              <div
                className={`absolute left-[max(1.1rem,env(safe-area-inset-left))] right-[max(4.5rem,env(safe-area-inset-right))] top-[max(1.1rem,env(safe-area-inset-top))] z-20 flex items-start gap-4 pointer-events-none md:left-8 md:right-24 md:top-[max(2rem,env(safe-area-inset-top))] md:gap-12 ${index === 0 ? "first-service-intro" : ""}`}
              >
                <span className="service-mobile-text shrink-0 bg-black px-1.5 py-0.5 font-montserrat text-[9px] font-semibold uppercase leading-none tracking-[0.04em] text-white sm:text-[10px] md:text-[16px]">
                  WHAT WE DO
                </span>

                <div className="flex max-w-[55vw] flex-col items-start gap-[2px] md:max-w-[440px]">
                  {service.items.map((item) => (
                    <span
                      key={item}
                      className="service-mobile-text inline-block bg-black px-1 py-[1px] font-montserrat text-[8px] font-medium uppercase leading-none tracking-[0.03em] text-white sm:text-[9px] md:text-[16px]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="absolute inset-0 z-20 pointer-events-none">
                <div
                  className={`absolute bottom-[max(3.5rem,env(safe-area-inset-bottom))] left-[max(1.1rem,env(safe-area-inset-left))] max-w-[90vw] pointer-events-auto md:bottom-[max(3rem,env(safe-area-inset-bottom))] md:left-8 lg:left-12 ${index === 0 ? "first-service-intro" : ""}`}
                >
                  <TransitionLink
                    href={`/services/${service.slug}`}
                    className="flex flex-col items-start gap-[2px] font-pixel text-[clamp(36px,9.5vw,48px)] font-bold uppercase leading-[0.91] tracking-normal text-white sm:text-[clamp(40px,9vw,52px)] md:text-[clamp(46px,6.6vw,62px)] lg:text-[106px] lg:leading-[0.94]"
                  >
                    {service.displayLines.map((line) => (
                      <span
                        key={line}
                        className="service-mobile-text block w-fit bg-black px-[0.06em] py-[0.01em] leading-[0.94] text-white lg:leading-[0.96]"
                      >
                        {line}
                      </span>
                    ))}
                  </TransitionLink>
                </div>

                <div
                  className={`service-mobile-text absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-[max(1.1rem,env(safe-area-inset-left))] inline-flex items-center gap-2 bg-black px-2 py-1 font-pixel text-[10px] tracking-wider text-white md:left-auto md:right-8 md:bottom-[max(2rem,env(safe-area-inset-bottom))] md:font-mono md:text-xs lg:right-12 ${index === 0 ? "first-service-intro" : ""}`}
                >
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
  );
}
