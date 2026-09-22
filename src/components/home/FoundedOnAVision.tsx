"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function FoundedOnAVision() {
  const containerRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (typeof window === "undefined") return;

      const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (motionQuery.matches) return;

      const label = labelRef.current;
      const text = textRef.current;
      const image = imageRef.current;
      if (!containerRef.current || !label || !text || !image) return;

      const mm = gsap.matchMedia();

      const buildReveal = (mobile: boolean) => {
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: mobile ? "top 90%" : "top 85%",
            once: true,
          },
        });

        if (label) {
          timeline.from(
            label,
            {
              opacity: 0,
              y: mobile ? 6 : 10,
              duration: mobile ? 0.35 : 0.5,
              ease: "power3.out",
            },
            "0"
          );
        }

        if (text) {
          timeline.from(
            text,
            {
              opacity: 0,
              y: mobile ? 14 : 20,
              duration: mobile ? 0.5 : 0.7,
              ease: "power3.out",
            },
            "-=0.2"
          );
        }

        if (image) {
          timeline.from(
            image,
            {
              opacity: 0,
              y: mobile ? 16 : 25,
              duration: mobile ? 0.5 : 0.7,
              ease: "power3.out",
            },
            "-=0.35"
          );
        }
      };

      mm.add("(max-width: 768px)", () => buildReveal(true));
      mm.add("(min-width: 769px)", () => buildReveal(false));

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  return (
    <section
      id="founded-on-a-vision"
      ref={containerRef}
      className="relative w-full h-auto min-h-0 bg-[#D4D6E4] text-black pointer-events-auto z-30 m-0 py-16 sm:py-20 lg:py-24 px-6 sm:px-10 lg:px-16 overflow-hidden select-none"
    >
      {/* 2-COLUMN COMPACT EDITORIAL LAYOUT (DESKTOP) / 1-COLUMN (MOBILE) */}
      <div className="relative w-full max-w-[1440px] mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-10 lg:gap-12">
        {/* LEFT COLUMN: LABEL & PARAGRAPH */}
        <div className="w-full lg:w-[60%] xl:w-[58%] flex flex-col items-start text-left">
          {/* COMPACT PIXEL LABEL */}
          <div ref={labelRef} className="flex items-center mb-6 sm:mb-8">
            <span className="font-pixel inline-block bg-black text-white px-2.5 py-1 text-xs sm:text-sm font-bold uppercase tracking-wider leading-none">
              FOUNDED ON A VISION
            </span>
          </div>

          {/* MAIN PARAGRAPH COPY */}
          <p
            ref={textRef}
            className="font-sans font-normal text-black text-[clamp(24px,2.5vw,42px)] leading-[1.08] tracking-[-0.025em] m-0 text-left"
          >
            NORTHFRAME was built on my belief that ordinary isn’t enough.
            I bring strategy, creativity, and technology together to help brands
            stand out and make an impact. No shortcuts. No mediocrity.
            Just purposeful work that makes you say WOOOOOW.
          </p>
        </div>

        {/* RIGHT COLUMN: FOUNDER PHOTO /images/FOUNDED/Head.png */}
        <div
          ref={imageRef}
          className="w-full sm:w-[80%] lg:w-[36%] xl:w-[35%] max-w-[430px] aspect-[4/5] relative bg-transparent overflow-hidden shadow-2xl self-center lg:self-auto"
          style={{
            clipPath: "polygon(10% 0, 100% 0, 100% 100%, 0 100%, 0 8%)",
          }}
        >
          <Image
            src="/images/FOUNDED/Head.png"
            alt="NORTHFRAME Founder"
            fill
            priority
            className="object-cover object-center grayscale contrast-105"
            sizes="(max-width: 1024px) 80vw, 36vw"
          />
        </div>
      </div>
    </section>
  );
}
