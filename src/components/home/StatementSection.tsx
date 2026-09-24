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
  const blockRefs = useRef<(HTMLSpanElement | null)[]>([]);
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
      gsap.set(trackRef.current, { yPercent: 12 });
      blockRefs.current.forEach((block) => {
        if (block) gsap.set(block, { scaleX: 0, transformOrigin: "left center" });
      });
      wordRefs.current.forEach((word) => {
        if (word) gsap.set(word, { color: "#000000" });
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

      timeline.to(trackRef.current, { yPercent: -10, duration: 0.8, ease: "none" }, 0.05);
      [0.1, 0.26, 0.42, 0.58, 0.74].forEach((position, index) => {
        const block = blockRefs.current[index];
        const word = wordRefs.current[index];
        if (!block || !word) return;

        timeline.to(block, { scaleX: 1, duration: 0.06, ease: "none" }, position);
        timeline.to(word, { color: "#FFFFFF", duration: 0.03 }, position + 0.03);

        if (index < words.length - 1) {
          timeline.to(block, { scaleX: 0, transformOrigin: "right center", duration: 0.06 }, position + 0.11);
          timeline.to(word, { color: "#000000", duration: 0.03 }, position + 0.11);
        }
      });

      timeline.to({}, { duration: 1 });
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="statement"
      ref={sectionRef}
      className="relative z-20 m-0 w-full bg-[#F000E8] p-0 text-black pointer-events-auto"
      aria-label="We make brands go wow"
    >
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
                className={`relative inline-block max-w-full px-[0.04em] ${
                  index === 4
                    ? "whitespace-nowrap text-[clamp(27px,7.7vw,100px)]"
                    : "text-[clamp(43px,10svh,105px)]"
                }`}
              >
                <span
                  ref={(element) => { blockRefs.current[index] = element; }}
                  aria-hidden="true"
                  className="absolute inset-0 origin-left scale-x-0 bg-black"
                />
                <span ref={(element) => { wordRefs.current[index] = element; }} className="relative z-10">
                  {word}
                </span>
              </span>
            </span>
          ))}
        </h2>
      </div>
    </section>
  );
}
