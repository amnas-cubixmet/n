"use client";

import React, { useState } from "react";
import BrandIntro from "@/components/intro/BrandIntro";
import Header from "@/components/navigation/Header";
import Shared3DBackground from "@/components/hero/Shared3DBackground";
import Hero from "@/components/hero/Hero";
import IntroSection from "@/components/intro/IntroSection";
import WatWeDoen from "@/components/home/WatWeDoen";
import OurExpertise from "@/components/home/OurExpertise";
import SelectedWork from "@/components/home/SelectedWork";
import DeliverablesSection from "@/components/home/DeliverablesSection";
import StatementSection from "@/components/home/StatementSection";
import OurVision from "@/components/home/OurVision";
import OurUSPs from "@/components/home/OurUSPs";
import FoundedOnAVision from "@/components/home/FoundedOnAVision";
import ContactSection from "@/components/home/ContactSection";

export default function Home() {
  // Keep the first server and client renders identical. BrandIntro checks
  // sessionStorage after hydration and calls onComplete when it is done.
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
