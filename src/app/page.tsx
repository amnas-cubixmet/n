"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import BrandIntro from "@/components/intro/BrandIntro";
import Header from "@/components/navigation/Header";
import Hero from "@/components/hero/Hero";
import IntroSection from "@/components/intro/IntroSection";
import WatWeDoen from "@/components/home/WatWeDoen";
import OurExpertise from "@/components/home/OurExpertise";
import FloatingContactActions from "@/components/navigation/FloatingContactActions";

const Shared3DBackground = dynamic(
  () => import("@/components/hero/Shared3DBackground"),
  { ssr: false }
);

const SelectedWork = dynamic(
  () => import("@/components/home/SelectedWork")
);
const DeliverablesSection = dynamic(
  () => import("@/components/home/DeliverablesSection")
);
const StatementSection = dynamic(
  () => import("@/components/home/StatementSection")
);
const OurVision = dynamic(
  () => import("@/components/home/OurVision")
);
const OurUSPs = dynamic(
  () => import("@/components/home/OurUSPs")
);
const FoundedOnAVision = dynamic(
  () => import("@/components/home/FoundedOnAVision")
);
const ContactSection = dynamic(
  () => import("@/components/home/ContactSection")
);

export default function Home() {
  // Keep the first server and client renders identical. BrandIntro runs on a
  // fresh page load and still calls onComplete when an in-app remount skips it.
  const [introCompleted, setIntroCompleted] = useState(false);

  const handleIntroComplete = () => {
    setIntroCompleted(true);
  };

  return (
    <main className="page relative min-h-screen text-white flex flex-col font-sans bg-transparent">
      {/* Brand Intro Animation Overlay */}
      <BrandIntro onComplete={handleIntroComplete} />

      {/* Global Fixed Header Navigation */}
      <Header />

      {/* Floating contact action appears only after the Introduction is passed */}
      <FloatingContactActions />

      {/* LAYER 1 — GLOBAL FIXED BACKGROUND */}
      <div className="global-visual-background fixed inset-0 w-full h-[100svh] lg:h-[100dvh] z-0 overflow-hidden pointer-events-none bg-[#05080B]">
        <Shared3DBackground />
      </div>

      {/* LAYER 2 — FOREGROUND SCROLLING CONTENT */}
      <div className="foreground relative z-10 w-full flex flex-col pointer-events-none">
        {/* The hero and introduction share the fixed 3D background. */}
        <div className="shared-background-range relative w-full">
          <Hero introCompleted={introCompleted} />

          <section
            id="intro"
            className="introduction relative w-full min-h-[50svh] flex flex-col justify-center pointer-events-auto bg-transparent text-white m-0 p-0"
          >
            <IntroSection />
          </section>
        </div>

        {/* WAT WE DOEN */}
        <div className="relative w-full pointer-events-auto bg-[#030508]">
          <WatWeDoen />
        </div>

        {/* OUR EXPERTISE */}
        <OurExpertise />

        {/* A SELECTION OF OUR WORK */}
        <SelectedWork />

        {/* DELIVERABLES */}
        <DeliverablesSection />

        {/* WOOOW STATEMENT */}
        <StatementSection />

        {/* OUR VISION SECTION */}
        <OurVision />

        {/* OUR USPs SECTION */}
        <OurUSPs />

        {/* FOUNDED ON A VISION SECTION */}
        <FoundedOnAVision />

        {/* CONTACT SECTION */}
        <ContactSection />
      </div>
    </main>
  );
}
