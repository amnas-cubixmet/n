"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Header from "@/components/navigation/Header";
import { usePageTransition } from "@/components/navigation/PageTransitionProvider";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface EditorialProject {
  num: string;
  title: string;
  category: string;
  description: string;
  image: string;
  imageAlt: string;
  destination: string;
  gridCols: string;
  rotation: string;
  bgLayerOffset: string;
  bgLayerRotation: string;
  imagePosition?: string;
}

const EDITORIAL_PROJECTS: EditorialProject[] = [
  {
    num: "01",
    title: "AUREA",
    category: "BRAND IDENTITY",
    description:
      "A complete visual identity built around clarity, precision and premium positioning.",
    image: "/images/work/work-01-branding.jpg",
    imageAlt: "AUREA Luxury Brand Identity & Packaging",
    destination: "/work/aurea",
    gridCols: "grid-cols-1 lg:grid-cols-[40%_60%]",
    rotation: "-1deg",
    bgLayerOffset: "top-[-12px] right-[-14px] bottom-[-10px] left-[-16px]",
    bgLayerRotation: "+0.8deg",
    imagePosition: "center center",
  },
  {
    num: "02",
    title: "VYRA",
    category: "BRAND & SIGNAGE",
    description:
      "Transforming spaces through bold branding and environmental design.",
    image: "/images/work/work-02-digital-marketing.jpg",
    imageAlt: "VYRA Architectural Signage & Environmental Design",
    destination: "/work/vyra",
    gridCols: "grid-cols-1 lg:grid-cols-[58%_42%]",
    rotation: "+1deg",
    bgLayerOffset: "top-[-16px] right-[-10px] bottom-[-14px] left-[-12px]",
    bgLayerRotation: "-1.1deg",
    imagePosition: "center center",
  },
  {
    num: "03",
    title: "NEXON",
    category: "CAMPAIGN",
    description:
      "A high-impact campaign that connects brands with people.",
    image: "/images/work/work-03-creative-production.jpg",
    imageAlt: "NEXON Advertising & Digital Billboard Campaign",
    destination: "/work/nexon",
    gridCols: "grid-cols-1 lg:grid-cols-[43%_57%]",
    rotation: "-1.2deg",
    bgLayerOffset: "top-[-10px] right-[-18px] bottom-[-12px] left-[-10px]",
    bgLayerRotation: "+1.2deg",
    imagePosition: "center center",
  },
  {
    num: "04",
    title: "MOMENTUM",
    category: "EVENT EXPERIENCE",
    description:
      "Immersive event experiences that engage, inspire and create lasting connections.",
    image: "/images/work/work-04-technology.jpg",
    imageAlt: "MOMENTUM Conference & Stage Experience",
    destination: "/work/momentum",
    gridCols: "grid-cols-1 lg:grid-cols-[57%_43%]",
    rotation: "+0.8deg",
    bgLayerOffset: "top-[-14px] right-[-12px] bottom-[-16px] left-[-14px]",
    bgLayerRotation: "-0.9deg",
    imagePosition: "center center",
  },
  {
    num: "05",
    title: "LUME",
    category: "DIGITAL EXPERIENCE",
    description:
      "Digital products that make complex ideas simple and human.",
    image: "/images/work/work-02-digital-marketing.jpg",
    imageAlt: "LUME Mobile Application & Digital Experience",
    destination: "/work/lume",
    gridCols: "grid-cols-1 lg:grid-cols-[41%_59%]",
    rotation: "-0.9deg",
    bgLayerOffset: "top-[-12px] right-[-16px] bottom-[-10px] left-[-12px]",
    bgLayerRotation: "+0.7deg",
    imagePosition: "center top",
  },
];

