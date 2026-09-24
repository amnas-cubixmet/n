"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const words = ["WE", "MAKE", "BRANDS", "GO", "WOW"];
const blackStartClip = "polygon(0% 116%, 14% 116%, 14% 102%, 28% 102%, 28% 113%, 43% 113%, 43% 100%, 57% 100%, 57% 118%, 72% 118%, 72% 107%, 86% 107%, 86% 115%, 100% 115%, 100% 100%, 0% 100%)";
const blackEndClip = "polygon(0% -8%, 14% -8%, 14% -22%, 28% -22%, 28% -11%, 43% -11%, 43% -24%, 57% -24%, 57% -6%, 72% -6%, 72% -17%, 86% -17%, 86% -9%, 100% -9%, 100% 100%, 0% 100%)";

export default function StatementSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const exitRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLHeadingElement>(null);
  const whiteTrackRef = useRef<HTMLDivElement>(null);
  const wowRef = useRef<HTMLSpanElement>(null);
  const whiteWowRef = useRef<HTMLSpanElement>(null);
  const leadLineRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const whiteLeadLineRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useGSAP(
    () => {
      if (
        !sectionRef.current ||
        !stageRef.current ||
        !exitRef.current ||
        !trackRef.current ||
        !whiteTrackRef.current ||
        !wowRef.current ||
        !whiteWowRef.current ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) return;

      const compact = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
      const stage = stageRef.current;
      const wow = wowRef.current;
      const stageBox = stage.getBoundingClientRect();
      const wowBox = wow.getBoundingClientRect();
      const centerWow = stage.clientHeight / 2 - (wowBox.top - stageBox.top + wowBox.height / 2);
      const fillWidth = Math.max(1, (stage.clientWidth * 0.94) / wowBox.width);

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${Math.round(stageRef.current!.clientHeight * (compact ? 1.8 : 2.1))}`,
          pin: stageRef.current,
          pinSpacing: true,
          scrub: compact ? 0.15 : 0.22,
          anticipatePin: 1,
          invalidateOnRefresh: false,
        },
      });

      // The text is fully rendered with the blue panel. Scrolling moves the
      // complete stack until WOW is centered, then expands only that word.
      timeline.to([trackRef.current, whiteTrackRef.current], {
        y: centerWow,
        duration: 0.55,
        ease: "none",
      }, 0);
      timeline.to([wowRef.current, whiteWowRef.current], {
        scale: fillWidth,
        transformOrigin: "center center",
        duration: 0.25,
        ease: "none",
      }, 0.55);
      timeline.to([...leadLineRefs.current, ...whiteLeadLineRefs.current].filter(Boolean), {
        autoAlpha: 0,
        duration: 0.2,
        ease: "none",
      }, 0.55);
      timeline.to(exitRef.current, { clipPath: blackEndClip, duration: 0.3, ease: "none" }, 0.8);
    },
    { scope: sectionRef }
  );

  const headingClass = "m-0 flex w-full flex-col items-center justify-center gap-[clamp(6px,1.4svh,14px)] text-center font-pixel font-bold uppercase leading-[0.86] tracking-[-0.035em]";

  const renderWords = (onBlack: boolean) => words.map((word, index) => (
    <span
      key={word}
      ref={index < 4 ? (element) => {
        (onBlack ? whiteLeadLineRefs : leadLineRefs).current[index] = element;
      } : undefined}
      className="block w-full py-[0.025em]"
    >
      <span
        ref={index === 4 ? (onBlack ? whiteWowRef : wowRef) : undefined}
        className={`relative inline-block whitespace-nowrap px-[0.06em] ${
          index === 4
            ? "text-[clamp(84px,16vw,220px)]"
            : "text-[clamp(68px,14vw,205px)]"
        } motion-reduce:!text-[clamp(36px,8vw,90px)] ${
          onBlack ? "text-white" : index === 4 ? "text-black" : "bg-black text-white"
        }`}
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
        className="relative flex h-[100svh] min-h-[100svh] w-full items-start justify-center overflow-hidden bg-[#1677FF] px-3 pt-[clamp(5rem,10svh,7rem)] select-none motion-reduce:h-auto motion-reduce:overflow-visible motion-reduce:py-16 md:h-[100dvh] md:min-h-[100dvh]"
      >
        <h2 ref={trackRef} className={`relative z-10 ${headingClass}`}>{renderWords(false)}</h2>
        <div
          ref={exitRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 flex items-start justify-center bg-black px-3 pt-[clamp(5rem,10svh,7rem)]"
          style={{ clipPath: blackStartClip }}
        >
          <div ref={whiteTrackRef} className={headingClass}>{renderWords(true)}</div>
        </div>
      </div>
    </section>
  );
}
