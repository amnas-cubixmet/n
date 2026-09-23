"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function FoundedOnAVision() {
  const containerRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const imageInnerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (
        typeof window === "undefined" ||
        !containerRef.current ||
        !labelRef.current ||
        !textRef.current ||
        !imageRef.current ||
        !imageInnerRef.current
      ) {
        return;
      }

      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (reducedMotion) {
        gsap.set(
          [labelRef.current, textRef.current, imageRef.current, imageInnerRef.current],
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            clearProps: "transform",
          }
        );
        return;
      }

      const mm = gsap.matchMedia();

      const buildReveal = (mobile: boolean) => {
        const label = labelRef.current;
        const text = textRef.current;
        const image = imageRef.current;
        const imageInner = imageInnerRef.current;

        if (!label || !text || !image || !imageInner) return;

        gsap.set(label, {
          autoAlpha: 0,
          y: mobile ? 5 : 7,
          force3D: true,
        });

        gsap.set(text, {
          autoAlpha: 0,
          y: mobile ? 14 : 18,
          force3D: true,
        });

        gsap.set(image, {
          autoAlpha: 0,
          y: mobile ? 12 : 16,
          force3D: true,
        });

        gsap.set(imageInner, {
          scale: 1.02,
          transformOrigin: "center center",
          force3D: true,
        });

        const timeline = gsap.timeline({
          defaults: {
            ease: "power3.out",
            overwrite: "auto",
          },
          scrollTrigger: {
            trigger: containerRef.current,
            start: mobile ? "top 88%" : "top 82%",
            once: true,
            invalidateOnRefresh: true,
          },
          onComplete: () => {
            gsap.set([label, text, image, imageInner], {
              clearProps: "will-change",
            });
          },
        });

        timeline
          .to(label, {
            autoAlpha: 1,
            y: 0,
            duration: mobile ? 0.3 : 0.36,
          })
          .to(
            text,
            {
              autoAlpha: 1,
              y: 0,
              duration: mobile ? 0.48 : 0.56,
            },
            mobile ? "-=0.12" : "-=0.14"
          )
          .to(
            image,
            {
              autoAlpha: 1,
              y: 0,
              duration: mobile ? 0.5 : 0.58,
            },
            mobile ? "-=0.32" : "-=0.38"
          )
          .to(
            imageInner,
            {
              scale: 1,
              duration: mobile ? 0.52 : 0.62,
              ease: "power2.out",
              force3D: true,
            },
            "<"
          );
      };

      mm.add("(max-width: 768px)", () => buildReveal(true));
      mm.add("(min-width: 769px)", () => buildReveal(false));

      return () => mm.revert();
    },
    {
      scope: containerRef,
    }
  );

  return (
    <section
      id="founded-on-a-vision"
      ref={containerRef}
      className="relative z-30 m-0 w-full overflow-hidden bg-[#D4D6E4] px-[max(1.1rem,env(safe-area-inset-left))] py-16 pr-[max(1.1rem,env(safe-area-inset-right))] text-black pointer-events-auto select-none sm:px-10 sm:py-20 lg:px-16 lg:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-8%] top-[10%] h-[42%] w-[46%] bg-[#C7C9DD]/55 sm:right-[-4%] lg:right-[2%] lg:top-[8%] lg:h-[46%] lg:w-[34%]"
        style={{
          clipPath: "polygon(18% 0, 100% 0, 100% 100%, 0 100%, 0 24%)",
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[8%] left-[-10%] h-[28%] w-[42%] bg-[#BFC2D8]/35 sm:left-[-6%] lg:left-[4%] lg:w-[28%]"
        style={{
          clipPath: "polygon(0 0, 82% 0, 100% 28%, 100% 100%, 0 100%)",
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col justify-between gap-10 lg:flex-row lg:items-center lg:gap-12">
        <div className="flex w-full flex-col items-start text-left lg:w-[60%] xl:w-[58%]">
          <div
            ref={labelRef}
            className="mb-6 flex items-center will-change-transform sm:mb-8"
          >
            <span className="inline-block bg-black px-2.5 py-1 font-pixel text-xs font-bold uppercase leading-none tracking-wider text-white sm:text-sm">
              FOUNDED ON A VISION
            </span>
          </div>

          <p
            ref={textRef}
            className="m-0 text-left font-sans text-[clamp(24px,6.2vw,34px)] font-normal leading-[1.08] tracking-[-0.025em] text-black will-change-transform sm:text-[clamp(28px,3.4vw,42px)] lg:text-[clamp(30px,2.5vw,42px)]"
          >
            NORTHFRAME was built on my belief that ordinary isn’t enough.
            I bring strategy, creativity, and technology together to help brands
            stand out and make an impact. No shortcuts. No mediocrity.
            Just purposeful work that makes you say WOOOOOW.
          </p>
        </div>

        <div
          ref={imageRef}
          className="relative aspect-[4/5] w-full max-w-[430px] self-center overflow-hidden bg-transparent shadow-2xl will-change-transform sm:w-[80%] lg:w-[36%] lg:self-auto xl:w-[35%]"
          style={{
            clipPath: "polygon(10% 0, 100% 0, 100% 100%, 0 100%, 0 8%)",
          }}
        >
          <div
            ref={imageInnerRef}
            className="relative h-full w-full will-change-transform"
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
      </div>
    </section>
  );
}