export default function WorkPageClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const projectRefs = useRef<(HTMLDivElement | null)[]>([]);
  const { triggerTransition } = usePageTransition();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 768px)");
    const syncMobile = () => setIsMobile(mobileQuery.matches);

    syncMobile();

    if (typeof mobileQuery.addEventListener === "function") {
      mobileQuery.addEventListener("change", syncMobile);
      return () => mobileQuery.removeEventListener("change", syncMobile);
    }

    mobileQuery.addListener(syncMobile);
    return () => mobileQuery.removeListener(syncMobile);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (motionQuery.matches) return;

      projectRefs.current.forEach((card, index) => {
        if (!card) return;

        const bgLayer = card.querySelector(".project-bg-layer");
        const cardInner = card.querySelector(".project-card-inner");
        const imgContainer = card.querySelector(".project-image-container");
        const imgElement = card.querySelector(".project-image");
        const titleElement = card.querySelector(".project-title");
        const descElement = card.querySelector(".project-desc");
        const baseRotation = EDITORIAL_PROJECTS[index].rotation;

        if (isMobile) {
          gsap.fromTo(
            cardInner,
            { opacity: 0, y: 24 },
            {
              opacity: 1,
              y: 0,
              duration: 0.55,
              ease: "power3.out",
              scrollTrigger: {
                trigger: card,
                start: "top 88%",
                once: true,
              },
            }
          );

          if (imgElement) {
            gsap.fromTo(
              imgElement,
              { scale: 1.02 },
              {
                scale: 1,
                duration: 0.55,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: card,
                  start: "top 85%",
                },
              }
            );
          }
        } else {
          // Desktop entrance animation
          if (bgLayer) {
            gsap.fromTo(
              bgLayer,
              { opacity: 0, scale: 0.96 },
              {
                opacity: 1,
                scale: 1,
                duration: 1.1,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: card,
                  start: "top 82%",
                },
              }
            );
          }

          if (cardInner) {
            gsap.fromTo(
              cardInner,
              { opacity: 0, y: 70, rotate: parseFloat(baseRotation) * 1.8 },
              {
                opacity: 1,
                y: 0,
                rotate: parseFloat(baseRotation),
                duration: 1.0,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: card,
                  start: "top 82%",
                },
              }
            );
          }

          if (imgElement && imgContainer) {
            gsap.fromTo(
              imgElement,
              { scale: 1.05 },
              {
                scale: 1.0,
                ease: "none",
                scrollTrigger: {
                  trigger: card,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 0.8,
                },
              }
            );
          }

          if (titleElement) {
            gsap.fromTo(
              titleElement,
              { opacity: 0, y: 30 },
              {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: card,
                  start: "top 78%",
                },
              }
            );
          }

          if (descElement) {
            gsap.fromTo(
              descElement,
              { opacity: 0, y: 30 },
              {
                opacity: 1,
                y: 0,
                duration: 0.5,
                delay: 0.1,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: card,
                  start: "top 78%",
                },
              }
            );
          }
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, [isMobile]);

  const handleProjectClick = (e: React.MouseEvent<HTMLDivElement>, href: string) => {
    e.preventDefault();
    triggerTransition(href);
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-[#05070A] text-white flex flex-col font-sans selection:bg-[#1677FF] selection:text-white"
    >
      {/* 2. HEADER */}
      <Header />

      {/* 1. PAGE HERO */}
      <section className="pt-[max(3rem,env(safe-area-inset-top))] sm:pt-16 lg:pt-20 pb-8 sm:pb-12 px-[max(1.5rem,env(safe-area-inset-left))] sm:px-10 lg:px-16 max-w-[1500px] w-full mx-auto">
        <div className="max-w-2xl">
          {/* Small label: WORK with subtle blue dash */}
          <div className="flex items-center gap-2 mb-4">
            <span className="w-4 h-[2px] bg-[#1677FF] inline-block" />
            <span className="font-mono text-xs sm:text-sm font-semibold tracking-[0.2em] text-[#1677FF] uppercase">
              WORK
            </span>
          </div>

          {/* Main heading: Ideas in Real Life. */}
          <h1 className="font-sans font-bold text-white text-5xl sm:text-7xl lg:text-8xl tracking-tight leading-[0.98] mb-6">
            Ideas
            <br />
            in <span className="text-[#1677FF]">Real Life.</span>
          </h1>

          {/* Short paragraph below */}
          <p className="text-[#A0A8B5] font-sans text-base sm:text-lg md:text-xl font-normal leading-relaxed max-w-xl">
            A selection of projects that turn ideas into meaningful brand experiences.
          </p>
        </div>
      </section>

      {/* 3. WORK LIST CONCEPT — VERTICAL EDITORIAL SHOWCASE */}
      <section className="pt-4 pb-28 sm:pb-40 px-4 sm:px-8 lg:px-16 max-w-[1500px] w-full mx-auto space-y-20 sm:space-y-28 lg:space-y-36">
        {EDITORIAL_PROJECTS.map((project, index) => {
          const isTextLeft = index % 2 === 0;

          return (
            <div
              key={project.num}
              ref={(el) => {
                projectRefs.current[index] = el;
              }}
              onClick={(e) => handleProjectClick(e, project.destination)}
              className="group relative cursor-pointer select-none"
              style={{
                WebkitBackfaceVisibility: "hidden",
                backfaceVisibility: "hidden",
              }}
            >
              {/* 10. SUBTLE LARGE DARK BACKGROUND LAYER */}
              <div
                className={`project-bg-layer absolute ${project.bgLayerOffset} bg-[#080A0D] border border-white/[0.03] rounded-[2px] pointer-events-none hidden lg:block transition-transform duration-500`}
                style={{
                  transform: `rotate(${project.bgLayerRotation})`,
                }}
              />

              {/* 4. MAIN PROJECT CARD composition (#101214 / #121416) */}
              <div
                className="project-card-inner relative bg-[#101214] border border-white/[0.06] rounded-[2px] overflow-hidden shadow-2xl transition-transform duration-400 lg:group-hover:-translate-y-1.5"
                style={{
                  transform: isMobile ? "none" : `rotate(${project.rotation})`,
                  willChange: isMobile ? "auto" : "transform, opacity",
                  WebkitBackfaceVisibility: "hidden",
                  backfaceVisibility: "hidden",
                }}
              >
                {/* 9. DESKTOP GRID COMPOSITION (Alternating text left / image right vs image left / text right) */}
                <div
                  className={`grid ${project.gridCols} min-h-[380px] sm:min-h-[460px] lg:min-h-[520px] items-stretch`}
                >
                  {/* TEXT CONTENT CONTAINER */}
                  <div
                    className={`p-6 sm:p-10 lg:p-14 flex flex-col justify-between ${
                      isTextLeft ? "lg:order-1" : "lg:order-2"
                    } bg-[#101214] z-10`}
                  >
                    <div>
                      {/* 6. BLUE NUMBER LABEL */}
                      <div className="inline-flex items-center justify-center bg-[#1677FF] text-white font-mono font-bold text-xs px-2.5 py-1 mb-6 sm:mb-8 rounded-[1px] tracking-wider">
                        {project.num}
                      </div>

                      {/* 5. PROJECT TITLE */}
                      <h2 className="project-title font-sans font-bold text-white text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight mb-2 lg:group-hover:text-[#1677FF] transition-colors duration-300">
                        {project.title}
                      </h2>

                      {/* CATEGORY */}
                      <p className="font-mono text-xs sm:text-sm font-semibold tracking-[0.2em] text-[#808A9D] uppercase mb-4 sm:mb-6">
                        {project.category}
                      </p>

                      {/* SHORT DESCRIPTION */}
                      <p className="project-desc font-sans text-sm sm:text-base text-[#9DA7B8] leading-relaxed max-w-md font-normal">
                        {project.description}
                      </p>
                    </div>

                    {/* SIMPLE HOVER ARROW BENEATH */}
                    <div className="pt-6 sm:pt-8 flex items-center gap-2 text-white lg:group-hover:text-[#1677FF] transition-colors duration-300">
                      <span className="font-mono text-xs tracking-widest uppercase">EXPLORE</span>
                      <svg
                        className="w-5 h-5 transform lg:group-hover:translate-x-1.5 transition-transform duration-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>

                  {/* 7 & 8. PROJECT IMAGES DOMINANT VISUAL CONTAINER */}
                  <div
                    className={`project-image-container relative overflow-hidden ${
                      isTextLeft ? "lg:order-2" : "lg:order-1"
                    } min-h-[260px] sm:min-h-[340px] lg:min-h-full bg-[#0A0C0E]`}
                  >
                    <Image
                      src={project.image}
                      alt={project.imageAlt}
                      fill
                      priority={index < 2}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 900px"
                      className="project-image object-cover w-full h-full transform scale-[1.03] lg:group-hover:scale-[1.05] transition-transform duration-700 ease-out brightness-95 lg:group-hover:brightness-100"
                      style={{ objectPosition: project.imagePosition || "center center" }}
                    />
                    {/* Subtle dark gradient overlay to blend image edge with card text on desktop */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#101214]/60 via-transparent to-transparent lg:hidden pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* 19. PAGE END */}
      <footer className="border-t border-white/[0.08] py-12 px-6 sm:px-10 lg:px-16 bg-[#040608]">
        <div className="max-w-[1500px] mx-auto flex flex-col sm:flex-row items-center justify-between text-[#6B7588] font-mono text-xs tracking-widest gap-4">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#1677FF] animate-pulse motion-reduce:animate-none" />
            <span>MORE PROJECTS AHEAD</span>
          </div>

          <div className="flex items-center gap-6">
            <span>SCROLL TO EXPLORE</span>
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-white/20 text-white font-bold text-[10px]">
              N
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

