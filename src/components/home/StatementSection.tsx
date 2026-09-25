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
  const trackRef = useRef<HTMLHeadingElement>(null);
  const wowRef = useRef<HTMLSpanElement>(null);
  const blackORefs = useRef<(HTMLSpanElement | null)[]>([]);
  const whiteORefs = useRef<(HTMLSpanElement | null)[]>([]);
  const blackFillRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useGSAP(
    () => {
      if (
        !sectionRef.current ||
        !stageRef.current ||
        !trackRef.current ||
        !wowRef.current ||
        blackORefs.current.length !== extraOs.length ||
        whiteORefs.current.length !== extraOs.length ||
        lineRefs.current.length !== words.length ||
        blackFillRefs.current.length !== words.length ||
        blackFillRefs.current.some((fill) => !fill) ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) return;

      const compact = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
      const stage = stageRef.current;
      const wow = wowRef.current;
      const stageBox = stage.getBoundingClientRect();
      const wowBox = wow.getBoundingClientRect();
      const centerWow = stage.clientHeight / 2 - (wowBox.top - stageBox.top + wowBox.height / 2);
      const blackOs = blackORefs.current as HTMLSpanElement[];
      const whiteOs = whiteORefs.current as HTMLSpanElement[];
      const letterWidths = blackOs.map((letter) => letter.firstElementChild!.getBoundingClientRect().width);
      const extraCount = Math.min(
        extraOs.length,
        Math.max(3, Math.ceil((stage.clientWidth * 1.04 - wowBox.width) / letterWidths[0])),
      );

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${Math.round(stageRef.current!.clientHeight * (3.2 + extraCount * (compact ? 0.28 : 0.35)))}`,
          pin: stageRef.current,
          pinSpacing: true,
          scrub: compact ? 0.15 : 0.22,
          anticipatePin: 1,
          invalidateOnRefresh: false,
        },
      });

      // The entire phrase is present as black text when the panel arrives.
      // Each word's own background then fills continuously with the scroll.
      blackFillRefs.current.forEach((fill, index) => {
        timeline.to(fill, {
          clipPath: "inset(0 0% 0 0)",
          duration: 0.42,
          ease: "none",
        }, index * 0.39);
      });

      // Bring WOW to the centre, then let more O glyphs extend it across the
      // viewport. The font never scales; its own black backing grows with it.
      timeline.to(trackRef.current, {
        y: centerWow,
        duration: 0.55,
        ease: "none",
      }, 2.03);
      timeline.to(lineRefs.current.slice(0, 4).filter(Boolean), {
        autoAlpha: 0,
        duration: 0.35,
        ease: "none",
      }, 2.03);

      extraOs.slice(0, extraCount).forEach((index) => {
        timeline.to([blackOs[index], whiteOs[index]], {
          width: letterWidths[index],
          autoAlpha: 1,
          duration: 0.23,
          ease: "none",
        }, 2.64 + index * 0.2);
      });
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
      ref={(element) => { lineRefs.current[index] = element; }}
      className="block w-full py-[0.025em]"
    >
      <span
        ref={index === 4 ? wowRef : undefined}
        className={`relative inline-block whitespace-nowrap px-[0.06em] ${
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
      className="relative z-40 w-full bg-[#1677FF] p-0 text-black pointer-events-auto motion-safe:-mt-[100svh] lg:motion-safe:-mt-[100dvh]"
      aria-label="We make brands go wow"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 h-[18svh] w-full bg-[#1677FF]"
        style={{
          // Overlap the blue stage slightly so a one-pixel seam cannot show
          // the previous white section through the two adjoining layers.
          bottom: "calc(100% - 2px)",
          clipPath: "polygon(0% 100%, 0% 42%, 14% 42%, 14% 72%, 28% 72%, 28% 30%, 43% 30%, 43% 58%, 57% 58%, 57% 38%, 72% 38%, 72% 68%, 86% 68%, 86% 26%, 100% 26%, 100% 100%)",
        }}
      />
      <div
        ref={stageRef}
        className="relative flex h-[100svh] min-h-[100svh] w-full items-end justify-center overflow-hidden bg-[#1677FF] px-3 pb-[clamp(2rem,8svh,5rem)] select-none motion-reduce:h-auto motion-reduce:overflow-visible motion-reduce:py-16 md:h-[100dvh] md:min-h-[100dvh]"
      >
        <h2 ref={trackRef} aria-label="We make brands go wow" className={`relative z-10 ${headingClass}`}>{renderWords()}</h2>
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-[calc(100%-2px)] h-[10svh] w-full bg-[#1677FF]"
        style={{
          clipPath: "polygon(0% 0%, 100% 0%, 100% 42%, 86% 42%, 86% 72%, 72% 72%, 72% 30%, 57% 30%, 57% 58%, 43% 58%, 43% 38%, 28% 38%, 28% 68%, 14% 68%, 14% 26%, 0% 26%)",
        }}
      />
    </section>
  );
}
