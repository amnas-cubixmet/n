"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const words = ["WE", "MAKE", "BRANDS", "GO", "WOOOOOOOOW!"];
const blackStartClip = "polygon(0% 116%, 14% 116%, 14% 102%, 28% 102%, 28% 113%, 43% 113%, 43% 100%, 57% 100%, 57% 118%, 72% 118%, 72% 107%, 86% 107%, 86% 115%, 100% 115%, 100% 100%, 0% 100%)";
const blackEndClip = "polygon(0% -8%, 14% -8%, 14% -22%, 28% -22%, 28% -11%, 43% -11%, 43% -24%, 57% -24%, 57% -6%, 72% -6%, 72% -17%, 86% -17%, 86% -9%, 100% -9%, 100% 100%, 0% 100%)";

export default function StatementSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const exitRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (
        !sectionRef.current ||
        !stageRef.current ||
        !exitRef.current ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) return;

      const compact = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;

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

      // The full black statement is present as soon as blue enters. Only
      // scrolling after the panel is fully in view reveals the black layer.
      timeline.to(exitRef.current, { clipPath: blackEndClip, duration: 0.72, ease: "none" }, 0.28);
    },
    { scope: sectionRef }
  );

  const headingClass = "m-0 flex w-full flex-col items-center justify-center gap-[clamp(6px,1.5svh,16px)] text-center font-pixel font-bold uppercase leading-[0.9] tracking-[-0.035em]";

  const renderWords = (onBlack: boolean) => words.map((word, index) => (
    <span key={word} className="block w-full overflow-hidden py-[0.04em]">
      <span
        className={`relative inline-block whitespace-nowrap px-[0.06em] ${
          index === 4
            ? "text-[clamp(32px,min(7vw,7.5svh),82px)]"
            : "text-[clamp(48px,min(12vw,11svh),116px)]"
        } ${onBlack ? "text-white" : "text-black"}`}
      >
        {word}
      </span>
    </span>
  ));

  return (
    <section
      id="statement"
      ref={sectionRef}
      className="relative z-30 w-full bg-[#1677FF] p-0 text-black pointer-events-auto motion-safe:-mt-[100svh] lg:motion-safe:-mt-[100dvh]"
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
        <h2 className={`relative z-10 ${headingClass}`}>{renderWords(false)}</h2>
        <div
          ref={exitRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black px-3"
          style={{ clipPath: blackStartClip }}
        >
          <div className={headingClass}>{renderWords(true)}</div>
        </div>
      </div>
    </section>
  );
}
