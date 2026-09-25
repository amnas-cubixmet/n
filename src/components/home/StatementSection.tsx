"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const words = ["WE", "MAKE", "BRANDS", "GO", "WOW"];
const wowSequence = ["WOW", "WOOW", "WOOOW", "WOOOOW"];

export default function StatementSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLHeadingElement>(null);
  const wowRef = useRef<HTMLSpanElement>(null);
  const blackWordRef = useRef<HTMLSpanElement>(null);
  const whiteWordRef = useRef<HTMLSpanElement>(null);
  const blackFillRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useGSAP(
    () => {
      if (
        !sectionRef.current ||
        !stageRef.current ||
        !trackRef.current ||
        !wowRef.current ||
        !blackWordRef.current ||
        !whiteWordRef.current ||
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
      blackWordRef.current.textContent = wowSequence[wowSequence.length - 1];
      const finalWordWidth = wow.getBoundingClientRect().width;
      blackWordRef.current.textContent = wowSequence[0];
      const fillWidth = (stage.clientWidth * 0.94) / finalWordWidth;

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${Math.round(stageRef.current!.clientHeight * (compact ? 3.6 : 4.2))}`,
          pin: stageRef.current,
          pinSpacing: true,
          scrub: compact ? 0.15 : 0.22,
          anticipatePin: 1,
          invalidateOnRefresh: false,
        },
      });

      let currentWord = wowSequence[0];
      timeline.eventCallback("onUpdate", () => {
        const time = timeline.time();
        const nextWord = time >= 2.46 ? wowSequence[3]
          : time >= 2.38 ? wowSequence[2]
          : time >= 2.3 ? wowSequence[1]
          : wowSequence[0];
        if (nextWord !== currentWord) {
          blackWordRef.current!.textContent = nextWord;
          whiteWordRef.current!.textContent = nextWord;
          currentWord = nextWord;
        }
      });

      // WE is visible when the blue panel arrives. Each later line enters
      // with scrolling; its own black backplate then crosses the letters.
      const revealAt = [0, 0.38, 0.78, 1.18];
      blackFillRefs.current.slice(0, 4).forEach((fill, index) => {
        if (index > 0) {
          timeline.fromTo(lineRefs.current[index],
            { autoAlpha: 0, y: 20 },
            { autoAlpha: 1, y: 0, duration: 0.18, ease: "none", immediateRender: false },
            revealAt[index] - 0.16,
          );
        }
        timeline.to(fill, {
          clipPath: "inset(0 0% 0 0)",
          duration: 0.25,
          ease: "none",
        }, revealAt[index]);
      });

      timeline.fromTo(lineRefs.current[4],
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, duration: 0.2, ease: "none", immediateRender: false },
        1.58,
      );

      // After the phrase has arrived, center and grow its final word.
      timeline.to(trackRef.current, {
        y: centerWow,
        duration: 0.55,
        ease: "none",
      }, 1.67);
      timeline.to(wowRef.current, {
        scale: fillWidth,
        transformOrigin: "center center",
        duration: 0.3,
        ease: "none",
      }, 2.22);
      timeline.to(lineRefs.current.slice(0, 4).filter(Boolean), {
        autoAlpha: 0,
        duration: 0.2,
        ease: "none",
      }, 2.22);
      timeline.to(blackFillRefs.current[4], {
        clipPath: "inset(0 0% 0 0)",
        duration: 0.4,
        ease: "none",
      }, 2.52);
    },
    { scope: sectionRef }
  );

  const headingClass = "m-0 flex w-full flex-col items-center justify-center gap-[clamp(6px,1.4svh,14px)] text-center font-pixel font-bold uppercase leading-[0.86] tracking-[-0.035em]";

  const renderWords = () => words.map((word, index) => (
    <span
      key={word}
      ref={(element) => { lineRefs.current[index] = element; }}
      className={`block w-full py-[0.025em] ${index > 0 ? "motion-safe:opacity-0" : ""}`}
    >
      <span
        ref={index === 4 ? wowRef : undefined}
        className={`relative inline-block whitespace-nowrap px-[0.06em] ${
          index === 4
            ? "text-[clamp(84px,16vw,220px)]"
            : "text-[clamp(68px,14vw,205px)]"
        } motion-reduce:!text-[clamp(36px,8vw,90px)] text-black`}
      >
        <span ref={index === 4 ? blackWordRef : undefined}>{word}</span>
        <span
          ref={(element) => { blackFillRefs.current[index] = element; }}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 block overflow-hidden bg-black text-white"
          style={{ clipPath: "inset(0 100% 0 0)" }}
        >
          <span
            ref={index === 4 ? whiteWordRef : undefined}
            className="inline-block whitespace-nowrap px-[0.06em]"
          >{word}</span>
        </span>
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
        className="relative flex h-[100svh] min-h-[100svh] w-full items-start justify-center overflow-hidden bg-[#1677FF] px-3 pt-[clamp(5rem,10svh,7rem)] select-none motion-reduce:h-auto motion-reduce:overflow-visible motion-reduce:py-16 md:h-[100dvh] md:min-h-[100dvh]"
      >
        <h2 ref={trackRef} className={`relative z-10 ${headingClass}`}>{renderWords()}</h2>
      </div>
    </section>
  );
}
