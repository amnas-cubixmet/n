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
  const trackRef = useRef<HTMLHeadingElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useGSAP(
    () => {
      if (
        !sectionRef.current ||
        !stageRef.current ||
        !trackRef.current ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) return;

      const compact = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
      gsap.set(trackRef.current, { yPercent: 18 });
      wordRefs.current.forEach((word, index) => {
        if (word && index > 0) gsap.set(word, { yPercent: 45, autoAlpha: 0 });
      });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${Math.round(stageRef.current!.clientHeight * (compact ? 2.7 : 3.2))}`,
          pin: stageRef.current,
          pinSpacing: true,
          scrub: compact ? 0.3 : 0.45,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      timeline.to(trackRef.current, { yPercent: -12, duration: 0.78, ease: "none" }, 0.08);
      [0.13, 0.28, 0.43, 0.58].forEach((position, index) => {
        const word = wordRefs.current[index + 1];
        if (word) timeline.to(word, { yPercent: 0, autoAlpha: 1, duration: 0.18, ease: "power2.out" }, position);
      });

      timeline.to({}, { duration: 1 });
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="statement"
      ref={sectionRef}
      className="relative z-30 m-0 w-full bg-[#F000E8] p-0 text-black pointer-events-auto"
      aria-label="We make brands go wow"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-full left-0 h-[18svh] w-full bg-[#F000E8]"
        style={{
          clipPath: "polygon(0% 100%, 0% 42%, 14% 42%, 14% 72%, 28% 72%, 28% 30%, 43% 30%, 43% 58%, 57% 58%, 57% 38%, 72% 38%, 72% 68%, 86% 68%, 86% 26%, 100% 26%, 100% 100%)",
        }}
      />
      <div
        ref={stageRef}
        className="relative flex h-[100svh] min-h-[100svh] w-full items-center justify-center overflow-hidden bg-[#F000E8] px-3 select-none md:h-[100dvh] md:min-h-[100dvh]"
      >
        <h2
          ref={trackRef}
          className="m-0 flex w-full flex-col items-center justify-center gap-1 text-center font-pixel font-bold uppercase leading-[0.9] tracking-[-0.035em] sm:gap-2"
        >
          {words.map((word, index) => (
            <span key={word} className="block w-full">
              <span
                ref={(element) => { wordRefs.current[index] = element; }}
                className={`relative inline-block whitespace-nowrap px-[0.06em] ${
                  index === 0
                    ? "text-[clamp(52px,13vw,132px)] text-black"
                    : index === 4
                      ? "max-w-none bg-black text-[clamp(72px,22vw,240px)] text-white md:text-[clamp(110px,15vw,220px)]"
                      : "bg-black text-[clamp(76px,18vw,175px)] text-white"
                }`}
              >
                {word}
              </span>
            </span>
          ))}
        </h2>
      </div>
    </section>
  );
}
