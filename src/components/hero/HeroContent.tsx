"use client";

import React from "react";
import Image from "next/image";
import ServiceList, { ServiceItemData } from "./ServiceList";

interface HeroContentProps {
  logoWrapperRef: React.RefObject<HTMLDivElement | null>;
  servicesContainerRef?: React.RefObject<HTMLDivElement | null>;
  serviceItemsRef: React.MutableRefObject<(HTMLAnchorElement | null)[]>;
  services?: ServiceItemData[];
  isMobile: boolean;
}

export default function HeroContent({
  logoWrapperRef,
  servicesContainerRef,
  serviceItemsRef,
  services,
  isMobile,
}: HeroContentProps) {
  return (
    <div
      className="heroBottom absolute z-[3] pointer-events-none flex flex-col md:flex-row items-start md:items-end"
      style={{
        left: "clamp(20px, 2.5vw, 40px)",
        bottom: "clamp(20px, 3.5vh, 40px)",
        gap: "clamp(48px, 8vw, 130px)",
      }}
    >
      {/* LEFT: NORTHFRAME LOGO IMAGE */}
      <div
        ref={logoWrapperRef}
        className="logo-wrapper pointer-events-auto shrink-0 select-none opacity-0 will-change-transform"
        style={{
          width: "clamp(260px, 34vw, 520px)",
          maxWidth: "85vw",
        }}
      >
        <Image
          src="/images/brand/northframe-logo.webp"
          alt="NORTHFRAME"
          width={700}
          height={116}
          priority
          className="w-full h-auto object-contain block drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]"
        />
      </div>

      {/* RIGHT OF LOGO: FIVE SERVICE LABELS ON SAME HORIZONTAL VISUAL ROW */}
      <ServiceList
        services={services}
        serviceItemsRef={serviceItemsRef}
        containerRef={servicesContainerRef}
        isMobile={isMobile}
      />
    </div>
  );
}
