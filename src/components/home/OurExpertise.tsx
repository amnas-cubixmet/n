"use client";

import { useEffect, useRef, useState } from "react";
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
  const [mobileRevealed, setMobileRevealed] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const mobile = window.matchMedia("(max-width: 768px)").matches;
    if (!mobile) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduced) {
      setMobileRevealed(true);
      return;
    }

    let frame = 0;
    let observer: IntersectionObserver | null = null;

    const revealIfReady = () => {
      frame = 0;
      const rect = container.getBoundingClientRect();
      const triggerLine = window.innerHeight * 0.82;

      if (rect.top <= triggerLine && rect.bottom > window.innerHeight * 0.12) {
        setMobileRevealed(true);
        observer?.disconnect();
        window.removeEventListener("scroll", requestCheck);
      }
    };

    const requestCheck = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(revealIfReady);
    };

    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry?.isIntersecting) return;
          requestCheck();
        },
        {
          threshold: 0.01,
          rootMargin: "0px 0px -18% 0px",
        }
      );
      observer.observe(container);
    }

    window.addEventListener("scroll", requestCheck, { passive: true });
    requestCheck();

    return () => {
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("scroll", requestCheck);
    };
  }, []);

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

      const buildReveal = () => {
        gsap.set(label, {
          scaleX: 0,
          transformOrigin: "left center",
          force3D: true,
        });

        gsap.set(copy, {
          y: 30,
          clipPath: "inset(0% 0% 100% 0%)",
          force3D: true,
        });

        const timeline = gsap.timeline({
          paused: false,
          defaults: {
            ease: "power3.out",
            overwrite: "auto",
          },
          scrollTrigger: {
            trigger: container,
            start: "top 82%",
            once: true,
            invalidateOnRefresh: true,
          },
        });

        timeline
          .to(label, {
            scaleX: 1,
            duration: 0.48,
            ease: "power4.out",
          })
          .to(
            copy,
            {
              y: 0,
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 0.74,
              ease: "expo.out",
            },
            "-=0.18"
          );

        return () => {
          timeline.scrollTrigger?.kill();
          timeline.kill();
        };
      };

      mm.add("(min-width: 769px)", () => buildReveal());

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  return (
    <section
      id="our-expertise"
      ref={containerRef}
      className={`our-expertise-mobile relative z-20 w-full bg-white text-black pointer-events-auto overflow-hidden ${mobileRevealed ? "our-expertise-mobile-revealed" : ""}`}
    >
      <div className="mx-auto flex min-h-[62svh] w-full max-w-[1600px] flex-col justify-start px-[max(1.1rem,env(safe-area-inset-left))] pb-[clamp(2rem,5vh,4rem)] pt-[clamp(5rem,12vh,10rem)] pr-[max(1.1rem,env(safe-area-inset-right))] sm:min-h-[68svh] sm:px-8 lg:min-h-0 lg:pb-8 lg:px-12 xl:px-16">
        <div className="w-full max-w-[1050px]">
          <div
            ref={labelRef}
            className="our-expertise-mobile-label flex items-center"
          >
            <span className="inline-block bg-black px-1.5 py-[2px] font-mono text-[10px] font-semibold uppercase leading-none tracking-[0.06em] text-white sm:text-[11px]">
              OUR EXPERTISE
            </span>
          </div>

          <div className="mt-2 max-w-[950px] lg:mt-0">
            <p
              ref={copyRef}
              className="our-expertise-mobile-copy m-0 font-sans text-[clamp(18px,4.7vw,23px)] font-normal leading-[1.34] tracking-[-0.025em] text-black sm:text-[clamp(23px,2.1vw,32px)]"
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
