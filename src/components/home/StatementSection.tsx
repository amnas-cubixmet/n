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

const TOP_STEP_OPEN =
  "polygon(0% 100%, 0% 48%, 14% 48%, 14% 74%, 28% 74%, 28% 36%, 43% 36%, 43% 60%, 57% 60%, 57% 42%, 72% 42%, 72% 70%, 86% 70%, 86% 30%, 100% 30%, 100% 100%)";

const TOP_STEP_TIGHT =
  "polygon(0% 100%, 0% 40%, 14% 40%, 14% 45%, 28% 45%, 28% 34%, 43% 34%, 43% 42%, 57% 42%, 57% 36%, 72% 36%, 72% 44%, 86% 44%, 86% 30%, 100% 30%, 100% 100%)";

const BOTTOM_STEP_OPEN =
  "polygon(0% 0%, 0% 52%, 14% 52%, 14% 26%, 28% 26%, 28% 64%, 43% 64%, 43% 40%, 57% 40%, 57% 58%, 72% 58%, 72% 30%, 86% 30%, 86% 70%, 100% 70%, 100% 0%)";

const BOTTOM_STEP_TIGHT =
  "polygon(0% 0%, 0% 60%, 14% 60%, 14% 55%, 28% 55%, 28% 66%, 43% 66%, 43% 58%, 57% 58%, 57% 64%, 72% 64%, 72% 56%, 86% 56%, 86% 70%, 100% 70%, 100% 0%)";

