"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const words = ["WE", "MAKE", "BRANDS", "GO", "WOOOOOOOOW!"];

export default function StatementSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const exitRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useGSAP(
    () => {
      if (
        !sectionRef.current ||
        !stageRef.current ||
        !exitRef.current ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) return;

      const compact = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
      gsap.set(exitRef.current, { yPercent: 100 });
      wordRefs.current.forEach((word, index) => {
        if (word && index > 0) gsap.set(word, { yPercent: 45, autoAlpha: 0 });
      });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${Math.round(stageRef.current!.clientHeight * (compact ? 1.2 : 1.45))}`,
          pin: stageRef.current,
          pinSpacing: true,
          scrub: compact ? 0.15 : 0.25,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      [0.06, 0.2, 0.34, 0.48].forEach((position, index) => {
        const word = wordRefs.current[index + 1];
        if (word) timeline.to(word, { yPercent: 0, autoAlpha: 1, duration: 0.18, ease: "power2.out" }, position);
      });

      // Once the full statement has landed, the following black section
      // enters through a stepped edge. It covers the blue at the pin exit.
      timeline.to(exitRef.current, { yPercent: 0, duration: 0.28, ease: "none" }, 0.72);
    },
    { scope: sectionRef }
  );

  const headingClass = "m-0 flex w-full flex-col items-center justify-center gap-[clamp(6px,1.5svh,16px)] text-center font-pixel font-bold uppercase leading-[0.9] tracking-[-0.035em]";

  const renderWords = () => words.map((word, index) => (
    <span key={word} className="block w-full overflow-hidden py-[0.04em]">
      <span
        ref={(element) => { wordRefs.current[index] = element; }}
        className={`relative inline-block whitespace-nowrap px-[0.06em] ${
          index === 4
            ? "text-[clamp(32px,min(7vw,7.5svh),82px)]"
            : "text-[clamp(48px,min(12vw,11svh),116px)]"
        } ${index === 0 || index === 2 || index === 4 ? "bg-black text-white" : "text-black"}`}
      >
        {word}
      </span>
    </span>
  ));

  return (
    <section
      id="statement"
      ref={sectionRef}
      className="relative z-30 m-0 w-full bg-[#1677FF] p-0 text-black pointer-events-auto"
      aria-label="We make brands go wow"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-full left-0 h-[18svh] w-full bg-[#1677FF]"
        style={{
          clipPath: "polygon(0% 100%, 0% 42%, 14% 42%, 14% 72%, 28% 72%, 28% 30%, 43% 30%, 43% 58%, 57% 58%, 57% 38%, 72% 38%, 72% 68%, 86% 68%, 86% 26%, 100% 26%, 100% 100%)",
        }}
      />
      <div
        ref={stageRef}
        className="relative flex h-[100svh] min-h-[100svh] w-full items-center justify-center overflow-hidden bg-[#1677FF] px-3 select-none md:h-[100dvh] md:min-h-[100dvh]"
      >
        <h2 className={`relative z-10 ${headingClass}`}>{renderWords()}</h2>
        <div
          ref={exitRef}
          aria-hidden="true"
          className="pointer-events-none absolute -top-[24svh] left-0 z-20 h-[124svh] w-full translate-y-full bg-black"
          style={{
            clipPath: "polygon(0% 16%, 14% 16%, 14% 2%, 28% 2%, 28% 13%, 43% 13%, 43% 0%, 57% 0%, 57% 18%, 72% 18%, 72% 7%, 86% 7%, 86% 15%, 100% 15%, 100% 100%, 0% 100%)",
          }}
        />
      </div>
    </section>
  );
}
