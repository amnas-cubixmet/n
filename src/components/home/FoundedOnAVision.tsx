"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const IMAGE_SHAPE =
  "polygon(12% 0, 100% 0, 100% 100%, 0 100%, 0 12%)";

const BACKING_SHAPE =
  "polygon(12% 0, 100% 0, 100% 72%, 84% 72%, 84% 100%, 62% 82%, 0 82%, 0 12%)";

export default function FoundedOnAVision() {
  const containerRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const shapeRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const imageInnerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = containerRef.current;
      const label = labelRef.current;
      const text = textRef.current;
      const visual = visualRef.current;
      const shape = shapeRef.current;
      const image = imageRef.current;
      const imageInner = imageInnerRef.current;

      if (
        !section ||
        !label ||
        !text ||
        !visual ||
        !shape ||
        !image ||
        !imageInner
      ) {
        return;
      }

      const mm = gsap.matchMedia();

      mm.add(
        {
          mobile: "(max-width: 768px)",
          desktop: "(min-width: 769px)",
          reduced: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const conditions = context.conditions as {
            mobile: boolean;
            desktop: boolean;
            reduced: boolean;
          };

          const mobile = Boolean(conditions.mobile);
          const reduced = Boolean(conditions.reduced);

          if (reduced) {
            gsap.set([label, text, visual, shape, image, imageInner], {
              autoAlpha: 1,
              x: 0,
              y: 0,
              xPercent: 0,
              yPercent: 0,
              scale: 1,
              clearProps: "transform,clipPath,willChange",
            });
            return;
          }

          gsap.set(label, {
            autoAlpha: 0,
            y: mobile ? 10 : 14,
            force3D: true,
          });

          gsap.set(text, {
            autoAlpha: 0,
            y: mobile ? 24 : 38,
            force3D: true,
          });

          gsap.set(visual, {
            autoAlpha: 1,
          });

          gsap.set(shape, {
            xPercent: mobile ? 3 : 6,
            yPercent: mobile ? -2 : -4,
            scale: mobile ? 0.99 : 0.985,
            transformOrigin: "center center",
            force3D: true,
          });

          gsap.set(image, {
            autoAlpha: 0,
            y: mobile ? 20 : 34,
            clipPath: "inset(14% 0 0 0)",
            force3D: true,
          });

          gsap.set(imageInner, {
            scale: mobile ? 1.025 : 1.045,
            yPercent: mobile ? 1 : 2,
            transformOrigin: "center center",
            force3D: true,
          });

          const timeline = gsap.timeline({
            defaults: {
              ease: "none",
              overwrite: "auto",
            },
            scrollTrigger: {
              trigger: section,
              start: mobile ? "top 92%" : "top 88%",
              end: mobile ? "top 38%" : "top 30%",
              scrub: mobile ? 0.35 : 0.65,
              invalidateOnRefresh: true,
            },
          });

          timeline
            .to(
              label,
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.22,
              },
              0
            )
            .to(
              text,
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.46,
              },
              0.08
            )
            .to(
              image,
              {
                autoAlpha: 1,
                y: 0,
                clipPath: "inset(0% 0 0 0)",
                duration: 0.5,
              },
              0.1
            )
            .to(
              imageInner,
              {
                scale: 1,
                yPercent: 0,
                duration: 0.62,
                force3D: true,
              },
              0.1
            )
            .to(
              shape,
              {
                xPercent: mobile ? -1 : -2.5,
                yPercent: mobile ? 1 : 2.5,
                scale: 1,
                duration: 0.72,
                force3D: true,
              },
              0
            );

          return () => {
            timeline.scrollTrigger?.kill();
            timeline.kill();
          };
        }
      );

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  return (
    <section
      id="founded-on-a-vision"
      ref={containerRef}
      className="relative z-30 m-0 w-full overflow-hidden bg-[#D4D6E4] px-[max(1.1rem,env(safe-area-inset-left))] py-16 pr-[max(1.1rem,env(safe-area-inset-right))] text-black pointer-events-auto select-none sm:px-10 sm:py-20 lg:px-16 lg:py-24"
    >
      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col justify-between gap-10 lg:flex-row lg:items-center lg:gap-12">
        <div className="flex w-full flex-col items-start text-left lg:w-[60%] xl:w-[58%]">
          <div
            ref={labelRef}
            className="mb-6 flex items-center sm:mb-8"
          >
            <span className="inline-block bg-black px-2.5 py-1 font-mono text-xs font-bold uppercase leading-none tracking-wider text-white sm:text-sm">
              FOUNDED ON A VISION
            </span>
          </div>

          <p
            ref={textRef}
            className="m-0 text-left font-sans text-[clamp(24px,6.2vw,34px)] font-normal leading-[1.08] tracking-[-0.025em] text-black sm:text-[clamp(28px,3.4vw,42px)] lg:text-[clamp(30px,2.5vw,42px)]"
          >
            NORTHFRAME was built on my belief that ordinary isn’t enough. I
            bring strategy, creativity, and technology together to help brands
            stand out and make an impact. No shortcuts. No mediocrity. Just
            purposeful work that makes you say WOOOOOW.
          </p>
        </div>

        <div
          ref={visualRef}
          className="relative w-full max-w-[470px] self-center sm:w-[82%] lg:w-[38%] lg:self-auto xl:w-[36%]"
        >
          <div
            ref={shapeRef}
            aria-hidden="true"
            className="pointer-events-none absolute -inset-x-[7%] -top-[5%] bottom-[-8%] bg-[#C7C9DD]/65 will-change-transform"
            style={{ clipPath: BACKING_SHAPE }}
          />

          <div
            ref={imageRef}
            data-cursor-theme="image"
            className="relative z-10 aspect-[4/5] w-full overflow-hidden bg-transparent shadow-2xl will-change-transform"
            style={{ clipPath: IMAGE_SHAPE }}
          >
            <div
              ref={imageInnerRef}
              className="relative h-full w-full will-change-transform"
            >
              <Image
                src="/images/FOUNDED/Head.png"
                alt="NORTHFRAME Founder"
                fill
                className="object-cover object-center grayscale contrast-105"
                sizes="(max-width: 768px) 82vw, (max-width: 1024px) 56vw, 38vw"
                priority={false}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
