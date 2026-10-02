"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function OurExpertise() {
  const containerRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const container = containerRef.current;
      const label = labelRef.current;
      const copy = copyRef.current;
      if (!container || !label || !copy) return;

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (reduced) {
        gsap.set([label, copy], {
          y: 0,
          scaleX: 1,
          clipPath: "inset(0% 0% 0% 0%)",
          clearProps: "transform,clip-path",
        });
        return;
      }

      const mm = gsap.matchMedia();

      const buildReveal = (mobile: boolean) => {
        gsap.set(label, {
          scaleX: 0,
          transformOrigin: "left center",
          force3D: true,
        });

        gsap.set(copy, {
          y: mobile ? 18 : 30,
          clipPath: "inset(0% 0% 100% 0%)",
          force3D: true,
        });

        const timeline = gsap.timeline({
          paused: mobile,
          defaults: {
            ease: "power3.out",
            overwrite: "auto",
          },
          ...(mobile
            ? {}
            : {
                scrollTrigger: {
                  trigger: container,
                  start: "top 82%",
                  once: true,
                  invalidateOnRefresh: true,
                },
              }),
        });

        timeline
          .to(label, {
            scaleX: 1,
            duration: mobile ? 0.34 : 0.48,
            ease: "power4.out",
          })
          .to(
            copy,
            {
              y: 0,
              clipPath: "inset(0% 0% 0% 0%)",
              duration: mobile ? 0.56 : 0.74,
              ease: "expo.out",
            },
            mobile ? "-=0.12" : "-=0.18"
          );

        if (!mobile) {
          return () => {
            timeline.scrollTrigger?.kill();
            timeline.kill();
          };
        }

        const observer =
          "IntersectionObserver" in window
            ? new IntersectionObserver(
                ([entry]) => {
                  if (!entry?.isIntersecting) return;
                  timeline.play(0);
                  observer.disconnect();
                },
                {
                  threshold: 0.01,
                  rootMargin: "0px 0px -6% 0px",
                }
              )
            : null;

        if (observer) observer.observe(container);
        else timeline.play(0);

        return () => {
          observer?.disconnect();
          timeline.kill();
        };
      };

      mm.add("(max-width: 768px)", () => buildReveal(true));
      mm.add("(min-width: 769px)", () => buildReveal(false));

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  return (
    <section
      id="our-expertise"
      ref={containerRef}
      className="relative z-20 w-full bg-white text-black pointer-events-auto overflow-hidden"
    >
      <div className="mx-auto flex min-h-[62svh] w-full max-w-[1600px] flex-col justify-start px-[max(1.1rem,env(safe-area-inset-left))] pb-[clamp(2rem,5vh,4rem)] pt-[clamp(5rem,12vh,10rem)] pr-[max(1.1rem,env(safe-area-inset-right))] sm:min-h-[68svh] sm:px-8 lg:min-h-0 lg:pb-8 lg:px-12 xl:px-16">
        <div className="w-full max-w-[1050px]">
          <div
            ref={labelRef}
            className="flex items-center"
          >
            <span className="inline-block bg-black px-1.5 py-[2px] font-mono text-[10px] font-semibold uppercase leading-none tracking-[0.06em] text-white sm:text-[11px]">
              OUR EXPERTISE
            </span>
          </div>

          <div className="mt-2 max-w-[950px] lg:mt-0">
            <p
              ref={copyRef}
              className="m-0 font-sans text-[clamp(18px,4.7vw,23px)] font-normal leading-[1.34] tracking-[-0.025em] text-black sm:text-[clamp(23px,2.1vw,32px)]"
            >
              What do we do best? Branding, design, and digital experiences.
              Expertise isn’t just about what we do, but how exceptionally we do
              it. We push every detail further and make work that feels
              considered, distinctive, and precise. There’s always a way to make
              it better.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