export default function StatementSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const topStepRef = useRef<HTMLDivElement>(null);
  const bottomStepRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const wowRef = useRef<HTMLSpanElement>(null);
  const blackORefs = useRef<(HTMLSpanElement | null)[]>([]);
  const whiteORefs = useRef<(HTMLSpanElement | null)[]>([]);
  const blackFillRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const stage = stageRef.current;
      const topStep = topStepRef.current;
      const bottomStep = bottomStepRef.current;
      const heading = headingRef.current;
      const wow = wowRef.current;

      if (
        !section ||
        !stage ||
        !topStep ||
        !bottomStep ||
        !heading ||
        !wow ||
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
            gsap.set(heading, { autoAlpha: 1 });
            gsap.set(topStep, {
              clipPath: TOP_STEP_OPEN,
              WebkitClipPath: TOP_STEP_OPEN,
              clearProps: "transform,height",
            });
            gsap.set(bottomStep, {
              clipPath: BOTTOM_STEP_OPEN,
              WebkitClipPath: BOTTOM_STEP_OPEN,
              clearProps: "transform,height",
            });
            gsap.set(blackFillRefs.current, {
              clipPath: "inset(0 0% 0 0)",
            });
            return;
          }

          // Typography is visible as the blue overlay enters.
          // The black word backgrounds are introduced later by scroll progress.
          gsap.set(heading, {
            autoAlpha: 1,
            force3D: true,
          });

          gsap.set(blackFillRefs.current, {
            clipPath: "inset(0 100% 0 0)",
          });

          gsap.set(topStep, {
            clipPath: TOP_STEP_OPEN,
            WebkitClipPath: TOP_STEP_OPEN,
            clearProps: "transform,height",
            force3D: true,
          });

          gsap.set(bottomStep, {
            clipPath: BOTTOM_STEP_OPEN,
            WebkitClipPath: BOTTOM_STEP_OPEN,
            clearProps: "transform,height",
            force3D: true,
          });

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

          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              // Start once a meaningful part of the WOW overlay is already
              // covering Deliverables. The section itself keeps moving upward.
              start: phone ? "top 60%" : tablet ? "top 58%" : "top 55%",
              // Finish before the blue section has completely left the viewport.
              end: phone ? "bottom 16%" : tablet ? "bottom 18%" : "bottom 20%",
              scrub: phone ? 0.12 : tablet ? 0.16 : 0.22,
              invalidateOnRefresh: true,
              fastScrollEnd: false,
            },
          });

          // Reveal the black word backgrounds while the whole section is
          // naturally scrolling upward: WE → MAKE → BRANDS → GO → WOW.
          blackFillRefs.current.forEach((fill) => {
            timeline.to(fill, {
              clipPath: "inset(0 0% 0 0)",
              duration: phone ? 0.34 : tablet ? 0.38 : 0.42,
              ease: "none",
            });
          });

          // Continue the same scroll-linked motion by extending the WOW letters.
          extraOs.slice(0, extraCount).forEach((index) => {
            timeline.to(
              [blackOs[index], whiteOs[index]],
              {
                width: letterWidths[index],
                autoAlpha: 1,
                duration: phone ? 0.1 : tablet ? 0.12 : 0.14,
                ease: "none",
              }
            );
          });

          // Keep the blue band at the same height and position.
          // Only the stepped notch depth becomes shallower as the section scrolls.
          // This avoids the previous whole-shape shrink/scale effect.
          const edgeTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: phone ? "top 94%" : tablet ? "top 92%" : "top 90%",
              end: phone ? "top 30%" : tablet ? "top 28%" : "top 24%",
              scrub: phone ? 0.12 : tablet ? 0.16 : 0.2,
              invalidateOnRefresh: true,
            },
          });

          edgeTimeline
            .to(
              topStep,
              {
                clipPath: TOP_STEP_TIGHT,
                WebkitClipPath: TOP_STEP_TIGHT,
                duration: 1,
                ease: "none",
                force3D: true,
              },
              0
            )
            .to(
              bottomStep,
              {
                clipPath: BOTTOM_STEP_TIGHT,
                WebkitClipPath: BOTTOM_STEP_TIGHT,
                duration: 1,
                ease: "none",
                force3D: true,
              },
              0
            );

          let frameA = 0;
          let frameB = 0;
          frameA = requestAnimationFrame(() => {
            frameB = requestAnimationFrame(() => {
              timeline.scrollTrigger?.refresh();
              timeline.scrollTrigger?.update();
            });
          });

          return () => {
            cancelAnimationFrame(frameA);
            cancelAnimationFrame(frameB);
            timeline.scrollTrigger?.kill();
            timeline.kill();
            edgeTimeline.scrollTrigger?.kill();
            edgeTimeline.kill();
            gsap.set([topStep, bottomStep], {
              clearProps:
                "transform,height,will-change,clip-path,-webkit-clip-path",
            });
            gsap.set(heading, { clearProps: "will-change" });
          };
        }
      );

      return () => {
        mm.revert();
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
      className="relative isolate z-40 -mt-[82svh] w-full bg-[#1677FF] p-0 text-black pointer-events-auto md:-mt-[80dvh]"
      aria-label="We make brands go wow"
    >
      <div
        ref={topStepRef}
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[calc(100%-2px)] left-0 z-[20] h-[18svh] min-h-[18svh] w-full bg-[#1677FF] will-change-transform md:h-[20dvh] md:min-h-[20dvh]"
        style={{
          clipPath: TOP_STEP_OPEN,
          WebkitClipPath: TOP_STEP_OPEN,
        }}
      />

      <div
        ref={bottomStepRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-[calc(100%-2px)] z-[20] h-[18svh] min-h-[18svh] w-full bg-[#1677FF] will-change-transform md:h-[20dvh] md:min-h-[20dvh]"
        style={{
          clipPath: BOTTOM_STEP_OPEN,
          WebkitClipPath: BOTTOM_STEP_OPEN,
        }}
      />

      <div
        ref={stageRef}
        className="relative z-10 flex h-[100svh] min-h-[100svh] w-full items-center justify-center overflow-hidden bg-[#1677FF] px-3 py-[clamp(1.5rem,4svh,3rem)] select-none motion-reduce:h-auto motion-reduce:min-h-0 motion-reduce:overflow-visible motion-reduce:py-16 lg:h-[100dvh] lg:min-h-[100dvh]"
      >
        <h2 ref={headingRef} aria-label="We make brands go wow" className={`relative z-10 ${headingClass}`}>{renderWords()}</h2>

      </div>
    </section>
  );
}
