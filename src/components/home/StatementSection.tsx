"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const words = ["WE", "MAKE", "BRANDS", "GO", "WOW"];
const extraOs = Array.from({ length: 20 }, (_, index) => index);

export default function StatementSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const wowRef = useRef<HTMLSpanElement>(null);
  const blackORefs = useRef<(HTMLSpanElement | null)[]>([]);
  const whiteORefs = useRef<(HTMLSpanElement | null)[]>([]);
  const blackFillRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const exitOverlayRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const stage = stageRef.current;
      const wow = wowRef.current;
      const exitOverlay = exitOverlayRef.current;

      if (
        !section ||
        !stage ||
        !wow ||
        !exitOverlay ||
        blackORefs.current.length !== extraOs.length ||
        whiteORefs.current.length !== extraOs.length ||
        blackFillRefs.current.length !== words.length ||
        blackFillRefs.current.some((fill) => !fill)
      ) {
        return;
      }

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
            section.style.height = "";
            gsap.set(exitOverlay, {
              yPercent: 100,
              clearProps: "will-change",
            });
            return;
          }

          const wowBox = wow.getBoundingClientRect();
          const blackOs = blackORefs.current as HTMLSpanElement[];
          const whiteOs = whiteORefs.current as HTMLSpanElement[];
          const letterWidths = blackOs.map(
            (letter) =>
              letter.firstElementChild?.getBoundingClientRect().width || 1
          );
          const extraCount = Math.min(
            extraOs.length,
            Math.max(
              3,
              Math.ceil(
                (stage.clientWidth * 1.04 - wowBox.width) /
                  Math.max(1, letterWidths[0])
              )
            )
          );

          gsap.set(exitOverlay, {
            yPercent: 100,
            force3D: true,
          });

          const getScrollDistance = () =>
            Math.round(
              stage.clientHeight *
                (1.48 +
                  extraCount *
                    (phone ? 0.1 : tablet ? 0.13 : 0.15))
            );

          const syncSectionHeight = () => {
            section.style.height = compact
              ? `${stage.clientHeight + getScrollDistance()}px`
              : `${getScrollDistance()}px`;
          };

          syncSectionHeight();

          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: () => `+=${getScrollDistance()}`,
              pin: desktop ? stage : false,
              pinSpacing: false,
              scrub: phone ? true : tablet ? 0.08 : 0.18,
              anticipatePin: desktop ? 1 : 0,
              invalidateOnRefresh: true,
              fastScrollEnd: false,
              onRefreshInit: syncSectionHeight,
              onLeave: () => {
                gsap.set(exitOverlay, { yPercent: 0 });
              },
            },
          });

          blackFillRefs.current.forEach((fill, index) => {
            timeline.to(
              fill,
              {
                clipPath: "inset(0 0% 0 0)",
                duration: 0.42,
                ease: "none",
              },
              index * 0.39
            );
          });

          extraOs.slice(0, extraCount).forEach((index) => {
            timeline.to(
              [blackOs[index], whiteOs[index]],
              {
                width: letterWidths[index],
                autoAlpha: 1,
                duration: 0.2,
                ease: "none",
              },
              2.04 + index * 0.16
            );
          });

          timeline.to(
            exitOverlay,
            {
              yPercent: 0,
              duration: phone ? 0.36 : tablet ? 0.42 : 0.46,
              ease: "none",
              force3D: true,
            },
            ">"
          );

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
            section.style.height = "";
            gsap.set(exitOverlay, {
              clearProps: "transform,will-change",
            });
          };
        }
      );

      return () => {
        mm.revert();
        section.style.height = "";
      };
    },
    { scope: sectionRef }
  );

  const headingClass = "m-0 flex w-full flex-col items-center justify-center gap-[clamp(6px,1.4svh,14px)] text-center font-pixel font-bold uppercase leading-[0.86] tracking-[-0.035em]";

  const renderWowLetters = (onBlack: boolean) => (
    <>
      WO
      {extraOs.map((index) => (
        <span
          key={index}
          ref={(element) => {
            (onBlack ? whiteORefs : blackORefs).current[index] = element;
          }}
          className="inline-block w-0 overflow-hidden align-baseline opacity-0"
        ><span className="inline-block">O</span></span>
      ))}
      W
    </>
  );

  const renderWords = () => words.map((word, index) => (
    <span
      key={word}
      className="block w-full py-[0.025em]"
    >
      <span
        ref={index === 4 ? wowRef : undefined}
        className={`${index === 4 ? "relative left-1/2 block w-max -translate-x-1/2" : "relative inline-block"} whitespace-nowrap px-[0.06em] ${
          index === 4
            ? "text-[clamp(42px,min(11vw,15svh),84px)] md:text-[clamp(68px,min(16vw,20svh),220px)]"
            : "text-[clamp(34px,min(9vw,13svh),68px)] md:text-[clamp(60px,min(14vw,18svh),205px)]"
        } motion-reduce:!text-[clamp(36px,8vw,90px)] text-black`}
      >
        <span>{index === 4 ? renderWowLetters(false) : word}</span>
        <span
          ref={(element) => { blackFillRefs.current[index] = element; }}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 block overflow-hidden bg-black text-white"
          style={{ clipPath: "inset(0 100% 0 0)" }}
        >
          <span className="inline-block whitespace-nowrap px-[0.06em]">
            {index === 4 ? renderWowLetters(true) : word}
          </span>
        </span>
      </span>
    </span>
  ));

  return (
    <section
      id="statement"
      ref={sectionRef}
      className="relative z-40 -mt-[100svh] w-full bg-black p-0 text-black pointer-events-auto motion-reduce:mt-0 md:-mt-[100dvh] md:motion-reduce:mt-0"
      aria-label="We make brands go wow"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 z-[5] h-[20svh] w-full bg-[#1677FF] md:h-[22dvh]"
        style={{
          // A stepped cap previews the blue statement before the full stage
          // enters, without overlapping an entire viewport or disturbing pin spacing.
          bottom: "calc(100% - 1px)",
          clipPath: "polygon(0% 100%, 0% 42%, 14% 42%, 14% 72%, 28% 72%, 28% 30%, 43% 30%, 43% 58%, 57% 58%, 57% 38%, 72% 38%, 72% 68%, 86% 68%, 86% 26%, 100% 26%, 100% 100%)",
        }}
      />

      <div
        ref={stageRef}
        className="mobile-scroll-sticky flex h-[100svh] min-h-[100svh] w-full items-center justify-center overflow-hidden bg-[#1677FF] px-3 py-[clamp(1.5rem,4svh,3rem)] select-none motion-reduce:relative motion-reduce:h-auto motion-reduce:min-h-0 motion-reduce:overflow-visible motion-reduce:py-16 lg:h-[100dvh] lg:min-h-[100dvh]"
      >
        <h2 aria-label="We make brands go wow" className={`relative z-10 ${headingClass}`}>{renderWords()}</h2>

        <div
          ref={exitOverlayRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 translate-y-full bg-black will-change-transform"
        >

        </div>
      </div>
    </section>
  );
}
