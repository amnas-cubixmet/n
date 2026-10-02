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
  const headingRef = useRef<HTMLHeadingElement>(null);
  const wowRef = useRef<HTMLSpanElement>(null);
  const blackORefs = useRef<(HTMLSpanElement | null)[]>([]);
  const whiteORefs = useRef<(HTMLSpanElement | null)[]>([]);
  const blackFillRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const stage = stageRef.current;
      const heading = headingRef.current;
      const wow = wowRef.current;

      if (
        !section ||
        !stage ||
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
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[calc(100%-2px)] left-0 z-[5] h-[18svh] w-full bg-[#1677FF] md:h-[20dvh]"
        style={{
          clipPath:
            "polygon(0% 100%, 0% 48%, 14% 48%, 14% 74%, 28% 74%, 28% 36%, 43% 36%, 43% 60%, 57% 60%, 57% 42%, 72% 42%, 72% 70%, 86% 70%, 86% 30%, 100% 30%, 100% 100%)",
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-[calc(100%-2px)] z-[5] h-[9svh] w-full bg-[#1677FF] md:h-[11dvh]"
        style={{
          clipPath:
            "polygon(0% 0%, 100% 0%, 100% 34%, 88% 34%, 88% 58%, 72% 58%, 72% 42%, 57% 42%, 57% 68%, 42% 68%, 42% 48%, 27% 48%, 27% 72%, 13% 72%, 13% 44%, 0% 44%)",
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
