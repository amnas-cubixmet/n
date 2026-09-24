"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function OurExpertise() {
  const containerRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const paragraphOneRef = useRef<HTMLParagraphElement>(null);
  const paragraphTwoRef = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      if (typeof window === "undefined" || !containerRef.current) return;

      const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

      const label = labelRef.current;
      const paragraphOne = paragraphOneRef.current;
      const paragraphTwo = paragraphTwoRef.current;

      if (!label || !paragraphOne || !paragraphTwo) return;

      if (motionQuery.matches) {
        gsap.set([label, paragraphOne, paragraphTwo], {
          autoAlpha: 1,
          y: 0,
          clearProps: "transform",
        });
        return;
      }

      const mm = gsap.matchMedia();

      const buildReveal = (mobile: boolean) => {
        gsap.set(label, {
          autoAlpha: 0,
          y: mobile ? 6 : 8,
          force3D: true,
          willChange: "transform, opacity",
        });

        gsap.set([paragraphOne, paragraphTwo], {
          autoAlpha: 0,
          y: mobile ? 16 : 22,
          force3D: true,
          willChange: "transform, opacity",
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
            gsap.set([label, paragraphOne, paragraphTwo], {
              clearProps: "will-change",
            });
          },
        });

        timeline
          .to(label, {
            autoAlpha: 1,
            y: 0,
            duration: mobile ? 0.28 : 0.34,
          })
          .to(
            paragraphOne,
            {
              autoAlpha: 1,
              y: 0,
              duration: mobile ? 0.46 : 0.56,
            },
            mobile ? "-=0.12" : "-=0.14"
          )
          .to(
            paragraphTwo,
            {
              autoAlpha: 1,
              y: 0,
              duration: mobile ? 0.46 : 0.56,
            },
            mobile ? "-=0.28" : "-=0.34"
          );

        return () => {
          timeline.kill();
        };
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
      id="our-expertise"
      ref={containerRef}
      className="relative z-20 w-full bg-white text-black pointer-events-auto overflow-hidden"
    >
      <div className="mx-auto flex min-h-[58svh] w-full max-w-[1600px] flex-col justify-center px-[max(1.1rem,env(safe-area-inset-left))] py-[clamp(3.5rem,8vh,7rem)] pr-[max(1.1rem,env(safe-area-inset-right))] sm:min-h-[62svh] sm:px-8 lg:min-h-[68svh] lg:px-12 xl:px-16">
        <div className="w-full max-w-[950px]">
          <div
            ref={labelRef}
            className="flex items-center"
          >
            <span className="inline-block bg-black px-1.5 py-[2px] font-mono text-[10px] font-semibold uppercase leading-none tracking-[0.06em] text-white sm:text-[11px]">
              OUR EXPERTISE
            </span>
          </div>

          <div className="mt-6 max-w-[900px] space-y-4 sm:mt-9 sm:space-y-6 lg:mt-11 lg:space-y-7">
            <p
              ref={paragraphOneRef}
              className="m-0 font-sans text-[clamp(17px,4.4vw,21px)] font-normal leading-[1.28] tracking-[-0.02em] text-black sm:text-[clamp(22px,2.7vw,34px)] sm:leading-[1.2] lg:text-[clamp(30px,2.35vw,40px)]"
            >
              What do we do best? Branding, design, and digital experiences. Yes,
              you’ve heard that before. But expertise isn’t just about what you
              do, it’s about how exceptionally you do it.
            </p>

            <p
              ref={paragraphTwoRef}
              className="m-0 font-sans text-[clamp(17px,4.4vw,21px)] font-normal leading-[1.28] tracking-[-0.02em] text-black sm:text-[clamp(22px,2.7vw,34px)] sm:leading-[1.2] lg:text-[clamp(30px,2.35vw,40px)]"
            >
              We push every detail further, challenge the expected, and strive for
              work that feels considered, distinctive, and precise. Because good
              is never the finish line. There’s always a way to make it better.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
